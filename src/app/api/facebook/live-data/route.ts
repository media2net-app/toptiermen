import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Facebook access token not configured'
      }, { status: 500 });
    }

    console.log('📊 Fetching Facebook data for date:', date);

    // Fetch campaigns with insights for the specific date
    const campaignsUrl = `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?access_token=${accessToken}&fields=id,name,status,objective,created_time,updated_time&limit=50`;
    
    const campaignsResponse = await fetch(campaignsUrl);
    if (!campaignsResponse.ok) {
      throw new Error(`Facebook API error: ${campaignsResponse.status} ${campaignsResponse.statusText}`);
    }
    
    const campaignsData = await campaignsResponse.json();
    const campaigns = campaignsData.data || [];

    console.log(`📈 Found ${campaigns.length} campaigns`);

    // Determine date range - if date is 'all', get lifetime data
    let timeRange = '';
    if (date === 'all') {
      // Get lifetime data from campaign creation to today
      timeRange = `&time_range={'since':'2025-08-22','until':'${new Date().toISOString().split('T')[0]}'}`;
    } else {
      timeRange = `&time_range={'since':'${date}','until':'${date}'}`;
    }

    // Fetch insights for each campaign
    const campaignInsights = await Promise.all(
      campaigns.map(async (campaign: any) => {
        try {
          const insightsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/insights?access_token=${accessToken}${timeRange}&fields=impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions,conversions&limit=1`;
          
          const insightsResponse = await fetch(insightsUrl);
          if (!insightsResponse.ok) {
            console.warn(`Failed to fetch insights for campaign ${campaign.id}`);
            return {
              ...campaign,
              insights: {
                impressions: 0,
                clicks: 0,
                spend: 0,
                reach: 0,
                frequency: 0,
                ctr: 0,
                cpc: 0,
                cpm: 0,
                conversions: 0,
                actions: []
              }
            };
          }
          
          const insightsData = await insightsResponse.json();
          const insights = insightsData.data?.[0] || {};
          
          // Extract conversions from actions
          const actions = insights.actions || [];
          const conversions = actions.reduce((total: number, action: any) => {
            if (action.action_type === 'lead' || action.action_type === 'complete_registration' || action.action_type === 'purchase') {
              return total + parseInt(action.value || '0');
            }
            return total;
          }, 0);

          return {
            ...campaign,
            insights: {
              impressions: parseInt(insights.impressions || '0'),
              clicks: parseInt(insights.clicks || '0'),
              spend: parseFloat(insights.spend || '0'),
              reach: parseInt(insights.reach || '0'),
              frequency: parseFloat(insights.frequency || '0'),
              ctr: parseFloat(insights.ctr || '0'),
              cpc: parseFloat(insights.cpc || '0'),
              cpm: parseFloat(insights.cpm || '0'),
              conversions: conversions,
              actions: actions
            }
          };
        } catch (error) {
          console.error(`Error fetching insights for campaign ${campaign.id}:`, error);
          return {
            ...campaign,
            insights: {
              impressions: 0,
              clicks: 0,
              spend: 0,
              reach: 0,
              frequency: 0,
              ctr: 0,
              cpc: 0,
              cpm: 0,
              conversions: 0,
              actions: []
            }
          };
        }
      })
    );

    // Calculate totals
    const totals = campaignInsights.reduce((acc, campaign) => ({
      totalSpend: acc.totalSpend + campaign.insights.spend,
      totalConversions: acc.totalConversions + campaign.insights.conversions,
      totalImpressions: acc.totalImpressions + campaign.insights.impressions,
      totalClicks: acc.totalClicks + campaign.insights.clicks,
      totalReach: acc.totalReach + campaign.insights.reach
    }), {
      totalSpend: 0,
      totalConversions: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalReach: 0
    });

    console.log('✅ Facebook data fetched successfully:', {
      campaigns: campaignInsights.length,
      totalSpend: totals.totalSpend,
      totalConversions: totals.totalConversions
    });

    return NextResponse.json({
      success: true,
      date: date,
      account: {
        id: adAccountId,
        name: 'Top Tier Men ADS'
      },
      totals,
      campaigns: campaignInsights,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching Facebook live data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
