import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key'
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking all modules and lessons...');

    // Get all modules
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .order('order_index');

    if (modulesError) {
      console.error('Modules error:', modulesError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch modules' 
      });
    }

    // Get all lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .order('order_index');

    if (lessonsError) {
      console.error('Lessons error:', lessonsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch lessons' 
      });
    }

    // Format the data
    const formattedModules = modules?.map(module => {
      const moduleLessons = lessons?.filter(lesson => lesson.module_id === module.id) || [];
      return {
        id: module.id,
        title: module.title,
        description: module.description,
        order_index: module.order_index,
        status: module.status,
        lessons_count: moduleLessons.length,
        lessons: moduleLessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration,
          type: lesson.type,
          status: lesson.status,
          order_index: lesson.order_index,
          content_length: lesson.content?.length || 0,
          content_status: lesson.content?.length > 1000 ? 'Detailed content available' : 
                         lesson.content?.length > 100 ? 'Basic content available' : 'Minimal content',
          has_video: !!lesson.video_url
        }))
      };
    });

    console.log('✅ All modules and lessons checked successfully');

    return NextResponse.json({
      success: true,
      modules: formattedModules,
      total_modules: formattedModules?.length || 0,
      total_lessons: lessons?.length || 0,
      modules_with_content: formattedModules?.filter(m => 
        m.lessons.some(l => l.content_length > 1000)
      ).length || 0
    });

  } catch (error) {
    console.error('❌ Error checking modules:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to check modules: ${error}` 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Updating all modules with comprehensive content...');

    // Update all modules with detailed content
    const updateResults: any[] = [];

    // 1. Update Discipline & Identiteit Module (already done, but let's ensure it's complete)
    const disciplineModule = await updateDisciplineModule();
    updateResults.push(disciplineModule);

    // 2. Update Fysieke Kracht Module
    const fysiekeKrachtModule = await updateFysiekeKrachtModule();
    updateResults.push(fysiekeKrachtModule);

    // 3. Update Mentale Kracht Module
    const mentaleKrachtModule = await updateMentaleKrachtModule();
    updateResults.push(mentaleKrachtModule);

    // 4. Update Finance & Business Module
    const financeModule = await updateFinanceModule();
    updateResults.push(financeModule);

    // 5. Update Brotherhood Module
    const brotherhoodModule = await updateBrotherhoodModule();
    updateResults.push(brotherhoodModule);

    // 6. Update Voeding & Gezondheid Module
    const voedingModule = await updateVoedingModule();
    updateResults.push(voedingModule);

    console.log('✅ All modules updated successfully');

    return NextResponse.json({
      success: true,
      message: 'All academy modules updated with comprehensive content',
      results: updateResults,
      total_modules_updated: updateResults.length
    });

  } catch (error) {
    console.error('❌ Error updating modules:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update modules: ${error}` 
    });
  }
}

async function updateDisciplineModule() {
  // Get the Discipline & Identiteit module
  const { data: module } = await supabase
    .from('academy_modules')
    .select('*')
    .eq('title', 'Discipline & Identiteit')
    .single();

  if (!module) return { module: 'Discipline & Identiteit', status: 'not_found' };

  // Update module description
  await supabase
    .from('academy_modules')
    .update({
      description: 'Leer de fundamenten van discipline en ontwikkel een sterke identiteit. Dit is de fundering voor alle andere modules en helpt je om consistent te zijn in je acties en beslissingen.',
      short_description: 'Ontwikkel discipline en ontdek je ware identiteit',
      status: 'published',
      updated_at: new Date().toISOString()
    })
    .eq('id', module.id);

  return { module: 'Discipline & Identiteit', status: 'updated', lessons_updated: 0 };
}

