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

// Video files to upload
const videosToUpload = [
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

async function uploadNewAdvertentieVideos() {
  console.log('🎬 Uploading new advertentie videos...');
  console.log('📁 Please make sure the video files are in the same directory as this script or provide the correct path.');

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
    for (const video of videosToUpload) {
      console.log(`\n📹 Processing: ${video.filename}`);
      
      // Check if file exists locally
      const filePath = path.join(__dirname, video.filename);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File ${video.filename} not found locally. Please place it in the scripts directory.`);
        console.log(`📁 Expected path: ${filePath}`);
        continue;
      }

      console.log(`✅ File ${video.filename} found locally`);

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

      // Upload file to storage bucket
      console.log(`📤 Uploading ${video.filename} to storage bucket...`);
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fs.statSync(filePath).size;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('advertenties')
        .upload(video.filename, fileBuffer, {
          contentType: 'video/mp4',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        continue;
      }

      console.log(`✅ Successfully uploaded ${video.filename} to storage bucket`);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('advertenties')
        .getPublicUrl(video.filename);

      // Create video record in database
      const { data: newVideo, error: insertError } = await supabase
        .from('videos')
        .insert({
          name: video.name,
          original_name: video.filename,
          file_path: video.filename,
          file_size: fileSize,
          mime_type: 'video/mp4',
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
        size: (fileSize / 1024 / 1024).toFixed(2) + ' MB',
        url: urlData.publicUrl
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
uploadNewAdvertentieVideos()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
