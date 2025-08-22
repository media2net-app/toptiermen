require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID || !FACEBOOK_PAGE_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function updateAdCreative(creativeId, adSetName) {
  console.log(`🔄 Updating ad creative: ${creativeId} for ${adSetName}`);
  
  const updatePayload = {
    object_story_spec: {
      page_id: FACEBOOK_PAGE_ID,
      link_data: {
        link: 'https://platform.toptiermen.eu/prelaunch',
        message: `Ontdek Top Tier Men - ${adSetName}`,
        call_to_action: {
          type: 'LEARN_MORE'
        }
      }
    }
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${creativeId}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
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
      console.log(`✅ Ad creative updated: ${creativeId}`);
      return true;
    } else {
      console.error(`❌ Ad creative update failed:`, result);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ad creative:`, error);
    return false;
  }
}

async function getAds() {
  console.log('📋 Fetching ads...');
  
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

async function updateAllAdsToPrelaunch() {
  console.log('🚀 Starting update of ads to prelaunch URL...');
  
  const ads = await getAds();
  
  if (ads.length === 0) {
    console.error('❌ No ads found');
    return;
  }

  const results = [];
  
  for (const ad of ads) {
    console.log(`\n📦 Processing ad: ${ad.name} (${ad.id})`);
    
    if (ad.creative && ad.creative.id) {
      const success = await updateAdCreative(ad.creative.id, ad.name);
      
      if (success) {
        results.push({
          adName: ad.name,
          adId: ad.id,
          creativeId: ad.creative.id
        });
      }
    } else {
      console.log(`⚠️  No creative found for ad: ${ad.name}`);
    }
    
    // Wait a bit between updates to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Summary:');
  console.log(`✅ Updated ${results.length} ads successfully`);
  
  results.forEach(result => {
    console.log(`   - ${result.adName}: Creative ID ${result.creativeId}`);
  });
  
  if (results.length === 11) {
    console.log('\n🎯 Perfect! All 11 ads updated to prelaunch URL!');
  } else {
    console.log(`\n⚠️  Updated ${results.length}/11 ads. Some may have failed.`);
  }
}

updateAllAdsToPrelaunch().catch(console.error);
