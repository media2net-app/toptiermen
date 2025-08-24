import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

// Manual data override based on Facebook Ads Manager (Live Data)
const MANUAL_DATA_OVERRIDE = {
  'TTM - Zakelijk Prelaunch Campagne': {
    clicks: 88,
    spend: 19.15,
    impressions: 1533,
    reach: 1533,
    ctr: 5.74, // (88/1533)*100
    cpc: 0.22, // 19.15/88
    frequency: 1.09
  },
  'TTM - Vaders Prelaunch Campagne': {
    clicks: 112,
    spend: 11.67,
    impressions: 1526,
    reach: 1526,
    ctr: 7.34, // (112/1526)*100
    cpc: 0.10, // 11.67/112
    frequency: 1.09
  },
  'TTM - Jongeren Prelaunch Campagne': {
    clicks: 80,
    spend: 13.15,
    impressions: 1526,
    reach: 1526,
    ctr: 5.24, // (80/1526)*100
    cpc: 0.16, // 13.15/80
    frequency: 1.06
  },
  'TTM - Algemene Prelaunch Campagne': {
    clicks: 192,
    spend: 23.55,
    impressions: 2994,
    reach: 2994,
    ctr: 6.41, // (192/2994)*100
    cpc: 0.12, // 23.55/192
    frequency: 1.12
  }
};

