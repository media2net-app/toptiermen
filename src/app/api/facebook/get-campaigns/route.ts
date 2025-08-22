import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching Facebook campaigns (including drafts)...');
    console.log('🔧 Using access token:', FACEBOOK_ACCESS_TOKEN ? 'PRESENT' : 'MISSING');
    console.log('🔧 Using ad account ID:', FACEBOOK_AD_ACCOUNT_ID);

    if (!FACEBOOK_ACCESS_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'Facebook access token not configured'
      }, { status: 500 });
    }

    // Fetch campaigns from Facebook with all statuses including drafts
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,created_time&limit=100`
    );

    if (!campaignsResponse.ok) {
      const errorData = await campaignsResponse.json();
      throw new Error(`Failed to fetch campaigns: ${JSON.stringify(errorData)}`);
    }

    const campaignsData = await campaignsResponse.json();
    const campaigns = campaignsData.data || [];

    // Transform Facebook campaigns to our format
    const transformedCampaigns = campaigns.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name,
      platform: 'Facebook',
      status: campaign.status.toLowerCase() as 'active' | 'paused' | 'completed' | 'draft' | 'scheduled' | 'pending_review' | 'disapproved' | 'archived' | 'deleted',
      objective: 'traffic',
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spent: 0,
      budget: 0,
      dailyBudget: 0,
      ctr: 0,
      cpc: 0,
      conversionRate: 0,
      roas: 0,
      targetAudience: 'Facebook Targeting',
      startDate: new Date().toISOString(),
      endDate: '',
      adsCount: 0,
      createdAt: campaign.created_time || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      videoId: '',
      videoName: '',
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

    console.log(`✅ Found ${transformedCampaigns.length} Facebook campaigns (including drafts)`);

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
