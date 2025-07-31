import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking Discipline & Identiteit module...');

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

    console.log('✅ Discipline & Identiteit module checked successfully');

    return NextResponse.json({
      success: true,
      module: {
        id: module.id,
        title: module.title,
        description: module.description
      },
      lessons: formattedLessons,
      total_lessons: formattedLessons?.length || 0,
      lessons_with_detailed_content: formattedLessons?.filter(l => l.content_length > 1000).length || 0
    });

  } catch (error) {
    console.error('❌ Error checking Discipline module:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to check Discipline module: ${error}` 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Updating Discipline & Identiteit module with comprehensive content...');

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

    const updateResults = [];

    // Update lesson 1: De Basis van Discipline (already good, but ensure it's complete)
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

    await supabase
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

    updateResults.push({ lesson: 1, title: 'De Basis van Discipline', status: 'updated' });

    // Update lesson 2: Je Identiteit Definiëren (already good, but ensure it's complete)
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

    await supabase
      .from('academy_lessons')
      .update({
        title: 'Je Identiteit Definiëren',
        duration: '30 minuten',
        type: 'video',
        status: 'published',
        order_index: 2,
        content: lesson2Content,
        updated_at: new Date().toISOString()
      })
      .eq('module_id', module.id)
      .eq('order_index', 2);

    updateResults.push({ lesson: 2, title: 'Je Identiteit Definiëren', status: 'updated' });

    // Update lesson 3: Discipline van korte termijn naar een levensstijl
    const lesson3Content = `Welkom bij les 3! In deze les leer je hoe je discipline kunt transformeren van een kortetermijn inspanning naar een duurzame levensstijl die je de rest van je leven bijblijft.

## Van inspanning naar levensstijl

Discipline wordt vaak gezien als iets wat je moet "doen" - een inspanning die je moet leveren. Maar echte discipline is een levensstijl, een manier van zijn die natuurlijk aanvoelt en duurzaam is.

## De 4 fases van discipline ontwikkeling:

### Fase 1: **Awareness** (Bewustwording)
- Erkennen dat verandering nodig is
- Begrijpen waarom discipline belangrijk is
- Identificeren van huidige gewoonten

### Fase 2: **Commitment** (Toewijding)
- Beslissen om te veranderen
- Doelen stellen en plannen maken
- Externe accountability zoeken

### Fase 3: **Consistency** (Consistentie)
- Dagelijkse actie ondernemen
- Routines opbouwen
- Doorzetten bij tegenslagen

### Fase 4: **Integration** (Integratie)
- Gewoonten worden automatisch
- Discipline wordt onderdeel van je identiteit
- Natuurlijke levensstijl

## Hoe discipline een levensstijl wordt:

### 1. **Identity-Based Habits**
- "Ik ben iemand die..." in plaats van "Ik moet..."
- Je gedrag komt overeen met je zelfbeeld
- Consistentie wordt natuurlijk

### 2. **Environment Design**
- Maak goede keuzes makkelijk
- Elimineer verleidingen
- Creëer een omgeving die discipline ondersteunt

### 3. **Habit Stacking**
- Koppel nieuwe gewoonten aan bestaande routines
- Bouw geleidelijk op
- Maak gebruik van bestaande triggers

### 4. **Progress Tracking**
- Meet je voortgang
- Vier kleine overwinningen
- Leer van tegenslagen

## Praktische strategieën:

### Strategie 1: De 2-Minute Rule
- Start elke gewoonte met 2 minuten
- Maak het zo klein mogelijk
- Focus op consistentie, niet perfectie

### Strategie 2: Habit Tracking
- Houd een gewoonten dagboek bij
- Gebruik visuele markers (kalender, app)
- Streak tracking voor motivatie

### Strategie 3: Implementation Intentions
- "Als [situatie], dan [actie]"
- Plan vooruit voor moeilijke momenten
- Maak beslissingen automatisch

### Strategie 4: Social Support
- Deel je doelen met anderen
- Zoek accountability partners
- Omring je met gelijkgestemden

## Van discipline naar flow:

### Wat is flow?
Flow is een staat van volledige absorptie in een activiteit. Het is waar discipline en plezier samenkomen.

### Hoe bereik je flow?
1. **Duidelijke doelen**: Weet precies wat je wilt bereiken
2. **Directe feedback**: Zie direct resultaat van je acties
3. **Balans tussen uitdaging en vaardigheid**: Niet te makkelijk, niet te moeilijk
4. **Focus**: Elimineer afleidingen
5. **Controle**: Voel dat je invloed hebt op het resultaat

## Dagelijkse discipline routine:

### Ochtend Routine (30 minuten):
- [ ] Sta op tijd op (5:30 AM)
- [ ] Drink water (500ml)
- [ ] Mediteer (10 minuten)
- [ ] Lees (15 minuten)
- [ ] Plan de dag (5 minuten)

### Middag Check-in (5 minuten):
- [ ] Reflecteer op voortgang
- [ ] Pas indien nodig aan
- [ ] Blijf gefocust

### Avond Routine (20 minuten):
- [ ] Reflecteer op de dag
- [ ] Plan morgen
- [ ] Gratitude practice
- [ ] Voorbereiden voor slaap

## Veelgemaakte fouten:

### 1. **All-or-Nothing Thinking**
- Fout: "Als ik niet perfect ben, ben ik gefaald"
- Oplossing: Focus op progressie, niet perfectie

### 2. **Too Much Too Soon**
- Fout: Te veel gewoonten tegelijk proberen
- Oplossing: Start met 1-2 gewoonten

### 3. **No Plan for Setbacks**
- Fout: Geen strategie voor moeilijke momenten
- Oplossing: Plan vooruit voor tegenslagen

### 4. **External Motivation Only**
- Fout: Alleen afhankelijk van externe motivatie
- Oplossing: Ontwikkel interne motivatie

## Belangrijke inzichten:

- Discipline wordt makkelijker naarmate je het meer doet
- Kleine dagelijkse acties leiden tot grote veranderingen
- Consistentie is belangrijker dan intensiteit
- Discipline is een vaardigheid die je kunt ontwikkelen
- De reis is belangrijker dan de bestemming

## Volgende stappen:

1. **Identificeer 1 gewoonte** die je wilt ontwikkelen
2. **Start met 2 minuten** per dag
3. **Track je voortgang** voor 30 dagen
4. **Vier kleine overwinningen**
5. **Bouw geleidelijk op**

Door discipline te zien als een levensstijl in plaats van een inspanning, maak je het duurzaam en natuurlijk. Het wordt onderdeel van wie je bent, niet iets wat je moet doen.`;

    await supabase
      .from('academy_lessons')
      .update({
        title: 'Discipline van korte termijn naar een levensstijl',
        duration: '35 minuten',
        type: 'video',
        status: 'published',
        order_index: 3,
        content: lesson3Content,
        updated_at: new Date().toISOString()
      })
      .eq('module_id', module.id)
      .eq('order_index', 3);

    updateResults.push({ lesson: 3, title: 'Discipline van korte termijn naar een levensstijl', status: 'updated' });

    // Update lesson 4: Wat is Identiteit en Waarom zijn Kernwaarden Essentieel?
    const lesson4Content = `Welkom bij les 4! In deze les duiken we dieper in wat identiteit werkelijk betekent en waarom kernwaarden de fundering zijn van een authentiek en succesvol leven.

## Wat is identiteit?

Je identiteit is niet alleen wie je bent, maar vooral wie je kiest te zijn. Het is de som van je overtuigingen, waarden, doelen en de manier waarop je jezelf ziet in de wereld.

## De 3 dimensies van identiteit:

### 1. **Self-Concept** (Zelfbeeld)
- Hoe je jezelf ziet
- Je sterke en zwakke punten
- Je capaciteiten en beperkingen

### 2. **Self-Esteem** (Zelfwaardering)
- Hoe je jezelf waardeert
- Je gevoel van eigenwaarde
- Je vertrouwen in jezelf

### 3. **Self-Efficacy** (Zelfeffectiviteit)
- Je geloof in je vermogen om doelen te bereiken
- Je vertrouwen in je vaardigheden
- Je bereidheid om uitdagingen aan te gaan

## Waarom zijn kernwaarden essentieel?

### 1. **Ze geven richting**
- Kernwaarden zijn je innerlijke kompas
- Ze helpen je bij het nemen van beslissingen
- Ze geven betekenis aan je acties

### 2. **Ze creëren consistentie**
- Je gedrag komt overeen met je waarden
- Je bent authentiek en betrouwbaar
- Anderen weten wat ze van je kunnen verwachten

### 3. **Ze motiveren van binnenuit**
- Intrinsieke motivatie in plaats van extrinsieke
- Duurzame drive en passie
- Veerkracht bij tegenslagen

### 4. **Ze definiëren succes**
- Je eigen definitie van succes
- Niet afhankelijk van externe validatie
- Persoonlijke vervulling en betekenis

## De 10 universele kernwaarden:

### 1. **Integriteit**
- Eerlijkheid en authenticiteit
- Je woorden komen overeen met je daden
- Morele consistentie

### 2. **Excellence**
- Streven naar de beste versie van jezelf
- Continu leren en groeien
- Kwaliteit boven kwantiteit

### 3. **Verantwoordelijkheid**
- Eigenaarschap van je leven
- Verantwoordelijkheid voor je keuzes
- Betrouwbaarheid naar anderen

### 4. **Compassie**
- Empathie en begrip voor anderen
- Vriendelijkheid en zorgzaamheid
- Service aan de gemeenschap

### 5. **Moed**
- Bereidheid om risico's te nemen
- Confrontatie van angsten
- Standvastigheid bij uitdagingen

### 6. **Gratitude**
- Dankbaarheid voor wat je hebt
- Erkenning van zegeningen
- Positieve focus

### 7. **Groeimindset**
- Geloof in ontwikkeling en leren
- Omarmen van uitdagingen
- Leren van fouten

### 8. **Balans**
- Evenwicht tussen verschillende levensgebieden
- Zorg voor lichaam, geest en ziel
- Duurzame levensstijl

### 9. **Creativiteit**
- Innovatief denken
- Out-of-the-box oplossingen
- Artistieke expressie

### 10. **Leiderschap**
- Invloed op anderen
- Inspireren en motiveren
- Positieve impact maken

## Hoe identificeer je je kernwaarden?

### Stap 1: Reflectie
- Denk na over momenten van diepe voldoening
- Identificeer wat je echt belangrijk vindt
- Schrijf op wat je inspireert

### Stap 2: Prioritering
- Rangschik je waarden van belangrijk naar minder belangrijk
- Kies je top 5-7 kernwaarden
- Focus op wat echt essentieel is

### Stap 3: Definitie
- Definieer elke waarde in je eigen woorden
- Maak ze specifiek en meetbaar
- Schrijf op hoe ze eruit zien in actie

### Stap 4: Integratie
- Leef je waarden dagelijks
- Maak beslissingen gebaseerd op je waarden
- Evalueer regelmatig je voortgang

## Praktische oefeningen:

### Oefening 1: Waarden Inventarisatie
1. Schrijf 20 dingen op die belangrijk voor je zijn
2. Groepeer vergelijkbare items
3. Rangschik van 1-20
4. De top 5 zijn je kernwaarden

### Oefening 2: Waarden in Actie
Voor elke kernwaarde, schrijf op:
- Hoe ziet deze waarde eruit in je dagelijks leven?
- Welke acties demonstreren deze waarde?
- Hoe kun je deze waarde meer leven?

### Oefening 3: Waarden Audit
- Evalueer je huidige leven
- Welke waarden leef je al?
- Welke waarden wil je meer leven?
- Wat houdt je tegen?

### Oefening 4: Waarden Statement
Schrijf een korte paragraaf die beschrijft:
- Wie je bent (gebaseerd op je waarden)
- Wat je belangrijk vindt
- Hoe je dit wilt uitdrukken in je leven

## Identiteit en kernwaarden in actie:

### Dagelijkse praktijken:
- [ ] Begin elke dag met je waarden in gedachten
- [ ] Maak beslissingen gebaseerd op je waarden
- [ ] Reflecteer 's avonds op hoe je je waarden hebt geleefd
- [ ] Vier momenten waarop je je waarden hebt gedemonstreerd

### Wekelijkse evaluatie:
- [ ] Review je voortgang op elke kernwaarde
- [ ] Identificeer gebieden voor verbetering
- [ ] Plan acties voor de komende week
- [ ] Pas je doelen aan indien nodig

## Veelgemaakte fouten:

### 1. **Vage waarden**
- "Geluk" is te vaag
- Maak waarden specifiek en meetbaar
- Definieer wat ze betekenen voor jou

### 2. **Te veel waarden**
- Focus op 5-7 kernwaarden
- Te veel waarden leiden tot verwarring
- Kwaliteit boven kwantiteit

### 3. **Waarden vs. doelen**
- Waarden zijn wie je bent
- Doelen zijn wat je wilt bereiken
- Focus op het worden, niet alleen het doen

### 4. **Externe waarden**
- Leef je eigen waarden, niet die van anderen
- Wees authentiek en eerlijk
- Durf anders te zijn

## Belangrijke inzichten:

- Je identiteit bepaalt je gedrag meer dan je doelen
- Kernwaarden zijn de fundering van een authentiek leven
- Kleine dagelijkse acties versterken je identiteit
- Consistentie is belangrijker dan perfectie
- Je kunt je identiteit bewust veranderen

## Volgende stappen:

1. **Identificeer je top 5 kernwaarden**
2. **Definieer elke waarde in je eigen woorden**
3. **Schrijf op hoe je ze dagelijks kunt leven**
4. **Begin met kleine acties**
5. **Evalueer en pas aan**

Door je identiteit te baseren op je kernwaarden, creëer je een authentiek en betekenisvol leven dat duurzaam is en je ware potentieel ontsluit.`;

    await supabase
      .from('academy_lessons')
      .update({
        title: 'Wat is Identiteit en Waarom zijn Kernwaarden Essentieel?',
        duration: '40 minuten',
        type: 'video',
        status: 'published',
        order_index: 4,
        content: lesson4Content,
        updated_at: new Date().toISOString()
      })
      .eq('module_id', module.id)
      .eq('order_index', 4);

    updateResults.push({ lesson: 4, title: 'Wat is Identiteit en Waarom zijn Kernwaarden Essentieel?', status: 'updated' });

    // Update lesson 5: Ontdek je kernwaarden en bouw je Top Tier identiteit
    const lesson5Content = `Welkom bij de laatste les van de Discipline & Identiteit module! In deze les ga je je kernwaarden ontdekken en je Top Tier identiteit bouwen - de fundering voor alle andere modules.

## Je Top Tier identiteit

Een Top Tier identiteit is niet alleen succesvol, maar ook authentiek, betekenisvol en duurzaam. Het is de versie van jezelf die je ware potentieel ontsluit en een positieve impact heeft op de wereld.

## De 5 pijlers van een Top Tier identiteit:

### 1. **Authenticiteit**
- Wees jezelf, altijd
- Leef volgens je eigen waarden
- Durf anders te zijn

### 2. **Excellence**
- Streven naar de beste versie van jezelf
- Continu leren en groeien
- Kwaliteit in alles wat je doet

### 3. **Integriteit**
- Eerlijkheid en betrouwbaarheid
- Je woorden komen overeen met je daden
- Morele consistentie

### 4. **Service**
- Bijdragen aan anderen
- Positieve impact maken
- Leiderschap door voorbeeld

### 5. **Groeimindset**
- Geloof in ontwikkeling
- Omarmen van uitdagingen
- Leren van fouten

## Stap-voor-stap: Je kernwaarden ontdekken

### Stap 1: Reflectie en introspectie

#### Oefening 1: Peak Moments
Denk terug aan momenten in je leven waarop je:
- Diepe voldoening voelde
- Trots was op jezelf
- Volledig in je element was
- Anderen inspireerde

**Vraag jezelf af:**
- Wat maakte deze momenten speciaal?
- Welke waarden werden hier gedemonstreerd?
- Hoe voelde je je tijdens deze momenten?

#### Oefening 2: Frustratie Analyse
Denk aan momenten van frustratie of woede:
- Wat irriteerde je het meest?
- Welke waarden werden hier geschonden?
- Wat zegt dit over wat je belangrijk vindt?

### Stap 2: Waarden Inventarisatie

#### Oefening 3: De 100 Waarden Lijst
1. Download een lijst van 100 waarden
2. Lees elke waarde en voel wat het met je doet
3. Markeer waarden die resoneren
4. Rangschik je top 20
5. Selecteer je top 5-7

#### Oefening 4: Waarden Definitie
Voor elke kernwaarde, schrijf op:
- Wat betekent deze waarde voor jou?
- Hoe ziet deze waarde eruit in actie?
- Welke gedragingen demonstreren deze waarde?
- Hoe voelt het om deze waarde te leven?

### Stap 3: Identiteit Statement

#### Oefening 5: Je Verhaal Schrijven
Schrijf een korte paragraaf die beschrijft:
- Wie je bent (gebaseerd op je waarden)
- Wat je belangrijk vindt
- Hoe je dit wilt uitdrukken in je leven
- Welke impact je wilt hebben

## Je Top Tier identiteit bouwen

### 1. **Identity-Based Goals**
In plaats van: "Ik wil 10 kilo afvallen"
Denk: "Ik ben iemand die gezond en fit is"

In plaats van: "Ik wil meer geld verdienen"
Denk: "Ik ben iemand die financiële vrijheid creëert"

### 2. **Habit Design**
Voor elke kernwaarde, ontwerp gewoonten die deze waarde demonstreren:

**Voorbeeld - Excellence:**
- [ ] Dagelijkse leesroutine
- [ ] Regelmatige feedback vragen
- [ ] Continu leren en ontwikkelen
- [ ] Kwaliteit in alle taken

**Voorbeeld - Service:**
- [ ] Dagelijkse acten van vriendelijkheid
- [ ] Mentorschap of coaching
- [ ] Bijdragen aan de gemeenschap
- [ ] Anderen helpen groeien

### 3. **Environment Design**
Creëer een omgeving die je identiteit ondersteunt:

**Fysieke omgeving:**
- Inspirerende quotes en beelden
- Boeken en materialen die je waarden reflecteren
- Ruimte voor gewoonten en routines

**Sociale omgeving:**
- Mensen die je waarden delen
- Mentors en rolmodellen
- Accountability partners

**Digitale omgeving:**
- Positieve content en inspiratie
- Productiviteit tools
- Leerplatforms en cursussen

## Praktische oefeningen voor je Top Tier identiteit:

### Oefening 1: Dagelijkse Identiteit Check-in
Elke ochtend, vraag jezelf:
- Wie wil ik vandaag zijn?
- Welke waarden wil ik vandaag demonstreren?
- Welke acties zullen mijn identiteit versterken?

### Oefening 2: Identity-Based Decision Making
Voor elke beslissing, vraag jezelf:
- Is dit in lijn met mijn kernwaarden?
- Zal dit mijn Top Tier identiteit versterken?
- Ben ik trots op deze keuze?

### Oefening 3: Identity Reflection
Elke avond, reflecteer:
- Heb ik vandaag geleefd volgens mijn waarden?
- Welke momenten versterkten mijn identiteit?
- Wat kan ik morgen beter doen?

### Oefening 4: Identity Visualization
Visualiseer jezelf als je Top Tier versie:
- Hoe ziet je ideale zelf eruit?
- Hoe gedraagt deze persoon zich?
- Wat zijn de dagelijkse gewoonten?
- Hoe voelt het om deze persoon te zijn?

## Je Top Tier identiteit in actie:

### Dagelijkse praktijken:
- [ ] Begin elke dag met je identiteit in gedachten
- [ ] Maak beslissingen gebaseerd op je waarden
- [ ] Demonstreer je kernwaarden in elke interactie
- [ ] Reflecteer en vier je voortgang

### Wekelijkse evaluatie:
- [ ] Review je identiteit ontwikkeling
- [ ] Identificeer gebieden voor groei
- [ ] Plan acties voor de komende week
- [ ] Pas je doelen aan indien nodig

### Maandelijkse reflectie:
- [ ] Diepe evaluatie van je identiteit
- [ ] Vier successen en overwinningen
- [ ] Stel nieuwe doelen en uitdagingen
- [ ] Plan voor de komende maand

## Veelgemaakte fouten:

### 1. **Perfectionisme**
- Fout: Proberen perfect te zijn
- Oplossing: Focus op progressie en groei

### 2. **Vergelijking met anderen**
- Fout: Jezelf vergelijken met anderen
- Oplossing: Focus op je eigen reis en groei

### 3. **Onrealistische verwachtingen**
- Fout: Te snel te veel willen
- Oplossing: Kleine stappen en geduld

### 4. **Geen actie**
- Fout: Alleen denken, niet doen
- Oplossing: Dagelijkse actie en consistentie

## Belangrijke inzichten:

- Je identiteit is een werk in uitvoering
- Kleine dagelijkse acties leiden tot grote veranderingen
- Consistentie is belangrijker dan perfectie
- Je kunt je identiteit bewust veranderen
- Authenticiteit is de sleutel tot duurzaam succes

## Volgende stappen:

1. **Voltooi alle oefeningen** in deze les
2. **Definieer je Top Tier identiteit**
3. **Ontwerp je dagelijkse routines**
4. **Begin met kleine acties**
5. **Blijf consistent en geduldig**

## Afsluiting van de module:

Gefeliciteerd! Je hebt nu de fundamenten van discipline en identiteit gelegd. Deze module is de basis voor alle andere modules in je Top Tier Men reis.

**Onthoud:**
- Discipline is een levensstijl, geen inspanning
- Je identiteit bepaalt je gedrag en resultaten
- Kernwaarden zijn je innerlijke kompas
- Consistentie is belangrijker dan perfectie
- Je bent altijd in ontwikkeling

Door deze principes toe te passen, bouw je een sterke fundering voor succes in alle aspecten van je leven. Je bent nu klaar om door te gaan naar de volgende modules en je Top Tier potentieel te ontsluiten!`;

    await supabase
      .from('academy_lessons')
      .update({
        title: 'Ontdek je kernwaarden en bouw je Top Tier identiteit',
        duration: '45 minuten',
        type: 'video',
        status: 'published',
        order_index: 5,
        content: lesson5Content,
        updated_at: new Date().toISOString()
      })
      .eq('module_id', module.id)
      .eq('order_index', 5);

    updateResults.push({ lesson: 5, title: 'Ontdek je kernwaarden en bouw je Top Tier identiteit', status: 'updated' });

    console.log('✅ Discipline & Identiteit module fully updated');

    return NextResponse.json({
      success: true,
      message: 'Discipline & Identiteit module fully updated with comprehensive content',
      results: updateResults,
      total_lessons_updated: updateResults.length
    });

  } catch (error) {
    console.error('❌ Error updating Discipline module:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update Discipline module: ${error}` 
    });
  }
} 