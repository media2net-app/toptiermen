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
    console.log('🔧 Updating all ad body texts with compelling content...');

    // First, get all TTM ads
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,creative{id,title,body,link_url,object_story_spec}&limit=1000&_t=${Date.now()}`,
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
      return NextResponse.json({ success: true, data: { updated: 0, errors: 0 } });
    }

    // Filter to only show TTM ads
    const ttmAds = data.data.filter((ad: any) => 
      ad.name && ad.name.includes('TTM')
    );

    console.log(`📋 Found ${ttmAds.length} TTM ads to update`);

    // Define compelling body texts for each ad type
    const bodyTexts = {
      'Algemeen - Interest Based': 'Ontdek hoe Top Tier Men je leven kan transformeren. Word onderdeel van een community van mannen die meer willen uit het leven.',
      'Algemeen - Lookalike': 'Sluit je aan bij Top Tier Men en word onderdeel van een elite community. Transformeer jezelf met fitness, mindset en brotherhood.',
      'Algemeen - Awareness': 'Top Tier Men - Voor mannen die meer willen. Ontdek hoe je jezelf kunt transformeren en onderdeel kunt worden van onze community.',
      'Algemeen - Custom Audience': 'Word lid van Top Tier Men en transformeer je leven. Ontdek fitness, mindset en brotherhood in onze community.',
      'Algemeen - Retargeting': 'Nog even over Top Tier Men - De community voor mannen die meer willen. Sluit je nu aan en transformeer jezelf.',
      'Zakelijk - Entrepreneurs & Leaders': 'Voor ondernemers die meer willen. Top Tier Men helpt je om jezelf te upgraden met fitness, mindset en een netwerk van succesvolle mannen.',
      'Zakelijk - Business Professionals': 'Business professionals: upgrade jezelf met Top Tier Men. Ontdek hoe fitness en mindset je carrière kunnen versnellen.',
      'Jongeren - Social & Community': 'Word onderdeel van onze community. Top Tier Men is voor jongeren die meer willen uit het leven. Transformeer jezelf nu.',
      'Jongeren - Fitness & Lifestyle': 'Fitness & lifestyle voor jongeren. Top Tier Men helpt je om de beste versie van jezelf te worden.',
      'Vaders - Family & Leadership': 'Voor vaders die meer willen. Top Tier Men helpt je om een betere vader en leider te worden.',
      'Vaders - Role Model & Success': 'Word de vader die je kinderen verdienen. Top Tier Men helpt je om een rolmodel te worden.'
    };

    let successCount = 0;
    let errorCount = 0;
    const results: Array<{
      adset_id?: string;
      adset_name?: string;
      ad_id?: string;
      ad_name?: string;
      creative_id?: string;
      status: string;
      added_interest?: string;
      total_interests?: number;
      error?: string;
      new_body?: string;
    }> = [];

    // Update each ad's creative
    for (const ad of ttmAds) {
      try {
        const creative = ad.creative;
        if (!creative || !creative.id) {
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

        // Determine which body text to use based on ad name
        let bodyText = 'Ontdek Top Tier Men en transformeer je leven.';
        for (const [key, text] of Object.entries(bodyTexts)) {
          if (ad.name.includes(key)) {
            bodyText = text;
            break;
          }
        }

        console.log(`🔧 Updating ad: ${ad.name} with body: "${bodyText}"`);

        // Update the creative with the new body text
        const updateResponse = await fetch(
          `https://graph.facebook.com/v19.0/${creative.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              body: bodyText,
              name: ad.name
            })
          }
        );

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log(`✅ Successfully updated creative ${creative.id}`);
          successCount++;
          results.push({
            ad_id: ad.id,
            ad_name: ad.name,
            creative_id: creative.id,
            status: 'success',
            new_body: bodyText
          });
        } else {
          const errorText = await updateResponse.text();
          console.error(`❌ Failed to update creative ${creative.id}:`, errorText);
          errorCount++;
          results.push({
            ad_id: ad.id,
            ad_name: ad.name,
            creative_id: creative.id,
            status: 'error',
            error: errorText
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error updating ad ${ad.name}:`, error);
        errorCount++;
        results.push({
          ad_id: ad.id,
          ad_name: ad.name,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`✅ Updated ${successCount} ads successfully`);
    console.log(`❌ ${errorCount} ads failed to update`);

    return NextResponse.json({
      success: true,
      data: {
        total_ads: ttmAds.length,
        updated: successCount,
        errors: errorCount,
        results: results
      }
    });

  } catch (error) {
    console.error('❌ Error updating ad bodies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ad bodies' },
      { status: 500 }
    );
  }
}
