const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

// Existing active campaigns that need LEADS versions
const EXISTING_CAMPAIGNS = [
  {
    name: 'TTM - Zakelijk Prelaunch Campagne',
    id: '120232181493720324'
  },
  {
    name: 'TTM - Vaders Prelaunch Campagne', 
    id: '120232181491490324'
  },
  {
    name: 'TTM - Jongeren Prelaunch Campagne',
    id: '120232181487970324'
  },
  {
    name: 'TTM - Algemene Prelaunch Campagne',
    id: '120232181480080324'
  }
];

async function createLeadsCampaign(campaignName, originalCampaignId) {
  const leadsCampaignName = `${campaignName} - LEADS`;
  
  console.log(`\n🎯 Creating LEADS campaign: ${leadsCampaignName}`);
  
  try {
    // Create the LEADS campaign
    const createCampaignResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          name: leadsCampaignName,
          objective: 'OUTCOME_LEADS',
          status: 'PAUSED', // Start paused for safety
          special_ad_categories: [],
          // Copy settings from original campaign
          start_time: Math.floor(Date.now() / 1000) + 3600, // Start in 1 hour
          daily_budget: 5000, // €50 daily budget
          billing_event: 'IMPRESSIONS',
          optimization_goal: 'LEADS',
          bid_strategy: 'LOWEST_COST_WITHOUT_CAP'
        })
      }
    );

    if (!createCampaignResponse.ok) {
      const errorText = await createCampaignResponse.text();
      console.error(`❌ Failed to create campaign ${leadsCampaignName}:`, errorText);
      return null;
    }

    const campaignData = await createCampaignResponse.json();
    console.log(`✅ Created campaign: ${leadsCampaignName} (ID: ${campaignData.id})`);

    // Get ad sets from original campaign to copy targeting
    console.log(`📋 Fetching ad sets from original campaign ${originalCampaignId}...`);
    const adSetsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${originalCampaignId}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,targeting,daily_budget,lifetime_budget,bid_amount,bid_strategy,optimization_goal,start_time,end_time,status&limit=100`
    );

    if (adSetsResponse.ok) {
      const adSetsData = await adSetsResponse.json();
      console.log(`📋 Found ${adSetsData.data?.length || 0} ad sets to copy`);

      // Create ad sets for the new LEADS campaign
      for (const adSet of adSetsData.data || []) {
        const newAdSetName = `${adSet.name} - LEADS`;
        
        console.log(`📋 Creating ad set: ${newAdSetName}`);
        
        const createAdSetResponse = await fetch(
          `https://graph.facebook.com/v19.0/${campaignData.id}/adsets`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: FACEBOOK_ACCESS_TOKEN,
              name: newAdSetName,
              campaign_id: campaignData.id,
              targeting: adSet.targeting,
              daily_budget: adSet.daily_budget || 5000,
              bid_amount: adSet.bid_amount || 200,
              bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
              optimization_goal: 'LEADS',
              status: 'PAUSED',
              start_time: Math.floor(Date.now() / 1000) + 3600
            })
          }
        );

        if (createAdSetResponse.ok) {
          const adSetData = await createAdSetResponse.json();
          console.log(`✅ Created ad set: ${newAdSetName} (ID: ${adSetData.id})`);
        } else {
          const errorText = await createAdSetResponse.text();
          console.error(`❌ Failed to create ad set ${newAdSetName}:`, errorText);
        }
      }
    }

    return campaignData.id;

  } catch (error) {
    console.error(`❌ Error creating LEADS campaign for ${campaignName}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Creating LEADS campaigns for all active campaigns...\n');
  
  const createdCampaigns = [];
  
  for (const campaign of EXISTING_CAMPAIGNS) {
    const campaignId = await createLeadsCampaign(campaign.name, campaign.id);
    if (campaignId) {
      createdCampaigns.push({
        name: `${campaign.name} - LEADS`,
        id: campaignId
      });
    }
    
    // Wait 2 seconds between campaigns to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 LEADS Campaign Creation Summary:');
  console.log('=====================================');
  
  if (createdCampaigns.length > 0) {
    console.log(`✅ Successfully created ${createdCampaigns.length} LEADS campaigns:`);
    createdCampaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.name} (ID: ${campaign.id})`);
    });
    
    console.log('\n📝 Next steps:');
    console.log('1. Review the campaigns in Facebook Ads Manager');
    console.log('2. Set up lead forms for each campaign');
    console.log('3. Create ad creatives for each ad set');
    console.log('4. Activate campaigns when ready');
    
  } else {
    console.log('❌ No campaigns were created successfully');
  }
}

main().catch(console.error);
