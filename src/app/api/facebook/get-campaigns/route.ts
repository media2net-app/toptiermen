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
    console.log('📊 Fetching Facebook campaigns (including drafts)...');
    console.log('🔧 Using access token:', FACEBOOK_ACCESS_TOKEN ? 'PRESENT' : 'MISSING');
    console.log('🔧 Using ad account ID:', FACEBOOK_AD_ACCOUNT_ID);

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,created_time&limit=100`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data) {
      console.log('✅ No campaigns found');
      return NextResponse.json({ success: true, data: [] });
    }

    // Filter to only show TTM campaigns
    const ttmCampaigns = data.data.filter((campaign: any) => 
      campaign.name && campaign.name.includes('TTM')
    );

    console.log(`✅ Found ${ttmCampaigns.length} TTM campaigns (filtered from ${data.data.length} total)`);

    const transformedCampaigns = ttmCampaigns.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status.toLowerCase(),
      objective: 'traffic',
      impressions: 0,
      clicks: 0,
      spent: 0,
      budget: 25,
      dailyBudget: 25,
      ctr: 0,
      cpc: 0,
      startDate: new Date(campaign.created_time).toISOString().split('T')[0],
      endDate: '2025-12-31',
      adsCount: 0,
      videoId: '',
      videoName: '',
      createdAt: campaign.created_time,
      lastUpdated: campaign.created_time
    }));

    return NextResponse.json({
      success: true,
      data: transformedCampaigns
    });

  } catch (error) {
    console.error('❌ Error fetching Facebook campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
