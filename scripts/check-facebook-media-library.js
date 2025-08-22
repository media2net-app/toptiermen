require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook environment variables');
  process.exit(1);
}

async function checkFacebookMediaLibrary() {
  console.log('🔍 Checking Facebook Media Library for uploaded videos...\n');
  
  try {
    // First, let's check what ad accounts we have access to
    console.log('📋 Checking available ad accounts...');
    const adAccountsResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,account_status`
    );
    
    if (!adAccountsResponse.ok) {
      throw new Error(`Failed to fetch ad accounts: ${adAccountsResponse.status}`);
    }
    
    const adAccountsData = await adAccountsResponse.json();
    console.log(`✅ Found ${adAccountsData.data?.length || 0} ad accounts`);
    
    adAccountsData.data?.forEach(account => {
      console.log(`   - ${account.name} (${account.id}) - Status: ${account.account_status}`);
    });
    
    // Now let's check the media library for our specific ad account
    console.log('\n🎬 Checking Media Library for videos...');
    const mediaLibraryResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adimages?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,url,width,height,created_time&limit=100`
    );
    
    if (!mediaLibraryResponse.ok) {
      throw new Error(`Failed to fetch media library: ${mediaLibraryResponse.status}`);
    }
    
    const mediaLibraryData = await mediaLibraryResponse.json();
    console.log(`📋 Found ${mediaLibraryData.data?.length || 0} media items in library`);
    
    // Filter for TTM videos
    const ttmVideos = mediaLibraryData.data?.filter(item => 
      item.name && item.name.includes('TTM_')
    ) || [];
    
    console.log(`🎯 Found ${ttmVideos.length} TTM videos in Media Library:`);
    
    if (ttmVideos.length > 0) {
      ttmVideos.forEach(video => {
        console.log(`   ✅ ${video.name} (ID: ${video.id})`);
        console.log(`      Created: ${video.created_time}`);
        console.log(`      URL: ${video.url}`);
        console.log(`      Dimensions: ${video.width}x${video.height}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No TTM videos found in Media Library');
    }
    
    // Let's also check for ad videos specifically
    console.log('🎥 Checking for video assets...');
    const videoAssetsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/advideos?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,created_time,source&limit=100`
    );
    
    if (!videoAssetsResponse.ok) {
      throw new Error(`Failed to fetch video assets: ${videoAssetsResponse.status}`);
    }
    
    const videoAssetsData = await videoAssetsResponse.json();
    console.log(`📹 Found ${videoAssetsData.data?.length || 0} video assets`);
    
    // Filter for TTM videos
    const ttmVideoAssets = videoAssetsData.data?.filter(video => 
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
    
    // Let's also check the business media library
    console.log('🏢 Checking Business Media Library...');
    const businessMediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/business_media?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,media_type,created_time,url&limit=100`
    );
    
    if (!businessMediaResponse.ok) {
      console.log(`⚠️  Could not access business media: ${businessMediaResponse.status}`);
    } else {
      const businessMediaData = await businessMediaResponse.json();
      console.log(`📋 Found ${businessMediaData.data?.length || 0} business media items`);
      
      const ttmBusinessMedia = businessMediaData.data?.filter(item => 
        item.name && item.name.includes('TTM_')
      ) || [];
      
      console.log(`🎯 Found ${ttmBusinessMedia.length} TTM business media items:`);
      
      if (ttmBusinessMedia.length > 0) {
        ttmBusinessMedia.forEach(item => {
          console.log(`   ✅ ${item.name} (ID: ${item.id})`);
          console.log(`      Type: ${item.media_type}`);
          console.log(`      Created: ${item.created_time}`);
          console.log(`      URL: ${item.url}`);
          console.log('');
        });
      }
    }
    
    console.log('\n🎉 Facebook Media Library Check Summary:');
    console.log('=====================================');
    console.log(`✅ Ad Accounts: ${adAccountsData.data?.length || 0}`);
    console.log(`✅ Media Library Items: ${mediaLibraryData.data?.length || 0}`);
    console.log(`✅ TTM Videos in Media Library: ${ttmVideos.length}`);
    console.log(`✅ Video Assets: ${videoAssetsData.data?.length || 0}`);
    console.log(`✅ TTM Video Assets: ${ttmVideoAssets.length}`);
    
    if (ttmVideos.length > 0 || ttmVideoAssets.length > 0) {
      console.log('\n🎯 SUCCESS! TTM videos found in Facebook Media Library!');
      console.log('Ready to replace Google Images with actual videos in ads.');
    } else {
      console.log('\n⚠️  No TTM videos found in Media Library yet.');
      console.log('Make sure videos are uploaded to the "advertentievideos" folder.');
    }
    
  } catch (error) {
    console.error('❌ Error checking Facebook Media Library:', error);
  }
}

checkFacebookMediaLibrary().catch(console.error);
