require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Detailed content for each Testosteron lesson in Markdown format
const testosteronLessonContent = {
  'Wat is Testosteron': `
# Wat is Testosteron?

Testosteron is het belangrijkste mannelijke geslachtshormoon dat een cruciale rol speelt in je fysieke en mentale welzijn. Het wordt voornamelijk geproduceerd in de testikels en in kleinere hoeveelheden in de bijnieren.

## De Belangrijkste Functies van Testosteron:

- **Spiermassa en Kracht:** Testosteron stimuleert eiwitsynthese en spiergroei
- **Botdichtheid:** Versterkt je botten en voorkomt osteoporose
- **Energie en Uithoudingsvermogen:** Verhoogt je energieniveau en vermindert vermoeidheid
- **Libido en Seksuele Functie:** Cruciaal voor een gezond seksleven
- **Mentale Scherpte:** Verbetert focus, geheugen en cognitieve functies
- **Gemoedstoestand:** Helpt bij het reguleren van stemming en zelfvertrouwen
- **Vetverbranding:** Ondersteunt een gezond lichaamsgewicht

## Normale Testosteronwaarden:

Voor mannen tussen 19-39 jaar liggen de normale waarden tussen 264-916 ng/dL. Deze waarden dalen natuurlijk met ongeveer 1-2% per jaar na je 30ste.

## Waarom is dit Belangrijk?

Lage testosteronwaarden kunnen leiden tot:

- Verminderde spierkracht en massa
- Toename van lichaamsvet
- Vermoeidheid en gebrek aan energie
- Depressie en stemmingswisselingen
- Verminderd libido
- Concentratieproblemen

In deze module leer je hoe je je testosteronwaarden natuurlijk kunt optimaliseren en welke factoren je hormoonhuishouding beïnvloeden.
  `,
  
  'De Kracht van Hoog Testosteron': `
# De Kracht van Hoog Testosteron

Wanneer je testosteronwaarden optimaal zijn, ervaar je een transformatie in je fysieke en mentale prestaties die je leven fundamenteel verandert.

## Fysieke Voordelen van Hoge Testosteron:

- **Snellere Spiergroei:** Je lichaam bouwt efficiënter spiermassa op
- **Betere Herstel:** Je herstelt sneller van trainingen en stress
- **Verhoogde Kracht:** Je kunt zwaardere gewichten tillen en langer trainen
- **Verbeterde Uithouding:** Je hebt meer energie voor dagelijkse activiteiten
- **Efficiëntere Vetverbranding:** Je lichaam verbrandt vet als brandstof
- **Sterkere Botten:** Verhoogde botdichtheid en minder risico op blessures

## Mentale en Emotionele Voordelen:

- **Verhoogd Zelfvertrouwen:** Je voelt je zelfverzekerder in sociale situaties
- **Betere Focus:** Je kunt je langer concentreren op taken
- **Verhoogde Motivatie:** Je hebt meer drive om je doelen te bereiken
- **Stabielere Stemming:** Minder stemmingswisselingen en depressieve gevoelens
- **Verbeterd Geheugen:** Betere cognitieve functies en herinnering
- **Verhoogd Libido:** Gezonder seksleven en intimiteit

## Sociale en Professionele Impact:

Hoge testosteronwaarden hebben ook invloed op hoe anderen je waarnemen:

- Je straalt meer autoriteit en leiderschap uit
- Mensen nemen je serieuzer in professionele settings
- Je hebt meer charisma en aantrekkingskracht
- Betere prestaties in competitieve situaties

## Lange-termijn Gezondheidsvoordelen:

- Lager risico op hart- en vaatziekten
- Betere insulinegevoeligheid
- Verhoogde levensverwachting
- Betere kwaliteit van leven op latere leeftijd

Het optimaliseren van je testosteron is niet alleen voor je fysieke prestaties - het is een investering in je totale welzijn en levenskwaliteit.
  `,
  
  'Testosteron Killers: Wat moet je Elimineren': `
# Testosteron Killers: Wat moet je Elimineren

Veel aspecten van het moderne leven zijn verwoestend voor je testosteronproductie. Hier zijn de belangrijkste factoren die je moet vermijden of minimaliseren.

## 1. Slechte Slaapkwaliteit

**Impact:** Slaaptekort kan je testosteron met 10-15% verlagen

- Streef naar 7-9 uur kwaliteitsslaap per nacht
- Vermijd blauw licht 2-3 uur voor het slapen
- Houd je slaapkamer koel en donker
- Stel een consistent slaapschema in

## 2. Chronische Stress

**Impact:** Cortisol (stresshormoon) blokkeert testosteronproductie

- Beoefen dagelijkse stressmanagement technieken
- Meditatie, ademhalingsoefeningen, of yoga
- Neem regelmatig tijd voor ontspanning
- Vermijd overtraining en burnout

## 3. Slechte Voeding

**Vermijd:**

- Overmatige suiker en geraffineerde koolhydraten
- Transvetten en bewerkte voedingsmiddelen
- Overmatig alcoholgebruik
- Te weinig gezonde vetten
- Calorietekort op lange termijn

## 4. Sedentaire Levensstijl

**Impact:** Weinig beweging verlaagt testosteron significant

- Doe regelmatig krachttraining (3-4x per week)
- Incorporeer HIIT trainingen
- Neem regelmatig wandelingen
- Vermijd langdurig zitten

## 5. Overgewicht en Visceraal Vet

**Impact:** Vetweefsel zet testosteron om in oestrogeen

- Focus op het verliezen van buikvet
- Combineer voeding met training
- Monitor je lichaamscompositie

## 6. Omgevingsfactoren

- **Xeno-oestrogenen:** In plastic, cosmetica, en pesticiden
- **Lage Vitamine D:** Zorg voor voldoende zonlicht of suppletie
- **Gebrek aan Zink:** Essentieel mineraal voor testosteronproductie

## 7. Medicatie en Drugs

- Vermijd anabole steroïden (tenzij medisch voorgeschreven)
- Wees voorzichtig met pijnstillers
- Vermijd recreatieve drugs
- Overleg met arts over medicatie die testosteron kan beïnvloeden

## Praktische Actiepunten:

1. Begin met het verbeteren van je slaapkwaliteit
2. Implementeer stressmanagement in je dagelijkse routine
3. Elimineer de grootste voedingsboosdoeners
4. Start met regelmatige krachttraining
5. Test je vitamine D en zink niveaus

Door deze testosteron killers te elimineren, creëer je de optimale omgeving voor je lichaam om natuurlijk hoge testosteronwaarden te produceren.
  `,
  
  'De Waarheid over Testosteron Doping': `
# De Waarheid over Testosteron Doping

Er is veel verwarring en misinformatie over testosteron doping en anabole steroïden. Het is cruciaal om de feiten te kennen voordat je overweegt om deze route te nemen.

## Wat zijn Anabole Steroïden?

Anabole steroïden zijn synthetische versies van testosteron die worden gebruikt om spiergroei en atletische prestaties te verbeteren. Ze zijn illegaal zonder medisch voorschrift in de meeste landen.

## De Risico's van Illegale Steroïden:

- **Leverproblemen:** Hepatotoxiciteit en leverziekte
- **Hart- en vaatziekten:** Verhoogde bloeddruk en cholesterol
- **Psychologische Effecten:** Agressie, stemmingswisselingen, depressie
- **Hormonale Disbalans:** Onderdrukking van natuurlijke testosteronproductie
- **Vruchtbaarheidsproblemen:** Verminderde spermakwaliteit
- **Gynaecomastie:** Ontwikkeling van borstweefsel bij mannen
- **Acne en Haaruitval:** Androgene bijwerkingen

## Waarom Mensen Steroïden Gebruiken:

- Snellere resultaten dan natuurlijke training
- Druk van sociale media en fitness industrie
- Onrealistische verwachtingen over lichaamsbouw
- Competitieve druk in sport
- Gebrek aan geduld voor natuurlijke progressie

## De Realiteit van Steroïden:

- **Resultaten zijn Tijdelijk:** Spiergroei verdwijnt vaak na stoppen
- **Natuurlijke Productie Stopt:** Je lichaam stopt met het maken van testosteron
- **Post-Cycle Problemen:** Moeilijke periode na het stoppen
- **Afhankelijkheid:** Psychologische en fysieke afhankelijkheid
- **Kwaliteit van Leven:** Vaak verslechtering van algehele gezondheid

## Legale Alternatieven:

- **Natuurlijke Testosteron Optimalisatie:** Voeding, training, slaap
- **Voedingssupplementen:** Vitamine D, zink, magnesium
- **Lifestyle Veranderingen:** Stressmanagement, gewichtsverlies
- **Medische TRT:** Alleen onder medisch toezicht

## Wanneer is TRT (Testosteron Replacement Therapy) Geïndiceerd?

TRT wordt alleen voorgeschreven voor mannen met klinisch lage testosteronwaarden:

- Testosteron onder 300 ng/dL
- Duidelijke symptomen van lage testosteron
- Uitsluiting van andere oorzaken
- Onder strikt medisch toezicht

## Mijn Visie:

Als fitness professional en coach geloof ik sterk in het natuurlijke pad. De risico's van illegale steroïden wegen zelden op tegen de voordelen. Focus op:

- Consistente training en voeding
- Geduld en realistische verwachtingen
- Lange-termijn gezondheid boven snelle resultaten
- Professionele begeleiding bij twijfel

De beste versie van jezelf bouw je op een duurzame, gezonde manier - niet door je gezondheid te riskeren voor tijdelijke gains.
  `,
  
  'TRT en mijn Visie': `
# TRT en mijn Visie

Testosteron Replacement Therapy (TRT) is een complex en vaak controversieel onderwerp. Hier deel ik mijn eerlijke visie gebaseerd op jarenlange ervaring in de fitness industrie.

## Wat is TRT?

TRT is een medische behandeling waarbij testosteron wordt toegediend aan mannen met klinisch lage testosteronwaarden. Het wordt alleen voorgeschreven door gekwalificeerde artsen na uitgebreide diagnostiek.

## Wanneer is TRT Echt Nodig?

- **Primaire Hypogonadisme:** Testikels produceren onvoldoende testosteron
- **Secundaire Hypogonadisme:** Hersenen sturen onvoldoende signalen
- **Leeftijdsgerelateerde Daling:** Natuurlijke afname na 40-50 jaar
- **Medische Aandoeningen:** Bepaalde ziekten die testosteron beïnvloeden

## De Diagnostische Criteria:

- Testosteron onder 300 ng/dL (gemeten in de ochtend)
- Duidelijke symptomen van lage testosteron
- Uitsluiting van andere oorzaken
- Meerdere metingen over tijd

## Mijn Visie op TRT:

### ✅ Wanneer ik TRT Ondersteun:

- Bij bewezen klinisch lage testosteron
- Wanneer alle natuurlijke methoden zijn uitgeput
- Onder strikt medisch toezicht
- Bij mannen die echt lijden onder de symptomen
- Als onderdeel van een holistische gezondheidsaanpak

### ❌ Wanneer ik TRT Niet Ondersteun:

- Voor snelle spiergroei of atletische prestaties
- Zonder eerst natuurlijke optimalisatie te proberen
- Bij normale testosteronwaarden
- Zonder medische begeleiding
- Als vervanging voor gezonde levensstijl

## Het Natuurlijke Pad Eerst:

Voordat je TRT overweegt, moet je eerst alle natuurlijke methoden uitputten:

1. **Optimaliseer je slaap:** 7-9 uur kwaliteitsslaap
2. **Verbeter je voeding:** Gezonde vetten, eiwitten, micronutriënten
3. **Start krachttraining:** 3-4x per week intensieve training
4. **Beheer stress:** Meditatie, ademhaling, ontspanning
5. **Verlies overtollig vet:** Focus op buikvet reductie
6. **Test je micronutriënten:** Vitamine D, zink, magnesium

## De Risico's van Onnodige TRT:

- Onderdrukking van natuurlijke testosteronproductie
- Afhankelijkheid van externe testosteron
- Potentiële bijwerkingen en gezondheidsrisico's
- Hoge kosten op lange termijn
- Mogelijke vruchtbaarheidsproblemen

## Mijn Aanbeveling:

Als je vermoedt dat je lage testosteron hebt:

1. Begin met het optimaliseren van je levensstijl
2. Laat je testosteron meten door een arts
3. Zoek een endocrinoloog of uroloog met TRT ervaring
4. Vraag om uitgebreide diagnostiek
5. Overweeg TRT alleen als laatste redmiddel

## De Toekomst van TRT:

TRT wordt steeds meer geaccepteerd als legitieme medische behandeling, maar het moet verantwoordelijk worden gebruikt. De focus moet liggen op het verbeteren van kwaliteit van leven, niet op cosmetische doelen.

**Mijn boodschap:** TRT kan levensveranderend zijn voor de juiste persoon, maar het is geen wondermiddel. De beste aanpak is altijd eerst je natuurlijke potentieel te maximaliseren voordat je externe interventies overweegt.
  `
};

