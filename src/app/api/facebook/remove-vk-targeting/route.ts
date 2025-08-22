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
    console.log('🔧 Removing VK targeting from ad sets...');

    // First, get all ad sets
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

    // Filter to only show TTM ad sets
    const ttmAdSets = data.data.filter((adset: any) => 
      adset.name && adset.name.includes('TTM')
    );

    console.log(`📋 Found ${ttmAdSets.length} TTM ad sets to check`);

    let successCount = 0;
    let errorCount = 0;
    const results: Array<{
      adset_id: string;
      adset_name: string;
      status: string;
      added_interest?: string;
      total_interests?: number;
      removed_interests?: any[];
      remaining_interests?: any[];
      error?: string;
    }> = [];

    // Check and fix each ad set
    for (const adset of ttmAdSets) {
      try {
        const targeting = adset.targeting;
        if (!targeting || !targeting.interests) {
          console.log(`⚠️ No interests targeting found for ad set ${adset.name}`);
          continue;
        }

        // Check if VK is in the interests
        const hasVK = targeting.interests.some((interest: any) => 
          interest.name === 'VK' || interest.id === '6002714396372'
        );

        if (!hasVK) {
          console.log(`✅ Ad set ${adset.name} doesn't have VK targeting`);
          continue;
        }

        console.log(`🔧 Found VK targeting in ad set: ${adset.name}`);

        // Create new targeting without VK
        const newTargeting = {
          ...targeting,
          interests: targeting.interests.filter((interest: any) => 
            interest.name !== 'VK' && interest.id !== '6002714396372'
          )
        };

        // Update the ad set targeting
        const updateResponse = await fetch(
          `https://graph.facebook.com/v19.0/${adset.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              targeting: newTargeting
            })
          }
        );

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log(`✅ Successfully updated ad set ${adset.id}`);
          successCount++;
          results.push({
            adset_id: adset.id,
            adset_name: adset.name,
            status: 'success',
            removed_interests: targeting.interests.filter((interest: any) => 
              interest.name === 'VK' || interest.id === '6002714396372'
            ),
            remaining_interests: newTargeting.interests
          });
        } else {
          const errorText = await updateResponse.text();
          console.error(`❌ Failed to update ad set ${adset.id}:`, errorText);
          errorCount++;
          results.push({
            adset_id: adset.id,
            adset_name: adset.name,
            status: 'error',
            error: errorText
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error updating ad set ${adset.name}:`, error);
        errorCount++;
        results.push({
          adset_id: adset.id,
          adset_name: adset.name,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`✅ Removed VK targeting from ${successCount} ad sets successfully`);
    console.log(`❌ ${errorCount} ad sets failed to update`);

    return NextResponse.json({
      success: true,
      data: {
        total_ad_sets: ttmAdSets.length,
        updated: successCount,
        errors: errorCount,
        results: results
      }
    });

  } catch (error) {
    console.error('❌ Error removing VK targeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove VK targeting' },
      { status: 500 }
    );
  }
}
