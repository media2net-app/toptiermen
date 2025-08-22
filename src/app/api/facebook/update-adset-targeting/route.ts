import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

// Correct targeting data based on our platform configuration
// ALLE advertentiesets zijn voor MANNEN - dit is een mannen-only platform!
const CORRECT_TARGETING_DATA = {
  'TTM - Algemeen - Awareness': {
    age_min: 18,
    age_max: 65,
    genders: ['men'], // Alleen mannen!
    locations: ['NL'], // Alleen Nederland!
    interests: ['6003384248805', '6003277229371', '6003392552125', '6003748928462']
  },
  'TTM - Algemeen - Custom Audience': {
    age_min: 25,
    age_max: 55,
    genders: ['men'], // Alleen mannen!
    locations: ['NL'], // Alleen Nederland!
    interests: ['6003384248805', '6003283387551', '6009986890906', '6003648059946', '6003092532417']
  },
  'TTM - Algemeen - Interest Based': {
    age_min: 30,
    age_max: 50,
    genders: ['men'], // Alleen mannen!
    locations: ['NL'], // Alleen Nederland!
    interests: ['6003392552125', '6003748928462', '6003400407018', '6002991059568']
  },
  'TTM - Algemeen - Lookalike': {
    age_min: 22,
    age_max: 40,
    genders: ['men'], // Alleen mannen!
    locations: ['NL'], // Alleen Nederland!
    interests: ['6003651640946', '6002929355372', '6004100985609']
  },
  'TTM - Algemeen - Retargeting': {
    age_min: 25,
    age_max: 55,
    genders: ['men'], // Alleen mannen!
    locations: ['NL'], // Alleen Nederland!
    interests: ['6003384248805', '6003277229371', '6009986890906', '6002929355372', '6004100985609']
  },
  'TTM - Jongeren - Fitness & Lifestyle': {
    age_min: 18,
    age_max: 25,
    genders: ['men'], // Alleen mannen!
    locations: ['NL'], // Alleen Nederland!
    interests: ['6003384248805', '6003277229371', '6009986890906', '6002929355372', '6004100985609']
  },
  'TTM - Jongeren - Social & Community': {
    age_min: 18,
    age_max: 25,
    genders: ['men'], // Alleen mannen!
    locations: ['NL'],
    interests: ['6003651640946', '6002929355372', '6004100985609', '6003392552125']
  },
  'TTM - Vaders - Family & Leadership': {
    age_min: 30,
    age_max: 50,
    genders: ['men'], // Alleen mannen!
    locations: ['NL'], // Alleen Nederland!
    interests: ['6002929355372', '6004100985609', '6003384248805', '6003277229371']
  },
  'TTM - Vaders - Role Model & Success': {
    age_min: 35,
    age_max: 55,
    genders: ['men'], // Alleen mannen!
    locations: ['NL'],
    interests: ['6003651640946', '6002929355372', '6004100985609', '6003392552125']
  },
          'TTM - Zakelijk - Business Professionals': {
          age_min: 28,
          age_max: 45,
          genders: ['men'], // Alleen mannen!
          locations: ['NL'], // Alleen Nederland!
          interests: ['6003352779232', '6003396973683', '6003120739217', '6004000198906']
        },
  'TTM - Zakelijk - Entrepreneurs & Leaders': {
    age_min: 30,
    age_max: 50,
    genders: ['men'], // Alleen mannen!
    locations: ['NL'],
    interests: ['6003352779232', '6003396973683', '6003120739217', '6004000198906']
  }
};

export async function POST(request: NextRequest) {
  if (!FACEBOOK_ACCESS_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'Missing Facebook access token' },
      { status: 500 }
    );
  }

  try {
    const { adsetId, adsetName } = await request.json();

    if (!adsetId || !adsetName) {
      return NextResponse.json(
        { success: false, error: 'Ad Set ID and name are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating targeting for ad set: ${adsetName}`);

    // Get correct targeting data for this ad set
    const targetingData = CORRECT_TARGETING_DATA[adsetName as keyof typeof CORRECT_TARGETING_DATA];
    
    if (!targetingData) {
      return NextResponse.json(
        { success: false, error: `No targeting data found for ad set: ${adsetName}` },
        { status: 400 }
      );
    }

    console.log(`📊 Correct targeting data for ${adsetName}:`, targetingData);

    // Prepare targeting parameters for Facebook API
    const targetingParams: any = {
      age_min: targetingData.age_min,
      age_max: targetingData.age_max,
      geo_locations: {
        countries: targetingData.locations
      }
    };

    // Set gender targeting
    if (targetingData.genders.includes('men')) {
      targetingParams.genders = [1]; // 1 = men, 2 = women
    } else if (targetingData.genders.includes('women')) {
      targetingParams.genders = [2];
    } else {
      targetingParams.genders = [1, 2]; // all genders
    }

    // Add interests if available
    if (targetingData.interests && targetingData.interests.length > 0) {
      targetingParams.interests = targetingData.interests.map((interestId: string) => ({
        id: interestId
      }));
    }

    console.log(`🎯 Facebook targeting params:`, targetingParams);

    // Update the ad set targeting
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${adsetId}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targeting: targetingParams
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook API error response:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    console.log(`✅ Successfully updated targeting for ad set ${adsetName}`);

    return NextResponse.json({
      success: true,
      message: `Targeting updated for ${adsetName}`,
      data: {
        adsetId,
        adsetName,
        targeting: targetingData,
        result
      }
    });

  } catch (error) {
    console.error('❌ Error updating ad set targeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ad set targeting' },
      { status: 500 }
    );
  }
}
