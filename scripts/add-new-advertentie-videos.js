require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// New video files to add
const newVideos = [
  {
    filename: 'lv_0_20250821161841.mp4',
    name: 'Advertentie Video 1 - 16:18',
    target_audience: 'Mannen 25-45, fitness, lifestyle, Nederland',
    campaign_status: 'inactive'
  },
  {
    filename: 'lv_0_20250821162618.mp4',
    name: 'Advertentie Video 2 - 16:26',
    target_audience: 'Mannen 25-45, fitness, lifestyle, Nederland',
    campaign_status: 'inactive'
  },
  {
    filename: 'lv_0_20250821163117.mp4',
    name: 'Advertentie Video 3 - 16:31',
    target_audience: 'Mannen 25-45, fitness, lifestyle, Nederland',
    campaign_status: 'inactive'
  }
];

async function addNewAdvertentieVideos() {
  console.log('🎬 Adding new advertentie videos to the system...');

  try {
    // Check if advertenties bucket exists
    console.log('🔍 Checking advertenties bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }

    const advertentiesBucket = buckets?.find(bucket => bucket.id === 'advertenties');
    
    if (!advertentiesBucket) {
      console.error('❌ Advertenties bucket not found. Please run the setup script first.');
      return;
    }

    console.log('✅ Advertenties bucket found:', advertentiesBucket.id);

    // Check if videos table exists
    console.log('🔍 Checking videos table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('videos')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Videos table not found. Please run the setup script first.');
      return;
    }

    console.log('✅ Videos table found');

    // Process each video
    for (const video of newVideos) {
      console.log(`\n📹 Processing: ${video.filename}`);
      
      // Check if video already exists in database
      const { data: existingVideo, error: checkError } = await supabase
        .from('videos')
        .select('id, original_name')
        .eq('original_name', video.filename)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing video:', checkError);
        continue;
      }

      if (existingVideo) {
        console.log(`⚠️ Video ${video.filename} already exists in database, skipping...`);
        continue;
      }

      // Check if file exists in storage bucket
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('advertenties')
        .list('', {
          search: video.filename
        });

      if (storageError) {
        console.error('❌ Error checking storage:', storageError);
        continue;
      }

      const fileExists = storageFiles?.some(file => file.name === video.filename);
      
      if (!fileExists) {
        console.log(`⚠️ File ${video.filename} not found in storage bucket. Please upload it first.`);
        continue;
      }

      console.log(`✅ File ${video.filename} found in storage bucket`);

      // Get file metadata from storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from('advertenties')
        .getPublicUrl(video.filename);

      if (fileError) {
        console.error('❌ Error getting file URL:', fileError);
        continue;
      }

      // Get file info from storage
      const { data: fileInfo, error: infoError } = await supabase.storage
        .from('advertenties')
        .list('', {
          search: video.filename
        });

      if (infoError) {
        console.error('❌ Error getting file info:', infoError);
        continue;
      }

      const file = fileInfo?.find(f => f.name === video.filename);
      if (!file) {
        console.error('❌ File info not found');
        continue;
      }

      // Create video record in database
      const { data: newVideo, error: insertError } = await supabase
        .from('videos')
        .insert({
          name: video.name,
          original_name: video.filename,
          file_path: video.filename,
          file_size: file.metadata?.size || 0,
          mime_type: file.metadata?.mimetype || 'video/mp4',
          target_audience: video.target_audience,
          campaign_status: video.campaign_status,
          bucket_name: 'advertenties',
          is_deleted: false
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error inserting video into database:', insertError);
        continue;
      }

      console.log(`✅ Successfully added ${video.filename} to database:`, {
        id: newVideo.id,
        name: newVideo.name,
        size: (file.metadata?.size / 1024 / 1024).toFixed(2) + ' MB',
        url: fileData.publicUrl
      });
    }

    console.log('\n🎉 All videos processed successfully!');
    
    // Show summary
    const { data: allVideos, error: summaryError } = await supabase
      .from('videos')
      .select('id, name, original_name, campaign_status')
      .eq('bucket_name', 'advertenties')
      .order('created_at', { ascending: false });

    if (!summaryError && allVideos) {
      console.log(`\n📊 Total videos in advertenties bucket: ${allVideos.length}`);
      console.log('📋 Recent videos:');
      allVideos.slice(0, 10).forEach(video => {
        console.log(`  • ${video.name} (${video.campaign_status})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
addNewAdvertentieVideos()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
