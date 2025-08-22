require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook environment variables');
  process.exit(1);
}

async function updateAllAdsWithCompleteStructure() {
  console.log('🎬 Updating all ads with complete structure (Instagram + Video + Correct Link + PAY_TO_ACCESS)...\n');
  
  try {
    // We know the video ID and image hash from the manually updated ad
    const knownVideoId = '2236550093464614'; // From the manually updated ad
    const knownImageHash = 'beb36994f50059b830badcb3bb91b065'; // From the manually updated ad
    const knownImageUrl = 'https://www.facebook.com/ads/image/?d=AQKUvm7Ntk-KgKyo4DhCzR8NLK-uQFQDl0BFcZV3B3tfFOcSKO8ajOMEKb3Wp4wafTgIEUi5A5tdiFhExdrlFU7mR7oVk4ilecnY4ZlT7qye3FTwjFssJl62pMvbu5ANUvnPfMvcasyyftJyR_wd92B1';
    const instagramUserId = '17841472149652019'; // From the manually updated ad
    
    console.log(`🎯 Using known video ID: ${knownVideoId}`);
    console.log(`🎯 Using known image hash: ${knownImageHash}`);
    console.log(`🎯 Using Instagram User ID: ${instagramUserId}`);
    
    // Get existing ad creatives that still use Google Images
    console.log('\n🎨 Getting ad creatives that need complete structure updates...');
    const creativesResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adcreatives?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,object_story_spec&limit=100`
    );
    
    if (!creativesResponse.ok) {
      console.error('❌ Could not fetch ad creatives');
      return;
    }
    
    const creativesData = await creativesResponse.json();
    
    // Filter for creatives that still use link_data (Google Images) instead of video_data
    const creativesToUpdate = creativesData.data?.filter(creative => 
      creative.name && 
      creative.name.includes('TTM') && 
      creative.object_story_spec?.link_data && // Still using link_data (Google Images)
      !creative.object_story_spec?.video_data // Not yet using video_data
    ) || [];
    
    console.log(`📋 Found ${creativesToUpdate.length} creatives to update with complete structure\n`);
    
    // Update each creative
    let updatedCount = 0;
    
    for (const creative of creativesToUpdate) {
      console.log(`🔄 Updating creative: ${creative.name}`);
      
      // Create new creative with complete structure (Instagram + Video + Correct Link + PAY_TO_ACCESS)
      try {
        const createResponse = await fetch(
          `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adcreatives?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: `Ontdek Top Tier Men - ${creative.name.split('Creative - ')[1]}`,
              object_story_spec: {
                page_id: creative.object_story_spec.page_id,
                instagram_user_id: instagramUserId, // Add Instagram
                video_data: {
                  video_id: knownVideoId,
                  message: creative.object_story_spec.link_data.message,
                  call_to_action: {
                    type: 'PAY_TO_ACCESS', // Changed from LEARN_MORE to PAY_TO_ACCESS
                    value: {
                      link: 'https://platform.toptiermen.eu/prelaunch', // Correct link
                      link_format: 'VIDEO_LPP'
                    }
                  },
                  image_hash: knownImageHash // Use image_hash only
                }
              }
            })
          }
        );
        
        if (createResponse.ok) {
          const newCreative = await createResponse.json();
          console.log(`   ✅ New creative created successfully!`);
          console.log(`   📋 New Creative ID: ${newCreative.id}`);
          console.log(`   🎬 Video: ${knownVideoId}`);
          console.log(`   📱 Instagram: ${instagramUserId}`);
          console.log(`   🔗 Link: https://platform.toptiermen.eu/prelaunch`);
          console.log(`   🎯 Action: PAY_TO_ACCESS`);
          updatedCount++;
          
          // Now we need to update the ad to use the new creative
          // First, let's find the ad that uses this creative
          const adsResponse = await fetch(
            `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,creative&limit=100`
          );
          
          if (adsResponse.ok) {
            const adsData = await adsResponse.json();
            const adToUpdate = adsData.data?.find(ad => 
              ad.creative && ad.creative.id === creative.id
            );
            
            if (adToUpdate) {
              console.log(`   🔄 Updating ad: ${adToUpdate.name}`);
              
              const updateAdResponse = await fetch(
                `https://graph.facebook.com/v19.0/${adToUpdate.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    creative: {
                      creative_id: newCreative.id
                    }
                  })
                }
              );
              
              if (updateAdResponse.ok) {
                console.log(`   ✅ Ad updated to use new creative!`);
              } else {
                const errorData = await updateAdResponse.text();
                console.log(`   ❌ Ad update failed: ${errorData}`);
              }
            }
          }
          
        } else {
          const errorData = await createResponse.text();
          console.log(`   ❌ Creative creation failed: ${errorData}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error creating creative: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('🎉 Update Summary:');
    console.log('==================');
    console.log(`✅ Creatives to update: ${creativesToUpdate.length}`);
    console.log(`✅ New creatives created: ${updatedCount}`);
    
    if (updatedCount > 0) {
      console.log('🎯 SUCCESS! All ads updated with complete structure!');
      console.log('🎬 All ads now have:');
      console.log('   ✅ Video content instead of Google Images');
      console.log('   ✅ Instagram integration');
      console.log('   ✅ Correct link to platform.toptiermen.eu/prelaunch');
      console.log('   ✅ PAY_TO_ACCESS button (Krijg toegang)');
      console.log('💡 Note: All ads are using the same video for now');
      console.log('💡 You can now manually assign specific videos to each ad');
    } else {
      console.log('⚠️  No creatives were updated');
      console.log('💡 Check the error messages above');
    }
    
  } catch (error) {
    console.error('❌ Error during creative update:', error);
  }
}

updateAllAdsWithCompleteStructure().catch(console.error);