async function fixTestosteronLessonContentMarkdown() {
  try {
    console.log('🔧 Fixing Testosteron lesson content with Markdown formatting...\n');

    // 1. Find the Testosteron module
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('slug', 'test');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    if (!modules || modules.length === 0) {
      console.log('❌ Testosteron module not found');
      return;
    }

    const testosteronModule = modules[0];
    console.log(`✅ Found Testosteron module: "${testosteronModule.title}" (ID: ${testosteronModule.id})`);

    // 2. Get all lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .eq('module_id', testosteronModule.id)
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons in Testosteron module\n`);

    // 3. Update each lesson with Markdown content
    let updatedCount = 0;
    let skippedCount = 0;

    for (const lesson of lessons || []) {
      const content = testosteronLessonContent[lesson.title];
      
      if (content) {
        console.log(`📝 Updating lesson: "${lesson.title}"`);
        
        const { error: updateError } = await supabase
          .from('academy_lessons')
          .update({ 
            content: content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', lesson.id);

        if (updateError) {
          console.error(`❌ Error updating lesson "${lesson.title}":`, updateError);
        } else {
          console.log(`✅ Successfully updated lesson: "${lesson.title}"`);
          updatedCount++;
        }
      } else {
        console.log(`⚠️ No content template found for lesson: "${lesson.title}"`);
        skippedCount++;
      }
    }

    console.log(`\n🎉 Markdown content update completed!`);
    console.log(`✅ Updated: ${updatedCount} lessons`);
    console.log(`⚠️ Skipped: ${skippedCount} lessons (no template)`);

    // 4. Show summary of all lessons
    console.log('\n📋 Testosteron Module Lessons Summary:');
    lessons?.forEach((lesson, index) => {
      const hasContent = lesson.content && lesson.content.length > 100;
      const status = hasContent ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${lesson.title}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixTestosteronLessonContentMarkdown();
