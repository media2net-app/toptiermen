import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

export async function GET() {
  if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
    return NextResponse.json(
      { success: false, error: 'Missing Facebook credentials' },
      { status: 500 }
    );
  }

  try {
    console.log('🔍 Analyzing all targeting for all target groups...');

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
      return NextResponse.json({ success: true, data: [] });
    }

    // Filter to only show TTM ad sets
    const ttmAdSets = data.data.filter((adset: any) => 
      adset.name && adset.name.includes('TTM')
    );

    console.log(`📋 Found ${ttmAdSets.length} TTM ad sets`);

    // Categorize ad sets by target group
    const targetGroups = {
      vaders: ttmAdSets.filter((adset: any) => adset.name.includes('Vaders')),
      jongeren: ttmAdSets.filter((adset: any) => adset.name.includes('Jongeren')),
      zakelijk: ttmAdSets.filter((adset: any) => adset.name.includes('Zakelijk')),
      algemeen: ttmAdSets.filter((adset: any) => adset.name.includes('Algemeen'))
    };

    // Analyze each target group
    const analysis = {};

    for (const [groupName, adSets] of Object.entries(targetGroups)) {
      console.log(`📊 Analyzing ${groupName} target group...`);
      
      const groupAnalysis = {
        total_ad_sets: adSets.length,
        ad_sets: [] as Array<{
          id: string;
          name: string;
          interests: string[];
          demographics: any;
          geo_locations: any;
          total_interests: number;
        }>,
        common_interests: {} as Record<string, number>,
        missing_interests: [] as string[],
        recommendations: [] as string[]
      };

      // Analyze each ad set in the group
      for (const adset of adSets) {
        const targeting = adset.targeting;
        const interests = targeting && targeting.interests ? targeting.interests : [];
        const demographics = targeting && targeting.demographics ? targeting.demographics : {};
        const geo_locations = targeting && targeting.geo_locations ? targeting.geo_locations : {};

        const adSetAnalysis = {
          id: adset.id,
          name: adset.name,
          interests: interests.map((i: any) => i.name),
          demographics: demographics,
          geo_locations: geo_locations,
          total_interests: interests.length
        };

        groupAnalysis.ad_sets.push(adSetAnalysis);

        // Count common interests
        interests.forEach((interest: any) => {
          groupAnalysis.common_interests[interest.name] = (groupAnalysis.common_interests[interest.name] || 0) + 1;
        });
      }

      // Generate recommendations based on target group
      if (groupName === 'vaders') {
        groupAnalysis.recommendations = [
          '✅ Vaderschap (kinderen en ouderschap) - ALREADY ADDED',
          '➕ Sociale media (online media) - MISSING (was VK)',
          '➕ Vader zijn - MISSING',
          '➕ Familie - MISSING',
          '➕ Ouderschap - MISSING',
          '➕ Kinderen - MISSING',
          '➕ Werkende vaders - MISSING',
          '➕ Balans werk-privé - MISSING'
        ];
      } else if (groupName === 'jongeren') {
        groupAnalysis.recommendations = [
          '➕ Sociale media (online media) - MISSING (was VK)',
          '➕ Jongeren - MISSING',
          '➕ Studenten - MISSING',
          '➕ Fitness - MISSING',
          '➕ Lifestyle - MISSING',
          '➕ Social media influencers - MISSING',
          '➕ Gaming - MISSING',
          '➕ Muziek - MISSING'
        ];
      } else if (groupName === 'zakelijk') {
        groupAnalysis.recommendations = [
          '➕ Ondernemers - MISSING',
          '➕ Business professionals - MISSING',
          '➕ Carrière - MISSING',
          '➕ Netwerken - MISSING',
          '➕ Leadership - MISSING',
          '➕ Management - MISSING',
          '➕ Business networking - MISSING',
          '➕ Professional development - MISSING'
        ];
      } else if (groupName === 'algemeen') {
        groupAnalysis.recommendations = [
          '➕ Sociale media (online media) - MISSING (was VK)',
          '➕ Mannen - MISSING',
          '➕ Lifestyle - MISSING',
          '➕ Persoonlijke ontwikkeling - MISSING',
          '➕ Motivatie - MISSING',
          '➕ Succes - MISSING',
          '➕ Ambitie - MISSING',
          '➕ Doelen stellen - MISSING'
        ];
      }

      analysis[groupName] = groupAnalysis;
    }

    return NextResponse.json({
      success: true,
      data: {
        total_ttm_ad_sets: ttmAdSets.length,
        target_groups: analysis
      }
    });

  } catch (error) {
    console.error('❌ Error analyzing targeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze targeting' },
      { status: 500 }
    );
  }
}
