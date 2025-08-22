require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook environment variables');
  process.exit(1);
}

async function updateCreativesWithVideos() {
  console.log('🎬 Updating Ad Creatives with TTM Videos...\n');
  
  try {
    // First, let's check if videos are now available
    console.log('🔍 Checking for TTM videos in Media Library...');
    
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
      console.log('❌ No TTM videos found yet');
      console.log('💡 Videos might still be processing in Facebook');
      console.log('💡 Try running this script again in a few minutes');
      return;
    }
    
    // Display found videos
    console.log('\n🎯 TTM Videos found:');
    ttmVideos.forEach(video => {
      console.log(`   ✅ ${video.name} (ID: ${video.id})`);
      console.log(`      URL: ${video.url}`);
      console.log(`      Dimensions: ${video.width}x${video.height}`);
      console.log('');
    });
    
    // Get existing ad creatives
    console.log('🎨 Getting existing ad creatives...');
    const creativesResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adcreatives?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,object_story_spec&limit=100`
    );
    
    if (!creativesResponse.ok) {
      console.error('❌ Could not fetch ad creatives');
      return;
    }
    
    const creativesData = await creativesResponse.json();
    const ttmCreatives = creativesData.data?.filter(creative => 
      creative.name && creative.name.includes('TTM')
    ) || [];
    
    console.log(`📋 Found ${ttmCreatives.length} TTM ad creatives to update\n`);
    
    // Create video mapping
    const videoMap = {};
    ttmVideos.forEach(video => {
      const videoName = video.name.replace('.mp4', '');
      videoMap[videoName] = video;
    });
    
    // Update each creative
    let updatedCount = 0;
    
    for (const creative of ttmCreatives) {
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
      
      // Update the creative
      try {
        const updateResponse = await fetch(
          `https://graph.facebook.com/v19.0/${creative.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              object_story_spec: {
                page_id: creative.object_story_spec.page_id,
                link_data: {
                  link: 'https://platform.toptiermen.eu/prelaunch',
                  message: creative.object_story_spec.link_data.message,
                  image_hash: targetVideo.id, // Replace Google Image with video
                  call_to_action: {
                    type: 'LEARN_MORE'
                  }
                }
              }
            })
          }
        );
        
        if (updateResponse.ok) {
          console.log(`   ✅ Creative updated successfully!`);
          updatedCount++;
        } else {
          const errorData = await updateResponse.text();
          console.log(`   ❌ Update failed: ${errorData}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error updating creative: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('🎉 Update Summary:');
    console.log('==================');
    console.log(`✅ TTM Videos found: ${ttmVideos.length}`);
    console.log(`✅ TTM Creatives processed: ${ttmCreatives.length}`);
    console.log(`✅ Creatives updated: ${updatedCount}`);
    
    if (updatedCount > 0) {
      console.log('🎯 SUCCESS! Google Images replaced with TTM videos!');
      console.log('🎬 Your ads now use the actual video content!');
    } else {
      console.log('⚠️  No creatives were updated');
      console.log('💡 Check the error messages above');
    }
    
  } catch (error) {
    console.error('❌ Error during creative update:', error);
  }
}

updateCreativesWithVideos().catch(console.error);
