import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  if (!FACEBOOK_ACCESS_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'Missing Facebook access token' },
      { status: 500 }
    );
  }

  try {
    console.log('🔗 Restoring Instagram account links to all ads...');

    // Use the Instagram business account ID for Top Tier Men
    // This should be the Instagram account ID that was previously linked
    const instagramAccountId = '17841405793087218'; // Top Tier Men Instagram account ID
    console.log(`📸 Using Instagram account ID: ${instagramAccountId}`);

    // Get all ads
    const adsResponse = await fetch(
      `https://graph.facebook.com/v19.0/act_1465834431278978/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,creative{id,object_story_spec}&limit=100`
    );

    if (!adsResponse.ok) {
      throw new Error(`Failed to get ads: ${adsResponse.status}`);
    }

    const adsData = await adsResponse.json();
    const ttmAds = adsData.data.filter((ad: any) => 
      ad.name && ad.name.includes('TTM')
    );

    console.log(`📋 Found ${ttmAds.length} TTM ads to update`);

    let successCount = 0;
    let errorCount = 0;

    for (const ad of ttmAds) {
      try {
        if (!ad.creative || !ad.creative.id) {
          console.log(`⚠️ Ad ${ad.name} has no creative, skipping`);
          continue;
        }

        // Get current creative data
        const creativeResponse = await fetch(
          `https://graph.facebook.com/v19.0/${ad.creative.id}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=object_story_spec`
        );

        if (!creativeResponse.ok) {
          console.log(`⚠️ Failed to get creative for ad ${ad.name}`);
          errorCount++;
          continue;
        }

        const creativeData = await creativeResponse.json();
        const currentObjectStorySpec = creativeData.object_story_spec || {};

        // Update object_story_spec to include Instagram account
        const updatedObjectStorySpec = {
          ...currentObjectStorySpec,
          instagram_actor_id: instagramAccountId
        };

        // Update the creative
        const updateResponse = await fetch(
          `https://graph.facebook.com/v19.0/${ad.creative.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              object_story_spec: updatedObjectStorySpec
            })
          }
        );

        if (updateResponse.ok) {
          console.log(`✅ Restored Instagram link for ad: ${ad.name}`);
          successCount++;
        } else {
          console.log(`❌ Failed to restore Instagram link for ad: ${ad.name}`);
          errorCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error updating ad ${ad.name}:`, error);
        errorCount++;
      }
    }

    console.log(`📊 Instagram link restoration completed:`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: `Instagram account links restored to ${successCount} ads`,
      data: {
        instagramAccountId,
        totalAds: ttmAds.length,
        successCount,
        errorCount
      }
    });

  } catch (error) {
    console.error('❌ Error restoring Instagram links:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore Instagram links' },
      { status: 500 }
    );
  }
}
