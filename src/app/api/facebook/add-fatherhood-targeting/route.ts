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
    console.log('👨‍👧‍👦 Adding Fatherhood targeting to Vaders ad sets...');

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

    // Filter to only show Vaders ad sets
    const vadersAdSets = data.data.filter((adset: any) => 
      adset.name && adset.name.includes('TTM') && adset.name.includes('Vaders')
    );

    console.log(`📋 Found ${vadersAdSets.length} Vaders ad sets to update`);

    let successCount = 0;
    let errorCount = 0;
    const results: Array<{
      adset_id: string;
      adset_name: string;
      status: string;
      added_interest?: string;
      total_interests?: number;
      error?: string;
    }> = [];

    // Check and update each Vaders ad set
    for (const adset of vadersAdSets) {
      try {
        const targeting = adset.targeting;
        if (!targeting) {
          console.log(`⚠️ No targeting found for ad set ${adset.name}`);
          continue;
        }

        // Check if Fatherhood is already in the interests
        const hasFatherhood = targeting.interests && targeting.interests.some((interest: any) => 
          interest.name === 'Fatherhood (children & parenting)' || 
          interest.name === 'Fatherhood' ||
          interest.id === '6002714396372' // Fatherhood interest ID
        );

        if (hasFatherhood) {
          console.log(`✅ Ad set ${adset.name} already has Fatherhood targeting`);
          continue;
        }

        console.log(`🔧 Adding Fatherhood targeting to ad set: ${adset.name}`);

        // Create new targeting with Fatherhood added
        const newTargeting = {
          ...targeting,
          interests: [
            ...(targeting.interests || []),
            {
              name: 'Fatherhood (children & parenting)',
              id: '6002714396372' // Fatherhood interest ID
            }
          ]
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
            added_interest: 'Fatherhood (children & parenting)',
            total_interests: newTargeting.interests.length
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

    console.log(`✅ Added Fatherhood targeting to ${successCount} Vaders ad sets successfully`);
    console.log(`❌ ${errorCount} ad sets failed to update`);

    return NextResponse.json({
      success: true,
      data: {
        total_vaders_ad_sets: vadersAdSets.length,
        updated: successCount,
        errors: errorCount,
        results: results
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
