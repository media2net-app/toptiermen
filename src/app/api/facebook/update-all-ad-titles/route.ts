import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

// Better ad titles for each ad set
const BETTER_AD_TITLES: { [key: string]: { title: string; description: string } } = {
  'TTM - Algemeen - Lookalike': {
    title: 'Word Onderdeel van Onze Elite Community',
    description: 'Sluit je aan bij mannen die net als jij meer uit het leven willen halen. Top Tier Men - waar gewone mannen buitengewone dingen bereiken.'
  },
  'TTM - Algemeen - Retargeting': {
    title: 'Nog Even Over Top Tier Men',
    description: 'Je hebt ons al gezien. Nu is het tijd om te handelen. Word lid van de community die je leven gaat veranderen.'
  },
  'TTM - Algemeen - Interest Based': {
    title: 'Voor Mannen Die Meer Willen',
    description: 'Ben jij klaar voor de volgende stap? Top Tier Men helpt je om je doelen te bereiken en je dromen waar te maken.'
  },
  'TTM - Algemeen - Custom Audience': {
    title: 'Word Lid van Top Tier Men',
    description: 'Exclusieve toegang tot een community van mannen die net als jij streven naar excellentie. Sluit je aan bij de elite.'
  },
  'TTM - Algemeen - Awareness': {
    title: 'Ontdek Top Tier Men',
    description: 'Een nieuwe manier van leven. Fitness, mindset, community en groei. Word de beste versie van jezelf.'
  },
  'TTM - Zakelijk - Entrepreneurs & Leaders': {
    title: 'Voor Ondernemers Die Meer Willen',
    description: 'Upgrade jezelf als ondernemer. Top Tier Men helpt je om zowel persoonlijk als zakelijk te groeien.'
  },
  'TTM - Zakelijk - Business Professionals': {
    title: 'Business Professionals: Upgrade Jezelf',
    description: 'Neem je carrière naar het volgende niveau. Top Tier Men voor ambitieuze professionals die meer willen bereiken.'
  },
  'TTM - Jongeren - Social & Community': {
    title: 'Word Onderdeel van Onze Community',
    description: 'Sluit je aan bij jongeren die net als jij streven naar groei en ontwikkeling. Top Tier Men - waar vriendschap en ambitie samenkomen.'
  },
  'TTM - Jongeren - Fitness & Lifestyle': {
    title: 'Fitness & Lifestyle voor Jongeren',
    description: 'Ontdek een nieuwe manier van trainen en leven. Top Tier Men - waar fitness, mindset en community samenkomen.'
  },
  'TTM - Vaders - Family & Leadership': {
    title: 'Voor Vaders Die Meer Willen',
    description: 'Word de vader die je kinderen verdienen. Top Tier Men helpt je om een betere leider te worden voor je gezin.'
  },
  'TTM - Vaders - Role Model & Success': {
    title: 'Word de Vader Die Je Kinderen Verdienen',
    description: 'Toon je kinderen wat het betekent om succesvol te zijn. Top Tier Men - waar vaders groeien en excelleren.'
  }
};

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
  const ttmPattern = /TTM - (Zakelijk|Vaders|Jongeren|Algemeen) - [^-]+(?: - [^-]+)?/;
  const match = baseName.match(ttmPattern);

  if (match) {
    const matchedString = match[0];
    for (const adSetName of Object.keys(BETTER_AD_TITLES)) {
      if (matchedString.includes(adSetName) || adSetName.includes(matchedString)) {
        return adSetName;
      }
    }
  }

  console.log(`🔍 Could not extract ad set name from: "${adName}"`);
  return null;
}

export async function POST(request: NextRequest) {
  if (!FACEBOOK_ACCESS_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'Missing Facebook access token' },
      { status: 500 }
    );
  }

  try {
    console.log('🎯 Updating all ad titles with better, more compelling text...');

    // Get all ads
    const adsResponse = await fetch(
      `https://graph.facebook.com/v19.0/act_1465834431278978/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,creative{id,title,body,image_url,video_id,link_url,object_story_spec}&limit=100`
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
    const errors: string[] = [];

    for (const ad of ttmAds) {
      try {
        const baseAdSetName = getBaseAdSetName(ad.name);
        
        if (!baseAdSetName) {
          console.log(`⚠️ Could not determine ad set name for: ${ad.name}`);
          errorCount++;
          errors.push(`Could not determine ad set name for: ${ad.name}`);
          continue;
        }

        const betterTitle = BETTER_AD_TITLES[baseAdSetName];
        
        if (!betterTitle) {
          console.log(`⚠️ No better title found for ad set: ${baseAdSetName}`);
          errorCount++;
          errors.push(`No better title found for ad set: ${baseAdSetName}`);
          continue;
        }

        console.log(`📝 Better title for ${baseAdSetName}:`, betterTitle);

        // Get the current ad creative to preserve other fields including Instagram account
        const getCreativeResponse = await fetch(
          `https://graph.facebook.com/v19.0/${ad.id}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=creative{id,title,body,image_url,video_id,link_url,object_story_spec}`
        );

        if (!getCreativeResponse.ok) {
          const errorText = await getCreativeResponse.text();
          console.error('Facebook API error getting creative:', errorText);
          throw new Error(`Facebook API error: ${getCreativeResponse.status} ${getCreativeResponse.statusText}`);
        }

        const adData = await getCreativeResponse.json();
        const creative = adData.creative;

        if (!creative || !creative.id) {
          console.log(`⚠️ Ad ${ad.name} has no creative, skipping`);
          errorCount++;
          errors.push(`No creative found for: ${ad.name}`);
          continue;
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
            `https://graph.facebook.com/v19.0/${ad.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
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

        console.log(`✅ Successfully updated ad title for ${ad.name}`);
        successCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error updating ad ${ad.name}:`, error);
        errorCount++;
        errors.push(`Error updating ${ad.name}: ${error}`);
      }
    }

    console.log(`📊 Ad title update completed:`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} ad titles successfully`,
      data: {
        totalAds: ttmAds.length,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('❌ Error updating all ad titles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update all ad titles' },
      { status: 500 }
    );
  }
}
