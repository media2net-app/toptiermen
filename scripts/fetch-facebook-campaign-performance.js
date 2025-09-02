require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const facebookAdAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

if (!facebookAccessToken || !facebookAdAccountId) {
  console.error('❌ Missing Facebook environment variables');
  console.log('📝 Please add the following to your .env.local file:');
  console.log('FACEBOOK_ACCESS_TOKEN=your_facebook_access_token');
  console.log('FACEBOOK_AD_ACCOUNT_ID=your_facebook_ad_account_id');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchCampaignPerformance() {
  console.log('📊 Fetching Facebook Campaign Performance Data...\n');
  
  try {
    // 1. Get first campaign date from database
    console.log('🔍 Getting first campaign date from database...');
    const { data: firstCampaign, error: campaignError } = await supabase
      .from('bulk_email_campaigns')
      .select('created_at')
      .order('created_at', { ascending: true })
      .limit(1);

    if (campaignError) {
      console.error('❌ Error fetching first campaign:', campaignError);
      return;
    }

    let startDate = '2024-01-01'; // Default fallback
    if (firstCampaign && firstCampaign.length > 0) {
      const campaignDate = firstCampaign[0].created_at.split('T')[0];
      // Use the earlier date between campaign start and 2024-01-01
      startDate = campaignDate < '2024-01-01' ? campaignDate : '2024-01-01';
      console.log(`✅ First campaign date: ${campaignDate}`);
      console.log(`📅 Using start date: ${startDate}`);
    } else {
      console.log('⚠️ No campaigns found in database, using default date: 2024-01-01');
    }

    // Use current date for end date
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    console.log(`📅 Date range: ${startDate} to ${endDate}\n`);

    // 2. Fetch campaigns from Facebook
    console.log('📋 Fetching campaigns from Facebook...');
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${facebookAdAccountId}/campaigns?access_token=${facebookAccessToken}&fields=id,name,status,objective,created_time,start_time,stop_time,insights{impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions}&limit=100&date_preset=maximum`
    );

    if (!campaignsResponse.ok) {
      const errorText = await campaignsResponse.text();
      console.error('❌ Facebook campaigns API error:', campaignsResponse.status, errorText);
      throw new Error(`Facebook campaigns API error: ${campaignsResponse.status} - ${errorText}`);
    }

    const campaignsData = await campaignsResponse.json();
    console.log(`✅ Found ${campaignsData.data?.length || 0} campaigns`);
    
    // Show all campaigns for debugging
    console.log('\n📋 All campaigns found:');
    campaignsData.data?.forEach((campaign, index) => {
      console.log(`   ${index + 1}. ${campaign.name} (${campaign.created_time?.split('T')[0] || 'N/A'})`);
    });
    console.log('');

    // 3. Filter TTM campaigns and process data within date range
    const ttmCampaigns = (campaignsData.data || []).filter((campaign) => {
      if (!campaign.name || !campaign.name.includes('TTM')) return false;
      
      // Filter by created_time within our date range
      if (campaign.created_time) {
        const campaignDate = campaign.created_time.split('T')[0];
        return campaignDate >= startDate && campaignDate <= endDate;
      }
      return false;
    });

    console.log(`📊 TTM Campaigns found: ${ttmCampaigns.length}\n`);

    if (ttmCampaigns.length === 0) {
      console.log('⚠️ No TTM campaigns found in the specified date range');
      return;
    }

    // 4. Process each campaign
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalReach = 0;
    let totalLeads = 0;

    for (const campaign of ttmCampaigns) {
      console.log(`📋 Campaign: ${campaign.name}`);
      console.log(`   Status: ${campaign.status} (${campaign.effective_status})`);
      console.log(`   Objective: ${campaign.objective}`);
      console.log(`   Created: ${campaign.created_time}`);
      
      if (campaign.insights && campaign.insights.data && campaign.insights.data.length > 0) {
        const insights = campaign.insights.data[0];
        console.log(`   📊 Performance:`);
        console.log(`      Impressions: ${insights.impressions?.toLocaleString() || 'N/A'}`);
        console.log(`      Clicks: ${insights.clicks?.toLocaleString() || 'N/A'}`);
        console.log(`      Spend: €${parseFloat(insights.spend || 0).toFixed(2)}`);
        console.log(`      Reach: ${insights.reach?.toLocaleString() || 'N/A'}`);
        console.log(`      CTR: ${insights.ctr ? (insights.ctr * 100).toFixed(2) + '%' : 'N/A'}`);
        console.log(`      CPC: €${parseFloat(insights.cpc || 0).toFixed(2)}`);
        console.log(`      CPM: €${parseFloat(insights.cpm || 0).toFixed(2)}`);

        // Count leads from actions
        if (insights.actions) {
          const leadActions = insights.actions.filter((action) => 
            action.action_type === 'lead' || 
            action.action_type === 'offsite_conversion' ||
            action.action_type === 'link_click'
          );
          const leadCount = leadActions.reduce((sum, action) => sum + (action.value || 0), 0);
          console.log(`      Leads: ${leadCount}`);
          totalLeads += leadCount;
        }

        totalImpressions += parseInt(insights.impressions) || 0;
        totalClicks += parseInt(insights.clicks) || 0;
        totalSpend += parseFloat(insights.spend) || 0;
        totalReach += parseInt(insights.reach) || 0;
      } else {
        console.log(`   ⚠️ No insights data available`);
      }
      console.log('');
    }

    // 5. Summary
    console.log('📊 CAMPAIGN PERFORMANCE SUMMARY');
    console.log('================================');
    console.log(`Total TTM Campaigns: ${ttmCampaigns.length}`);
    console.log(`Total Impressions: ${totalImpressions.toLocaleString()}`);
    console.log(`Total Clicks: ${totalClicks.toLocaleString()}`);
    console.log(`Total Spend: €${totalSpend.toFixed(2)}`);
    console.log(`Total Reach: ${totalReach.toLocaleString()}`);
    console.log(`Total Leads: ${totalLeads}`);
    console.log(`Overall CTR: ${totalClicks > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + '%' : 'N/A'}`);
    console.log(`Overall CPC: €${totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : 'N/A'}`);
    console.log(`Overall CPM: €${totalImpressions > 0 ? ((totalSpend / totalImpressions) * 1000).toFixed(2) : 'N/A'}`);

    // 6. Check for new leads in database
    console.log('\n🔍 Checking for new leads in database...');
    const { data: recentLeads, error: leadsError } = await supabase
      .from('profiles')
      .select('id, email, created_at, full_name')
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59')
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
    } else {
      console.log(`✅ Found ${recentLeads?.length || 0} leads created in date range`);
      
      if (recentLeads && recentLeads.length > 0) {
        console.log('\n📋 Recent Leads:');
        recentLeads.slice(0, 10).forEach((lead) => {
          console.log(`   ${lead.full_name || 'Unknown'} (${lead.email}) - ${lead.created_at.split('T')[0]}`);
        });
        
        if (recentLeads.length > 10) {
          console.log(`   ... and ${recentLeads.length - 10} more`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error fetching campaign performance:', error);
  }
}

// Run the script
fetchCampaignPerformance();
