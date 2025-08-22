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
    console.log('🔍 Checking for VK targeting in ad sets...');

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

    // Filter to only show TTM ad sets
    const ttmAdSets = data.data.filter((adset: any) => 
      adset.name && adset.name.includes('TTM')
    );

    console.log(`📋 Found ${ttmAdSets.length} TTM ad sets`);

    const vkAdSets: Array<{
      id: string;
      name: string;
      targeting: any;
      interests: any[];
      has_interests?: boolean;
      interest_count?: number;
    }> = [];
    const nonVkAdSets: Array<{
      id: string;
      name: string;
      targeting: any;
      interests: any[];
      has_interests?: boolean;
      interest_count?: number;
    }> = [];

    // Check each ad set for VK targeting
    for (const adset of ttmAdSets) {
      const targeting = adset.targeting;
      const hasVK = targeting && targeting.interests && targeting.interests.some((interest: any) => 
        interest.name === 'VK' || interest.id === '6002714396372'
      );

      if (hasVK) {
        vkAdSets.push({
          id: adset.id,
          name: adset.name,
          targeting: targeting,
          interests: targeting.interests
        });
      } else {
        nonVkAdSets.push({
          id: adset.id,
          name: adset.name,
          targeting: targeting,
          interests: targeting && targeting.interests ? targeting.interests : [],
          has_interests: targeting && targeting.interests ? true : false,
          interest_count: targeting && targeting.interests ? targeting.interests.length : 0
        });
      }
    }

    console.log(`🔍 Found ${vkAdSets.length} ad sets with VK targeting`);
    console.log(`✅ Found ${nonVkAdSets.length} ad sets without VK targeting`);

    return NextResponse.json({
      success: true,
      data: {
        total_ad_sets: ttmAdSets.length,
        vk_ad_sets: vkAdSets.length,
        non_vk_ad_sets: nonVkAdSets.length,
        vk_ad_sets_details: vkAdSets,
        non_vk_ad_sets_details: nonVkAdSets
      }
    });

  } catch (error) {
    console.error('❌ Error checking VK targeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check VK targeting' },
      { status: 500 }
    );
  }
}
