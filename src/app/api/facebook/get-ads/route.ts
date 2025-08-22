import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching Facebook ads (including drafts)...');
    console.log('🔧 Using access token:', FACEBOOK_ACCESS_TOKEN ? 'PRESENT' : 'MISSING');
    console.log('🔧 Using ad account ID:', FACEBOOK_AD_ACCOUNT_ID);

    if (!FACEBOOK_ACCESS_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'Facebook access token not configured'
      }, { status: 500 });
    }

    // Fetch ads from Facebook with all statuses including drafts
    const adsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,created_time&limit=100`
    );

    if (!adsResponse.ok) {
      const errorData = await adsResponse.json();
      throw new Error(`Failed to fetch ads: ${JSON.stringify(errorData)}`);
    }

    const adsData = await adsResponse.json();
    const ads = adsData.data || [];

    // Transform Facebook ads to our format
    const transformedAds = ads.map((ad: any) => ({
      id: ad.id,
      name: ad.name,
      adset_id: '',
      adset_name: '',
      platform: 'Facebook',
      status: ad.status.toLowerCase() as 'active' | 'paused' | 'completed' | 'draft' | 'scheduled' | 'pending_review' | 'disapproved' | 'archived' | 'deleted',
      creative_type: 'Link',
      creative_id: '',
      title: '',
      body: '',
      link_url: '',
      impressions: 0,
      clicks: 0,
      spent: 0,
      reach: 0,
      ctr: 0,
      cpc: 0,
      created_time: ad.created_time || new Date().toISOString(),
      updated_time: new Date().toISOString()
    }));

    console.log(`✅ Found ${transformedAds.length} Facebook ads (including drafts)`);

    return NextResponse.json({
      success: true,
      data: transformedAds
    });

  } catch (error) {
    console.error('❌ Error fetching Facebook ads:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