export async function GET(request: NextRequest) {
  if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
    return NextResponse.json(
      { success: false, error: 'Missing Facebook credentials' },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'maximum';
    const includeInsights = searchParams.get('includeInsights') !== 'false';
    const useManualData = searchParams.get('useManualData') === 'true';

    console.log('📊 Fetching comprehensive Facebook analytics data...');
    console.log('🔧 Date range:', dateRange);
    console.log('🔧 Include insights:', includeInsights);
    console.log('🔧 Use manual data:', useManualData);
    console.log('🔧 Ad Account ID:', FACEBOOK_AD_ACCOUNT_ID);

    const analyticsData: any = {
      summary: {},
      campaigns: [],
      adSets: [],
      ads: [],
      creatives: [],
      insights: {},
      dateRange,
      lastUpdated: new Date().toISOString()
    };

    // 1. Fetch campaigns with detailed insights
    console.log('📋 Fetching campaigns...');
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,objective,created_time,start_time,stop_time,spend_cap,spend_cap_type,special_ad_categories&limit=100`
    );

    if (!campaignsResponse.ok) {
      const errorText = await campaignsResponse.text();
      console.error('❌ Facebook campaigns API error:', campaignsResponse.status, errorText);
      throw new Error(`Facebook campaigns API error: ${campaignsResponse.status} - ${errorText}`);
    }

    const campaignsData = await campaignsResponse.json();
    console.log('📋 Raw campaigns data:', campaignsData);
    
    const ttmCampaigns = campaignsData.data?.filter((campaign: any) => 
      campaign.name && campaign.name.includes('TTM')
    ) || [];
    
    console.log('📋 TTM campaigns found:', ttmCampaigns.length);

    // Fetch insights for each campaign with full date range
    analyticsData.campaigns = await Promise.all(ttmCampaigns.map(async (campaign: any) => {
      try {
        let insights: any = null;
        
        if (useManualData && MANUAL_DATA_OVERRIDE[campaign.name]) {
          // Use manual data override
          const manualData = MANUAL_DATA_OVERRIDE[campaign.name];
          insights = {
            impressions: manualData.impressions.toString(),
            clicks: manualData.clicks.toString(),
            spend: manualData.spend.toString(),
            reach: manualData.reach.toString(),
            frequency: manualData.frequency ? manualData.frequency.toString() : '0',
            ctr: manualData.ctr ? manualData.ctr.toString() : '0',
            cpc: manualData.cpc ? manualData.cpc.toString() : '0',
            cpm: '0',
            actions: [],
            action_values: [],
            cost_per_action_type: [],
            cost_per_conversion: '0'
          };
          console.log(`📊 Using manual data for ${campaign.name}:`, manualData);
        } else {
          // Fetch from API with maximum date range
          const insightsResponse = await fetch(
            `https://graph.facebook.com/v19.0/${campaign.id}/insights?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions,action_values,cost_per_action_type,cost_per_conversion&time_range={"since":"2024-01-01","until":"today"}&limit=1000`
          );
          
          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            insights = insightsData.data?.[0];
          }
        }
        
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
          impressions: insights?.impressions || 0,
          clicks: insights?.clicks || 0,
          spend: insights?.spend ? parseFloat(insights.spend) : 0,
          reach: insights?.reach || 0,
          frequency: insights?.frequency || 0,
          ctr: insights?.ctr || 0,
          cpc: insights?.cpc ? parseFloat(insights.cpc) : 0,
          cpm: insights?.cpm ? parseFloat(insights.cpm) : 0,
          actions: insights?.actions || [],
          action_values: insights?.action_values || [],
          cost_per_action_type: insights?.cost_per_action_type || [],
          cost_per_conversion: insights?.cost_per_conversion ? parseFloat(insights.cost_per_conversion) : 0
        };
      } catch (error) {
        console.error(`❌ Error fetching insights for campaign ${campaign.id}:`, error);
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

    // 2. Fetch ad sets with insights
    console.log('📋 Fetching ad sets...');
    const adSetsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,campaign_id,created_time,start_time,stop_time,daily_budget,lifetime_budget,bid_amount,bid_strategy,targeting,optimization_goal,insights{impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions,action_values,cost_per_action_type,cost_per_conversion}&time_range={"since":"2024-01-01","until":"today"}&limit=1000`
    );

    if (adSetsResponse.ok) {
      const adSetsData = await adSetsResponse.json();
      const ttmAdSets = adSetsData.data?.filter((adSet: any) => 
        adSet.name && adSet.name.includes('TTM')
      ) || [];

      analyticsData.adSets = ttmAdSets.map((adSet: any) => {
        const insights = adSet.insights?.data?.[0];
        return {
          id: adSet.id,
          name: adSet.name,
          status: adSet.status,
          campaign_id: adSet.campaign_id,
          created_time: adSet.created_time,
          start_time: adSet.start_time,
          stop_time: adSet.stop_time,
          daily_budget: adSet.daily_budget,
          lifetime_budget: adSet.lifetime_budget,
          bid_amount: adSet.bid_amount,
          bid_strategy: adSet.bid_strategy,
          targeting: adSet.targeting,
          optimization_goal: adSet.optimization_goal,
          impressions: insights?.impressions || 0,
          clicks: insights?.clicks || 0,
          spend: insights?.spend ? parseFloat(insights.spend) : 0,
          reach: insights?.reach || 0,
          frequency: insights?.frequency || 0,
          ctr: insights?.ctr || 0,
          cpc: insights?.cpc ? parseFloat(insights.cpc) : 0,
          cpm: insights?.cpm ? parseFloat(insights.cpm) : 0,
          actions: insights?.actions || [],
          action_values: insights?.action_values || [],
          cost_per_action_type: insights?.cost_per_action_type || [],
          cost_per_conversion: insights?.cost_per_conversion ? parseFloat(insights.cost_per_conversion) : 0
        };
      });
    }

    // 3. Fetch ads with insights
    console.log('📋 Fetching ads...');
    const adsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,effective_status,adset_id,campaign_id,created_time,creative{id,title,body,image_url,video_id,link_url,object_story_spec},insights{impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions,action_values,cost_per_action_type,cost_per_conversion}&time_range={"since":"2024-01-01","until":"today"}&limit=1000`
    );

    if (adsResponse.ok) {
      const adsData = await adsResponse.json();
      const ttmAds = adsData.data?.filter((ad: any) => 
        ad.name && ad.name.includes('TTM')
      ) || [];

      analyticsData.ads = ttmAds.map((ad: any) => {
        const insights = ad.insights?.data?.[0];
        return {
          id: ad.id,
          name: ad.name,
          status: ad.status,
          effective_status: ad.effective_status,
          adset_id: ad.adset_id,
          campaign_id: ad.campaign_id,
          created_time: ad.created_time,
          creative: ad.creative,
          impressions: insights?.impressions || 0,
          clicks: insights?.clicks || 0,
          spend: insights?.spend ? parseFloat(insights.spend) : 0,
          reach: insights?.reach || 0,
          frequency: insights?.frequency || 0,
          ctr: insights?.ctr || 0,
          cpc: insights?.cpc ? parseFloat(insights.cpc) : 0,
          cpm: insights?.cpm ? parseFloat(insights.cpm) : 0,
          actions: insights?.actions || [],
          action_values: insights?.action_values || [],
          cost_per_action_type: insights?.cost_per_action_type || [],
          cost_per_conversion: insights?.cost_per_conversion ? parseFloat(insights.cost_per_conversion) : 0
        };
      });
    }

    // 4. Fetch ad creatives
    console.log('📋 Fetching ad creatives...');
    const creativesResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adcreatives?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,title,body,image_url,video_id,link_url,object_story_spec&limit=1000`
    );

    if (creativesResponse.ok) {
      const creativesData = await creativesResponse.json();
      analyticsData.creatives = creativesData.data || [];
    }

    // 5. Calculate comprehensive summary metrics
    const summary = {
      totalImpressions: analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + (parseInt(campaign.impressions) || 0), 0),
      totalClicks: analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + (parseInt(campaign.clicks) || 0), 0),
      totalSpend: analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + (campaign.spend || 0), 0),
      totalReach: analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + (parseInt(campaign.reach) || 0), 0),
      averageCTR: analyticsData.campaigns.length > 0 ? analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + (parseFloat(campaign.ctr) || 0), 0) / analyticsData.campaigns.length : 0,
      averageCPC: analyticsData.campaigns.length > 0 ? analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + (campaign.cpc || 0), 0) / analyticsData.campaigns.length : 0,
      activeCampaigns: analyticsData.campaigns.filter((campaign: any) => campaign.status === 'ACTIVE').length,
      totalConversions: analyticsData.campaigns.reduce((sum: number, campaign: any) => {
        const conversionActions = campaign.actions?.filter((action: any) => 
          action.action_type === 'lead' || action.action_type === 'complete_registration'
        ) || [];
        return sum + conversionActions.reduce((actionSum: number, action: any) => actionSum + (parseInt(action.value) || 0), 0);
      }, 0)
    };

    analyticsData.summary = summary;

    // Log campaign details
    analyticsData.campaigns.forEach((campaign: any, index: number) => {
      console.log(`📋 Campaign ${index + 1}:`, {
        name: campaign.name,
        status: campaign.status,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        spend: campaign.spend,
        ctr: campaign.ctr,
        cpc: campaign.cpc
      });
    });

    console.log('✅ Comprehensive Facebook analytics data fetched successfully');
    console.log('📊 Summary:', {
      campaigns: analyticsData.campaigns.length,
      adSets: analyticsData.adSets.length,
      ads: analyticsData.ads.length,
      creatives: analyticsData.creatives.length,
      totalSpend: summary.totalSpend,
      totalClicks: summary.totalClicks,
      totalImpressions: summary.totalImpressions,
      totalReach: summary.totalReach,
      averageCTR: summary.averageCTR,
      averageCPC: summary.averageCPC,
      activeCampaigns: summary.activeCampaigns,
      totalConversions: summary.totalConversions
    });

    return NextResponse.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('❌ Error fetching Facebook analytics:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
