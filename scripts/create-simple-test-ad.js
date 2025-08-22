const fetch = require('node-fetch');
require('dotenv').config({ path: '../.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID || '610571295471584';

async function createSimpleTestAd() {
  try {
    console.log('🚀 Creating simple test ad...');

    // Step 1: Create a simple campaign
    console.log('📊 Creating test campaign...');
    const campaignResponse = await fetch(`https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Simple Test Campaign',
        objective: 'OUTCOME_TRAFFIC',
        status: 'PAUSED',
        special_ad_categories: []
      })
    });

    const campaignData = await campaignResponse.json();
    if (!campaignResponse.ok) {
      throw new Error(`Campaign creation failed: ${JSON.stringify(campaignData)}`);
    }

    const campaignId = campaignData.id;
    console.log(`✅ Campaign created: ${campaignId}`);

    // Step 2: Create a simple ad set
    console.log('📊 Creating test ad set...');
    const adSetResponse = await fetch(`https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Simple Test Ad Set',
        campaign_id: campaignId,
        targeting: {
          geo_locations: {
            countries: ['NL']
          },
          age_min: 18,
          age_max: 65
        },
        daily_budget: 500, // €5.00
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'LINK_CLICKS',
        bid_amount: 100, // €1.00
        dsa_beneficiary: 'Rick Cuijpers',
        dsa_payor: 'Rick Cuijpers',
        status: 'PAUSED'
      })
    });

    const adSetData = await adSetResponse.json();
    if (!adSetResponse.ok) {
      throw new Error(`Ad Set creation failed: ${JSON.stringify(adSetData)}`);
    }

    const adSetId = adSetData.id;
    console.log(`✅ Ad Set created: ${adSetId}`);

    // Step 3: Create a simple ad creative
    console.log('📊 Creating test ad creative...');
    const creativeResponse = await fetch(`https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adcreatives?access_token=${FACEBOOK_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Simple Test Creative',
        object_story_spec: {
          page_id: FACEBOOK_PAGE_ID,
          link_data: {
            link: 'https://www.google.com',
            message: 'Simple test ad',
            name: 'Test',
            description: 'Test description'
          }
        }
      })
    });

    const creativeData = await creativeResponse.json();
    if (!creativeResponse.ok) {
      throw new Error(`Creative creation failed: ${JSON.stringify(creativeData)}`);
    }

    const creativeId = creativeData.id;
    console.log(`✅ Creative created: ${creativeId}`);

    // Step 4: Create the actual ad
    console.log('📊 Creating test ad...');
    const adResponse = await fetch(`https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Simple Test Ad',
        adset_id: adSetId,
        creative: {
          creative_id: creativeId
        },
        status: 'PAUSED'
      })
    });

    const adData = await adResponse.json();
    if (!adResponse.ok) {
      throw new Error(`Ad creation failed: ${JSON.stringify(adData)}`);
    }

    const adId = adData.id;
    console.log(`✅ Ad created: ${adId}`);

    console.log('\n🎉 Simple test ad successfully created!');
    console.log(`Campaign ID: ${campaignId}`);
    console.log(`Ad Set ID: ${adSetId}`);
    console.log(`Creative ID: ${creativeId}`);
    console.log(`Ad ID: ${adId}`);

  } catch (error) {
    console.error('❌ Error creating simple test ad:', error.message);
  }
}

createSimpleTestAd();
