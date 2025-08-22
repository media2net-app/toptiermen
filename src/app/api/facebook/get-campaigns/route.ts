import { NextRequest, NextResponse } from 'next/server';
import { facebookAdManagerComplete } from '@/lib/facebook-ad-manager-complete';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching Facebook campaigns...');

    // Test connection first
    const connectionTest = await facebookAdManagerComplete.testConnection();
    if (!connectionTest.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Facebook connection failed',
        details: connectionTest.error 
      }, { status: 500 });
    }

    // Get campaigns from Facebook
    const campaignsResult = await facebookAdManagerComplete.getCampaigns();
    
    if (!campaignsResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch campaigns',
        details: campaignsResult.error 
      }, { status: 500 });
    }

    // Transform Facebook campaigns to our format
    const transformedCampaigns = campaignsResult.data.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      platform: 'Facebook',
      status: campaign.status.toLowerCase() as 'active' | 'paused' | 'completed' | 'draft' | 'scheduled',
      objective: campaign.objective.toLowerCase() as 'awareness' | 'traffic' | 'conversions' | 'engagement' | 'sales',
      impressions: 0, // Will be populated from ad insights
      clicks: 0,
      conversions: 0,
      spent: 0,
      budget: campaign.daily_budget || campaign.lifetime_budget || 0,
      dailyBudget: campaign.daily_budget || 0,
      ctr: 0,
      cpc: 0,
      conversionRate: 0,
      roas: 0,
      targetAudience: 'Facebook Targeting',
      startDate: campaign.start_time || new Date().toISOString(),
      endDate: campaign.stop_time || '',
      adsCount: 0, // Will be populated from ad sets
      createdAt: campaign.created_time || new Date().toISOString(),
      lastUpdated: campaign.updated_time || new Date().toISOString(),
      videoId: '', // Will be populated from ad sets
      videoName: '', // Will be populated from ad sets
      targeting: {
        ageMin: 18,
        ageMax: 65,
        gender: 'ALL' as const,
        locations: ['NL'],
        languages: ['nl'],
        interests: [],
        behaviors: [],
        exclusions: []
      },
      placements: {
        facebook: true,
        instagram: true,
        audienceNetwork: false,
        messenger: false
      },
      adFormat: 'VIDEO' as const
    }));

    console.log(`✅ Found ${transformedCampaigns.length} Facebook campaigns`);

    return NextResponse.json({
      success: true,
      data: transformedCampaigns
    });

  } catch (error) {
    console.error('❌ Error fetching Facebook campaigns:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
