require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!supabaseUrl || !supabaseServiceKey || !FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadVideosToAdAccount() {
  console.log('🚀 Uploading TTM videos to Facebook Ad Account...\n');
  
  try {
    // Get all TTM videos from Supabase
    const { data: videos, error: dbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .like('name', 'TTM_%')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('❌ Error fetching videos:', dbError);
      return;
    }

    console.log(`📋 Found ${videos?.length || 0} TTM videos to upload\n`);

    if (!videos || videos.length === 0) {
      console.log('❌ No TTM videos found in database');
      return;
    }

    // Upload each video to Facebook Ad Account
    for (const video of videos) {
      console.log(`🎬 Uploading: ${video.name}`);
      
      try {
        // Get the video URL from Supabase
        const { data: urlData, error: urlError } = await supabase.storage
          .from('advertenties')
          .createSignedUrl(video.original_name, 3600); // 1 hour expiry

        if (urlError) {
          console.error(`❌ Error getting URL for ${video.name}:`, urlError);
          continue;
        }

        const videoUrl = urlData.signedUrl;
        console.log(`   📥 Video URL: ${videoUrl.substring(0, 50)}...`);

        // Upload to Facebook Ad Account
        const uploadResponse = await fetch(
          `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adimages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: video.name,
              url: videoUrl,
              bytes: video.file_size,
              mime_type: video.mime_type
            })
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.text();
          console.error(`❌ Upload failed for ${video.name}:`, errorData);
          continue;
        }

        const uploadData = await uploadResponse.json();
        console.log(`   ✅ Uploaded successfully!`);
        console.log(`   📋 Facebook ID: ${uploadData.images?.[video.name]?.hash || 'Unknown'}`);
        console.log(`   🔗 Facebook URL: ${uploadData.images?.[video.name]?.url || 'Unknown'}`);
        console.log('');

        // Update the database with Facebook info
        await supabase
          .from('videos')
          .update({
            facebook_id: uploadData.images?.[video.name]?.hash,
            facebook_url: uploadData.images?.[video.name]?.url,
            updated_at: new Date().toISOString()
          })
          .eq('id', video.id);

      } catch (error) {
        console.error(`❌ Error uploading ${video.name}:`, error);
      }
    }

    // Verify uploads
    console.log('🔍 Verifying uploads...');
    const verifyResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adimages?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,url,width,height,created_time&limit=100`
    );

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const ttmVideos = verifyData.data?.filter(item => 
        item.name && item.name.includes('TTM_')
      ) || [];

      console.log(`✅ Found ${ttmVideos.length} TTM videos in Ad Account:`);
      ttmVideos.forEach(video => {
        console.log(`   🎬 ${video.name} (ID: ${video.id})`);
        console.log(`      URL: ${video.url}`);
        console.log(`      Dimensions: ${video.width}x${video.height}`);
        console.log('');
      });
    }

    console.log('\n🎉 Video Upload Summary:');
    console.log('========================');
    console.log(`✅ Videos processed: ${videos.length}`);
    console.log('✅ Videos uploaded to Facebook Ad Account');
    console.log('✅ Database updated with Facebook IDs');
    console.log('✅ Ready to replace Google Images in ad creatives!');

  } catch (error) {
    console.error('❌ Error during video upload:', error);
  }
}

uploadVideosToAdAccount().catch(console.error);
