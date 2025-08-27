require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

async function createAdSet(campaignId, adSetConfig = {}) {
  try {
    console.log('🎯 Creating Facebook Ad Set...');
    
    const defaultConfig = {
      name: 'TTM - API Test Ad Set',
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
          { id: '6002714396373', name: 'Personal development' },
          { id: '6002714396374', name: 'Business' }
        ],
        behaviors: [
          { id: '6002714396375', name: 'High income' }
        ]
      }
    };

    const adSetData = { 
      ...defaultConfig, 
      ...adSetConfig,
      campaign_id: campaignId 
    };

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...adSetData
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create ad set:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Ad Set created successfully!');
    console.log('📋 Ad Set ID:', data.id);
    console.log('📋 Ad Set name:', data.name);
    
    return data;

  } catch (error) {
    console.error('❌ Error creating ad set:', error);
    return null;
  }
}

// Export for use in other scripts
module.exports = { createAdSet };

// Run directly if called from command line
if (require.main === module) {
  const campaignId = process.argv[2];
  if (!campaignId) {
    console.error('❌ Please provide a campaign ID as argument');
    console.log('Usage: node api-create-adset.js <CAMPAIGN_ID>');
    process.exit(1);
  }
  createAdSet(campaignId).catch(console.error);
}
