import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🏗️ Creating onboarding forum topic...');

    // First, check if the topic already exists
    const { data: existingTopic, error: checkError } = await supabaseAdmin
      .from('forum_topics')
      .select('id, title')
      .eq('title', 'Nieuwe Leden - Stel je voor!')
      .single();

    if (existingTopic) {
      console.log('✅ Onboarding topic already exists:', existingTopic.id);
      return NextResponse.json({
        success: true,
        message: 'Onboarding topic already exists',
        topicId: existingTopic.id
      });
    }

    // Create the onboarding topic
    const { data: topic, error: topicError } = await supabaseAdmin
      .from('forum_topics')
      .insert({
        title: 'Nieuwe Leden - Stel je voor!',
        content: `# Welkom bij Top Tier Men! 🎉

Dit is de plek waar nieuwe leden van onze community zich kunnen voorstellen. 

## Vertel ons over jezelf:

- **Naam**: Hoe mogen we je noemen?
- **Leeftijd**: Hoe oud ben je?
- **Locatie**: Waar kom je vandaan?
- **Doelen**: Wat wil je bereiken met Top Tier Men?
- **Hobby's**: Wat doe je graag in je vrije tijd?
- **Favoriete training**: Wat is je favoriete vorm van training?

## Community Guidelines:

- Wees respectvol en vriendelijk
- Deel je ervaringen en leer van anderen
- Stel vragen als je hulp nodig hebt
- Help andere nieuwe leden waar mogelijk

**Welkom in de Brotherhood! 💪**

*Dit topic is speciaal gemaakt voor nieuwe leden tijdens hun onboarding proces.*`,
        category_id: 1 // Assuming category 1 is "Algemeen" or similar
      })
      .select('id, title, content')
      .single();

    if (topicError) {
      console.error('❌ Error creating onboarding topic:', topicError);
      return NextResponse.json({
        success: false,
        error: topicError.message
      }, { status: 500 });
    }

    console.log('✅ Onboarding topic created successfully:', topic.id);

    return NextResponse.json({
      success: true,
      message: 'Onboarding topic created successfully',
      topicId: topic.id,
      topic: topic
    });

  } catch (error) {
    console.error('❌ Error in create-onboarding-forum-topic API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
