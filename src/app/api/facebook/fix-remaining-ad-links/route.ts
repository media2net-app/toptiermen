import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

export async function POST() {
  if (!FACEBOOK_ACCESS_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'Missing Facebook credentials' },
      { status: 500 }
    );
  }

  try {
    console.log('🔧 Fixing remaining problematic ad links...');

    // These are the 2 ads that failed in the previous attempt
    const problematicAds = [
      {
        ad_id: "120232182211690324",
        ad_name: "Nog Even Over Top Tier Men - TTM - Algemeen - Retargeting",
        creative_id: "1380007889763979"
      },
      {
        ad_id: "120232182184630324", 
        ad_name: "Business Professionals: Upgrade Jezelf - TTM - Zakelijk - Business Professionals",
        creative_id: "674312598263880"
      }
    ];

    const results = [];

    for (const ad of problematicAds) {
      try {
        console.log(`🔧 Fixing problematic ad: ${ad.ad_name}`);

        // For the first ad, we need to use a different name to avoid duplicate
        const creativeName = ad.ad_name === "Nog Even Over Top Tier Men - TTM - Algemeen - Retargeting" 
          ? "Nog Even Over Top Tier Men - TTM - Algemeen - Retargeting - Updated"
          : ad.ad_name;

        // Update the creative with the correct link URL
        const updateResponse = await fetch(
          `https://graph.facebook.com/v19.0/${ad.creative_id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              link_url: 'https://platform.toptiermen.eu/prelaunch',
              name: creativeName
            })
          }
        );

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log(`✅ Successfully updated creative ${ad.creative_id}`);
          results.push({
            ad_id: ad.ad_id,
            ad_name: ad.ad_name,
            creative_id: ad.creative_id,
            status: 'success',
            new_link_url: 'https://platform.toptiermen.eu/prelaunch'
          });
        } else {
          const errorText = await updateResponse.text();
          console.error(`❌ Failed to update creative ${ad.creative_id}:`, errorText);
          results.push({
            ad_id: ad.ad_id,
            ad_name: ad.ad_name,
            creative_id: ad.creative_id,
            status: 'error',
            error: errorText
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error fixing ad ${ad.ad_name}:`, error);
        results.push({
          ad_id: ad.ad_id,
          ad_name: ad.ad_name,
          creative_id: ad.creative_id,
          status: 'error',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`✅ Fixed ${successCount} remaining ads successfully`);
    console.log(`❌ ${errorCount} remaining ads failed to fix`);

    return NextResponse.json({
      success: true,
      data: {
        total_ads: problematicAds.length,
        fixed: successCount,
        errors: errorCount,
        results: results
      }
    });

  } catch (error) {
    console.error('❌ Error fixing remaining ad links:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix remaining ad links' },
      { status: 500 }
    );
  }
}
