import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

export async function POST() {
  if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
    return NextResponse.json(
      { success: false, error: 'Missing Facebook credentials' },
      { status: 500 }
    );
  }

  try {
    console.log('👨‍👧‍👦 Adding Fatherhood targeting to Vaders ad sets (v2)...');

    // First, search for the correct Fatherhood interest ID
    console.log('🔍 Searching for Fatherhood interest ID...');
    const searchResponse = await fetch(
      `https://graph.facebook.com/v19.0/search?type=adinterest&q=Fatherhood&access_token=${FACEBOOK_ACCESS_TOKEN}&limit=10`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Facebook search API error:', errorText);
      throw new Error(`Facebook search API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('🔍 Search results:', searchData);

    // Find the correct Fatherhood interest
    const fatherhoodInterest = searchData.data?.find((interest: any) => 
      interest.name.toLowerCase().includes('fatherhood') || 
      interest.name.toLowerCase().includes('parenting') ||
      interest.name.toLowerCase().includes('children')
    );

    if (!fatherhoodInterest) {
      console.log('❌ Could not find Fatherhood interest, trying alternative approach...');
      
      // Try with a known Fatherhood interest ID
      const knownFatherhoodIds = [
        '6002714396372', // Common Fatherhood ID
        '6002714396373', // Alternative
        '6002714396374'  // Another alternative
      ];

      for (const interestId of knownFatherhoodIds) {
        try {
          const testResponse = await fetch(
            `https://graph.facebook.com/v19.0/${interestId}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
            {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            }
          );

          if (testResponse.ok) {
            const testData = await testResponse.json();
            if (testData.name && testData.name.toLowerCase().includes('fatherhood')) {
              console.log(`✅ Found Fatherhood interest: ${testData.name} (ID: ${interestId})`);
              break;
            }
          }
        } catch (error) {
          console.log(`❌ Interest ID ${interestId} not valid`);
        }
      }
    } else {
      console.log(`✅ Found Fatherhood interest: ${fatherhoodInterest.name} (ID: ${fatherhoodInterest.id})`);
    }

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
      return NextResponse.json({ success: true, data: { updated: 0, errors: 0 } });
    }

    // Filter to only show Vaders ad sets
    const vadersAdSets = data.data.filter((adset: any) => 
      adset.name && adset.name.includes('TTM') && adset.name.includes('Vaders')
    );

    console.log(`📋 Found ${vadersAdSets.length} Vaders ad sets to update`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // For now, let's just return the search results to see what interests are available
    return NextResponse.json({
      success: true,
      data: {
        search_results: searchData.data,
        vaders_ad_sets: vadersAdSets.map((adset: any) => ({
          id: adset.id,
          name: adset.name,
          current_interests: adset.targeting?.interests?.map((i: any) => i.name) || []
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error adding Fatherhood targeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add Fatherhood targeting' },
      { status: 500 }
    );
  }
}
