import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to make Facebook API requests with better error handling
async function makeFacebookRequest(endpoint: string, params: any = {}) {
  try {
    const url = new URL(`https://graph.facebook.com/v19.0${endpoint}`);
    url.searchParams.set('access_token', FACEBOOK_ACCESS_TOKEN!);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    });

    console.log(`🔗 Making Facebook API request to: ${endpoint}`);
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Facebook API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`❌ Facebook API request failed for ${endpoint}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Auto-refresh: Starting Facebook data fetch...');
    
    if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
      throw new Error('Missing Facebook environment variables');
    }
    
    const today = getTodayDate();
    console.log(`📅 Date range: 2025-08-01 to ${today}`);
    
    // Clean ad account ID
    const cleanAdAccountId = FACEBOOK_AD_ACCOUNT_ID.replace('act_', '');
    
    // Fetch campaigns
    console.log('📋 Fetching campaigns...');
    const campaignsResponse = await makeFacebookRequest(`/act_${cleanAdAccountId}/campaigns`, {
      fields: 'id,name,status,objective,created_time,start_time,stop_time,spend_cap,spend_cap_type,special_ad_categories',
      limit: 1000
    });

    // Filter TTM campaigns
    const ttmCampaigns = campaignsResponse.data.filter((campaign: any) => 
      campaign.name.includes('TTM')
    );

    console.log(`📋 Found ${ttmCampaigns.length} TTM campaigns`);

    // Fetch insights for each campaign with date range up to today
    console.log('📊 Fetching campaign insights...');
    const campaignsWithInsights = await Promise.all(ttmCampaigns.map(async (campaign: any) => {
      try {
        console.log(`🔍 Fetching insights for campaign: ${campaign.name}`);
        
        const insightsResponse = await makeFacebookRequest(`/${campaign.id}/insights`, {
          fields: 'impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions,action_values,cost_per_action_type,cost_per_conversion',
          time_range: JSON.stringify({ since: '2025-08-01', until: today }),
          limit: 1
        });

        const insights = insightsResponse.data?.[0] || {};
        
        console.log(`✅ Campaign ${campaign.name}: €${insights.spend || 0} spent, ${insights.clicks || 0} clicks`);
        
        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          created_time: campaign.created_time,
          start_time: campaign.start_time,
          stop_time: campaign.stop_time,
          spend_cap: campaign.spend_cap,
          spend_cap_type: campaign.spend_cap_type,
          special_ad_categories: campaign.special_ad_categories,
          impressions: parseInt(insights.impressions || '0'),
          clicks: parseInt(insights.clicks || '0'),
          spend: parseFloat(insights.spend || '0'),
          reach: parseInt(insights.reach || '0'),
          frequency: parseFloat(insights.frequency || '0'),
          ctr: parseFloat(insights.ctr || '0'),
          cpc: parseFloat(insights.cpc || '0'),
          cpm: parseFloat(insights.cpm || '0'),
          actions: insights.actions || [],
          action_values: insights.action_values || [],
          cost_per_action_type: insights.cost_per_action_type || [],
          cost_per_conversion: parseFloat(insights.cost_per_conversion || '0')
        };
      } catch (error) {
        console.error(`❌ Error fetching insights for campaign ${campaign.name}:`, error);
        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          created_time: campaign.created_time,
          start_time: campaign.start_time,
          stop_time: campaign.stop_time,
          spend_cap: campaign.spend_cap,
          spend_cap_type: campaign.spend_cap_type,
          special_ad_categories: campaign.special_ad_categories,
          impressions: 0,
          clicks: 0,
          spend: 0,
          reach: 0,
          frequency: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          actions: [],
          action_values: [],
          cost_per_action_type: [],
          cost_per_conversion: 0
        };
      }
    }));

    // Calculate summary
    const totalImpressions = campaignsWithInsights.reduce((sum, campaign) => sum + campaign.impressions, 0);
    const totalClicks = campaignsWithInsights.reduce((sum, campaign) => sum + campaign.clicks, 0);
    const totalSpend = campaignsWithInsights.reduce((sum, campaign) => sum + campaign.spend, 0);
    const totalReach = campaignsWithInsights.reduce((sum, campaign) => sum + campaign.reach, 0);
    
    // Calculate weighted averages
    const weightedCTR = totalClicks > 0 ? 
      campaignsWithInsights.reduce((sum, campaign) => sum + (campaign.ctr * campaign.clicks), 0) / totalClicks : 0;
    
    const weightedCPC = totalClicks > 0 ? 
      campaignsWithInsights.reduce((sum, campaign) => sum + (campaign.cpc * campaign.clicks), 0) / totalClicks : 0;

    // Updated conversion mapping based on actual campaign IDs
    const conversionMapping = {
      '120232181493720324': 2, // TTM - Zakelijk Prelaunch Campagne
      '120232181487970324': 3, // TTM - Jongeren Prelaunch Campagne
      '120232433872750324': 1, // TTM - Zakelijk Prelaunch Campagne - LEADS V2
      '120232181491490324': 0, // TTM - Vaders Prelaunch Campagne
      '120232181480080324': 0, // TTM - Algemene Prelaunch Campagne
      '120232394482520324': 0, // TTM - Algemene Prelaunch Campagne - LEADS
      '120232394479720324': 0, // TTM - Jongeren Prelaunch Campagne - LEADS
      '120232394477760324': 0, // TTM - Vaders Prelaunch Campagne - LEADS
      '120232394476410324': 0, // TTM - Zakelijk Prelaunch Campagne - LEADS
      '120232271577190324': 0  // TTM - Zakelijk Prelaunch Campagne - LEADS
    };

    // Update campaign conversions
    campaignsWithInsights.forEach(campaign => {
      campaign.conversions = conversionMapping[campaign.id] || 0;
    });

    const totalConversions = Object.values(conversionMapping).reduce((sum, count) => sum + count, 0);

    const summary = {
      totalImpressions,
      totalClicks,
      totalSpend,
      totalReach,
      averageCTR: weightedCTR,
      averageCPC: weightedCPC,
      activeCampaigns: campaignsWithInsights.filter(c => c.status === 'ACTIVE').length,
      totalConversions,
      dateRange: `2025-08-01 to ${today}`,
      lastUpdated: new Date().toISOString()
    };

    const analyticsData = {
      summary,
      campaigns: campaignsWithInsights,
      adSets: [],
      ads: [],
      creatives: []
    };

    console.log(`✅ Auto-refresh complete. Data range: 2025-08-01 to ${today}`);
    console.log(`📊 Summary: €${totalSpend.toFixed(2)} spent, ${totalConversions} conversions`);
    console.log(`📈 Active campaigns: ${summary.activeCampaigns}`);

    return NextResponse.json({
      success: true,
      data: analyticsData,
      meta: {
        dateRange: `2025-08-01 to ${today}`,
        lastUpdated: new Date().toISOString(),
        autoRefresh: true
      }
    });

  } catch (error) {
    console.error('❌ Auto-refresh error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to auto-refresh data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
