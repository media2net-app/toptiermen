require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ Missing FACEBOOK_ACCESS_TOKEN environment variable');
  process.exit(1);
}

async function fetchRealCampaigns() {
  console.log('📊 Fetching real campaigns from Facebook...\n');

  try {
    // Fetch campaigns
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,objective,daily_budget,created_time,updated_time&limit=100`
    );

    if (!campaignsResponse.ok) {
      const errorData = await campaignsResponse.json();
      throw new Error(`Failed to fetch campaigns: ${JSON.stringify(errorData)}`);
    }

    const campaignsData = await campaignsResponse.json();
    const campaigns = campaignsData.data || [];

    console.log(`✅ Found ${campaigns.length} campaigns:`);
    
    const realCampaigns = [];
    
    for (const campaign of campaigns) {
      console.log(`\n📊 Campaign: ${campaign.name}`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Objective: ${campaign.objective}`);
      console.log(`   Daily Budget: €${(campaign.daily_budget || 0) / 100}`);

      // Fetch ad sets for this campaign
      const adSetsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${campaign.id}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,daily_budget,targeting&limit=100`
      );

      let adSets = [];
      if (adSetsResponse.ok) {
        const adSetsData = await adSetsResponse.json();
        adSets = adSetsData.data || [];
        console.log(`   Ad Sets: ${adSets.length}`);
      }

      // Fetch ads for this campaign
      const adsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${campaign.id}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,creative&limit=100`
      );

      let ads = [];
      if (adsResponse.ok) {
        const adsData = await adsResponse.json();
        ads = adsData.data || [];
        console.log(`   Ads: ${ads.length}`);
      }

      realCampaigns.push({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        daily_budget: campaign.daily_budget ? campaign.daily_budget / 100 : 0,
        created_time: campaign.created_time,
        updated_time: campaign.updated_time,
        ad_sets: adSets.map(adSet => ({
          id: adSet.id,
          name: adSet.name,
          status: adSet.status,
          daily_budget: adSet.daily_budget ? adSet.daily_budget / 100 : 0,
          targeting: adSet.targeting
        })),
        ads: ads.map(ad => ({
          id: ad.id,
          name: ad.name,
          status: ad.status,
          creative: ad.creative
        }))
      });

      // Wait a bit to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 REAL CAMPAIGN DATA FOR DASHBOARD');
    console.log('='.repeat(80));

    console.log('\n📋 Campaign Data Structure:');
    console.log(JSON.stringify(realCampaigns, null, 2));

    console.log('\n📊 Summary:');
    console.log(`Total Campaigns: ${realCampaigns.length}`);
    console.log(`Total Ad Sets: ${realCampaigns.reduce((sum, c) => sum + c.ad_sets.length, 0)}`);
    console.log(`Total Ads: ${realCampaigns.reduce((sum, c) => sum + c.ads.length, 0)}`);
    console.log(`Total Daily Budget: €${realCampaigns.reduce((sum, c) => sum + c.daily_budget, 0)}`);

    return realCampaigns;

  } catch (error) {
    console.error('❌ Error fetching campaigns:', error.message);
    return [];
  }
}

// Run the script
fetchRealCampaigns()
  .then((campaigns) => {
    console.log('\n✅ Script completed');
    console.log(`📊 Ready to update dashboard with ${campaigns.length} real campaigns`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
