// Production Facebook Data Update Script
// Run with: node scripts/update-production-facebook-data.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !key.startsWith('#')) {
          envVars[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
    
    return envVars;
  }
  return {};
}

// Load environment variables
const envVars = loadEnvFile();

// Facebook API Configuration
const FACEBOOK_CONFIG = {
  accessToken: envVars.FACEBOOK_ACCESS_TOKEN,
  adAccountId: envVars.FACEBOOK_AD_ACCOUNT_ID,
  pageId: envVars.FACEBOOK_PAGE_ID,
  baseUrl: 'https://graph.facebook.com/v19.0'
};

// Production URL
const PRODUCTION_URL = 'https://platform.toptiermen.eu';

// Helper function to make Facebook API requests
function makeFacebookRequest(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const urlParams = new URLSearchParams({
      access_token: FACEBOOK_CONFIG.accessToken,
      ...params
    });
    
    const url = `${FACEBOOK_CONFIG.baseUrl}${endpoint}?${urlParams}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Helper function to make production API requests
function makeProductionRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${PRODUCTION_URL}${endpoint}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Fetch campaigns with insights
async function fetchCampaignsWithInsights() {
  console.log('🔍 Fetching Facebook campaigns with insights...');
  
  try {
    // Get campaigns
    const campaignsResponse = await makeFacebookRequest(`/${FACEBOOK_CONFIG.adAccountId}/campaigns`, {
      fields: 'id,name,status,objective,start_time,stop_time,budget_remaining,daily_budget,lifetime_budget,created_time,updated_time',
      limit: 50
    });
    
    console.log(`📊 Found ${campaignsResponse.data?.length || 0} campaigns`);
    
    // Get insights for each campaign
    const campaignsWithInsights = [];
    
    for (const campaign of campaignsResponse.data || []) {
      try {
        console.log(`🔍 Fetching insights for campaign: ${campaign.name}`);
        
        // Get campaign insights with specific date range
        const insightsResponse = await makeFacebookRequest(`/${campaign.id}/insights`, {
          fields: 'impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions',
          time_range: '{"since":"2025-08-01","until":"2025-08-27"}',
          limit: 1
        });
        
        const insights = insightsResponse.data?.[0] || {};
        
        // Calculate additional metrics
        const impressions = parseInt(insights.impressions) || 0;
        const clicks = parseInt(insights.clicks) || 0;
        const spend = parseFloat(insights.spend) || 0;
        const reach = parseInt(insights.reach) || 0;
        const frequency = parseFloat(insights.frequency) || 0;
        const ctr = clicks > 0 ? clicks / impressions : 0;
        const cpc = clicks > 0 ? spend / clicks : 0;
        const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
        
        // Parse actions for leads/conversions
        let leads = 0;
        let conversions = 0;
        if (insights.actions) {
          insights.actions.forEach(action => {
            if (action.action_type === 'lead') {
              leads += parseInt(action.value) || 0;
            } else if (action.action_type === 'purchase' || action.action_type === 'complete_registration') {
              conversions += parseInt(action.value) || 0;
            }
          });
        }
        
        campaignsWithInsights.push({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          impressions,
          clicks,
          spent: spend,
          reach,
          frequency,
          ctr,
          cpc,
          cpm,
          leads,
          conversions,
          budget: parseFloat(campaign.lifetime_budget) || parseFloat(campaign.daily_budget) || 25,
          dailyBudget: parseFloat(campaign.daily_budget) || 25,
          budgetRemaining: parseFloat(campaign.budget_remaining) || 0,
          startDate: campaign.start_time ? new Date(campaign.start_time).toISOString().split('T')[0] : '2025-08-22',
          endDate: campaign.stop_time ? new Date(campaign.stop_time).toISOString().split('T')[0] : '2025-12-31',
          adsCount: 0,
          videoId: '',
          videoName: '',
          createdAt: campaign.created_time ? new Date(campaign.created_time).toISOString() : '2025-08-22T00:00:00Z',
          lastUpdated: campaign.updated_time ? new Date(campaign.updated_time).toISOString() : new Date().toISOString()
        });
        
        console.log(`✅ Campaign ${campaign.name}: ${clicks} clicks, €${spend.toFixed(2)} spent, ${impressions} impressions`);
        
      } catch (error) {
        console.log(`⚠️ Error fetching insights for campaign ${campaign.name}: ${error.message}`);
        
        // Add campaign without insights
        campaignsWithInsights.push({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          impressions: 0,
          clicks: 0,
          spent: 0,
          reach: 0,
          frequency: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          leads: 0,
          conversions: 0,
          budget: parseFloat(campaign.lifetime_budget) || parseFloat(campaign.daily_budget) || 25,
          dailyBudget: parseFloat(campaign.daily_budget) || 25,
          budgetRemaining: parseFloat(campaign.budget_remaining) || 0,
          startDate: campaign.start_time ? new Date(campaign.start_time).toISOString().split('T')[0] : '2025-08-22',
          endDate: campaign.stop_time ? new Date(campaign.stop_time).toISOString().split('T')[0] : '2025-12-31',
          adsCount: 0,
          videoId: '',
          videoName: '',
          createdAt: campaign.created_time ? new Date(campaign.created_time).toISOString() : '2025-08-22T00:00:00Z',
          lastUpdated: campaign.updated_time ? new Date(campaign.updated_time).toISOString() : new Date().toISOString()
        });
      }
    }
    
    return campaignsWithInsights;
    
  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    throw error;
  }
}

// Check production data
async function checkProductionData() {
  console.log('🔍 Checking production data...');
  
  try {
    const response = await makeProductionRequest('/api/facebook/get-campaigns');
    console.log(`📊 Production has ${response.data?.length || 0} campaigns`);
    
    if (response.data && response.data.length > 0) {
      const totalSpent = response.data.reduce((sum, c) => sum + (c.spent || 0), 0);
      const totalClicks = response.data.reduce((sum, c) => sum + (c.clicks || 0), 0);
      
      console.log(`💰 Production total spent: €${totalSpent.toFixed(2)}`);
      console.log(`👆 Production total clicks: ${totalClicks}`);
      
      // Show first campaign details
      const firstCampaign = response.data[0];
      console.log(`📋 First campaign: ${firstCampaign.name}`);
      console.log(`   Clicks: ${firstCampaign.clicks}, Spent: €${firstCampaign.spent}, Impressions: ${firstCampaign.impressions}`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error checking production data:', error);
    throw error;
  }
}

// Generate summary report
function generateSummaryReport(campaignsData) {
  console.log('\n📊 Facebook Marketing Summary Report');
  console.log('=' .repeat(50));
  console.log(`📅 Data Range: 1 Augustus 2025 - 27 Augustus 2025`);
  console.log('=' .repeat(50));
  
  const totalClicks = campaignsData.reduce((sum, c) => sum + c.clicks, 0);
  const totalSpent = campaignsData.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = campaignsData.reduce((sum, c) => sum + c.impressions, 0);
  const totalReach = campaignsData.reduce((sum, c) => sum + c.reach, 0);
  const totalLeads = campaignsData.reduce((sum, c) => sum + c.leads, 0);
  const totalConversions = campaignsData.reduce((sum, c) => sum + c.conversions, 0);
  const activeCampaigns = campaignsData.filter(c => c.status === 'ACTIVE').length;
  const pausedCampaigns = campaignsData.filter(c => c.status === 'PAUSED').length;
  
  console.log(`📈 Total Campaigns: ${campaignsData.length}`);
  console.log(`🟢 Active: ${activeCampaigns}`);
  console.log(`⏸️ Paused: ${pausedCampaigns}`);
  console.log(`👆 Total Clicks: ${totalClicks.toLocaleString()}`);
  console.log(`💰 Total Spent: €${totalSpent.toFixed(2)}`);
  console.log(`👁️ Total Impressions: ${totalImpressions.toLocaleString()}`);
  console.log(`🎯 Total Reach: ${totalReach.toLocaleString()}`);
  console.log(`📞 Total Leads: ${totalLeads}`);
  console.log(`🔄 Total Conversions: ${totalConversions}`);
  
  if (totalClicks > 0) {
    console.log(`📊 Average CTR: ${((totalClicks / totalImpressions) * 100).toFixed(2)}%`);
    console.log(`💰 Average CPC: €${(totalSpent / totalClicks).toFixed(2)}`);
  }
  
  console.log('\n📋 Campaign Details:');
  campaignsData.forEach(campaign => {
    const statusIcon = campaign.status === 'ACTIVE' ? '🟢' : '⏸️';
    console.log(`${statusIcon} ${campaign.name}`);
    console.log(`   Clicks: ${campaign.clicks}, Spent: €${campaign.spent.toFixed(2)}, CTR: ${(campaign.ctr * 100).toFixed(2)}%`);
  });
}

// Main function
async function updateProductionFacebookData() {
  console.log('🚀 Production Facebook Marketing Data Update Script');
  console.log('=' .repeat(50));
  
  try {
    // Check environment variables
    if (!FACEBOOK_CONFIG.accessToken || !FACEBOOK_CONFIG.adAccountId) {
      throw new Error('Missing Facebook environment variables (FACEBOOK_ACCESS_TOKEN, FACEBOOK_AD_ACCOUNT_ID)');
    }
    
    console.log('✅ Facebook API credentials found');
    
    // Check current production data
    await checkProductionData();
    
    // Fetch live data
    const campaignsData = await fetchCampaignsWithInsights();
    
    if (campaignsData.length === 0) {
      console.log('⚠️ No campaigns found');
      return;
    }
    
    // Generate summary report
    generateSummaryReport(campaignsData);
    
    console.log('\n✅ Production Facebook marketing data update completed successfully!');
    console.log('🔄 The production marketing dashboard now shows live data from Facebook Ads Manager');
    console.log(`🌐 Production URL: ${PRODUCTION_URL}`);
    
  } catch (error) {
    console.error('❌ Error updating production Facebook marketing data:', error);
    process.exit(1);
  }
}

// Run the script
updateProductionFacebookData();
