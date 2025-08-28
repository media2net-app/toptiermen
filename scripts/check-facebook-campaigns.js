require('dotenv').config({ path: '.env.local' });

console.log('📊 CHECKING FACEBOOK CAMPAIGN STATUS');
console.log('====================================\n');

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook environment variables');
  process.exit(1);
}

async function checkFacebookCampaigns() {
  try {
    console.log('📋 STEP 1: Fetching campaigns');
    console.log('----------------------------');
    
    // Get campaigns
    const campaignsUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?fields=id,name,status,objective,created_time,updated_time&access_token=${FACEBOOK_ACCESS_TOKEN}`;
    
    const campaignsResponse = await fetch(campaignsUrl);
    const campaignsData = await campaignsResponse.json();
    
    if (campaignsData.error) {
      console.error('❌ Campaign fetch error:', campaignsData.error);
      return;
    }
    
    console.log('✅ Campaigns fetched successfully');
    console.log(`📊 Total campaigns: ${campaignsData.data.length}`);
    
    campaignsData.data.forEach(campaign => {
      console.log(`   - ${campaign.name} (${campaign.status})`);
    });
    
    console.log('\n📋 STEP 2: Fetching campaign insights');
    console.log('------------------------------------');
    
    // Get insights for all campaigns
    const insightsUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_AD_ACCOUNT_ID}/insights?fields=campaign_id,campaign_name,spend,impressions,clicks,actions&date_preset=this_month&access_token=${FACEBOOK_ACCESS_TOKEN}`;
    
    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();
    
    if (insightsData.error) {
      console.error('❌ Insights fetch error:', insightsData.error);
      return;
    }
    
    console.log('✅ Insights fetched successfully');
    console.log(`📊 Total insights records: ${insightsData.data.length}`);
    
    let totalSpend = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalActions = 0;
    
    insightsData.data.forEach(insight => {
      const spend = parseFloat(insight.spend || 0);
      const clicks = parseInt(insight.clicks || 0);
      const impressions = parseInt(insight.impressions || 0);
      
      totalSpend += spend;
      totalClicks += clicks;
      totalImpressions += impressions;
      
      console.log(`   - ${insight.campaign_name}: €${spend.toFixed(2)} | ${clicks} clicks | ${impressions} impressions`);
      
      if (insight.actions) {
        insight.actions.forEach(action => {
          if (action.action_type === 'lead') {
            totalActions += parseInt(action.value || 0);
            console.log(`     → Leads: ${action.value}`);
          }
        });
      }
    });
    
    console.log('\n📋 STEP 3: Summary');
    console.log('------------------');
    console.log(`💰 Total Spend: €${totalSpend.toFixed(2)}`);
    console.log(`👆 Total Clicks: ${totalClicks}`);
    console.log(`👁️  Total Impressions: ${totalImpressions}`);
    console.log(`📞 Total Leads: ${totalActions}`);
    
    console.log('\n📋 STEP 4: Checking lead data');
    console.log('----------------------------');
    
    // Check our database for leads
    const leadsUrl = 'http://localhost:3000/api/prelaunch-leads';
    const leadsResponse = await fetch(leadsUrl);
    const leadsData = await leadsResponse.json();
    
    if (leadsData.success) {
      console.log('✅ Leads data fetched successfully');
      console.log(`📊 Total leads in database: ${leadsData.leads.length}`);
      
      // Count leads with campaign tracking
      const campaignLeads = leadsData.leads.filter(lead => lead.campaign_id || lead.utm_source);
      console.log(`📊 Leads with campaign tracking: ${campaignLeads.length}`);
      
      campaignLeads.forEach(lead => {
        console.log(`   - ${lead.email} (${lead.campaign_id || lead.utm_source})`);
      });
    } else {
      console.log('❌ Could not fetch leads data');
    }
    
    console.log('\n📋 STEP 5: Date Range Check');
    console.log('---------------------------');
    
    const today = new Date();
    const august28 = new Date('2025-08-28');
    
    console.log(`📅 Today: ${today.toISOString().split('T')[0]}`);
    console.log(`📅 August 28: ${august28.toISOString().split('T')[0]}`);
    console.log(`📊 Data includes: ${today.getMonth() === 7 ? 'Current month' : 'Previous month'}`);
    
    console.log('\n🎯 VERIFICATION:');
    console.log('================');
    console.log(`✅ Spend: €${totalSpend.toFixed(2)} (Expected: €240.61)`);
    console.log(`✅ Leads: ${totalActions} (Expected: 7)`);
    console.log(`✅ Date range: Up to ${today.toISOString().split('T')[0]}`);
    
    if (Math.abs(totalSpend - 240.61) < 1) {
      console.log('✅ Spend amount matches expected value');
    } else {
      console.log(`⚠️  Spend amount differs: €${totalSpend.toFixed(2)} vs €240.61`);
    }
    
    if (totalActions === 7) {
      console.log('✅ Lead count matches expected value');
    } else {
      console.log(`⚠️  Lead count differs: ${totalActions} vs 7`);
    }
    
  } catch (error) {
    console.error('❌ Error checking Facebook campaigns:', error.message);
  }
}

// Run the check
checkFacebookCampaigns();
