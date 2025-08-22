require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook environment variables');
  process.exit(1);
}

async function checkAdAccountMedia() {
  console.log('🔍 Checking Ad Account Media Library for TTM videos...\n');
  
  try {
    // Check the ad account's media library (adimages endpoint)
    console.log('📁 Checking Ad Account Media Library (adimages)...');
    const adImagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adimages?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,url,width,height,created_time&limit=100`
    );
    
    if (!adImagesResponse.ok) {
      throw new Error(`Failed to fetch ad images: ${adImagesResponse.status}`);
    }
    
    const adImagesData = await adImagesResponse.json();
    console.log(`📋 Found ${adImagesData.data?.length || 0} media items in ad account`);
    
    // Filter for TTM videos
    const ttmVideos = adImagesData.data?.filter(item => 
      item.name && item.name.includes('TTM_')
    ) || [];
    
    console.log(`🎯 Found ${ttmVideos.length} TTM videos in ad account media library:`);
    
    if (ttmVideos.length > 0) {
      ttmVideos.forEach(video => {
        console.log(`   ✅ ${video.name} (ID: ${video.id})`);
        console.log(`      Created: ${video.created_time}`);
        console.log(`      URL: ${video.url}`);
        console.log(`      Dimensions: ${video.width}x${video.height}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No TTM videos found in ad images');
    }
    
    // Also check for video assets specifically
    console.log('🎥 Checking Ad Account Video Assets (advideos)...');
    let adVideosData = null;
    let ttmVideoAssets = [];
    
    const adVideosResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/advideos?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,created_time,source&limit=100`
    );
    
    if (!adVideosResponse.ok) {
      console.log(`⚠️  Could not access ad videos: ${adVideosResponse.status}`);
    } else {
      adVideosData = await adVideosResponse.json();
      console.log(`📹 Found ${adVideosData.data?.length || 0} video assets in ad account`);
      
      // Filter for TTM videos
      ttmVideoAssets = adVideosData.data?.filter(video => 
        video.name && video.name.includes('TTM_')
      ) || [];
      
      console.log(`🎯 Found ${ttmVideoAssets.length} TTM video assets:`);
      
      if (ttmVideoAssets.length > 0) {
        ttmVideoAssets.forEach(video => {
          console.log(`   ✅ ${video.name} (ID: ${video.id})`);
          console.log(`      Status: ${video.status}`);
          console.log(`      Created: ${video.created_time}`);
          console.log(`      Source: ${video.source}`);
          console.log('');
        });
      } else {
        console.log('   ❌ No TTM video assets found');
      }
    }
    
    // Let's also check for ad creatives that might reference these videos
    console.log('🎨 Checking Ad Creatives for video references...');
    let ttmCreatives = [];
    
    const adCreativesResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adcreatives?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,object_story_spec&limit=100`
    );
    
    if (!adCreativesResponse.ok) {
      console.log(`⚠️  Could not access ad creatives: ${adCreativesResponse.status}`);
    } else {
      const adCreativesData = await adCreativesResponse.json();
      console.log(`🎨 Found ${adCreativesData.data?.length || 0} ad creatives`);
      
      // Look for creatives that might use TTM videos
      ttmCreatives = adCreativesData.data?.filter(creative => 
        creative.name && creative.name.includes('TTM')
      ) || [];
      
      console.log(`🎯 Found ${ttmCreatives.length} TTM-related ad creatives:`);
      
      if (ttmCreatives.length > 0) {
        ttmCreatives.forEach(creative => {
          console.log(`   ✅ ${creative.name} (ID: ${creative.id})`);
          console.log(`      Object Story Spec: ${JSON.stringify(creative.object_story_spec, null, 2)}`);
          console.log('');
        });
      }
    }
    
    console.log('\n🎉 Ad Account Media Check Summary:');
    console.log('=================================');
    console.log(`✅ Ad Account: ${FACEBOOK_AD_ACCOUNT_ID}`);
    console.log(`✅ Media Library Items: ${adImagesData.data?.length || 0}`);
    console.log(`✅ TTM Videos in Media Library: ${ttmVideos.length}`);
    console.log(`✅ Video Assets: ${adVideosData?.data?.length || 0}`);
    console.log(`✅ TTM Video Assets: ${ttmVideoAssets?.length || 0}`);
    console.log(`✅ TTM Ad Creatives: ${ttmCreatives?.length || 0}`);
    
    if (ttmVideos.length > 0 || ttmVideoAssets?.length > 0) {
      console.log('\n🎯 SUCCESS! TTM videos found in Ad Account Media Library!');
      console.log('Ready to replace Google Images with actual videos in ads.');
      
      // Create a mapping for easy reference
      console.log('\n📋 Video ID Mapping for Ad Creation:');
      console.log('====================================');
      if (ttmVideos.length > 0) {
        ttmVideos.forEach(video => {
          const videoName = video.name.replace('.mp4', '');
          console.log(`${videoName} → ID: ${video.id}`);
        });
      }
      if (ttmVideoAssets?.length > 0) {
        ttmVideoAssets.forEach(video => {
          const videoName = video.name.replace('.mp4', '');
          console.log(`${videoName} → ID: ${video.id}`);
        });
      }
    } else if (ttmCreatives?.length > 0) {
      console.log('\n🎯 Found TTM Ad Creatives but no videos yet!');
      console.log('The ads exist but are still using Google Images.');
      console.log('We need to find the videos and update the creatives.');
      
      console.log('\n📋 Current Ad Creative Mapping:');
      console.log('==============================');
      ttmCreatives.forEach(creative => {
        const creativeName = creative.name;
        console.log(`${creativeName} → Creative ID: ${creative.id}`);
        console.log(`   Currently using: Google Image (${creative.object_story_spec?.link_data?.image_hash})`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No TTM videos found in Ad Account Media Library yet.');
      console.log('Make sure videos are uploaded to the "Media advertentieaccount" section.');
    }
    
  } catch (error) {
    console.error('❌ Error checking ad account media:', error);
  }
}

checkAdAccountMedia().catch(console.error);
