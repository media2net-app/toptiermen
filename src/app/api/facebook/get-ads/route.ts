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
    console.log('📊 Fetching Facebook ads with detailed data...');
    console.log('🔧 Using access token:', FACEBOOK_ACCESS_TOKEN ? 'PRESENT' : 'MISSING');
    console.log('🔧 Using ad account ID:', FACEBOOK_AD_ACCOUNT_ID);

    // Fetch ads with more detailed fields including creative details
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,effective_status,created_time,adset_id,creative{id,title,body,image_url,video_id,link_url,object_story_spec},insights{impressions,clicks,spend,reach,ctr,cpc}&limit=1000&_t=${Date.now()}`,
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

    if (!data.data) {
      console.log('✅ No ads found');
      return NextResponse.json({ success: true, data: [] });
    }

    console.log(`📋 Raw ads from Facebook: ${data.data.length}`);
    console.log('📋 Sample ad names:', data.data.slice(0, 3).map((ad: any) => ad.name));

    // Filter to only show TTM ads
    const ttmAds = data.data.filter((ad: any) => 
      ad.name && ad.name.includes('TTM')
    );

    console.log(`✅ Found ${ttmAds.length} TTM ads (filtered from ${data.data.length} total)`);
    console.log('📋 TTM ad names:', ttmAds.map((ad: any) => ad.name));

    const transformedAds = ttmAds.map((ad: any) => {
      // Get insights data
      const insights = ad.insights && ad.insights.data && ad.insights.data[0];
      const creative = ad.creative;
      
      // Get matching video for this ad based on name
      const videoBaseName = getVideoForAdName(ad.name);
      
      return {
        id: ad.id,
        name: ad.name,
        adset_id: ad.adset_id || '',
        adset_name: getAdSetNameFromId(ad.adset_id),
        creative_type: creative?.video_id ? 'Video' : 'Image',
        creative_id: creative?.id || '',
        title: creative?.title || `Top Tier Men - ${ad.name}`,
        body: creative?.body || 'Transform jezelf met Top Tier Men',
        link_url: creative?.link_url || 'https://platform.toptiermen.eu/prelaunch',
        video_name: videoBaseName,
        video_id: creative?.object_story_spec?.video_data?.video_id || creative?.video_id || '',
        image_url: creative?.image_url || '',
        object_story_spec: creative?.object_story_spec || null,
        raw_creative: creative, // Include full creative data for debugging
        impressions: insights?.impressions || 0,
        clicks: insights?.clicks || 0,
        spent: insights?.spend ? parseFloat(insights.spend) * 100 : 0, // Convert to cents
        reach: insights?.reach || 0,
        ctr: insights?.ctr || 0,
        cpc: insights?.cpc ? parseFloat(insights.cpc) * 100 : 0, // Convert to cents
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

    function getAdSetNameFromId(adsetId: string): string {
      // This would need to be implemented with a separate API call
      // For now, return a placeholder
      return adsetId ? `Ad Set ${adsetId.slice(-4)}` : '-';
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
