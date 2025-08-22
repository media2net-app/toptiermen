import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

export async function GET() {
  if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
    return NextResponse.json(
      { success: false, error: 'Missing Facebook credentials' },
      { status: 500 }
    );
  }

  try {
    console.log('📊 Fetching Facebook ad sets (including drafts)...');
    console.log('🔧 Using access token:', FACEBOOK_ACCESS_TOKEN ? 'PRESENT' : 'MISSING');
    console.log('🔧 Using ad account ID:', FACEBOOK_AD_ACCOUNT_ID);

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,created_time&limit=1000`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data) {
      console.log('✅ No ad sets found');
      return NextResponse.json({ success: true, data: [] });
    }

    console.log(`📋 Raw ad sets from Facebook: ${data.data.length}`);
    console.log('📋 Sample ad set names:', data.data.slice(0, 3).map((adSet: any) => adSet.name));
    console.log('📋 All ad set names:', data.data.map((adSet: any) => adSet.name));

    // Filter to only show TTM ad sets
    const ttmAdSets = data.data.filter((adSet: any) => 
      adSet.name && adSet.name.includes('TTM')
    );

    console.log(`✅ Found ${ttmAdSets.length} TTM ad sets (filtered from ${data.data.length} total)`);
    console.log('📋 TTM ad set names:', ttmAdSets.map((adSet: any) => adSet.name));

    const transformedAdSets = ttmAdSets.map((adSet: any) => ({
      id: adSet.id,
      name: adSet.name,
      campaign_id: '',
      campaign_name: '',
      status: adSet.status.toLowerCase(),
      impressions: 0,
      clicks: 0,
      spent: 0,
      reach: 0,
      ctr: 0,
      cpc: 0,
      daily_budget: 500, // €5 in cents
      lifetime_budget: 0,
      created_time: adSet.created_time,
      updated_time: adSet.created_time
    }));

    return NextResponse.json({
      success: true,
      data: transformedAdSets
    });

  } catch (error) {
    console.error('❌ Error fetching Facebook ad sets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ad sets' },
      { status: 500 }
    );
  }
}
