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
    console.log('👨‍🎓 Improving Jongeren targeting with youth and lifestyle interests...');

    // Define the interests to add for Jongeren
    const jongerenInterests = [
      { name: 'Jongeren', searchTerm: 'Jongeren' },
      { name: 'Studenten', searchTerm: 'Studenten' },
      { name: 'Lifestyle', searchTerm: 'Lifestyle' },
      { name: 'Social media influencers', searchTerm: 'Social media influencers' },
      { name: 'Gaming', searchTerm: 'Gaming' },
      { name: 'Muziek', searchTerm: 'Muziek' }
    ];

    const foundInterests: Array<{
      id: string;
      found_name: string;
      original_name: string;
      audience_size?: string;
    }> = [];

    // Search for each interest
    for (const interest of jongerenInterests) {
      console.log(`🔍 Searching for: ${interest.searchTerm}`);
      
      const searchResponse = await fetch(
        `https://graph.facebook.com/v19.0/search?type=adinterest&q=${encodeURIComponent(interest.searchTerm)}&access_token=${FACEBOOK_ACCESS_TOKEN}&limit=5`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const bestMatch = searchData.data?.[0];
        
        if (bestMatch) {
          foundInterests.push({
            original_name: interest.name,
            found_name: bestMatch.name,
            id: bestMatch.id,
            audience_size: bestMatch.audience_size_lower_bound ? 
              `${bestMatch.audience_size_lower_bound.toLocaleString()} - ${bestMatch.audience_size_upper_bound.toLocaleString()}` : 
              'Unknown'
          });
          console.log(`✅ Found: ${bestMatch.name} (ID: ${bestMatch.id})`);
        } else {
          console.log(`❌ No match found for: ${interest.searchTerm}`);
        }
      }

      // Small delay between searches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`📋 Found ${foundInterests.length} interests for Jongeren`);

    // Get all Jongeren ad sets
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

    // Filter to only show Jongeren ad sets
    const jongerenAdSets = data.data.filter((adset: any) => 
      adset.name && adset.name.includes('TTM') && adset.name.includes('Jongeren')
    );

    console.log(`📋 Found ${jongerenAdSets.length} Jongeren ad sets to update`);

    let successCount = 0;
    let errorCount = 0;
    const results: Array<{
      adset_id: string;
      adset_name: string;
      status: string;
      added_interest?: string;
      added_interests?: string[];
      total_interests?: number;
      error?: string;
    }> = [];

    // Update each Jongeren ad set
    for (const adset of jongerenAdSets) {
      try {
        const targeting = adset.targeting;
        if (!targeting) {
          console.log(`⚠️ No targeting found for ad set ${adset.name}`);
          continue;
        }

        // Check which interests are already present
        const existingInterests = targeting.interests || [];
        const interestsToAdd = foundInterests.filter(interest => 
          !existingInterests.some(existing => 
            existing.name === interest.found_name || 
            existing.id === interest.id
          )
        );

        if (interestsToAdd.length === 0) {
          console.log(`✅ Ad set ${adset.name} already has all Jongeren interests`);
          continue;
        }

        console.log(`🔧 Adding ${interestsToAdd.length} interests to ad set: ${adset.name}`);

        // Create new targeting with new interests added
        const newTargeting = {
          ...targeting,
          interests: [
            ...existingInterests,
            ...interestsToAdd.map(interest => ({
              name: interest.found_name,
              id: interest.id
            }))
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
            added_interests: interestsToAdd.map(i => i.found_name),
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

    console.log(`✅ Improved ${successCount} Jongeren ad sets successfully`);
    console.log(`❌ ${errorCount} ad sets failed to update`);

    return NextResponse.json({
      success: true,
      data: {
        total_jongeren_ad_sets: jongerenAdSets.length,
        updated: successCount,
        errors: errorCount,
        found_interests: foundInterests,
        results: results
      }
    });

  } catch (error) {
    console.error('❌ Error improving Jongeren targeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to improve Jongeren targeting' },
      { status: 500 }
    );
  }
}
