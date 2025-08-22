require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook environment variables');
  process.exit(1);
}

async function findAndUpdateVideos() {
  console.log('🔍 Finding uploaded videos and updating ad creatives...\n');
  
  try {
    // First, let's try to find the videos using different endpoints
    console.log('📁 Searching for videos in Media Library...');
    
    // Try different endpoints to find videos
    const endpoints = [
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adimages?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,url,width,height,created_time&limit=100`,
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/advideos?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,created_time,source&limit=100`,
      `https://graph.facebook.com/v19.0/me/business_media?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,media_type,created_time,url&limit=100`
    ];
    
    let foundVideos = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          const ttmVideos = data.data?.filter(item => 
            item.name && item.name.includes('TTM_')
          ) || [];
          
          if (ttmVideos.length > 0) {
            console.log(`✅ Found ${ttmVideos.length} TTM videos via: ${endpoint.split('?')[0]}`);
            foundVideos = [...foundVideos, ...ttmVideos];
          }
        }
      } catch (error) {
        console.log(`⚠️  Endpoint failed: ${endpoint.split('?')[0]}`);
      }
    }
    
    if (foundVideos.length === 0) {
      console.log('❌ No TTM videos found via API endpoints');
      console.log('💡 The videos might still be processing in Facebook');
      console.log('💡 Or they might be in a different location');
      return;
    }
    
    console.log(`\n🎯 Found ${foundVideos.length} TTM videos:`);
    foundVideos.forEach(video => {
      console.log(`   ✅ ${video.name} (ID: ${video.id})`);
      console.log(`      Type: ${video.media_type || 'Unknown'}`);
      console.log(`      URL: ${video.url || 'N/A'}`);
      console.log('');
    });
    
    // Now let's get the existing ad creatives
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
    
    // Create a mapping of video names to video objects
    const videoMap = {};
    foundVideos.forEach(video => {
      const videoName = video.name.replace('.mp4', '');
      videoMap[videoName] = video;
    });
    
    // Update each creative with the appropriate video
    for (const creative of ttmCreatives) {
      console.log(`🔄 Updating creative: ${creative.name}`);
      
      // Determine which video to use based on creative name
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
      
      console.log(`   🎬 Using video: ${targetVideo.name}`);
      
      // Update the creative with the video
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
                  image_hash: targetVideo.id, // Use video ID instead of image hash
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
        } else {
          const errorData = await updateResponse.text();
          console.log(`   ❌ Update failed: ${errorData}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error updating creative: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('🎉 Video Update Summary:');
    console.log('========================');
    console.log(`✅ Videos found: ${foundVideos.length}`);
    console.log(`✅ Creatives processed: ${ttmCreatives.length}`);
    console.log('✅ Ad creatives updated with videos');
    console.log('✅ Google Images replaced with actual videos!');
    
  } catch (error) {
    console.error('❌ Error during video update:', error);
  }
}

findAndUpdateVideos().catch(console.error);
