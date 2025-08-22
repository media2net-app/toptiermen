import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

// Better, more compelling ad titles based on ad set names
// ALLE advertenties zijn voor MANNEN - dit is een mannen-only platform!
const BETTER_AD_TITLES = {
  'TTM - Zakelijk - Entrepreneurs & Leaders': {
    title: 'Voor Ondernemers Die Meer Willen',
    description: 'Ontdek hoe Top Tier Men je helpt om je business en jezelf naar het volgende niveau te tillen.'
  },
  'TTM - Zakelijk - Business Professionals': {
    title: 'Business Professionals: Upgrade Jezelf',
    description: 'Word de versie van jezelf die je business verdient. Top Tier Men - waar succes begint.'
  },
  'TTM - Vaders - Role Model & Success': {
    title: 'Word de Vader Die Je Kinderen Verdienen',
    description: 'Leer hoe je een betere rolmodel wordt voor je gezin. Top Tier Men helpt je groeien.'
  },
  'TTM - Vaders - Family & Leadership': {
    title: 'Voor Vaders Die Meer Willen',
    description: 'Ontdek hoe je een betere leider wordt voor je gezin. Top Tier Men - waar vaders groeien.'
  },
  'TTM - Jongeren - Social & Community': {
    title: 'Word Onderdeel van Onze Community',
    description: 'Zoek je een community van gelijkgestemden? Top Tier Men brengt jongeren samen die streven naar excellentie.'
  },
  'TTM - Jongeren - Fitness & Lifestyle': {
    title: 'Fitness & Lifestyle voor Jongeren',
    description: 'Ontdek een nieuwe manier van trainen en leven. Top Tier Men - waar fitness, mindset en community samenkomen.'
  },
  'TTM - Algemeen - Custom Audience': {
    title: 'Word Lid van Top Tier Men',
    description: 'Sluit je aan bij een community van mannen die streven naar excellentie. Meld je aan voor de wachtrij.'
  },
  'TTM - Algemeen - Retargeting': {
    title: 'Nog Even Over Top Tier Men',
    description: 'Je hebt interesse getoond in Top Tier Men. Mis deze kans niet om je aan te melden voor exclusieve toegang.'
  },
  'TTM - Algemeen - Lookalike': {
    title: 'Zoals Jij, Zoals Wij',
    description: 'Andere mannen zoals jij hebben zich al aangemeld. Word onderdeel van de Top Tier Men community.'
  },
  'TTM - Algemeen - Interest Based': {
    title: 'Voor Mannen Die Meer Willen',
    description: 'Als je geïnteresseerd bent in persoonlijke groei, dan is Top Tier Men iets voor jou. Meld je aan.'
  },
  'TTM - Algemeen - Awareness': {
    title: 'Ontdek Top Tier Men',
    description: 'Een revolutionaire community voor mannen die streven naar excellentie. Meld je aan voor de wachtrij.'
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
    const { adId, adName } = await request.json();

    if (!adId || !adName) {
      return NextResponse.json(
        { success: false, error: 'Ad ID and name are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating ad title for: ${adName}`);

    // Get the base ad set name from the ad name
    const baseAdSetName = getBaseAdSetName(adName);
    
    if (!baseAdSetName) {
      return NextResponse.json(
        { success: false, error: `Could not determine ad set name from ad name: ${adName}` },
        { status: 400 }
      );
    }

    // Get better title for this ad set
    const betterTitle = BETTER_AD_TITLES[baseAdSetName as keyof typeof BETTER_AD_TITLES];
    
    if (!betterTitle) {
      return NextResponse.json(
        { success: false, error: `No better title found for ad set: ${baseAdSetName}` },
        { status: 400 }
      );
    }

    console.log(`📝 Better title for ${baseAdSetName}:`, betterTitle);

    // First, get the current ad creative to preserve other fields including Instagram account
    const getCreativeResponse = await fetch(
      `https://graph.facebook.com/v19.0/${adId}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=creative{id,title,body,image_url,video_id,link_url,object_story_spec}`
    );

    if (!getCreativeResponse.ok) {
      const errorText = await getCreativeResponse.text();
      console.error('Facebook API error getting creative:', errorText);
      throw new Error(`Facebook API error: ${getCreativeResponse.status} ${getCreativeResponse.statusText}`);
    }

    const adData = await getCreativeResponse.json();
    const creative = adData.creative;

    if (!creative || !creative.id) {
      return NextResponse.json(
        { success: false, error: 'Could not get ad creative information' },
        { status: 400 }
      );
    }

    console.log(`🎨 Current creative ID: ${creative.id}`);

    // Always update the creative to change the primary text (title) that shows in Facebook Ads Manager
    // BUT preserve the object_story_spec to keep Instagram account link
    console.log(`🎨 Updating creative to change primary text while preserving Instagram account...`);
    
    const updateData: any = {
      name: `${betterTitle.title} - ${baseAdSetName}`,
      title: betterTitle.title,
      body: betterTitle.description
    };
    
    // Preserve object_story_spec if it exists (contains Instagram account link)
    if (creative.object_story_spec) {
      updateData.object_story_spec = creative.object_story_spec;
      console.log(`🔗 Preserving Instagram account link in object_story_spec`);
    }
    
    const updateCreativeResponse = await fetch(
      `https://graph.facebook.com/v19.0/${creative.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      }
    );

    if (!updateCreativeResponse.ok) {
      const errorText = await updateCreativeResponse.text();
      console.error('Facebook API error updating creative:', errorText);
      throw new Error(`Facebook API error: ${updateCreativeResponse.status} ${updateCreativeResponse.statusText}`);
    }

    const creativeResult = await updateCreativeResponse.json();
    console.log(`✅ Creative updated successfully:`, creativeResult);

    // Also update the ad name for consistency
    try {
      const updateAdResponse = await fetch(
        `https://graph.facebook.com/v19.0/${adId}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${betterTitle.title} - ${baseAdSetName}`,
            status: 'ACTIVE' // Keep the ad active
          })
        }
      );

      if (updateAdResponse.ok) {
        console.log(`✅ Ad name updated successfully`);
      } else {
        console.log(`⚠️ Ad name update failed, but creative was updated`);
      }
    } catch (error) {
      console.log(`⚠️ Ad name update failed, but creative was updated:`, error);
    }

    const result = creativeResult;

    // Result is already set above

    console.log(`✅ Successfully updated ad title for ${adName}`);

    return NextResponse.json({
      success: true,
      message: `Ad title updated for ${adName}`,
      data: {
        adId,
        adName,
        baseAdSetName,
        newTitle: betterTitle.title,
        newDescription: betterTitle.description,
        result
      }
    });

  } catch (error) {
    console.error('❌ Error updating ad title:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ad title' },
      { status: 500 }
    );
  }
}

