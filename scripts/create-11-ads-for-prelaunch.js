require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID || !FACEBOOK_PAGE_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function createAdCreative(adSetId, adSetName) {
  console.log(`🎨 Creating ad creative for: ${adSetName}`);
  
  const creativePayload = {
    name: `Creative - ${adSetName}`,
    object_story_spec: {
      page_id: FACEBOOK_PAGE_ID,
      link_data: {
        link: 'https://www.google.com', // Use a simple external URL first
        message: `Ontdek Top Tier Men - ${adSetName}`,
        call_to_action: {
          type: 'LEARN_MORE'
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
      console.log(`✅ Ad creative created: ${result.id}`);
      return result.id;
    } else {
      console.error(`❌ Ad creative creation failed:`, result);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating ad creative:`, error);
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

async function createAdsForAllAdSets() {
  console.log('🚀 Starting creation of 11 ads for prelaunch...');
  
  const adSets = await getAdSets();
  
  if (adSets.length === 0) {
    console.error('❌ No ad sets found');
    return;
  }

  const results = [];
  
  for (const adSet of adSets) {
    console.log(`\n📦 Processing ad set: ${adSet.name} (${adSet.id})`);
    
    // Create ad creative
    const creativeId = await createAdCreative(adSet.id, adSet.name);
    
    if (creativeId) {
      // Create ad
      const adId = await createAd(adSet.id, adSet.name, creativeId);
      
      if (adId) {
        results.push({
          adSetName: adSet.name,
          adSetId: adSet.id,
          creativeId: creativeId,
          adId: adId
        });
      }
    }
    
    // Wait a bit between creations to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 Summary:');
  console.log(`✅ Created ${results.length} ads successfully`);
  
  results.forEach(result => {
    console.log(`   - ${result.adSetName}: Ad ID ${result.adId}`);
  });
  
  if (results.length === 11) {
    console.log('\n🎯 Perfect! All 11 ads created successfully!');
  } else {
    console.log(`\n⚠️  Created ${results.length}/11 ads. Some may have failed.`);
  }
}

createAdsForAllAdSets().catch(console.error);
