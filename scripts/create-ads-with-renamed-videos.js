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
      return data.videos;
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

async function createAd(adSetId, adSetName, creativeId) {
  console.log(`📢 Creating ad for: ${adSetName}`);

  const adPayload = {
    name: `Ad - ${adSetName}`,
    adset_id: adSetId,
    creative: {
      creative_id: creativeId
    },
    status: 'PAUSED'
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adPayload)
      }
    );

    const result = await response.json();

    if (result.id) {
      console.log(`✅ Ad created: ${result.id} for ${adSetName}`);
      return result.id;
    } else {
      console.error(`❌ Ad creation failed:`, result);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating ad:`, error);
    return null;
  }
}

async function getAdSets() {
  console.log('📋 Fetching ad sets...');

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status&limit=1000`
    );

    const data = await response.json();

    if (data.data) {
      const ttmAdSets = data.data.filter(adSet =>
        adSet.name && adSet.name.includes('TTM')
      );

      console.log(`✅ Found ${ttmAdSets.length} TTM ad sets`);
      return ttmAdSets;
    } else {
      console.error('❌ Failed to fetch ad sets:', data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching ad sets:', error);
    return [];
  }
}

function getVideoForAdSet(adSetName) {
  if (adSetName.includes('Zakelijk - Entrepreneurs & Leaders')) {
    return 'zakelijk_01.mp4';
  } else if (adSetName.includes('Zakelijk - Business Professionals')) {
    return 'zakelijk_02.mp4';
  } else if (adSetName.includes('Vaders - Role Model & Success')) {
    return 'vaders_01.mp4';
  } else if (adSetName.includes('Vaders - Family & Leadership')) {
    return 'vaders_02.mp4';
  } else if (adSetName.includes('Jongeren - Social & Community')) {
    return 'jongeren_01.mp4';
  } else if (adSetName.includes('Jongeren - Fitness & Lifestyle')) {
    return 'jongeren_02.mp4';
  } else if (adSetName.includes('Algemeen - Custom Audience')) {
    return 'algemeen_01.mp4';
  } else if (adSetName.includes('Algemeen - Retargeting')) {
    return 'algemeen_02.mp4';
  } else if (adSetName.includes('Algemeen - Lookalike')) {
    return 'algemeen_03.mp4';
  } else if (adSetName.includes('Algemeen - Interest Based')) {
    return 'algemeen_04.mp4';
  } else if (adSetName.includes('Algemeen - Awareness')) {
    return 'algemeen_05.mp4';
  } else {
    return 'algemeen_01.mp4'; // Default
  }
}

async function createAdsWithVideos() {
  console.log('🚀 Starting creation of ads with renamed videos...');
  
  // Get available videos
  const videos = await getAdvertentieVideos();
  if (videos.length === 0) {
    console.error('❌ No videos found');
    return;
  }

  // Get TTM ad sets
  const adSets = await getAdSets();
  if (adSets.length === 0) {
    console.error('❌ No TTM ad sets found');
    return;
  }

  console.log(`🎯 Will create ads for ${adSets.length} ad sets with ${videos.length} available videos`);

  const results = [];
  
  for (const adSet of adSets) {
    console.log(`\n📦 Processing ad set: ${adSet.name} (${adSet.id})`);
    
    // Get the correct video for this ad set
    const videoName = getVideoForAdSet(adSet.name);
    const video = videos.find(v => v.name === videoName);
    
    if (!video) {
      console.log(`⚠️  Video ${videoName} not found, skipping...`);
      continue;
    }
    
    console.log(`🎥 Using video: ${video.name}`);
    
    // Upload video to Facebook
    const videoId = await uploadVideoToFacebook(video.public_url, video.name);
    
    if (videoId) {
      // Create video ad creative
      const creativeId = await createVideoAdCreative(videoId, adSet.name, video.name);
      
      if (creativeId) {
        // Create ad
        const adId = await createAd(adSet.id, adSet.name, creativeId);
        
        if (adId) {
          results.push({
            adSetName: adSet.name,
            adSetId: adSet.id,
            videoName: video.name,
            videoId: videoId,
            creativeId: creativeId,
            adId: adId
          });
        }
      }
    }
    
    // Wait a bit between creations to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n🎉 Summary:');
  console.log(`✅ Created ${results.length} ads with videos`);
  
  results.forEach(result => {
    console.log(`   - ${result.adSetName}: Video ${result.videoName} → Ad ID ${result.adId}`);
  });
  
  if (results.length === adSets.length) {
    console.log('\n🎯 Perfect! All ads created with videos!');
  } else {
    console.log(`\n⚠️  Created ${results.length}/${adSets.length} ads. Some may have failed.`);
  }
}

createAdsWithVideos().catch(console.error);
