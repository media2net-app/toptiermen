import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching Facebook ad sets...');

    if (!FACEBOOK_ACCESS_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'Facebook access token not configured'
      }, { status: 500 });
    }

    // Fetch ad sets from Facebook
    const adSetsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,campaign_id,campaign{name},status,daily_budget,lifetime_budget,created_time,updated_time,insights{impressions,clicks,spend,reach,frequency,ctr,cpc,cpm}`
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
      campaign_id: adSet.campaign_id,
      campaign_name: adSet.campaign?.name || '',
      platform: 'Facebook',
      status: adSet.status.toLowerCase() as 'active' | 'paused' | 'completed' | 'draft' | 'scheduled',
      impressions: adSet.insights?.impressions || 0,
      clicks: adSet.insights?.clicks || 0,
      spent: adSet.insights?.spend || 0,
      reach: adSet.insights?.reach || 0,
      ctr: adSet.insights?.ctr || 0,
      cpc: adSet.insights?.cpc || 0,
      daily_budget: adSet.daily_budget || 0,
      lifetime_budget: adSet.lifetime_budget || 0,
      created_time: adSet.created_time || new Date().toISOString(),
      updated_time: adSet.updated_time || new Date().toISOString()
    }));

    console.log(`✅ Found ${transformedAdSets.length} Facebook ad sets`);

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
