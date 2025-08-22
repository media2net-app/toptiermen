import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
    return NextResponse.json(
      { success: false, error: 'Missing Facebook credentials' },
      { status: 500 }
    );
  }

  try {
    console.log('📊 Checking current targeting for all ad sets...');

    // Get all ad sets with targeting information - force fresh data with timestamp
    const timestamp = Date.now();
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,targeting{age_min,age_max,genders,geo_locations,interests}&limit=100&_t=${timestamp}`,
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
      console.error('Facebook API error:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const adSets = data.data || [];

    console.log(`📋 Found ${adSets.length} ad sets`);

    // Filter for TTM ad sets and analyze their targeting
    const ttmAdSets = adSets.filter((adSet: any) => 
      adSet.name && adSet.name.includes('TTM')
    );

    console.log(`✅ Found ${ttmAdSets.length} TTM ad sets`);

    const targetingAnalysis = ttmAdSets.map((adSet: any) => {
      const targeting = adSet.targeting || {};
      
      // Check if targeting is correct (should be men only)
      const currentGenders = targeting.genders || [];
      const isCorrectGender = currentGenders.length === 1 && currentGenders[0] === 1; // 1 = men
      
      // Check age ranges
      const ageMin = targeting.age_min;
      const ageMax = targeting.age_max;
      
      // Check locations
      const locations = targeting.geo_locations?.countries || [];
      
      // Check interests
      const interests = targeting.interests || [];

      // Debug logging
      console.log(`🔍 Debug - ${adSet.name}:`, {
        rawTargeting: targeting,
        genders: currentGenders,
        isCorrect: isCorrectGender
      });

      return {
        id: adSet.id,
        name: adSet.name,
        currentTargeting: {
          age_min: ageMin,
          age_max: ageMax,
          genders: currentGenders,
          locations: locations,
          interests: interests.map((interest: any) => interest.id)
        },
        analysis: {
          genderCorrect: isCorrectGender,
          genderStatus: isCorrectGender ? '✅ Correct (Men only)' : `❌ Incorrect (${currentGenders.length === 0 ? 'No gender set' : currentGenders.length === 2 ? 'All genders' : 'Unknown'})`,
          hasAgeRange: ageMin && ageMax,
          hasLocations: locations.length > 0,
          hasInterests: interests.length > 0
        },
        debug: {
          rawTargeting: targeting,
          genderArray: currentGenders
        }
      };
    });

    // Summary
    const correctGenderCount = targetingAnalysis.filter(item => item.analysis.genderCorrect).length;
    const incorrectGenderCount = targetingAnalysis.length - correctGenderCount;

    const summary = {
      totalAdSets: ttmAdSets.length,
      correctGender: correctGenderCount,
      incorrectGender: incorrectGenderCount,
      needsUpdate: incorrectGenderCount > 0
    };

    console.log(`📊 Targeting Analysis Summary:`);
    console.log(`- Total TTM Ad Sets: ${summary.totalAdSets}`);
    console.log(`- Correct Gender (Men only): ${summary.correctGender}`);
    console.log(`- Incorrect Gender: ${summary.incorrectGender}`);
    console.log(`- Needs Update: ${summary.needsUpdate ? 'YES' : 'NO'}`);

    return NextResponse.json({
      success: true,
      summary,
      adSets: targetingAnalysis
    });

  } catch (error) {
    console.error('❌ Error checking ad set targeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check ad set targeting' },
      { status: 500 }
    );
  }
}