async function updateFysiekeKrachtModule() {
  // Get Fysieke Dominantie module (existing title)
  const { data: module } = await supabase
    .from('academy_modules')
    .select('*')
    .eq('title', 'Fysieke Dominantie')
    .single();

  if (!module) return { module: 'Fysieke Dominantie', status: 'not_found' };

  // Update module
  await supabase
    .from('academy_modules')
    .update({
      description: 'Bouw een sterk, gezond lichaam en ontwikkel fysieke kracht die je helpt om je doelen te bereiken. Leer effectieve trainingstechnieken, voeding en herstel strategieën.',
      short_description: 'Bouw fysieke kracht en gezondheid',
      status: 'published',
      updated_at: new Date().toISOString()
    })
    .eq('id', module.id);

  // Update the first lesson with detailed content
  const lesson1Content = `Welkom bij de module Fysieke Dominantie! In deze les leer je waarom fysieke kracht cruciaal is voor je algehele succes en welzijn.

## Waarom fysieke dominantie belangrijk is:

### 1. **Mentale Kracht**
- Krachttraining verhoogt je zelfvertrouwen
- Het leert je doorzetten bij uitdagingen
- Het verbetert je focus en discipline

### 2. **Fysieke Gezondheid**
- Sterkere botten en gewrichten
- Betere stofwisseling
- Verhoogde energie levels

### 3. **Functionele Kracht**
- Dagelijkse activiteiten worden makkelijker
- Betere houding en balans
- Verminderde kans op blessures

### 4. **Status en Aantrekkingskracht**
- Fysieke aanwezigheid creëert respect
- Gezond lichaam straalt vitaliteit uit
- Zelfvertrouwen door fysieke prestaties

## De 5 basis principes van fysieke dominantie:

### 1. **Progressive Overload**
- Verhoog geleidelijk de weerstand
- Focus op techniek, niet alleen gewicht
- Houd je voortgang bij

### 2. **Compound Movements**
- Squats, deadlifts, bench press
- Pull-ups, rows, overhead press
- Deze oefeningen trainen meerdere spiergroepen

### 3. **Consistentie**
- Train 3-4x per week
- Houd je schema aan
- Rust is net zo belangrijk als training

### 4. **Proper Form**
- Leer de juiste techniek
- Start met lichte gewichten
- Vraag om feedback van een trainer

### 5. **Recovery**
- Slaap 7-9 uur per nacht
- Eet voldoende eiwitten
- Neem rustdagen serieus

## Je eerste trainingsweek:

### Dag 1: Push (Borst, Schouders, Triceps)
- Bench Press: 3x8
- Overhead Press: 3x8
- Dips: 3x10
- Push-ups: 3x15

### Dag 2: Pull (Rug, Biceps)
- Deadlifts: 3x5
- Pull-ups: 3x8
- Rows: 3x10
- Bicep curls: 3x12

### Dag 3: Legs (Benen)
- Squats: 3x8
- Lunges: 3x10 per been
- Calf raises: 3x15
- Planks: 3x30 seconden

## Belangrijke tips:

- **Warm altijd op** met 5-10 minuten cardio
- **Stretch na je training** voor flexibiliteit
- **Drink voldoende water** tijdens en na training
- **Luister naar je lichaam** en neem rust als nodig

## Volgende stappen:

1. Plan je trainingsschema
2. Koop basis apparatuur of ga naar een gym
3. Leer de basis oefeningen
4. Start met lichte gewichten
5. Houd je voortgang bij

Door consistent te trainen en deze principes toe te passen, bouw je niet alleen fysieke kracht op, maar ontwikkel je ook mentale discipline en zelfvertrouwen.`;

  await supabase
    .from('academy_lessons')
    .update({
      title: 'Waarom is fysieke dominantie zo belangrijk?',
      duration: '15 minuten',
      type: 'video',
      status: 'published',
      order_index: 1,
      content: lesson1Content,
      updated_at: new Date().toISOString()
    })
    .eq('module_id', module.id)
    .eq('order_index', 1);

  return { module: 'Fysieke Dominantie', status: 'updated', lessons_updated: 1 };
}

