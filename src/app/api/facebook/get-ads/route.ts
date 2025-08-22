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
    console.log('📊 Fetching Facebook ads (including drafts)...');
    console.log('🔧 Using access token:', FACEBOOK_ACCESS_TOKEN ? 'PRESENT' : 'MISSING');
    console.log('🔧 Using ad account ID:', FACEBOOK_AD_ACCOUNT_ID);

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,effective_status,created_time&limit=1000`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data) {
      console.log('✅ No ads found');
      return NextResponse.json({ success: true, data: [] });
    }

    console.log(`📋 Raw ads from Facebook: ${data.data.length}`);
    console.log('📋 Sample ad names:', data.data.slice(0, 3).map((ad: any) => ad.name));
    console.log('📋 All ad names:', data.data.map((ad: any) => ad.name));

    // Filter to only show TTM ads
    const ttmAds = data.data.filter((ad: any) => 
      ad.name && ad.name.includes('TTM')
    );

    console.log(`✅ Found ${ttmAds.length} TTM ads (filtered from ${data.data.length} total)`);
    console.log('📋 TTM ad names:', ttmAds.map((ad: any) => ad.name));

    const transformedAds = ttmAds.map((ad: any, index: number) => {
      // Get matching video for this ad based on name
      const videoBaseName = getVideoForAdName(ad.name);
      
      return {
        id: ad.id,
        name: ad.name,
        adset_id: '',
        adset_name: '',
        creative_type: 'Video',
        creative_id: '',
        title: `Top Tier Men - ${ad.name}`,
        body: 'Transform jezelf met Top Tier Men',
        link_url: 'https://platform.toptiermen.eu/prelaunch',
        video_name: videoBaseName,
        impressions: 0,
        clicks: 0,
        spent: 0,
        reach: 0,
        ctr: 0,
        cpc: 0,
        status: ad.effective_status ? ad.effective_status.toLowerCase() : ad.status.toLowerCase(),
        created_time: ad.created_time
      };
    });

    function getVideoForAdName(adName: string): string {
      if (adName.includes('Zakelijk - Entrepreneurs & Leaders')) {
        return 'zakelijk_01.mp4';
      } else if (adName.includes('Zakelijk - Business Professionals')) {
        return 'zakelijk_02.mp4';
      } else if (adName.includes('Vaders - Role Model & Success')) {
        return 'vaders_01.mp4';
      } else if (adName.includes('Vaders - Family & Leadership')) {
        return 'vaders_02.mp4';
      } else if (adName.includes('Jongeren - Social & Community')) {
        return 'jongeren_01.mp4';
      } else if (adName.includes('Jongeren - Fitness & Lifestyle')) {
        return 'jongeren_02.mp4';
      } else if (adName.includes('Algemeen - Custom Audience')) {
        return 'algemeen_01.mp4';
      } else if (adName.includes('Algemeen - Retargeting')) {
        return 'algemeen_02.mp4';
      } else if (adName.includes('Algemeen - Lookalike')) {
        return 'algemeen_03.mp4';
      } else if (adName.includes('Algemeen - Interest Based')) {
        return 'algemeen_04.mp4';
      } else if (adName.includes('Algemeen - Awareness')) {
        return 'algemeen_05.mp4';
      } else {
        return 'algemeen_01.mp4'; // Default
      }
    }

    return NextResponse.json({
      success: true,
      data: transformedAds
    });

  } catch (error) {
    console.error('❌ Error fetching Facebook ads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}