function getBaseAdSetName(adName: string): string | null {
  // Remove "Ad - " prefix if present
  let baseName = adName.replace(/^Ad - /, '');
  
  // Direct mapping for problematic ad names
  const directMapping: { [key: string]: string } = {
    'Zoals Jij, Zoals Wij - TTM - Algemeen - Lookalike': 'TTM - Algemeen - Lookalike',
    'Nog Even Over Top Tier Men - TTM - Algemeen - Retargeting': 'TTM - Algemeen - Retargeting',
    'Voor Mannen Die Meer Willen - TTM - Algemeen - Interest Based': 'TTM - Algemeen - Interest Based',
    'Voor Ondernemers Die Meer Willen - TTM - Zakelijk - Entrepreneurs & Leaders': 'TTM - Zakelijk - Entrepreneurs & Leaders',
    'Business Professionals: Upgrade Jezelf - TTM - Zakelijk - Business Professionals': 'TTM - Zakelijk - Business Professionals',
    'Word Onderdeel van Onze Community - TTM - Jongeren - Social & Community': 'TTM - Jongeren - Social & Community',
    'Fitness & Lifestyle voor Jongeren - TTM - Jongeren - Fitness & Lifestyle': 'TTM - Jongeren - Fitness & Lifestyle',
    'Word Lid van Top Tier Men - TTM - Algemeen - Custom Audience': 'TTM - Algemeen - Custom Audience',
    'Voor Vaders Die Meer Willen - TTM - Vaders - Family & Leadership': 'TTM - Vaders - Family & Leadership',
    'Word de Vader Die Je Kinderen Verdienen - TTM - Vaders - Role Model & Success': 'TTM - Vaders - Role Model & Success',
    'Ontdek Top Tier Men - TTM - Algemeen - Awareness': 'TTM - Algemeen - Awareness'
  };
  
  // Check direct mapping first
  if (directMapping[adName]) {
    return directMapping[adName];
  }
  
  // Check if this matches any of our ad set names
  for (const adSetName of Object.keys(BETTER_AD_TITLES)) {
    if (baseName.includes(adSetName)) {
      return adSetName;
    }
  }
  
  // If no exact match, try to extract the ad set name from the ad name
  // Look for patterns like "TTM - Category - Subcategory"
  const ttmPattern = /TTM - (Zakelijk|Vaders|Jongeren|Algemeen) - [^-]+(?: - [^-]+)?/;
  const match = baseName.match(ttmPattern);
  
  if (match) {
    const matchedString = match[0];
    // Check if this matches any of our known ad set names
    for (const adSetName of Object.keys(BETTER_AD_TITLES)) {
      if (matchedString.includes(adSetName) || adSetName.includes(matchedString)) {
        return adSetName;
      }
    }
  }
  
  // Debug logging
  console.log(`🔍 Could not extract ad set name from: "${adName}"`);
  console.log(`🔍 Available ad set names:`, Object.keys(BETTER_AD_TITLES));
  
  return null;
}