async function updateMentaleKrachtModule() {
  // Get Mentale Kracht/Weerbaarheid module (existing title)
  const { data: module } = await supabase
    .from('academy_modules')
    .select('*')
    .eq('title', 'Mentale Kracht/Weerbaarheid')
    .single();

  if (!module) return { module: 'Mentale Kracht/Weerbaarheid', status: 'not_found' };

  // Update module
  await supabase
    .from('academy_modules')
    .update({
      description: 'Ontwikkel mentale veerkracht, focus en een groei mindset om uitdagingen te overwinnen. Leer technieken voor stress management, mindfulness en persoonlijke ontwikkeling.',
      short_description: 'Bouw mentale veerkracht en focus',
      status: 'published',
      updated_at: new Date().toISOString()
    })
    .eq('id', module.id);

  // Update the first lesson with detailed content
  const lesson1Content = `Welkom bij de module Mentale Kracht/Weerbaarheid! In deze les leer je wat mentale kracht is en hoe je het kunt ontwikkelen.

## Wat is mentale kracht?

Mentale kracht is het vermogen om effectief om te gaan met stress, tegenslagen en uitdagingen. Het is de combinatie van veerkracht, focus, zelfvertrouwen en doorzettingsvermogen.

## De 4 pijlers van mentale kracht:

### 1. **Veerkracht**
- Het vermogen om te herstellen van tegenslagen
- Flexibiliteit in het omgaan met verandering
- Optimisme en hoop behouden

### 2. **Focus**
- Het vermogen om je aandacht te richten
- Afleidingen elimineren
- Prioriteiten stellen

### 3. **Zelfvertrouwen**
- Geloof in je eigen capaciteiten
- Realistisch zelfbeeld
- Bereidheid om risico's te nemen

### 4. **Doorzettingsvermogen**
- Volharden ondanks obstakels
- Lange-termijn denken
- Consistentie in acties

## Technieken om mentale kracht op te bouwen:

### 1. **Gratitude Practice**
- Schrijf elke dag 3 dingen op waar je dankbaar voor bent
- Focus op wat je hebt in plaats van wat je mist
- Vier kleine overwinningen

### 2. **Mindfulness & Meditatie**
- 10 minuten dagelijkse meditatie
- Focus op je ademhaling
- Observeer je gedachten zonder oordeel

### 3. **Visualisatie**
- Visualiseer je succes elke dag
- Maak je doelen levendig en gedetailleerd
- Oefen je reacties op uitdagingen

### 4. **Self-Talk**
- Vervang negatieve gedachten door positieve
- Praat tegen jezelf zoals tegen een goede vriend
- Gebruik bevestigingen en mantras

### 5. **Comfort Zone Uitbreiden**
- Doe elke dag iets wat je ongemakkelijk vindt
- Neem kleine risico's
- Leer van falen

## Omgaan met tegenslagen:

### 1. **Accepteer wat je niet kunt veranderen**
- Focus op wat je wel kunt controleren
- Leer van de situatie
- Blijf in het heden

### 2. **Reframe de situatie**
- Zie uitdagingen als kansen
- Vraag: "Wat kan ik hiervan leren?"
- Focus op groei in plaats van falen

### 3. **Blijf in actie**
- Doe iets, hoe klein ook
- Blijf bewegen naar je doelen
- Vertrouw op het proces

### 4. **Zoek support**
- Praat met vertrouwde mensen
- Vraag om hulp als nodig
- Blijf verbonden met anderen

## Dagelijkse mentale kracht routine:

### Ochtend (10 minuten):
- Meditatie
- Gratitude journaling
- Positieve affirmaties
- Dagelijkse intentie stellen

### Middag (5 minuten):
- Ademhalingsoefening
- Mindful pauze
- Reflectie op voortgang

### Avond (10 minuten):
- Dagelijkse reflectie
- Planning voor morgen
- Gratitude practice
- Ontspanning

## Veelgemaakte fouten:

- Perfectionisme nastreven
- Negatieve self-talk
- Vermijden van ongemak
- Vergelijken met anderen

## Belangrijke inzichten:

- Mentale kracht is een vaardigheid die je kunt ontwikkelen
- Consistentie is belangrijker dan perfectie
- Kleine dagelijkse acties leiden tot grote veranderingen
- Mentale kracht is de basis van alle andere successen

Door mentale kracht op te bouwen, word je beter bestand tegen uitdagingen en bereik je je doelen effectiever.`;

  await supabase
    .from('academy_lessons')
    .update({
      title: 'Wat is mentale kracht',
      duration: '20 minuten',
      type: 'video',
      status: 'published',
      order_index: 1,
      content: lesson1Content,
      updated_at: new Date().toISOString()
    })
    .eq('module_id', module.id)
    .eq('order_index', 1);

  return { module: 'Mentale Kracht/Weerbaarheid', status: 'updated', lessons_updated: 1 };
}

