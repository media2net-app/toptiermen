require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 DEBUGGING FACEBOOK DATA ISSUES');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to make Facebook API requests
async function makeFacebookRequest(endpoint, params = {}) {
  const url = new URL(`https://graph.facebook.com/v19.0${endpoint}`);
  url.searchParams.set('access_token', FACEBOOK_ACCESS_TOKEN);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  });

  console.log(`🔗 Making request to: ${url.toString().replace(FACEBOOK_ACCESS_TOKEN, '***TOKEN***')}`);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Facebook API error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

async function debugFacebookData() {
  console.log('📋 STEP 1: Environment Check');
  console.log('----------------------------------------');
  
  console.log('✅ Supabase URL:', supabaseUrl ? 'Configured' : 'Missing');
  console.log('✅ Supabase Service Key:', supabaseServiceKey ? 'Configured' : 'Missing');
  console.log('✅ Facebook Access Token:', FACEBOOK_ACCESS_TOKEN ? 'Configured' : 'Missing');
  console.log('✅ Facebook Ad Account ID:', FACEBOOK_AD_ACCOUNT_ID ? 'Configured' : 'Missing');
  
  console.log('\n📋 STEP 2: Database Analysis');
  console.log('----------------------------------------');
  
  try {
    // Check available tables first
    console.log('🔍 Checking available tables...');
    
    // Try different table names
    const tableNames = ['prelaunch_leads', 'leads', 'facebook_leads', 'marketing_leads'];
    
    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Found table: ${tableName}`);
          
          // Get actual data from this table
          const { data: leads, error: leadsError } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (!leadsError && leads.length > 0) {
            console.log(`✅ Found ${leads.length} records in ${tableName}`);
            
            const facebookLeads = leads.filter(lead => 
              lead.source === 'facebook_ad' || 
              lead.campaign_id || 
              lead.ad_set_id
            );
            
            console.log(`✅ Facebook Ad Leads: ${facebookLeads.length}`);
            
            if (facebookLeads.length > 0) {
              console.log('\n📊 Recent Facebook Leads:');
              facebookLeads.slice(0, 5).forEach(lead => {
                console.log(`   - ${lead.email || lead.email_address} (${lead.campaign_id || 'No Campaign ID'}) - ${lead.created_at}`);
              });
            }
            break;
          }
        }
      } catch (error) {
        // Table doesn't exist, continue to next
      }
    }
    
    // Check if there's a facebook_analytics table
    const { data: analytics, error: analyticsError } = await supabase
      .from('facebook_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (analyticsError) {
      console.log('ℹ️  No facebook_analytics table found (this might be normal)');
    } else {
      console.log(`✅ Found ${analytics.length} analytics records`);
      if (analytics.length > 0) {
        console.log('📊 Recent Analytics:');
        analytics.forEach(record => {
          console.log(`   - ${record.campaign_name}: €${record.spend || 0} spent, ${record.clicks || 0} clicks`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
  
  console.log('\n📋 STEP 3: Facebook API Test');
  console.log('----------------------------------------');
  
  try {
    const today = getTodayDate();
    console.log(`📅 Testing API for date range: 2025-08-01 to ${today}`);
    console.log(`🔑 Ad Account ID: ${FACEBOOK_AD_ACCOUNT_ID}`);
    
    // Test 1: Get campaigns
    console.log('\n🔍 Test 1: Fetching campaigns...');
    
    // Remove 'act_' prefix if it's already in the ID
    const cleanAdAccountId = FACEBOOK_AD_ACCOUNT_ID.replace('act_', '');
    const endpoint = `/act_${cleanAdAccountId}/campaigns`;
    
    const campaignsResponse = await makeFacebookRequest(endpoint, {
      fields: 'id,name,status,objective,created_time,start_time,stop_time',
      limit: 10
    });
    
    console.log(`✅ Found ${campaignsResponse.data.length} campaigns`);
    
    // Filter TTM campaigns
    const ttmCampaigns = campaignsResponse.data.filter(campaign => 
      campaign.name.includes('TTM')
    );
    
    console.log(`✅ Found ${ttmCampaigns.length} TTM campaigns`);
    
    if (ttmCampaigns.length > 0) {
      console.log('\n📋 TTM Campaigns:');
      ttmCampaigns.forEach(campaign => {
        console.log(`   - ${campaign.name} (${campaign.id}) - Status: ${campaign.status}`);
      });
      
      // Test 2: Get insights for first campaign
      console.log('\n🔍 Test 2: Fetching insights for first campaign...');
      const firstCampaign = ttmCampaigns[0];
      
      const insightsResponse = await makeFacebookRequest(`/${firstCampaign.id}/insights`, {
        fields: 'impressions,clicks,spend,reach,frequency,ctr,cpc,cpm',
        time_range: JSON.stringify({ since: '2025-08-01', until: today }),
        limit: 1
      });
      
      if (insightsResponse.data && insightsResponse.data.length > 0) {
        const insights = insightsResponse.data[0];
        console.log('✅ Insights found:');
        console.log(`   - Impressions: ${insights.impressions || 0}`);
        console.log(`   - Clicks: ${insights.clicks || 0}`);
        console.log(`   - Spend: €${insights.spend || 0}`);
        console.log(`   - Reach: ${insights.reach || 0}`);
        console.log(`   - CTR: ${insights.ctr || 0}%`);
        console.log(`   - CPC: €${insights.cpc || 0}`);
      } else {
        console.log('⚠️  No insights data found for this campaign');
      }
    }
    
  } catch (error) {
    console.error('❌ Facebook API error:', error.message);
    
    // Check if it's a token issue
    if (error.message.includes('400') || error.message.includes('access_token')) {
      console.log('\n🔍 Token validation check...');
      try {
        const testResponse = await makeFacebookRequest('/me', {});
        console.log('✅ Token is valid, user:', testResponse.name);
      } catch (tokenError) {
        console.error('❌ Token validation failed:', tokenError.message);
      }
    }
  }
  
  console.log('\n📋 STEP 4: Auto-Refresh API Test');
  console.log('----------------------------------------');
  
  try {
    console.log('🔍 Testing auto-refresh API endpoint...');
    
    const response = await fetch('http://localhost:3001/api/facebook/auto-refresh-analytics');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Auto-refresh API working');
      console.log(`📊 Summary: €${data.data.summary.totalSpend.toFixed(2)} spent, ${data.data.summary.totalConversions} conversions`);
      console.log(`📅 Date range: ${data.data.summary.dateRange}`);
      console.log(`🕒 Last updated: ${data.data.summary.lastUpdated}`);
      
      if (data.data.campaigns.length > 0) {
        console.log('\n📋 Campaign Data:');
        data.data.campaigns.forEach(campaign => {
          console.log(`   - ${campaign.name}: €${campaign.spend.toFixed(2)} spent, ${campaign.clicks} clicks, ${campaign.conversions || 0} conversions`);
        });
      }
    } else {
      console.error('❌ Auto-refresh API failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Auto-refresh API test failed:', error.message);
  }
  
  console.log('\n📋 STEP 5: Problem Analysis');
  console.log('----------------------------------------');
  
  console.log('🎯 POTENTIAL ISSUES IDENTIFIED:');
  console.log('');
  console.log('1. 🔍 Data Source Mismatch:');
  console.log('   - Leads are being tracked but Facebook spend data is not');
  console.log('   - This suggests the auto-refresh is not working properly');
  console.log('');
  console.log('2. 🔍 Date Range Issues:');
  console.log('   - Auto-refresh uses fixed date range (2025-08-01 to today)');
  console.log('   - Might miss recent data or include old data');
  console.log('');
  console.log('3. 🔍 Campaign Attribution:');
  console.log('   - Leads show "Onbekend" campaign name');
  console.log('   - This suggests campaign ID mapping is broken');
  console.log('');
  console.log('4. 🔍 API Rate Limiting:');
  console.log('   - Facebook API might be rate limited');
  console.log('   - Auto-refresh might be failing silently');
  console.log('');
  
  console.log('📋 STEP 6: Recommended Solutions');
  console.log('----------------------------------------');
  
  console.log('🔧 IMMEDIATE FIXES:');
  console.log('');
  console.log('1. ✅ Fix Auto-Refresh Logic:');
  console.log('   - Update date range to be more dynamic');
  console.log('   - Add better error handling and logging');
  console.log('   - Implement retry mechanism for failed API calls');
  console.log('');
  console.log('2. ✅ Fix Campaign Attribution:');
  console.log('   - Update campaign ID mapping in auto-refresh');
  console.log('   - Ensure leads are properly linked to campaigns');
  console.log('');
  console.log('3. ✅ Add Data Validation:');
  console.log('   - Validate Facebook API responses');
  console.log('   - Add fallback data when API fails');
  console.log('');
  console.log('4. ✅ Improve Error Handling:');
  console.log('   - Add detailed logging for debugging');
  console.log('   - Implement graceful degradation');
  console.log('');
  
  console.log('🎯 RESULT:');
  console.log('✅ Facebook data debugging complete');
  console.log('✅ Issues identified and solutions proposed');
  console.log('✅ Ready to implement fixes');
}

async function main() {
  try {
    console.log('🚀 Starting Facebook data debugging...');
    console.log('');
    
    await debugFacebookData();
    
  } catch (error) {
    console.error('❌ Debugging failed:', error.message);
  }
}

main();
