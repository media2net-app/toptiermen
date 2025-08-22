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
    console.log('🔍 Checking Vaders ad sets targeting...');

    // Get all ad sets
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,targeting&limit=1000&_t=${Date.now()}`,
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
      console.log('✅ No ad sets found');
      return NextResponse.json({ success: true, data: [] });
    }

    // Filter to only show Vaders ad sets
    const vadersAdSets = data.data.filter((adset: any) => 
      adset.name && adset.name.includes('TTM') && adset.name.includes('Vaders')
    );

    console.log(`📋 Found ${vadersAdSets.length} Vaders ad sets`);

    const results = vadersAdSets.map((adset: any) => {
      const targeting = adset.targeting;
      const interests = targeting && targeting.interests ? targeting.interests : [];
      
      const hasFatherhood = interests.some((interest: any) => 
        interest.name === 'Fatherhood (children & parenting)' || 
        interest.name === 'Fatherhood' ||
        interest.id === '6002714396372'
      );

      return {
        id: adset.id,
        name: adset.name,
        has_fatherhood: hasFatherhood,
        interests: interests.map((interest: any) => interest.name),
        total_interests: interests.length
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        total_vaders_ad_sets: vadersAdSets.length,
        ad_sets: results
      }
    });

  } catch (error) {
    console.error('❌ Error checking Vaders targeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check Vaders targeting' },
      { status: 500 }
    );
  }
}