async function updateFinanceModule() {
  // Get Business and Finance module (existing title)
  const { data: module } = await supabase
    .from('academy_modules')
    .select('*')
    .eq('title', 'Business and Finance ')
    .single();

  if (!module) return { module: 'Business and Finance', status: 'not_found' };

  // Update module
  await supabase
    .from('academy_modules')
    .update({
      description: 'Leer financiële intelligentie en business vaardigheden om je inkomen te verhogen en financiële vrijheid te bereiken. Ontdek strategieën voor investeren, ondernemen en passief inkomen.',
      short_description: 'Bouw financiële intelligentie en business skills',
      status: 'published',
      updated_at: new Date().toISOString()
    })
    .eq('id', module.id);

  // Update the first lesson with detailed content
  const lesson1Content = `Welkom bij de module Business and Finance! In deze les leer je de fundamenten van de financiële mindset en hoe je je relatie met geld kunt transformeren.

## Wat is de financiële mindset?

De financiële mindset is de manier waarop je denkt over geld, rijkdom en financiële vrijheid. Het bepaalt je financiële beslissingen en uiteindelijk je financiële resultaten.

## De 4 pijlers van financiële intelligentie:

### 1. **Verdienen**
- Verhoog je inkomen door nieuwe vaardigheden
- Ontwikkel meerdere inkomstenbronnen
- Investeer in jezelf en je kennis

### 2. **Besparen**
- Leef onder je stand
- Automatiseer je spaargeld
- Vermijd lifestyle inflation

### 3. **Investeren**
- Laat je geld voor je werken
- Diversificeer je investeringen
- Denk lange termijn

### 4. **Beschermen**
- Verzeker jezelf adequaat
- Plan voor onvoorziene omstandigheden
- Bescherm je vermogen

## Je financiële roadmap:

### Fase 1: Foundation (0-6 maanden)
- **Emergency Fund**: 3-6 maanden uitgaven
- **Schulden aflossen**: Start met hoogste rente
- **Budget opstellen**: Track al je uitgaven
- **Financiële doelen stellen**: SMART doelen

### Fase 2: Building (6 maanden - 2 jaar)
- **Investeren starten**: Index funds, ETFs
- **Pensioen opbouwen**: Maximaliseer belastingvoordelen
- **Vaardigheden ontwikkelen**: Cursussen, certificeringen
- **Side hustle starten**: Extra inkomen genereren

### Fase 3: Growing (2-5 jaar)
- **Portfolio uitbreiden**: Vastgoed, crypto, business
- **Passief inkomen**: Dividend stocks, rental income
- **Networking**: Connect met succesvolle mensen
- **Mentorship**: Leer van experts

### Fase 4: Scaling (5+ jaar)
- **Business opbouwen**: Eigen onderneming
- **Vermogen beschermen**: Trusts, verzekeringen
- **Legacy plannen**: Erfenis, filantropie
- **Financial freedom**: Optie om te stoppen met werken

## Praktische stappen voor vandaag:

### 1. **Budget opstellen**
- Track al je uitgaven voor 30 dagen
- Categoriseer je uitgaven
- Identificeer besparingsmogelijkheden

### 2. **Emergency fund starten**
- Open aparte spaarrekening
- Automatiseer maandelijkse storting
- Streef naar 3-6 maanden uitgaven

### 3. **Schulden inventariseren**
- Maak lijst van alle schulden
- Noteer rentepercentages
- Maak aflossingsplan

### 4. **Investeren leren**
- Lees boeken over investeren
- Volg online cursussen
- Start met kleine bedragen

## Veelgemaakte fouten:

- **Lifestyle inflation**: Meer uitgeven bij meer inkomen
- **Timing the market**: Proberen de markt te voorspellen
- **Emotionele beslissingen**: Angst en hebzucht
- **Geen plan**: Doelloos geld uitgeven

## Belangrijke principes:

### 1. **Compound Interest**
- Je geld verdient geld
- Start zo vroeg mogelijk
- Consistentie is belangrijker dan bedrag

### 2. **Diversificatie**
- Spreid je risico's
- Investeer in verschillende asset classes
- Don't put all eggs in one basket

### 3. **Long-term thinking**
- Investeer voor de lange termijn
- Ignore short-term volatility
- Focus op fundamentals

### 4. **Continuous learning**
- Blijf leren over geld
- Volg trends en ontwikkelingen
- Investeer in je financiële educatie

## Volgende stappen:

1. **Stel je financiële doelen op**
2. **Maak een budget**
3. **Start met sparen**
4. **Leer over investeren**
5. **Zoek een mentor**

Door deze principes toe te passen en consistent te zijn, bouw je niet alleen vermogen op, maar ontwikkel je ook financiële vrijheid en keuzevrijheid in je leven.`;

  await supabase
    .from('academy_lessons')
    .update({
      title: 'De Financiële Mindset ',
      duration: '25 minuten',
      type: 'video',
      status: 'published',
      order_index: 1,
      content: lesson1Content,
      updated_at: new Date().toISOString()
    })
    .eq('module_id', module.id)
    .eq('order_index', 1);

  return { module: 'Business and Finance', status: 'updated', lessons_updated: 1 };
}

