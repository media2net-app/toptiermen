import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching Facebook ad sets (including drafts)...');
    console.log('🔧 Using access token:', FACEBOOK_ACCESS_TOKEN ? 'PRESENT' : 'MISSING');
    console.log('🔧 Using ad account ID:', FACEBOOK_AD_ACCOUNT_ID);

    if (!FACEBOOK_ACCESS_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'Facebook access token not configured'
      }, { status: 500 });
    }

    // Fetch ad sets from Facebook with all statuses including drafts
    const adSetsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,created_time&limit=100`
    );

    if (!adSetsResponse.ok) {
      const errorData = await adSetsResponse.json();
      throw new Error(`Failed to fetch ad sets: ${JSON.stringify(errorData)}`);
    }

    const adSetsData = await adSetsResponse.json();
    const adSets = adSetsData.data || [];

    // Transform Facebook ad sets to our format
    const transformedAdSets = adSets.map((adSet: any) => ({
      id: adSet.id,
      name: adSet.name,
      campaign_id: '',
      campaign_name: '',
      platform: 'Facebook',
      status: adSet.status.toLowerCase() as 'active' | 'paused' | 'completed' | 'draft' | 'scheduled' | 'pending_review' | 'disapproved' | 'archived' | 'deleted',
      impressions: 0,
      clicks: 0,
      spent: 0,
      reach: 0,
      ctr: 0,
      cpc: 0,
      daily_budget: 0,
      lifetime_budget: 0,
      created_time: adSet.created_time || new Date().toISOString(),
      updated_time: new Date().toISOString()
    }));

    console.log(`✅ Found ${transformedAdSets.length} Facebook ad sets (including drafts)`);

    return NextResponse.json({
      success: true,
      data: transformedAdSets
    });

  } catch (error) {
    console.error('❌ Error fetching Facebook ad sets:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
