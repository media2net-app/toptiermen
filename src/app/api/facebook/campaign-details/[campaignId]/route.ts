import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

async function makeFacebookRequest(endpoint: string, params: any = {}) {
  try {
    const url = new URL(`https://graph.facebook.com/v18.0${endpoint}`);
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

export async function GET(
  request: NextRequest, 
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    console.log(`🔍 CAMPAIGN DETAILS: Fetching comprehensive data for campaign ${campaignId}`);

    if (!FACEBOOK_ACCESS_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Facebook API credentials not configured' },
        { status: 500 }
      );
    }

    // 1. Get campaign basic info (targeting comes from ad sets)
    console.log('📋 Fetching campaign basic info...');
    const campaignResponse = await makeFacebookRequest(`/${campaignId}`, {
      fields: [
        'id', 'name', 'status', 'objective', 'created_time', 'updated_time',
        'start_time', 'stop_time', 'daily_budget', 'lifetime_budget',
        'effective_status', 'configured_status', 'bid_strategy', 'buying_type'
      ].join(',')
    });

    // 2. Get campaign insights with detailed breakdown
    console.log('📊 Fetching campaign insights...');
    const insightsResponse = await makeFacebookRequest(`/${campaignId}/insights`, {
      fields: [
        'impressions', 'clicks', 'spend', 'reach', 'frequency', 'ctr', 'cpc', 'cpm',
        'actions', 'action_values', 'cost_per_action_type', 'cost_per_conversion',
        'conversion_rate_ranking', 'quality_ranking', 'engagement_rate_ranking',
        'video_avg_time_watched_actions', 'video_p25_watched_actions', 'video_p50_watched_actions',
        'video_p75_watched_actions', 'video_p100_watched_actions', 'cost_per_unique_click',
        'unique_clicks', 'unique_ctr', 'website_ctr', 'inline_link_clicks',
        'inline_link_click_ctr', 'cost_per_inline_link_click'
      ].join(','),
      time_range: JSON.stringify({ since: '2025-08-01', until: new Date().toISOString().split('T')[0] }),
      breakdowns: 'age,gender'
    });

    // 3. Get ad sets within this campaign
    console.log('🎯 Fetching ad sets...');
    const adSetsResponse = await makeFacebookRequest(`/${campaignId}/adsets`, {
      fields: [
        'id', 'name', 'status', 'configured_status', 'effective_status',
        'created_time', 'updated_time', 'daily_budget', 'lifetime_budget',
        'bid_strategy', 'optimization_goal', 'targeting'
      ].join(','),
      limit: 100
    });

    // 4. Get ads within this campaign
    console.log('📢 Fetching ads...');
    const adsResponse = await makeFacebookRequest(`/${campaignId}/ads`, {
      fields: [
        'id', 'name', 'status', 'configured_status', 'effective_status',
        'created_time', 'updated_time', 'adset_id'
      ].join(','),
      limit: 100
    });

    // 5. Get campaign insights by placement
    console.log('📱 Fetching placement insights...');
    let placementInsightsResponse = { data: [] };
    try {
      placementInsightsResponse = await makeFacebookRequest(`/${campaignId}/insights`, {
        fields: 'impressions,clicks,spend,ctr,cpc',
        breakdowns: 'publisher_platform',
        time_range: JSON.stringify({ since: '2025-08-01', until: new Date().toISOString().split('T')[0] })
      });
    } catch (error) {
      console.log('⚠️ Placement insights not available, skipping...');
    }

    // 6. Get campaign insights by country/region
    console.log('🌍 Fetching geographic insights...');
    let geoInsightsResponse = { data: [] };
    try {
      geoInsightsResponse = await makeFacebookRequest(`/${campaignId}/insights`, {
        fields: 'impressions,clicks,spend,ctr,cpc',
        breakdowns: 'country',
        time_range: JSON.stringify({ since: '2025-08-01', until: new Date().toISOString().split('T')[0] })
      });
    } catch (error) {
      console.log('⚠️ Geographic insights not available, skipping...');
    }

    // Process targeting data from the first ad set (campaigns don't have targeting, ad sets do)
    const firstAdSetTargeting = adSetsResponse.data?.[0]?.targeting || {};
    const processedTargeting = {
      age_min: firstAdSetTargeting.age_min || 'Not set',
      age_max: firstAdSetTargeting.age_max || 'Not set',
      genders: firstAdSetTargeting.genders || [],
      geo_locations: firstAdSetTargeting.geo_locations || {},
      interests: firstAdSetTargeting.interests || [],
      behaviors: firstAdSetTargeting.behaviors || [],
      flexible_spec: firstAdSetTargeting.flexible_spec || [],
      exclusions: firstAdSetTargeting.exclusions || {},
      custom_audiences: firstAdSetTargeting.custom_audiences || [],
      excluded_custom_audiences: firstAdSetTargeting.excluded_custom_audiences || [],
      connections: firstAdSetTargeting.connections || [],
      excluded_connections: firstAdSetTargeting.excluded_connections || [],
      user_device: firstAdSetTargeting.user_device || [],
      user_os: firstAdSetTargeting.user_os || [],
      wireless_carrier: firstAdSetTargeting.wireless_carrier || [],
      device_platforms: firstAdSetTargeting.device_platforms || [],
      publisher_platforms: firstAdSetTargeting.publisher_platforms || [],
      facebook_positions: firstAdSetTargeting.facebook_positions || [],
      instagram_positions: firstAdSetTargeting.instagram_positions || [],
      locales: firstAdSetTargeting.locales || [],
      education_statuses: firstAdSetTargeting.education_statuses || [],
      work_employers: firstAdSetTargeting.work_employers || [],
      work_positions: firstAdSetTargeting.work_positions || [],
      relationship_statuses: firstAdSetTargeting.relationship_statuses || [],
      life_events: firstAdSetTargeting.life_events || [],
      family_statuses: firstAdSetTargeting.family_statuses || [],
      income: firstAdSetTargeting.income || [],
      home_ownership: firstAdSetTargeting.home_ownership || [],
      home_type: firstAdSetTargeting.home_type || [],
      home_value: firstAdSetTargeting.home_value || [],
      ethnic_affinity: firstAdSetTargeting.ethnic_affinity || [],
      generation: firstAdSetTargeting.generation || [],
      household_composition: firstAdSetTargeting.household_composition || [],
      moms: firstAdSetTargeting.moms || [],
      office_type: firstAdSetTargeting.office_type || [],
      politics: firstAdSetTargeting.politics || [],
      targeting_optimization: firstAdSetTargeting.targeting_optimization || 'none'
    };

    // Process insights for better structure
    const insights = insightsResponse.data?.[0] || {};
    const demographicInsights = insightsResponse.data || [];

    // Process ad sets with insights
    const adSetsWithInsights = await Promise.all(
      adSetsResponse.data.map(async (adSet: any) => {
        try {
          const adSetInsights = await makeFacebookRequest(`/${adSet.id}/insights`, {
            fields: 'impressions,clicks,spend,reach,ctr,cpc,conversions',
            time_range: JSON.stringify({ since: '2025-08-01', until: new Date().toISOString().split('T')[0] })
          });
          return {
            ...adSet,
            insights: adSetInsights.data?.[0] || {}
          };
        } catch (error) {
          console.error(`❌ Error fetching insights for ad set ${adSet.id}:`, error);
          return {
            ...adSet,
            insights: {}
          };
        }
      })
    );

    // Process ads with insights  
    const adsWithInsights = await Promise.all(
      adsResponse.data.map(async (ad: any) => {
        try {
          const adInsights = await makeFacebookRequest(`/${ad.id}/insights`, {
            fields: 'impressions,clicks,spend,reach,ctr,cpc,conversions',
            time_range: JSON.stringify({ since: '2025-08-01', until: new Date().toISOString().split('T')[0] })
          });
          return {
            ...ad,
            insights: adInsights.data?.[0] || {}
          };
        } catch (error) {
          console.error(`❌ Error fetching insights for ad ${ad.id}:`, error);
          return {
            ...ad,
            insights: {}
          };
        }
      })
    );

    const result = {
      campaign: {
        ...campaignResponse,
        targeting: processedTargeting
      },
      insights: {
        overall: insights,
        demographic: demographicInsights,
        placement: placementInsightsResponse.data || [],
        geographic: geoInsightsResponse.data || []
      },
      adSets: adSetsWithInsights,
      ads: adsWithInsights,
      meta: {
        fetched_at: new Date().toISOString(),
        total_ad_sets: adSetsResponse.data.length,
        total_ads: adsResponse.data.length
      }
    };

    console.log(`✅ CAMPAIGN DETAILS: Successfully fetched comprehensive data for ${campaignResponse.name}`);
    console.log(`📊 Found ${adSetsResponse.data.length} ad sets and ${adsResponse.data.length} ads`);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Campaign details fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campaign details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
