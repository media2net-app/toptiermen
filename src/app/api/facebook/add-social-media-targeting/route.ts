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
    console.log('📱 Adding Social media targeting to all target groups...');

    // First, search for the correct Social media interest ID
    console.log('🔍 Searching for Social media interest ID...');
    const searchResponse = await fetch(
      `https://graph.facebook.com/v19.0/search?type=adinterest&q=Sociale media&access_token=${FACEBOOK_ACCESS_TOKEN}&limit=10`,
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
    console.log('🔍 Search results for Social media:', searchData);

    // Find the correct Social media interest
    const socialMediaInterest = searchData.data?.find((interest: any) => 
      interest.name.toLowerCase().includes('sociale media') || 
      interest.name.toLowerCase().includes('online media') ||
      interest.name.toLowerCase().includes('social media')
    );

    if (!socialMediaInterest) {
      console.log('❌ Could not find Social media interest, using known ID...');
      // Use a known Social media interest ID
      const socialMediaId = '6002714396372'; // Common Social media ID
      console.log(`Using Social media ID: ${socialMediaId}`);
    } else {
      console.log(`✅ Found Social media interest: ${socialMediaInterest.name} (ID: ${socialMediaInterest.id})`);
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
      error?: string;
    }> = [];

    // Check and update each ad set
    for (const adset of ttmAdSets) {
      try {
        const targeting = adset.targeting;
        if (!targeting) {
          console.log(`⚠️ No targeting found for ad set ${adset.name}`);
          continue;
        }

        // Check if Social media is already in the interests
        const hasSocialMedia = targeting.interests && targeting.interests.some((interest: any) => 
          interest.name.toLowerCase().includes('sociale media') || 
          interest.name.toLowerCase().includes('online media') ||
          interest.name.toLowerCase().includes('social media')
        );

        if (hasSocialMedia) {
          console.log(`✅ Ad set ${adset.name} already has Social media targeting`);
          continue;
        }

        console.log(`🔧 Adding Social media targeting to ad set: ${adset.name}`);

        // Use the found interest or fallback to known ID
        const socialMediaInterestToAdd = socialMediaInterest || {
          name: 'Sociale media (online media)',
          id: '6002714396372'
        };

        // Create new targeting with Social media added
        const newTargeting = {
          ...targeting,
          interests: [
            ...(targeting.interests || []),
            {
              name: socialMediaInterestToAdd.name,
              id: socialMediaInterestToAdd.id
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
            added_interest: socialMediaInterestToAdd.name,
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

    console.log(`✅ Added Social media targeting to ${successCount} ad sets successfully`);
    console.log(`❌ ${errorCount} ad sets failed to update`);

    return NextResponse.json({
      success: true,
      data: {
        total_ad_sets: ttmAdSets.length,
        updated: successCount,
        errors: errorCount,
        results: results,
        social_media_interest: socialMediaInterest || { name: 'Sociale media (online media)', id: '6002714396372' }
      }
    });

  } catch (error) {
    console.error('❌ Error adding Social media targeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add Social media targeting' },
      { status: 500 }
    );
  }
}
