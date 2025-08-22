require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook environment variables');
  process.exit(1);
}

async function checkBusinessMediaVideos() {
  console.log('🔍 Checking Business Media (Zakelijke Media) for TTM videos...\n');
  
  try {
    // Let's try different approaches to access business media
    console.log('📁 Trying to access business media through different endpoints...\n');
    
    // Method 1: Try to get business media through the user
    console.log('👤 Method 1: User business media...');
    const userBusinessMediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/business_media?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,media_type,created_time,url,folder&limit=100`
    );
    
    if (userBusinessMediaResponse.ok) {
      const userBusinessMediaData = await userBusinessMediaResponse.json();
      console.log(`✅ Found ${userBusinessMediaData.data?.length || 0} items in user business media`);
      
      const ttmVideos = userBusinessMediaData.data?.filter(item => 
        item.name && item.name.includes('TTM_')
      ) || [];
      
      console.log(`🎯 Found ${ttmVideos.length} TTM videos in user business media:`);
      ttmVideos.forEach(video => {
        console.log(`   ✅ ${video.name} (ID: ${video.id})`);
        console.log(`      Type: ${video.media_type}`);
        console.log(`      Created: ${video.created_time}`);
        console.log(`      Folder: ${video.folder?.name || 'No Folder'}`);
        console.log(`      URL: ${video.url}`);
        console.log('');
      });
    } else {
      console.log(`❌ User business media failed: ${userBusinessMediaResponse.status}`);
    }
    
    // Method 2: Try to get business media through the business manager
    console.log('🏢 Method 2: Business Manager media...');
    const businessManagerResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/businesses?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name`
    );
    
    if (businessManagerResponse.ok) {
      const businessManagerData = await businessManagerResponse.json();
      console.log(`✅ Found ${businessManagerData.data?.length || 0} businesses`);
      
      for (const business of businessManagerData.data || []) {
        console.log(`\n🔍 Checking business: ${business.name} (${business.id})`);
        
        const businessMediaResponse = await fetch(
          `https://graph.facebook.com/v19.0/${business.id}/business_media?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,media_type,created_time,url,folder&limit=100`
        );
        
        if (businessMediaResponse.ok) {
          const businessMediaData = await businessMediaResponse.json();
          console.log(`   📋 Found ${businessMediaData.data?.length || 0} media items`);
          
          const ttmVideos = businessMediaData.data?.filter(item => 
            item.name && item.name.includes('TTM_')
          ) || [];
          
          if (ttmVideos.length > 0) {
            console.log(`   🎯 Found ${ttmVideos.length} TTM videos in ${business.name}:`);
            ttmVideos.forEach(video => {
              console.log(`      ✅ ${video.name} (ID: ${video.id})`);
              console.log(`         Type: ${video.media_type}`);
              console.log(`         Folder: ${video.folder?.name || 'No Folder'}`);
              console.log(`         URL: ${video.url}`);
            });
          }
        } else {
          console.log(`   ❌ Could not access business media: ${businessMediaResponse.status}`);
        }
      }
    } else {
      console.log(`❌ Business manager failed: ${businessManagerResponse.status}`);
    }
    
    // Method 3: Try to get media through the ad account
    console.log('\n💼 Method 3: Ad Account media...');
    const adAccountMediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adimages?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,url,width,height,created_time&limit=100`
    );
    
    if (adAccountMediaResponse.ok) {
      const adAccountMediaData = await adAccountMediaResponse.json();
      console.log(`✅ Found ${adAccountMediaData.data?.length || 0} items in ad account media`);
      
      adAccountMediaData.data?.forEach(item => {
        console.log(`   - ${item.name} (${item.width}x${item.height})`);
      });
    } else {
      console.log(`❌ Ad account media failed: ${adAccountMediaResponse.status}`);
    }
    
    // Method 4: Try to get video assets from ad account
    console.log('\n🎥 Method 4: Ad Account video assets...');
    const adAccountVideosResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/advideos?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,created_time,source&limit=100`
    );
    
    if (adAccountVideosResponse.ok) {
      const adAccountVideosData = await adAccountVideosResponse.json();
      console.log(`✅ Found ${adAccountVideosData.data?.length || 0} video assets in ad account`);
      
      adAccountVideosData.data?.forEach(video => {
        console.log(`   - ${video.name} (Status: ${video.status})`);
      });
    } else {
      console.log(`❌ Ad account videos failed: ${adAccountVideosResponse.status}`);
    }
    
    console.log('\n🎉 Business Media Check Summary:');
    console.log('================================');
    console.log('✅ Checked multiple endpoints for business media');
    console.log('✅ Looked for TTM videos in various locations');
    console.log('✅ Verified ad account access');
    
    console.log('\n💡 Next Steps:');
    console.log('1. If videos are found in business media, we can try to copy them to ad account');
    console.log('2. Or we can upload them directly to the ad account media library');
    console.log('3. Check if we need different permissions to access business media');
    
  } catch (error) {
    console.error('❌ Error checking business media videos:', error);
  }
}

checkBusinessMediaVideos().catch(console.error);
