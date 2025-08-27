require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

async function createAd(adSetId, adConfig = {}) {
  try {
    console.log('🎯 Creating Facebook Ad...');
    
    // Step 1: Create ad creative
    const defaultCreativeConfig = {
      name: 'TTM - API Test Creative',
      title: 'Word een Top Tier Man',
      body: 'Fysiek sterker, mentaal onbreekbaar en financieel onafhankelijk. Met mariniersdiscipline word jij een Top Tier Men.',
      object_story_spec: {
        page_id: 'YOUR_PAGE_ID', // Replace with actual page ID
        link_data: {
          link: 'https://platform.toptiermen.eu/prelaunch',
          message: 'Schrijf je in voor de wachtlijst van Top Tier Men'
        }
      }
    };

    const creativeData = { ...defaultCreativeConfig, ...adConfig.creative };

    const creativeResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adcreatives`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...creativeData
        })
      }
    );

    if (!creativeResponse.ok) {
      const errorText = await creativeResponse.text();
      console.error('❌ Failed to create ad creative:', errorText);
      return null;
    }

    const creative = await creativeResponse.json();
    console.log('✅ Ad Creative created successfully!');
    console.log('📋 Creative ID:', creative.id);

    // Step 2: Create ad
    const defaultAdConfig = {
      name: 'TTM - API Test Ad',
      status: 'PAUSED'
    };

    const adData = {
      ...defaultAdConfig,
      ...adConfig,
      adset_id: adSetId,
      creative: { creative_id: creative.id }
    };

    const adResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...adData
        })
      }
    );

    if (!adResponse.ok) {
      const errorText = await adResponse.text();
      console.error('❌ Failed to create ad:', errorText);
      return null;
    }

    const ad = await adResponse.json();
    console.log('✅ Ad created successfully!');
    console.log('📋 Ad ID:', ad.id);
    console.log('📋 Ad name:', ad.name);
    
    return ad;

  } catch (error) {
    console.error('❌ Error creating ad:', error);
    return null;
  }
}

// Export for use in other scripts
module.exports = { createAd };

// Run directly if called from command line
if (require.main === module) {
  const adSetId = process.argv[2];
  if (!adSetId) {
    console.error('❌ Please provide an ad set ID as argument');
    console.log('Usage: node api-create-ad.js <ADSET_ID>');
    process.exit(1);
  }
  createAd(adSetId).catch(console.error);
}
