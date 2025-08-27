require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

async function createCompleteAdWorkflow(workflowConfig = {}) {
  try {
    console.log('🚀 Creating complete Facebook Ad workflow...\n');
    
    // Step 1: Create Campaign
    console.log('📋 Step 1: Creating Campaign...');
    const defaultCampaignConfig = {
      name: 'TTM - Complete API Workflow',
      objective: 'OUTCOME_LEADS',
      status: 'PAUSED',
      special_ad_categories: [],
      daily_budget: 5000,
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP'
    };

    const campaignData = { ...defaultCampaignConfig, ...workflowConfig.campaign };

    const campaignResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...campaignData
        })
      }
    );

    if (!campaignResponse.ok) {
      throw new Error(`Campaign creation failed: ${await campaignResponse.text()}`);
    }

    const campaign = await campaignResponse.json();
    console.log('✅ Campaign created:', campaign.id);

    // Step 2: Create Ad Set
    console.log('\n📋 Step 2: Creating Ad Set...');
    const defaultAdSetConfig = {
      name: 'TTM - Complete API Ad Set',
      status: 'PAUSED',
      daily_budget: 5000,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LEADS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
                   targeting: {
               age_min: 25,
               age_max: 45,
               genders: [1], // Alleen mannen - Top Tier Men richt zich exclusief op mannen
        geo_locations: {
          countries: ['NL'],
          location_types: ['home']
        },
        interests: [
          { id: '6002714396372', name: 'Fitness' },
          { id: '6002714396373', name: 'Personal development' }
        ]
      }
    };

    const adSetData = { 
      ...defaultAdSetConfig, 
      ...workflowConfig.adSet,
      campaign_id: campaign.id 
    };

    const adSetResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...adSetData
        })
      }
    );

    if (!adSetResponse.ok) {
      throw new Error(`Ad Set creation failed: ${await adSetResponse.text()}`);
    }

    const adSet = await adSetResponse.json();
    console.log('✅ Ad Set created:', adSet.id);

    // Step 3: Create Ad Creative
    console.log('\n📋 Step 3: Creating Ad Creative...');
    const defaultCreativeConfig = {
      name: 'TTM - Complete API Creative',
      title: 'Word een Top Tier Man',
      body: 'Fysiek sterker, mentaal onbreekbaar en financieel onafhankelijk.',
      object_story_spec: {
        page_id: 'YOUR_PAGE_ID', // Replace with actual page ID
        link_data: {
          link: 'https://platform.toptiermen.eu/prelaunch',
          message: 'Schrijf je in voor de wachtlijst'
        }
      }
    };

    const creativeData = { ...defaultCreativeConfig, ...workflowConfig.creative };

    const creativeResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adcreatives`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...creativeData
        })
      }
    );

    if (!creativeResponse.ok) {
      throw new Error(`Creative creation failed: ${await creativeResponse.text()}`);
    }

    const creative = await creativeResponse.json();
    console.log('✅ Ad Creative created:', creative.id);

    // Step 4: Create Ad
    console.log('\n📋 Step 4: Creating Ad...');
    const defaultAdConfig = {
      name: 'TTM - Complete API Ad',
      status: 'PAUSED'
    };

    const adData = {
      ...defaultAdConfig,
      ...workflowConfig.ad,
      adset_id: adSet.id,
      creative: { creative_id: creative.id }
    };

    const adResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...adData
        })
      }
    );

    if (!adResponse.ok) {
      throw new Error(`Ad creation failed: ${await adResponse.text()}`);
    }

    const ad = await adResponse.json();
    console.log('✅ Ad created:', ad.id);

    // Summary
    console.log('\n🎉 Complete workflow created successfully!');
    console.log('==============================');
    console.log(`Campaign ID: ${campaign.id}`);
    console.log(`Ad Set ID: ${adSet.id}`);
    console.log(`Creative ID: ${creative.id}`);
    console.log(`Ad ID: ${ad.id}`);
    console.log('\n🔗 View in Facebook Ads Manager:');
    console.log(`https://business.facebook.com/adsmanager/manage/campaigns/${campaign.id}`);

    return {
      campaign,
      adSet,
      creative,
      ad
    };

  } catch (error) {
    console.error('❌ Error in complete workflow:', error);
    return null;
  }
}

// Export for use in other scripts
module.exports = { createCompleteAdWorkflow };

// Run directly if called from command line
if (require.main === module) {
  createCompleteAdWorkflow().catch(console.error);
}
