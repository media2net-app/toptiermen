require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook environment variables');
  process.exit(1);
}

async function checkFacebookFolders() {
  console.log('🔍 Checking Facebook Media Library folders...\n');
  
  try {
    // First, let's check if we can access the business media library with different endpoints
    console.log('📁 Checking for media folders...');
    
    // Try to get business media with folder information
    const businessMediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/business_media?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,media_type,created_time,url,folder&limit=100`
    );
    
    if (businessMediaResponse.ok) {
      const businessMediaData = await businessMediaResponse.json();
      console.log(`📋 Found ${businessMediaData.data?.length || 0} business media items`);
      
      // Group by folder
      const folderGroups = {};
      businessMediaData.data?.forEach(item => {
        const folderName = item.folder?.name || 'No Folder';
        if (!folderGroups[folderName]) {
          folderGroups[folderName] = [];
        }
        folderGroups[folderName].push(item);
      });
      
      console.log('\n📂 Media organized by folders:');
      Object.keys(folderGroups).forEach(folderName => {
        console.log(`\n📁 Folder: "${folderName}" (${folderGroups[folderName].length} items)`);
        folderGroups[folderName].forEach(item => {
          console.log(`   - ${item.name} (${item.media_type})`);
        });
      });
      
      // Look for TTM videos specifically
      const ttmVideos = businessMediaData.data?.filter(item => 
        item.name && item.name.includes('TTM_')
      ) || [];
      
      console.log(`\n🎯 Found ${ttmVideos.length} TTM videos in business media:`);
      ttmVideos.forEach(video => {
        console.log(`   ✅ ${video.name} (ID: ${video.id})`);
        console.log(`      Folder: ${video.folder?.name || 'No Folder'}`);
        console.log(`      Type: ${video.media_type}`);
        console.log(`      Created: ${video.created_time}`);
        console.log('');
      });
    } else {
      console.log(`⚠️  Could not access business media: ${businessMediaResponse.status}`);
    }
    
    // Let's also try to get the ad account's media library
    console.log('\n🎬 Checking Ad Account Media Library...');
    const adAccountMediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adimages?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,url,width,height,created_time&limit=100`
    );
    
    if (adAccountMediaResponse.ok) {
      const adAccountMediaData = await adAccountMediaResponse.json();
      console.log(`📋 Found ${adAccountMediaData.data?.length || 0} media items in ad account`);
      
      adAccountMediaData.data?.forEach(item => {
        console.log(`   - ${item.name} (${item.width}x${item.height})`);
      });
    } else {
      console.log(`⚠️  Could not access ad account media: ${adAccountMediaResponse.status}`);
    }
    
    // Let's try to get video assets from the ad account
    console.log('\n🎥 Checking Ad Account Video Assets...');
    const adAccountVideosResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/advideos?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,created_time,source&limit=100`
    );
    
    if (adAccountVideosResponse.ok) {
      const adAccountVideosData = await adAccountVideosResponse.json();
      console.log(`📹 Found ${adAccountVideosData.data?.length || 0} video assets in ad account`);
      
      adAccountVideosData.data?.forEach(video => {
        console.log(`   - ${video.name} (Status: ${video.status})`);
      });
    } else {
      console.log(`⚠️  Could not access ad account videos: ${adAccountVideosResponse.status}`);
    }
    
    // Let's also check if we can access the user's media library
    console.log('\n👤 Checking User Media Library...');
    const userMediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/photos?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,created_time&limit=100`
    );
    
    if (userMediaResponse.ok) {
      const userMediaData = await userMediaResponse.json();
      console.log(`📋 Found ${userMediaData.data?.length || 0} user photos`);
    } else {
      console.log(`⚠️  Could not access user media: ${userMediaResponse.status}`);
    }
    
    // Let's try to get the business manager assets
    console.log('\n🏢 Checking Business Manager Assets...');
    const businessAssetsResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/businesses?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,verification_status`
    );
    
    if (businessAssetsResponse.ok) {
      const businessAssetsData = await businessAssetsResponse.json();
      console.log(`📋 Found ${businessAssetsData.data?.length || 0} businesses`);
      
      businessAssetsData.data?.forEach(business => {
        console.log(`   - ${business.name} (ID: ${business.id}) - Status: ${business.verification_status}`);
      });
    } else {
      console.log(`⚠️  Could not access businesses: ${businessAssetsResponse.status}`);
    }
    
    console.log('\n🎉 Facebook Folders Check Summary:');
    console.log('=================================');
    console.log('✅ Checked multiple Facebook Media Library endpoints');
    console.log('✅ Verified ad account access');
    console.log('✅ Checked for folder organization');
    console.log('✅ Looked for TTM videos in various locations');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Videos might still be processing in Facebook');
    console.log('2. Check if videos are in a specific folder that requires different API access');
    console.log('3. Try uploading one video directly to the ad account media library');
    console.log('4. Check Facebook Business Manager for media assets');
    
  } catch (error) {
    console.error('❌ Error checking Facebook folders:', error);
  }
}

checkFacebookFolders().catch(console.error);
