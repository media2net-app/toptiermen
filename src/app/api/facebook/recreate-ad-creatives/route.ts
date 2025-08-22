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
    console.log('🔧 Recreating Facebook ad creatives with correct website destination...');

    // First, get all TTM ads with their current creatives
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,creative{id,title,body,image_url,video_id,object_story_spec}&limit=1000&_t=${Date.now()}`,
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
      return NextResponse.json({ success: true, data: { recreated: 0, errors: 0 } });
    }

    // Filter to only show TTM ads
    const ttmAds = data.data.filter((ad: any) => 
      ad.name && ad.name.includes('TTM')
    );

    console.log(`📋 Found ${ttmAds.length} TTM ads to recreate creatives for`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Recreate creatives for each ad
    for (const ad of ttmAds) {
      try {
        const creative = ad.creative;
        if (!creative) {
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

        console.log(`🔧 Recreating creative for ad: ${ad.name}`);

        // Create new creative with website destination
        const newCreativeData = {
          name: ad.name,
          title: creative.title || ad.name,
          body: creative.body || 'Ontdek Top Tier Men',
          link_url: 'https://platform.toptiermen.eu/prelaunch',
          object_story_spec: {
            page_id: creative.object_story_spec?.page_id || '610571295471584',
            link_data: {
              link: 'https://platform.toptiermen.eu/prelaunch',
              message: creative.body || 'Ontdek Top Tier Men',
              name: creative.title || ad.name,
              description: creative.body || 'Ontdek Top Tier Men'
            }
          }
        };

        // If there's a video, include it
        if (creative.video_id) {
          newCreativeData.object_story_spec.video_data = {
            video_id: creative.video_id
          };
        }

        // If there's an image, include it
        if (creative.image_url) {
          newCreativeData.image_url = creative.image_url;
        }

        // Create new creative
        const createResponse = await fetch(
          `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adcreatives?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCreativeData)
          }
        );

        if (createResponse.ok) {
          const createData = await createResponse.json();
          console.log(`✅ Successfully created new creative: ${createData.id}`);

          // Update the ad to use the new creative
          const updateAdResponse = await fetch(
            `https://graph.facebook.com/v19.0/${ad.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                creative: `{"creative_id":"${createData.id}"}`
              })
            }
          );

          if (updateAdResponse.ok) {
            console.log(`✅ Successfully updated ad ${ad.id} with new creative`);
            successCount++;
            results.push({
              ad_id: ad.id,
              ad_name: ad.name,
              old_creative_id: creative.id,
              new_creative_id: createData.id,
              status: 'success',
              new_link_url: 'https://platform.toptiermen.eu/prelaunch'
            });
          } else {
            const errorText = await updateAdResponse.text();
            console.error(`❌ Failed to update ad ${ad.id}:`, errorText);
            errorCount++;
            results.push({
              ad_id: ad.id,
              ad_name: ad.name,
              old_creative_id: creative.id,
              new_creative_id: createData.id,
              status: 'error',
              error: errorText
            });
          }
        } else {
          const errorText = await createResponse.text();
          console.error(`❌ Failed to create new creative for ad ${ad.name}:`, errorText);
          errorCount++;
          results.push({
            ad_id: ad.id,
            ad_name: ad.name,
            old_creative_id: creative.id,
            status: 'error',
            error: errorText
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error recreating creative for ad ${ad.name}:`, error);
        errorCount++;
        results.push({
          ad_id: ad.id,
          ad_name: ad.name,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`✅ Recreated ${successCount} creatives successfully`);
    console.log(`❌ ${errorCount} creatives failed to recreate`);

    return NextResponse.json({
      success: true,
      data: {
        total_ads: ttmAds.length,
        recreated: successCount,
        errors: errorCount,
        results: results
      }
    });

  } catch (error) {
    console.error('❌ Error recreating ad creatives:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to recreate ad creatives' },
      { status: 500 }
    );
  }
}
