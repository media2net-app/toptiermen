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
    console.log('📊 Fetching Facebook ad sets with detailed data...');
    console.log('🔧 Using access token:', FACEBOOK_ACCESS_TOKEN ? 'PRESENT' : 'MISSING');
    console.log('🔧 Using ad account ID:', FACEBOOK_AD_ACCOUNT_ID);

    // Fetch ad sets with more detailed fields
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,created_time,campaign_id,insights{impressions,clicks,spend,reach,ctr,cpc}&limit=1000`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook API error response:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data) {
      console.log('✅ No ad sets found');
      return NextResponse.json({ success: true, data: [] });
    }

    console.log(`📋 Raw ad sets from Facebook: ${data.data.length}`);
    console.log('📋 Sample ad set names:', data.data.slice(0, 3).map((adSet: any) => adSet.name));

    // Filter to only show TTM ad sets
    const ttmAdSets = data.data.filter((adSet: any) => 
      adSet.name && adSet.name.includes('TTM')
    );

    console.log(`✅ Found ${ttmAdSets.length} TTM ad sets (filtered from ${data.data.length} total)`);
    console.log('📋 TTM ad set names:', ttmAdSets.map((adSet: any) => adSet.name));

    const transformedAdSets = ttmAdSets.map((adSet: any) => {
      // Get insights data
      const insights = adSet.insights && adSet.insights.data && adSet.insights.data[0];
      
      return {
        id: adSet.id,
        name: adSet.name,
        campaign_id: adSet.campaign_id || '',
        campaign_name: getCampaignNameFromId(adSet.campaign_id),
        status: adSet.status.toLowerCase(),
        impressions: insights?.impressions || 0,
        clicks: insights?.clicks || 0,
        spent: insights?.spend ? parseFloat(insights.spend) * 100 : 0, // Convert to cents
        reach: insights?.reach || 0,
        ctr: insights?.ctr || 0,
        cpc: insights?.cpc ? parseFloat(insights.cpc) * 100 : 0, // Convert to cents
        daily_budget: 500, // €5 in cents
        lifetime_budget: 0,
        created_time: adSet.created_time,
        updated_time: adSet.created_time
      };
    });

    function getCampaignNameFromId(campaignId: string): string {
      // This would need to be implemented with a separate API call
      // For now, return a placeholder
      return campaignId ? `Campaign ${campaignId.slice(-4)}` : '-';
    }

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
