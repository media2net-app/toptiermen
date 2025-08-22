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
    console.log('🔧 Fixing Facebook ad link URLs...');

    // First, get all TTM ads
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,creative{id,link_url,object_story_spec}&limit=1000&_t=${Date.now()}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
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
      return NextResponse.json({ success: true, data: { fixed: 0, errors: 0 } });
    }

    // Filter to only show TTM ads
    const ttmAds = data.data.filter((ad: any) => 
      ad.name && ad.name.includes('TTM')
    );

    console.log(`📋 Found ${ttmAds.length} TTM ads to fix`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Fix each ad's creative
    for (const ad of ttmAds) {
      try {
        const creative = ad.creative;
        if (!creative || !creative.id) {
          console.log(`⚠️ No creative found for ad ${ad.name}`);
          errorCount++;
          results.push({
            ad_id: ad.id,
            ad_name: ad.name,
            status: 'error',
            error: 'No creative found'
          });
          continue;
        }

        console.log(`🔧 Fixing ad: ${ad.name} (Creative ID: ${creative.id})`);

        // Update the creative with the correct link URL
        const updateResponse = await fetch(
          `https://graph.facebook.com/v19.0/${creative.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              link_url: 'https://platform.toptiermen.eu/prelaunch',
              name: ad.name
            })
          }
        );

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log(`✅ Successfully updated creative ${creative.id}`);
          successCount++;
          results.push({
            ad_id: ad.id,
            ad_name: ad.name,
            creative_id: creative.id,
            status: 'success',
            new_link_url: 'https://platform.toptiermen.eu/prelaunch'
          });
        } else {
          const errorText = await updateResponse.text();
          console.error(`❌ Failed to update creative ${creative.id}:`, errorText);
          errorCount++;
          results.push({
            ad_id: ad.id,
            ad_name: ad.name,
            creative_id: creative.id,
            status: 'error',
            error: errorText
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error fixing ad ${ad.name}:`, error);
        errorCount++;
        results.push({
          ad_id: ad.id,
          ad_name: ad.name,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`✅ Fixed ${successCount} ads successfully`);
    console.log(`❌ ${errorCount} ads failed to fix`);

    return NextResponse.json({
      success: true,
      data: {
        total_ads: ttmAds.length,
        fixed: successCount,
        errors: errorCount,
        results: results
      }
    });

  } catch (error) {
    console.error('❌ Error fixing ad links:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix ad links' },
      { status: 500 }
    );
  }
}
