import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching Facebook ads (including drafts)...');

    if (!FACEBOOK_ACCESS_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'Facebook access token not configured'
      }, { status: 500 });
    }

    // Fetch ads from Facebook with all statuses including drafts
    const adsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,adset_id,adset{name},status,creative{id,title,body,image_url,video_id,link_url,call_to_action_type},created_time,updated_time,insights{impressions,clicks,spend,reach,frequency,ctr,cpc,cpm}&status[]=ACTIVE&status[]=PAUSED&status[]=DRAFT&status[]=PENDING_REVIEW&status[]=DISAPPROVED&status[]=ARCHIVED&status[]=DELETED&limit=100`
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
      adset_id: ad.adset_id,
      adset_name: ad.adset?.name || '',
      platform: 'Facebook',
      status: ad.status.toLowerCase() as 'active' | 'paused' | 'completed' | 'draft' | 'scheduled' | 'pending_review' | 'disapproved' | 'archived' | 'deleted',
      creative_type: ad.creative?.video_id ? 'Video' : ad.creative?.image_url ? 'Image' : 'Link',
      creative_id: ad.creative?.id || '',
      title: ad.creative?.title || '',
      body: ad.creative?.body || '',
      link_url: ad.creative?.link_url || '',
      impressions: ad.insights?.impressions || 0,
      clicks: ad.insights?.clicks || 0,
      spent: ad.insights?.spend || 0,
      reach: ad.insights?.reach || 0,
      ctr: ad.insights?.ctr || 0,
      cpc: ad.insights?.cpc || 0,
      created_time: ad.created_time || new Date().toISOString(),
      updated_time: ad.updated_time || new Date().toISOString()
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
