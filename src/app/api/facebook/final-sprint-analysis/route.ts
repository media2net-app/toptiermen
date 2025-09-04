import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    
    console.log('🚀 FINAL SPRINT: Fetching detailed campaign analysis...');
    
    // Get timeframe dates
    const timeFrameDays: { [key: string]: number } = {
      '7d': 7,
      '14d': 14,
      '30d': 30,
      '90d': 90
    };
    
    const days = timeFrameDays[timeframe] || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const until = new Date();
    
    const sinceStr = since.toISOString().split('T')[0];
    const untilStr = until.toISOString().split('T')[0];
    
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;
    
    if (!accessToken || !adAccountId) {
      return NextResponse.json({
        success: false,
        error: 'Facebook API credentials not configured'
      }, { status: 500 });
    }

    // Fetch campaigns with detailed metrics
    // Remove 'act_' prefix if it already exists in the account ID
    const cleanAccountId = adAccountId.startsWith('act_') ? adAccountId.slice(4) : adAccountId;
    const campaignsUrl = `https://graph.facebook.com/v18.0/act_${cleanAccountId}/campaigns`;
    const campaignsParams = new URLSearchParams({
      access_token: accessToken,
      fields: [
        'id',
        'name', 
        'status',
        'objective',
        'daily_budget',
        'lifetime_budget',
        'start_time',
        'end_time',
        'insights{' + [
          'impressions',
          'reach',
          'clicks',
          'spend',
          'actions',
          'cost_per_action_type',
          'cpc',
          'cpm',
          'cpp',
          'ctr',
          'action_values'
        ].join(',') + '}',
        'targeting{' + [
          'age_min',
          'age_max', 
          'genders',
          'geo_locations',
          'interests',
          'behaviors',
          'custom_audiences'
        ].join(',') + '}'
      ].join(','),
      limit: '100',
      time_range: JSON.stringify({
        since: sinceStr,
        until: untilStr
      })
    });
    
    console.log('📊 Fetching campaigns with insights...');
    const campaignsResponse = await fetch(`${campaignsUrl}?${campaignsParams}`);
    const campaignsData = await campaignsResponse.json();
    
    if (campaignsData.error) {
      console.error('❌ Facebook API Error:', campaignsData.error);
      return NextResponse.json({
        success: false,
        error: `Facebook API Error: ${campaignsData.error.message}`
      }, { status: 400 });
    }

    // Process campaigns and calculate metrics
    const processedCampaigns = (campaignsData.data || []).map((campaign: any) => {
      const insights = campaign.insights?.data?.[0] || {};
      const targeting = campaign.targeting || {};
      
      // Use consistent conversion mapping with auto-refresh-analytics API for accuracy
      // This mapping is based on actual database leads and matches conversie-overzicht page
      const conversionMapping: { [key: string]: number } = {
        '120232181493720324': 2, // TTM - Zakelijk Prelaunch Campagne
        '120232181487970324': 3, // TTM - Jongeren Prelaunch Campagne
        '120232433872750324': 1, // TTM - Zakelijk Prelaunch Campagne - LEADS V2
        '120232181491490324': 0, // TTM - Vaders Prelaunch Campagne
        '120232181480080324': 0, // TTM - Algemene Prelaunch Campagne
        '120232498227590324': 1, // TTM - Jongeren Prelaunch Campagne - LEADS V2
        '120232497018130324': 0, // TTM - Vaders Prelaunch Campagne - LEADS V2
      };
      
      const conversions = conversionMapping[campaign.id] || 0;
      
      // Debug log for conversion mapping
      console.log(`🎯 Campaign "${campaign.name}" (${campaign.id}): ${conversions} conversions from mapping`);
      
      // Calculate conversion values - only for accurate email registration types
      const actionValues = insights.action_values || [];
      const conversionValueTypes = [
        'onsite_web_lead',
        'offsite_conversion.fb_pixel_lead'
      ];
      
      const conversionValue = actionValues
        .filter((value: any) => conversionValueTypes.includes(value.action_type))
        .reduce((sum: number, value: any) => sum + parseFloat(value.value || '0'), 0);
      
      // Calculate KPIs
      const impressions = parseInt(insights.impressions || '0');
      const reach = parseInt(insights.reach || '0');
      const clicks = parseInt(insights.clicks || '0');
      const spend = parseFloat(insights.spend || '0');
      
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpc = parseFloat(insights.cpc || '0');
      const cpm = parseFloat(insights.cpm || '0');
      const cpp = parseFloat(insights.cpp || '0');
      const conversion_rate = clicks > 0 ? (conversions / clicks) * 100 : 0;
      const roas = spend > 0 ? conversionValue / spend : 0;
      
      // Calculate performance score (0-100)
      let performance_score = 0;
      
      // CTR Score (30% weight)
      const ctr_score = Math.min(ctr * 20, 30); // Good CTR = 1.5%+
      
      // Conversion Rate Score (30% weight)  
      const conv_score = Math.min(conversion_rate * 6, 30); // Good conversion = 5%+
      
      // ROAS Score (25% weight)
      const roas_score = Math.min(roas * 5, 25); // Good ROAS = 5x+
      
      // CPC Score (15% weight) - inverted (lower is better)
      const cpc_score = cpc > 0 ? Math.max(15 - (cpc * 3), 0) : 0;
      
      performance_score = ctr_score + conv_score + roas_score + cpc_score;
      
      // Determine recommendation category
      let recommendation_category: 'excellent' | 'good' | 'needs_improvement' | 'poor';
      if (performance_score >= 80) recommendation_category = 'excellent';
      else if (performance_score >= 60) recommendation_category = 'good';
      else if (performance_score >= 40) recommendation_category = 'needs_improvement';
      else recommendation_category = 'poor';
      
      // Estimate audience size based on targeting
      let audience_size = 1000000; // Default estimate
      if (targeting.age_min && targeting.age_max) {
        const age_range = targeting.age_max - targeting.age_min;
        audience_size = age_range * 50000; // Rough estimate
      }
      
      // Create age and gender breakdowns (mock data for now)
      const age_breakdown = {
        '18-24': Math.random() * 30,
        '25-34': Math.random() * 40,
        '35-44': Math.random() * 20,
        '45-54': Math.random() * 10
      };
      
      const gender_breakdown = {
        'male': 50 + (Math.random() - 0.5) * 20,
        'female': 50 + (Math.random() - 0.5) * 20
      };
      
      const placement_breakdown = {
        'facebook_feed': Math.random() * 40 + 30,
        'instagram_feed': Math.random() * 30 + 20,
        'facebook_stories': Math.random() * 15 + 10,
        'instagram_stories': Math.random() * 15 + 10
      };
      
      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        daily_budget: parseFloat(campaign.daily_budget || '0') / 100, // Convert from cents
        lifetime_budget: parseFloat(campaign.lifetime_budget || '0') / 100,
        start_time: campaign.start_time,
        end_time: campaign.end_time,
        
        // Performance Metrics
        impressions,
        reach,
        clicks, 
        spend,
        conversions,
        
        // Calculated KPIs
        ctr,
        cpc,
        cpm,
        cpp,
        conversion_rate,
        roas,
        
        // Audience Data
        audience_size,
        age_breakdown,
        gender_breakdown,
        placement_breakdown,
        
        // Performance Score
        performance_score,
        recommendation_category
      };
    });
    
    console.log(`✅ Processed ${processedCampaigns.length} campaigns with detailed metrics`);
    
    return NextResponse.json({
      success: true,
      campaigns: processedCampaigns,
      timeframe,
      total_campaigns: processedCampaigns.length,
      analysis_date: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Final Sprint Analysis Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch campaign analysis data'
    }, { status: 500 });
  }
}
