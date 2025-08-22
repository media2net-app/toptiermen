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
    console.log('🔍 Checking creative details directly...');

    // Get one ad to check its creative
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,creative{id,title,body,link_url}&limit=1&_t=${Date.now()}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook API error response:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log('✅ No ads found');
      return NextResponse.json({ success: true, data: null });
    }

    const ad = data.data[0];
    const creative = ad.creative;

    console.log('📋 Ad details:', {
      ad_id: ad.id,
      ad_name: ad.name,
      creative_id: creative?.id,
      creative_title: creative?.title,
      creative_body: creative?.body,
      creative_link_url: creative?.link_url
    });

    return NextResponse.json({
      success: true,
      data: {
        ad_id: ad.id,
        ad_name: ad.name,
        creative_id: creative?.id,
        creative_title: creative?.title,
        creative_body: creative?.body,
        creative_link_url: creative?.link_url,
        raw_creative: creative
      }
    });

  } catch (error) {
    console.error('❌ Error checking creative details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check creative details' },
      { status: 500 }
    );
  }
}
