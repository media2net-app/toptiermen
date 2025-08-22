require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ Missing FACEBOOK_ACCESS_TOKEN environment variable');
  process.exit(1);
}

console.log(`📊 Using Ad Account ID: ${FACEBOOK_AD_ACCOUNT_ID}`);

// Campaign configurations (campaigns only)
const ALL_CAMPAIGNS = {
  algemene: {
    name: 'TTM - Algemene Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 25 // 5 x €5
  },
  jongeren: {
    name: 'TTM - Jongeren Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 10 // 2 x €5
  },
  vaders: {
    name: 'TTM - Vaders Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 10 // 2 x €5
  },
  zakelijk: {
    name: 'TTM - Zakelijk Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 10 // 2 x €5
  }
};

async function createCampaignsOnly() {
  console.log('🚀 Creating All 4 Campaigns to Facebook (Campaigns Only)...\n');
  console.log(`📊 Ad Account ID: ${FACEBOOK_AD_ACCOUNT_ID}\n`);

  try {
    console.log('📝 Only campaigns will be created\n');
    console.log('💡 You will need to add ad sets and creatives manually in Facebook Ads Manager\n');

    console.log('\n' + '='.repeat(80));
    console.log('📊 CREATING CAMPAIGNS TO FACEBOOK');
    console.log('='.repeat(80));

    const results = {};

    // Create each campaign
    for (const [campaignKey, campaignData] of Object.entries(ALL_CAMPAIGNS)) {
      console.log(`\n🎯 Creating ${campaignKey.toUpperCase()} campaign...`);
      
      console.log(`📊 Campaign: ${campaignData.name}`);
      console.log(`💰 Budget: €${campaignData.campaign_daily_budget}/day`);

      try {
        // Create campaign
        const campaignPayload = {
          name: campaignData.name,
          objective: campaignData.objective,
          status: campaignData.status,
          special_ad_categories: [],
          ad_account_id: FACEBOOK_AD_ACCOUNT_ID
        };

        const campaignResponse = await fetch(
          `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaignPayload)
          }
        );

        if (!campaignResponse.ok) {
          const errorData = await campaignResponse.json();
          throw new Error(`Campaign creation failed: ${JSON.stringify(errorData)}`);
        }

        const campaign = await campaignResponse.json();
        console.log(`✅ Campaign created: ${campaign.id}`);

        results[campaignKey] = {
          success: true,
          campaign: campaign
        };

        console.log(`✅ ${campaignKey} campaign completed successfully!`);
        console.log(`📊 Campaign ID: ${campaign.id}`);

      } catch (error) {
        console.error(`❌ ${campaignKey} campaign creation failed:`, error.message);
        results[campaignKey] = {
          success: false,
          error: error.message
        };
      }

      // Wait a bit between campaigns to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(80));

    const successfulCampaigns = Object.values(results).filter(r => r.success).length;
    const totalBudget = Object.values(ALL_CAMPAIGNS).reduce((sum, campaign) => sum + campaign.campaign_daily_budget, 0);

    console.log(`\n🎉 Campaigns created: ${successfulCampaigns}/4`);
    console.log(`💰 Total daily budget: €${totalBudget}`);

    console.log('\n📊 Campaign Details:');
    Object.entries(results).forEach(([campaignKey, result]) => {
      if (result.success) {
        console.log(`✅ ${campaignKey}: ${result.campaign.name} (ID: ${result.campaign.id})`);
      } else {
        console.log(`❌ ${campaignKey}: Failed - ${result.error}`);
      }
    });

    console.log('\n🔧 Next steps:');
    console.log('1. Go to Facebook Ads Manager');
    console.log('2. Find the created campaigns');
    console.log('3. Add ad sets manually to each campaign');
    console.log('4. Add ad creatives manually to each ad set');
    console.log('5. Link the Facebook page (Top Tier Men) to ad creatives');
    console.log('6. Add images or videos to the ad creatives');
    console.log('7. Set targeting (age, location, interests) for each ad set');
    console.log('8. Set budgets for each ad set (€5/day)');
    console.log('9. Activate campaigns when ready');
    console.log('10. Monitor performance and adjust as needed');
    console.log('11. Focus on email collection for the prelaunch waitlist');

    console.log('\n📋 Manual Setup Instructions:');
    console.log('For each campaign, create ad sets with:');
    console.log('- Daily budget: €5');
    console.log('- Optimization goal: Link clicks');
    console.log('- Billing event: Impressions');
    console.log('- Targeting: Age, location, interests (see campaign data)');
    console.log('- Ad creatives: Link to prelaunch page with call-to-action');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createCampaignsOnly()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
