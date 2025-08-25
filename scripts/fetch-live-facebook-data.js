require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

async function fetchLiveFacebookData() {
  try {
    console.log('🔍 Fetching live Facebook data...\n');

    if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
      console.error('❌ Missing Facebook credentials');
      return;
    }

    console.log('📋 Fetching campaigns...');
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,objective,created_time&limit=100`
    );

    if (!campaignsResponse.ok) {
      const errorText = await campaignsResponse.text();
      console.error('❌ Facebook campaigns API error:', campaignsResponse.status, errorText);
      return;
    }

    const campaignsData = await campaignsResponse.json();
    console.log(`✅ Found ${campaignsData.data?.length || 0} campaigns\n`);

    // Filter TTM campaigns
    const ttmCampaigns = campaignsData.data?.filter((campaign) => 
      campaign.name && campaign.name.includes('TTM')
    ) || [];

    console.log(`📋 Found ${ttmCampaigns.length} TTM campaigns:\n`);

    let totalSpend = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalReach = 0;

    // Fetch insights for each TTM campaign
    for (const campaign of ttmCampaigns) {
      console.log(`📊 Fetching insights for: ${campaign.name}`);
      
      const insightsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${campaign.id}/insights?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=impressions,clicks,spend,reach,frequency,ctr,cpc,cpm&time_range={"since":"2024-01-01","until":"today"}`
      );

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        const insights = insightsData.data?.[0];

        if (insights) {
          const spend = parseFloat(insights.spend) || 0;
          const clicks = parseInt(insights.clicks) || 0;
          const impressions = parseInt(insights.impressions) || 0;
          const reach = parseInt(insights.reach) || 0;
          const ctr = parseFloat(insights.ctr) || 0;
          const cpc = parseFloat(insights.cpc) || 0;

          console.log(`   Clicks: ${clicks}`);
          console.log(`   Spend: €${spend.toFixed(2)}`);
          console.log(`   Impressions: ${impressions}`);
          console.log(`   Reach: ${reach}`);
          console.log(`   CTR: ${ctr.toFixed(2)}%`);
          console.log(`   CPC: €${cpc.toFixed(2)}\n`);

          totalSpend += spend;
          totalClicks += clicks;
          totalImpressions += impressions;
          totalReach += reach;
        } else {
          console.log(`   No insights data available\n`);
        }
      } else {
        console.log(`   Failed to fetch insights\n`);
      }
    }

    console.log('📊 LIVE DATA TOTALS:');
    console.log('====================');
    console.log(`Total Clicks: ${totalClicks}`);
    console.log(`Total Spend: €${totalSpend.toFixed(2)}`);
    console.log(`Total Impressions: ${totalImpressions}`);
    console.log(`Total Reach: ${totalReach}`);
    console.log(`Average CTR: ${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0}%`);
    console.log(`Average CPC: €${totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : 0}\n`);

    console.log('🔍 COMPARISON:');
    console.log('==============');
    console.log(`Live data total spend: €${totalSpend.toFixed(2)}`);
    console.log(`User reported total spend: €110.26`);
    console.log(`Manual data total spend: €67.52`);
    console.log(`Difference (Live vs Manual): €${(totalSpend - 67.52).toFixed(2)}`);
    console.log(`Difference (Live vs User): €${(totalSpend - 110.26).toFixed(2)}\n`);

    if (Math.abs(totalSpend - 110.26) < 5) {
      console.log('✅ Live data matches user report closely');
    } else {
      console.log('⚠️  Live data differs from user report');
    }

  } catch (error) {
    console.error('❌ Error fetching live Facebook data:', error);
  }
}

fetchLiveFacebookData();
