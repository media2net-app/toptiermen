require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID || !FACEBOOK_PAGE_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function getAdvertentieVideos() {
  console.log('🎥 Fetching videos from advertentie materiaal...');
  
  try {
    const response = await fetch('http://localhost:3000/api/list-advertentie-videos');
    const data = await response.json();
    
    if (data.success && data.videos) {
      console.log(`✅ Found ${data.videos.length} videos`);
      
      // Filter for video files
      const videoFiles = data.videos.filter(video => 
        video.name.includes('.mp4') || video.name.includes('.mov')
      );
      
      console.log(`📹 Video files: ${videoFiles.length}`);
      return videoFiles;
    } else {
      console.error('❌ Failed to fetch videos:', data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching videos:', error);
    return [];
  }
}

async function uploadVideoToFacebook(videoUrl, videoName) {
  console.log(`📤 Uploading video to Facebook: ${videoName}`);
  
  const uploadPayload = {
    source: videoUrl,
    title: `TTM Video - ${videoName}`,
    description: 'Top Tier Men advertisement video',
    published: false
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/advideos?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadPayload)
      }
    );

    const result = await response.json();
    
    if (result.id) {
      console.log(`✅ Video uploaded to Facebook: ${result.id}`);
      return result.id;
    } else {
      console.error(`❌ Video upload failed:`, result);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error uploading video:`, error);
    return null;
  }
}

async function createVideoAdCreative(videoId, adSetName, videoName) {
  console.log(`🎨 Creating video ad creative for: ${adSetName}`);
  
  const creativePayload = {
    name: `Video Creative - ${adSetName}`,
    object_story_spec: {
      page_id: FACEBOOK_PAGE_ID,
      video_data: {
        video_id: videoId,
        title: `Ontdek Top Tier Men - ${adSetName}`,
        message: `Transform jezelf met Top Tier Men. ${adSetName}`,
        call_to_action: {
          type: 'LEARN_MORE',
          value: {
            link: 'https://platform.toptiermen.eu/prelaunch'
          }
        }
      }
    }
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adcreatives?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creativePayload)
      }
    );

    const result = await response.json();
    
    if (result.id) {
      console.log(`✅ Video ad creative created: ${result.id}`);
      return result.id;
    } else {
      console.error(`❌ Video ad creative creation failed:`, result);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating video ad creative:`, error);
    return null;
  }
}

async function updateAdCreative(adId, newCreativeId) {
  console.log(`🔄 Updating ad ${adId} with new creative ${newCreativeId}`);
  
  const updatePayload = {
    creative: {
      creative_id: newCreativeId
    }
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${adId}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      }
    );

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Ad updated successfully: ${adId}`);
      return true;
    } else {
      console.error(`❌ Ad update failed:`, result);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ad:`, error);
    return false;
  }
}

async function getTTMAds() {
  console.log('📋 Fetching TTM ads...');
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,creative{id}&limit=1000`
    );

    const data = await response.json();
    
    if (data.data) {
      const ttmAds = data.data.filter(ad => 
        ad.name && ad.name.includes('TTM')
      );
      
      console.log(`✅ Found ${ttmAds.length} TTM ads`);
      return ttmAds;
    } else {
      console.error('❌ Failed to fetch ads:', data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching ads:', error);
    return [];
  }
}

async function updateAllAdsWithVideos() {
  console.log('🚀 Starting update of ads with videos...');
  
  // Get available videos
  const videos = await getAdvertentieVideos();
  if (videos.length === 0) {
    console.error('❌ No videos found');
    return;
  }

  // Get TTM ads
  const ads = await getTTMAds();
  if (ads.length === 0) {
    console.error('❌ No TTM ads found');
    return;
  }

  console.log(`🎯 Will update ${ads.length} ads with ${videos.length} available videos`);

  const results = [];
  
  for (let i = 0; i < ads.length; i++) {
    const ad = ads[i];
    const video = videos[i % videos.length]; // Cycle through videos if we have more ads than videos
    
    console.log(`\n📦 Processing ad: ${ad.name} (${ad.id})`);
    console.log(`🎥 Using video: ${video.name}`);
    
    // Upload video to Facebook
    const videoId = await uploadVideoToFacebook(video.public_url, video.name);
    
    if (videoId) {
      // Create new video ad creative
      const creativeId = await createVideoAdCreative(videoId, ad.name, video.name);
      
      if (creativeId) {
        // Update ad with new creative
        const success = await updateAdCreative(ad.id, creativeId);
        
        if (success) {
          results.push({
            adName: ad.name,
            adId: ad.id,
            videoName: video.name,
            videoId: videoId,
            creativeId: creativeId
          });
        }
      }
    }
    
    // Wait a bit between updates to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n🎉 Summary:');
  console.log(`✅ Updated ${results.length} ads with videos`);
  
  results.forEach(result => {
    console.log(`   - ${result.adName}: Video ${result.videoName} (${result.videoId})`);
  });
  
  if (results.length === ads.length) {
    console.log('\n🎯 Perfect! All ads updated with videos!');
  } else {
    console.log(`\n⚠️  Updated ${results.length}/${ads.length} ads. Some may have failed.`);
  }
}

updateAllAdsWithVideos().catch(console.error);
