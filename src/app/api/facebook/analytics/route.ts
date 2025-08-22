import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
    return NextResponse.json(
      { success: false, error: 'Missing Facebook credentials' },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'last_30d';
    const level = searchParams.get('level') || 'campaign'; // campaign, adset, ad

    console.log('📊 Fetching Facebook analytics data...');
    console.log('🔧 Date range:', dateRange);
    console.log('🔧 Level:', level);

    let analyticsData: any = {};

    // Fetch campaigns with insights
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,objective,created_time,insights{impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions}&limit=100&date_preset=${dateRange}`
    );

    if (!campaignsResponse.ok) {
      throw new Error(`Facebook API error: ${campaignsResponse.status}`);
    }

    const campaignsData = await campaignsResponse.json();
    const ttmCampaigns = campaignsData.data?.filter((campaign: any) => 
      campaign.name && campaign.name.includes('TTM')
    ) || [];

    analyticsData.campaigns = ttmCampaigns.map((campaign: any) => {
      const insights = campaign.insights?.data?.[0];
      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        impressions: insights?.impressions || 0,
        clicks: insights?.clicks || 0,
        spend: insights?.spend ? parseFloat(insights.spend) : 0,
        reach: insights?.reach || 0,
        frequency: insights?.frequency || 0,
        ctr: insights?.ctr || 0,
        cpc: insights?.cpc ? parseFloat(insights.cpc) : 0,
        cpm: insights?.cpm ? parseFloat(insights.cpm) : 0,
        actions: insights?.actions || [],
        created_time: campaign.created_time
      };
    });

    // Fetch ad sets with insights
    const adSetsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,campaign_id,created_time,insights{impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions}&limit=1000&date_preset=${dateRange}`
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
          campaign_id: adSet.campaign_id,
          status: adSet.status,
          impressions: insights?.impressions || 0,
          clicks: insights?.clicks || 0,
          spend: insights?.spend ? parseFloat(insights.spend) : 0,
          reach: insights?.reach || 0,
          frequency: insights?.frequency || 0,
          ctr: insights?.ctr || 0,
          cpc: insights?.cpc ? parseFloat(insights.cpc) : 0,
          cpm: insights?.cpm ? parseFloat(insights.cpm) : 0,
          actions: insights?.actions || [],
          created_time: adSet.created_time
        };
      });
    }

    // Fetch ads with insights
    const adsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,adset_id,campaign_id,created_time,insights{impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions}&limit=1000&date_preset=${dateRange}`
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
          adset_id: ad.adset_id,
          campaign_id: ad.campaign_id,
          status: ad.status,
          impressions: insights?.impressions || 0,
          clicks: insights?.clicks || 0,
          spend: insights?.spend ? parseFloat(insights.spend) : 0,
          reach: insights?.reach || 0,
          frequency: insights?.frequency || 0,
          ctr: insights?.ctr || 0,
          cpc: insights?.cpc ? parseFloat(insights.cpc) : 0,
          cpm: insights?.cpm ? parseFloat(insights.cpm) : 0,
          actions: insights?.actions || [],
          created_time: ad.created_time
        };
      });
    }

    // Calculate summary metrics
    const summary = {
      totalImpressions: analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + campaign.impressions, 0),
      totalClicks: analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + campaign.clicks, 0),
      totalSpend: analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + campaign.spend, 0),
      totalReach: analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + campaign.reach, 0),
      averageCTR: analyticsData.campaigns.length > 0 ? 
        analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + campaign.ctr, 0) / analyticsData.campaigns.length : 0,
      averageCPC: analyticsData.campaigns.length > 0 ? 
        analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + campaign.cpc, 0) / analyticsData.campaigns.length : 0,
      averageCPM: analyticsData.campaigns.length > 0 ? 
        analyticsData.campaigns.reduce((sum: number, campaign: any) => sum + campaign.cpm, 0) / analyticsData.campaigns.length : 0,
      activeCampaigns: analyticsData.campaigns.filter((campaign: any) => campaign.status === 'ACTIVE').length,
      totalCampaigns: analyticsData.campaigns.length
    };

    console.log('✅ Facebook analytics data fetched successfully');
    console.log('📊 Summary:', {
      campaigns: analyticsData.campaigns.length,
      adSets: analyticsData.adSets?.length || 0,
      ads: analyticsData.ads?.length || 0,
      totalSpend: summary.totalSpend,
      totalClicks: summary.totalClicks
    });

    return NextResponse.json({
      success: true,
      data: {
        summary,
        campaigns: analyticsData.campaigns,
        adSets: analyticsData.adSets || [],
        ads: analyticsData.ads || [],
        dateRange,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error fetching Facebook analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