async function updateBrotherhoodModule() {
  // Get Brotherhood module (existing title)
  const { data: module } = await supabase
    .from('academy_modules')
    .select('*')
    .eq('title', 'Brotherhood')
    .single();

  if (!module) return { module: 'Brotherhood', status: 'not_found' };

  // Update module
  await supabase
    .from('academy_modules')
    .update({
      description: 'Bouw sterke connecties en een support netwerk van gelijkgestemde mannen die je helpen groeien. Leer effectieve communicatie, leiderschap en hoe je betekenisvolle relaties opbouwt.',
      short_description: 'Bouw sterke connecties en support netwerk',
      status: 'published',
      updated_at: new Date().toISOString()
    })
    .eq('id', module.id);

  // Update the first lesson with detailed content
  const lesson1Content = `Welkom bij de Brotherhood module! In deze les leer je waarom een brotherhood cruciaal is voor je persoonlijke groei en succes.

## Waarom een brotherhood belangrijk is:

### 1. **Accountability**
- Anderen houden je verantwoordelijk
- Je blijft consistent in je doelen
- Externe motivatie en support

### 2. **Perspectief**
- Verschillende viewpoints en ervaringen
- Leer van andermans fouten en successen
- Nieuwe inzichten en ideeën

### 3. **Emotionele Support**
- Veilige ruimte om te delen
- Begrip en empathie
- Mentale gezondheid en welzijn

### 4. **Networking**
- Nieuwe kansen en mogelijkheden
- Business connecties
- Vriendschappen voor het leven

## De 5 pijlers van betekenisvolle connecties:

### 1. **Authenticiteit**
- Wees jezelf, altijd
- Deel je echte verhalen en uitdagingen
- Toon kwetsbaarheid

### 2. **Vulnerability**
- Deel je angsten en twijfels
- Toon je imperfecties
- Maak ruimte voor echte connectie

### 3. **Active Listening**
- Luister om te begrijpen, niet om te reageren
- Stel verdiepende vragen
- Toon oprechte interesse

### 4. **Reciprocity**
- Geef zonder verwachting van terugkeer
- Support anderen in hun doelen
- Wees een giver, niet alleen een taker

### 5. **Consistency**
- Blijf in contact
- Toon up voor anderen
- Bouw vertrouwen door tijd

## Hoe je een brotherhood opbouwt:

### 1. **Identificeer je tribe**
- Zoek mensen met vergelijkbare waarden
- Mensen die je bewondert en respecteert
- Mensen die je willen helpen groeien

### 2. **Initieer connecties**
- Nodig mensen uit voor koffie/lunch
- Deel je doelen en uitdagingen
- Vraag om advies en feedback

### 3. **Creëer regelmatige momenten**
- Wekelijkse check-ins
- Maandelijkse meetups
- Kwartaal retreats

### 4. **Bouw deep conversations**
- Ga verder dan small talk
- Deel persoonlijke uitdagingen
- Vraag naar andermans struggles

## Effectieve communicatie in brotherhood:

### 1. **Radical Honesty**
- Spreek de waarheid, altijd
- Geef constructieve feedback
- Accepteer feedback van anderen

### 2. **Non-judgmental Space**
- Oordeel niet over andermans keuzes
- Bied support zonder advies
- Luister zonder oplossingen te geven

### 3. **Celebrate Wins**
- Vier andermans successen
- Erken vooruitgang en groei
- Moedig elkaar aan

### 4. **Support in Struggles**
- Wees er voor anderen in moeilijke tijden
- Bied praktische hulp
- Toon emotionele support

## Praktische oefeningen:

### 1. **Weekly Check-in**
- Deel je doelen voor de week
- Reflecteer op vorige week
- Vraag om accountability

### 2. **Monthly Deep Dive**
- Deel een persoonlijke uitdaging
- Vraag om perspectief en advies
- Plan concrete acties

### 3. **Quarterly Review**
- Evalueer je voortgang
- Stel nieuwe doelen
- Vier successen

### 4. **Annual Retreat**
- Diepe reflectie en planning
- Team building activiteiten
- Vision setting voor het jaar

## Veelgemaakte fouten:

- **Surface-level relationships**: Alleen small talk
- **One-sided relationships**: Alleen nemen, niet geven
- **Inconsistent contact**: Sporadische communicatie
- **Judgment**: Oordelen over andermans keuzes

## Belangrijke inzichten:

- **Quality over quantity**: 5 echte vrienden > 50 oppervlakkige connecties
- **Vulnerability breeds connection**: Echte connectie komt door kwetsbaarheid
- **Consistency builds trust**: Regelmatig contact bouwt sterke relaties
- **Give without expectation**: Geef omdat je wilt, niet omdat je iets terug verwacht

## Volgende stappen:

1. **Identificeer 3 mensen** die je wilt leren kennen
2. **Plan een eerste ontmoeting** met elk van hen
3. **Deel je doelen** en vraag om feedback
4. **Stel regelmatige check-ins** in
5. **Wees consistent** in je communicatie

Door betekenisvolle connecties op te bouwen, creëer je niet alleen een support netwerk, maar ontwikkel je ook jezelf als mens en leider.`;

  await supabase
    .from('academy_lessons')
    .update({
      title: 'Waarom een Brotherhood',
      duration: '20 minuten',
      type: 'video',
      status: 'published',
      order_index: 1,
      content: lesson1Content,
      updated_at: new Date().toISOString()
    })
    .eq('module_id', module.id)
    .eq('order_index', 1);

  return { module: 'Brotherhood', status: 'updated', lessons_updated: 1 };
}

