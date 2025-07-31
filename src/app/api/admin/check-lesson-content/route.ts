import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key'
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking lesson content...');

    // Get the Discipline & Identiteit module
    const { data: module, error: moduleError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('title', 'Discipline & Identiteit')
      .single();

    if (moduleError) {
      console.error('Module error:', moduleError);
      return NextResponse.json({ 
        success: false, 
        error: 'Module not found' 
      });
    }

    // Get all lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .eq('module_id', module.id)
      .order('order_index');

    if (lessonsError) {
      console.error('Lessons error:', lessonsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch lessons' 
      });
    }

    // Format the data
    const formattedLessons = lessons?.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      type: lesson.type,
      status: lesson.status,
      order_index: lesson.order_index,
      content_length: lesson.content?.length || 0,
      content_status: lesson.content?.length > 1000 ? 'Detailed content available' : 
                     lesson.content?.length > 100 ? 'Basic content available' : 'Minimal content',
      content_preview: lesson.content?.substring(0, 200) || '',
      has_video: !!lesson.video_url
    }));

    console.log('✅ Lesson content checked successfully');

    return NextResponse.json({
      success: true,
      module: {
        id: module.id,
        title: module.title,
        description: module.description
      },
      lessons: formattedLessons,
      total_lessons: formattedLessons?.length || 0,
      lessons_with_content: formattedLessons?.filter(l => l.content_length > 100).length || 0
    });

  } catch (error) {
    console.error('❌ Error checking lesson content:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to check lesson content: ${error}` 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Updating lesson content...');

    // Get the Discipline & Identiteit module
    const { data: module, error: moduleError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('title', 'Discipline & Identiteit')
      .single();

    if (moduleError) {
      console.error('Module error:', moduleError);
      return NextResponse.json({ 
        success: false, 
        error: 'Module not found' 
      });
    }

    // Update lesson 1: De Basis van Discipline
    const lesson1Content = `Discipline is de fundering van alle succes. In deze les leer je wat discipline echt betekent en hoe je het kunt ontwikkelen.

## Wat is discipline?

Discipline is niet alleen over hard werken of jezelf dwingen om dingen te doen die je niet leuk vindt. Het is over consistentie, focus en de bereidheid om korte-termijn plezier op te offeren voor lange-termijn doelen.

## De 3 pijlers van discipline:

### 1. **Consistentie**
- Doe elke dag iets, hoe klein ook
- Bouw routines op die je kunt volhouden
- Focus op progressie, niet perfectie

### 2. **Focus**
- Elimineer afleidingen
- Werk in tijdsblokken
- Leer nee zeggen tegen onnodige verplichtingen

### 3. **Doelgerichtheid**
- Ken je waarom
- Visualiseer je doelen
- Meet je voortgang

## Praktische oefeningen:

1. **De 5-minuten regel**: Begin elke dag met 5 minuten van je belangrijkste taak
2. **Habit stacking**: Koppel nieuwe gewoonten aan bestaande routines
3. **Environment design**: Maak je omgeving zo dat goede keuzes makkelijk zijn
4. **Accountability**: Vind iemand die je verantwoordelijk houdt

## Dagelijkse discipline checklist:

- [ ] Sta op tijd op (5:30 AM)
- [ ] Drink water (500ml)
- [ ] Mediteer (10 minuten)
- [ ] Lees (30 minuten)
- [ ] Train (45 minuten)
- [ ] Plan morgen (10 minuten)

## Belangrijke inzichten:

- Discipline is een spier die je kunt trainen
- Start klein en bouw geleidelijk op
- Focus op het proces, niet alleen het resultaat
- Vier kleine overwinningen

Door deze principes toe te passen, ontwikkel je een sterke basis van discipline die je helpt om alle andere doelen te bereiken.`;

    const { error: update1Error } = await supabase
      .from('academy_lessons')
      .update({
        title: 'De Basis van Discipline',
        duration: '25 minuten',
        type: 'video',
        status: 'published',
        order_index: 1,
        content: lesson1Content,
        updated_at: new Date().toISOString()
      })
      .eq('module_id', module.id)
      .eq('order_index', 1);

    if (update1Error) {
      console.error('Error updating lesson 1:', update1Error);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to update lesson 1: ${update1Error.message}` 
      });
    }

    // Update lesson 2: Je Identiteit Definiëren
    const lesson2Content = `Je identiteit is wie je bent als persoon. Het bepaalt je gedrag, je keuzes en je resultaten. In deze les leer je hoe je een sterke, authentieke identiteit kunt ontwikkelen.

## Wat is identiteit?

Je identiteit is de som van je overtuigingen, waarden, doelen en de manier waarop je jezelf ziet. Het is je innerlijke kompas dat je helpt om beslissingen te nemen en consistent te zijn in je acties.

## De 4 lagen van identiteit:

### 1. **Fysieke Identiteit**
- Hoe je eruit ziet
- Hoe je je lichaam behandelt
- Je gezondheidsgewoonten

### 2. **Mentale Identiteit**
- Je gedachten en overtuigingen
- Je kennis en vaardigheden
- Je mindset en perspectief

### 3. **Emotionele Identiteit**
- Hoe je met emoties omgaat
- Je relaties en connecties
- Je empathie en compassie

### 4. **Spirituele Identiteit**
- Je waarden en principes
- Je doel en missie
- Je verbinding met iets groters

## Stappen om je identiteit te definiëren:

### Stap 1: Reflecteer op je waarden
- Wat is echt belangrijk voor jou?
- Waar ben je bereid om voor te vechten?
- Wat zou je nooit opgeven?

### Stap 2: Identificeer je sterke punten
- Waar ben je van nature goed in?
- Wat doen anderen dat je bewondert?
- Welke vaardigheden wil je ontwikkelen?

### Stap 3: Stel je doelen vast
- Wat wil je bereiken in de komende 5 jaar?
- Welke impact wil je hebben?
- Wat is je definitie van succes?

### Stap 4: Ontwikkel je visie
- Hoe zie je je ideale toekomst?
- Wie wil je zijn over 10 jaar?
- Wat is je levensmissie?

## Praktische oefeningen:

### Oefening 1: Waarden Inventarisatie
Schrijf 20 dingen op die belangrijk voor je zijn. Rangschik ze van 1-20. De top 5 zijn je kernwaarden.

### Oefening 2: Identiteit Statement
Schrijf een korte paragraaf die beschrijft wie je bent en wat je belangrijk vindt.

### Oefening 3: Rolmodellen
Identificeer 3 mensen die je bewondert. Schrijf op welke eigenschappen je in hen bewondert.

### Oefening 4: Dagelijkse Reflectie
Stel jezelf elke avond deze vragen:
- Heb ik vandaag geleefd volgens mijn waarden?
- Wat heb ik geleerd over mezelf?
- Hoe kan ik morgen beter zijn?

## Identiteit vs. Doelen:

- **Doelen** zijn wat je wilt bereiken
- **Identiteit** is wie je bent
- Focus op het worden, niet alleen het doen
- "Ik ben iemand die..." in plaats van "Ik wil..."

## Belangrijke inzichten:

- Je identiteit bepaalt je gedrag meer dan je doelen
- Kleine dagelijkse acties versterken je identiteit
- Je kunt je identiteit bewust veranderen
- Consistentie is belangrijker dan perfectie

Door een sterke identiteit te ontwikkelen, word je consistenter in je acties en bereik je je doelen effectiever.`;

    const { error: update2Error } = await supabase
      .from('academy_lessons')
      .update({
        title: 'Je Identiteit Definiëren',
        duration: '30 minuten',
        type: 'text',
        status: 'published',
        order_index: 2,
        content: lesson2Content,
        updated_at: new Date().toISOString()
      })
      .eq('module_id', module.id)
      .eq('order_index', 2);

    if (update2Error) {
      console.error('Error updating lesson 2:', update2Error);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to update lesson 2: ${update2Error.message}` 
      });
    }

    console.log('✅ Lesson content updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Discipline lessons updated with detailed content',
      updated_lessons: 2,
      module_title: module.title
    });

  } catch (error) {
    console.error('❌ Error updating lesson content:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update lesson content: ${error}` 
    });
  }
} 