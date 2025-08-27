require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

async function createCampaign(campaignConfig = {}) {
  try {
    console.log('🎯 Creating Facebook Campaign...');
    
    const defaultConfig = {
      name: 'TTM - API Test Campagne',
      objective: 'OUTCOME_LEADS',
      status: 'PAUSED',
      special_ad_categories: [],
      daily_budget: 5000, // €50
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP'
    };

    const campaignData = { ...defaultConfig, ...campaignConfig };

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...campaignData
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create campaign:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Campaign created successfully!');
    console.log('📋 Campaign ID:', data.id);
    console.log('📋 Campaign name:', data.name);
    
    return data;

  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    return null;
  }
}

// Export for use in other scripts
module.exports = { createCampaign };

// Run directly if called from command line
if (require.main === module) {
  createCampaign().catch(console.error);
}