async function updateVoedingModule() {
  // Get Voeding & Gezondheid module (existing title)
  const { data: module } = await supabase
    .from('academy_modules')
    .select('*')
    .eq('title', 'Voeding & Gezondheid')
    .single();

  if (!module) return { module: 'Voeding & Gezondheid', status: 'not_found' };

  // Update module
  await supabase
    .from('academy_modules')
    .update({
      description: 'Leer hoe je optimale voeding kunt gebruiken om je prestaties te verbeteren en gezondheid te optimaliseren. Ontdek voedingsstrategieën voor energie, spieropbouw en algehele welzijn.',
      short_description: 'Optimaliseer voeding en gezondheid',
      status: 'published',
      updated_at: new Date().toISOString()
    })
    .eq('id', module.id);

  // Update the first lesson with detailed content
  const lesson1Content = `Welkom bij de Voeding & Gezondheid module! In deze les leer je de basisprincipes van voeding en hoe je je lichaam kunt voeden voor optimale prestaties.

## Waarom voeding cruciaal is:

### 1. **Energie & Prestaties**
- Voeding is je brandstof
- Kwaliteit bepaalt je energie levels
- Timing beïnvloedt je prestaties

### 2. **Spieropbouw & Herstel**
- Eiwitten voor spiergroei
- Koolhydraten voor energie
- Vetten voor hormonen

### 3. **Mentale Kracht**
- Voeding beïnvloedt je brein
- Focus en concentratie
- Stemming en welzijn

### 4. **Langetermijn Gezondheid**
- Preventie van ziekten
- Gezonde veroudering
- Vitaliteit en levenskwaliteit

## De 3 macronutriënten:

### 1. **Eiwitten (Proteïne)**
**Functie**: Spieropbouw, herstel, hormonen
**Bronnen**: Vlees, vis, eieren, zuivel, peulvruchten
**Aanbeveling**: 1.6-2.2g per kg lichaamsgewicht

**Tips**:
- Verdeel over de dag (4-6 maaltijden)
- Kwaliteit boven kwantiteit
- Combineer met koolhydraten voor optimale opname

### 2. **Koolhydraten**
**Functie**: Energie, herstel, hersenfunctie
**Bronnen**: Rijst, pasta, aardappelen, fruit, groenten
**Aanbeveling**: 3-7g per kg lichaamsgewicht (afhankelijk van activiteit)

**Tips**:
- Complexe koolhydraten boven simpele
- Timing rond training
- Aanpassen aan activiteitsniveau

### 3. **Vetten**
**Functie**: Hormonen, celmembranen, vitaminen
**Bronnen**: Olijfolie, noten, avocado, vette vis
**Aanbeveling**: 0.8-1.2g per kg lichaamsgewicht

**Tips**:
- Focus op gezonde vetten
- Omega-3 voor ontstekingsremming
- Vermijd transvetten

## Micronutriënten (Vitaminen & Mineralen):

### **Vitamine D**
- Zonlicht, vette vis, eieren
- Belangrijk voor immuunsysteem en testosteron

### **Magnesium**
- Noten, zaden, groene bladgroenten
- Spierontspanning en slaap

### **Zink**
- Vlees, schaal- en schelpdieren
- Testosteron productie en herstel

### **Omega-3**
- Vette vis, lijnzaad, walnoten
- Ontstekingsremming en hersenfunctie

## Praktische voedingsstrategieën:

### 1. **Meal Prep**
- Plan je maaltijden vooruit
- Kook in bulk voor efficiency
- Houd gezonde opties beschikbaar

### 2. **Timing**
- **Ontbijt**: Eiwit + koolhydraten
- **Pre-workout**: Lichte koolhydraten
- **Post-workout**: Eiwit + koolhydraten
- **Avond**: Lichte maaltijd

### 3. **Hydratatie**
- Drink 2-3L water per dag
- Extra voor training
- Elektrolyten bij intensieve training

### 4. **Supplementen**
- **Whey protein**: Voor eiwit aanvulling
- **Creatine**: Voor kracht en power
- **Multivitamin**: Voor micronutriënten
- **Omega-3**: Voor ontstekingsremming

## Voorbeeld voedingsplan:

### Ontbijt (7:00)
- 3 eieren met groenten
- Havermout met bessen
- Griekse yoghurt

### Snack (10:00)
- Handvol noten
- Appel

### Lunch (13:00)
- Kipfilet met rijst
- Groene salade
- Olijfolie dressing

### Pre-workout (16:00)
- Banaan
- Whey protein shake

### Post-workout (18:00)
- Whey protein shake
- Havermout of rijst

### Diner (20:00)
- Zalm met groenten
- Quinoa of zoete aardappel

## Veelgemaakte fouten:

- **Te weinig eiwit**: Voor spieropbouw en herstel
- **Te veel bewerkte voeding**: Voor energie en gezondheid
- **Onregelmatige maaltijden**: Voor metabolisme
- **Te weinig water**: Voor prestaties en herstel

## Belangrijke principes:

### 1. **Consistentie boven perfectie**
- 80/20 regel: 80% gezond, 20% flexibiliteit
- Kleine veranderingen over tijd
- Duurzame gewoonten

### 2. **Kwaliteit boven kwantiteit**
- Volwaardige voeding boven supplementen
- Verse ingrediënten boven bewerkt
- Biologisch waar mogelijk

### 3. **Luister naar je lichaam**
- Honger en verzadiging
- Energie levels
- Herstel en prestaties

### 4. **Personaliseer**
- Wat werkt voor jou
- Aanpassen aan doelen
- Experimenteer en leer

## Volgende stappen:

1. **Bereken je caloriebehoefte**
2. **Plan je macronutriënten**
3. **Maak een boodschappenlijst**
4. **Start met meal prep**
5. **Track je voortgang**

Door optimale voeding te gebruiken als tool voor prestaties en gezondheid, geef je je lichaam de brandstof die het nodig heeft om te excelleren in alle aspecten van je leven.`;

  await supabase
    .from('academy_lessons')
    .update({
      title: 'De Basisprincipes van Voeding',
      duration: '20 minuten',
      type: 'video',
      status: 'published',
      order_index: 1,
      content: lesson1Content,
      updated_at: new Date().toISOString()
    })
    .eq('module_id', module.id)
    .eq('order_index', 1);

  return { module: 'Voeding & Gezondheid', status: 'updated', lessons_updated: 1 };
} 