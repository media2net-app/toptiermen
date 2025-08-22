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
    console.log('🔍 Checking Facebook ad link URLs...');

    // Fetch ads with creative details
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,creative{id,link_url,object_story_spec}&limit=1000&_t=${Date.now()}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook API error response:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data) {
      console.log('✅ No ads found');
      return NextResponse.json({ success: true, data: [] });
    }

    // Filter to only show TTM ads
    const ttmAds = data.data.filter((ad: any) => 
      ad.name && ad.name.includes('TTM')
    );

    console.log(`📋 Found ${ttmAds.length} TTM ads`);

    const adLinkStatus = ttmAds.map((ad: any) => {
      const creative = ad.creative;
      const currentLinkUrl = creative?.link_url || creative?.object_story_spec?.link_data?.link || 'No link found';
      const isCorrect = currentLinkUrl === 'https://platform.toptiermen.eu/prelaunch';
      
      return {
        id: ad.id,
        name: ad.name,
        creative_id: creative?.id,
        current_link_url: currentLinkUrl,
        is_correct: isCorrect,
        needs_fix: !isCorrect
      };
    });

    const incorrectAds = adLinkStatus.filter(ad => ad.needs_fix);
    const correctAds = adLinkStatus.filter(ad => ad.is_correct);

    console.log(`✅ ${correctAds.length} ads have correct link URL`);
    console.log(`❌ ${incorrectAds.length} ads need fixing`);

    return NextResponse.json({
      success: true,
      data: {
        total_ads: ttmAds.length,
        correct_ads: correctAds.length,
        incorrect_ads: incorrectAds.length,
        ad_details: adLinkStatus,
        incorrect_ads_list: incorrectAds
      }
    });

  } catch (error) {
    console.error('❌ Error checking ad links:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check ad links' },
      { status: 500 }
    );
  }
}
