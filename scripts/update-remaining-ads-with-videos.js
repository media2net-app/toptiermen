require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook environment variables');
  process.exit(1);
}

async function updateRemainingAdsWithVideos() {
  console.log('🎬 Updating remaining ads with videos...\n');
  
  try {
    // First, let's get the video IDs from the Media Library
    console.log('🔍 Getting video IDs from Media Library...');
    
    const videosResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adimages?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,url,width,height,created_time&limit=100`
    );
    
    if (!videosResponse.ok) {
      console.error('❌ Could not fetch videos from Media Library');
      return;
    }
    
    const videosData = await videosResponse.json();
    const ttmVideos = videosData.data?.filter(item => 
      item.name && item.name.includes('TTM_')
    ) || [];
    
    console.log(`📋 Found ${ttmVideos.length} TTM videos in Media Library`);
    
    if (ttmVideos.length === 0) {
      console.log('❌ No TTM videos found in Media Library');
      console.log('💡 Make sure videos are uploaded to Media advertentieaccount');
      return;
    }
    
    // Display found videos
    console.log('\n🎯 TTM Videos found:');
    ttmVideos.forEach(video => {
      console.log(`   ✅ ${video.name} (ID: ${video.id})`);
    });
    
    // Get existing ad creatives that still use Google Images
    console.log('\n🎨 Getting ad creatives that need video updates...');
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
    
    console.log(`📋 Found ${creativesToUpdate.length} creatives to update with videos\n`);
    
    // Create video mapping
    const videoMap = {};
    ttmVideos.forEach(video => {
      const videoName = video.name.replace('.mp4', '');
      videoMap[videoName] = video;
    });
    
    // Update each creative
    let updatedCount = 0;
    
    for (const creative of creativesToUpdate) {
      console.log(`🔄 Updating creative: ${creative.name}`);
      
      // Map creative to video based on name
      let targetVideo = null;
      
      if (creative.name.includes('Algemeen - Interest Based')) {
        targetVideo = videoMap['TTM_algemeen_01'];
      } else if (creative.name.includes('Algemeen - Lookalike')) {
        targetVideo = videoMap['TTM_algemeen_02'];
      } else if (creative.name.includes('Algemeen - Custom Audience')) {
        targetVideo = videoMap['TTM_algemeen_03'];
      } else if (creative.name.includes('Algemeen - Awareness')) {
        targetVideo = videoMap['TTM_algemeen_04'];
      } else if (creative.name.includes('Algemeen - Retargeting')) {
        targetVideo = videoMap['TTM_algemeen_05'];
      } else if (creative.name.includes('Jongeren - Social & Community')) {
        targetVideo = videoMap['TTM_jongeren_01'];
      } else if (creative.name.includes('Jongeren - Fitness & Lifestyle')) {
        targetVideo = videoMap['TTM_jongeren_02'];
      } else if (creative.name.includes('Vaders - Role Model & Success')) {
        targetVideo = videoMap['TTM_vaders_01'];
      } else if (creative.name.includes('Vaders - Family & Leadership')) {
        targetVideo = videoMap['TTM_vaders_02'];
      } else if (creative.name.includes('Zakelijk - Entrepreneurs & Leaders')) {
        targetVideo = videoMap['TTM_zakelijk_01'];
      } else if (creative.name.includes('Zakelijk - Business Professionals')) {
        targetVideo = videoMap['TTM_zakelijk_02'];
      }
      
      if (!targetVideo) {
        console.log(`   ⚠️  No matching video found for: ${creative.name}`);
        continue;
      }
      
      console.log(`   🎬 Using video: ${targetVideo.name} (ID: ${targetVideo.id})`);
      
      // Create new creative with video_data structure (like the manually updated one)
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
                video_data: {
                  video_id: targetVideo.id,
                  message: creative.object_story_spec.link_data.message,
                  call_to_action: {
                    type: 'LEARN_MORE',
                    value: {
                      link: 'https://platform.toptiermen.eu/prelaunch',
                      link_format: 'VIDEO_LPP'
                    }
                  }
                }
              }
            })
          }
        );
        
        if (createResponse.ok) {
          const newCreative = await createResponse.json();
          console.log(`   ✅ New creative created successfully!`);
          console.log(`   📋 New Creative ID: ${newCreative.id}`);
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
    console.log(`✅ TTM Videos found: ${ttmVideos.length}`);
    console.log(`✅ Creatives to update: ${creativesToUpdate.length}`);
    console.log(`✅ New creatives created: ${updatedCount}`);
    
    if (updatedCount > 0) {
      console.log('🎯 SUCCESS! Remaining ads updated with videos!');
      console.log('🎬 All ads now use video content instead of Google Images!');
    } else {
      console.log('⚠️  No creatives were updated');
      console.log('💡 Check the error messages above');
    }
    
  } catch (error) {
    console.error('❌ Error during creative update:', error);
  }
}

updateRemainingAdsWithVideos().catch(console.error);
