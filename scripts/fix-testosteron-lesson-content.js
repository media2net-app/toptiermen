require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Detailed content for each Testosteron lesson
const testosteronLessonContent = {
  'Wat is Testosteron': `
    <h2>Wat is Testosteron?</h2>
    
    <p>Testosteron is het belangrijkste mannelijke geslachtshormoon dat een cruciale rol speelt in je fysieke en mentale welzijn. Het wordt voornamelijk geproduceerd in de testikels en in kleinere hoeveelheden in de bijnieren.</p>
    
    <h3>De Belangrijkste Functies van Testosteron:</h3>
    <ul>
      <li><strong>Spiermassa en Kracht:</strong> Testosteron stimuleert eiwitsynthese en spiergroei</li>
      <li><strong>Botdichtheid:</strong> Versterkt je botten en voorkomt osteoporose</li>
      <li><strong>Energie en Uithoudingsvermogen:</strong> Verhoogt je energieniveau en vermindert vermoeidheid</li>
      <li><strong>Libido en Seksuele Functie:</strong> Cruciaal voor een gezond seksleven</li>
      <li><strong>Mentale Scherpte:</strong> Verbetert focus, geheugen en cognitieve functies</li>
      <li><strong>Gemoedstoestand:</strong> Helpt bij het reguleren van stemming en zelfvertrouwen</li>
      <li><strong>Vetverbranding:</strong> Ondersteunt een gezond lichaamsgewicht</li>
    </ul>
    
    <h3>Normale Testosteronwaarden:</h3>
    <p>Voor mannen tussen 19-39 jaar liggen de normale waarden tussen 264-916 ng/dL. Deze waarden dalen natuurlijk met ongeveer 1-2% per jaar na je 30ste.</p>
    
    <h3>Waarom is dit Belangrijk?</h3>
    <p>Lage testosteronwaarden kunnen leiden tot:</p>
    <ul>
      <li>Verminderde spierkracht en massa</li>
      <li>Toename van lichaamsvet</li>
      <li>Vermoeidheid en gebrek aan energie</li>
      <li>Depressie en stemmingswisselingen</li>
      <li>Verminderd libido</li>
      <li>Concentratieproblemen</li>
    </ul>
    
    <p>In deze module leer je hoe je je testosteronwaarden natuurlijk kunt optimaliseren en welke factoren je hormoonhuishouding beïnvloeden.</p>
  `,
  
  'De Kracht van Hoog Testosteron': `
    <h2>De Kracht van Hoog Testosteron</h2>
    
    <p>Wanneer je testosteronwaarden optimaal zijn, ervaar je een transformatie in je fysieke en mentale prestaties die je leven fundamenteel verandert.</p>
    
    <h3>Fysieke Voordelen van Hoge Testosteron:</h3>
    <ul>
      <li><strong>Snellere Spiergroei:</strong> Je lichaam bouwt efficiënter spiermassa op</li>
      <li><strong>Betere Herstel:</strong> Je herstelt sneller van trainingen en stress</li>
      <li><strong>Verhoogde Kracht:</strong> Je kunt zwaardere gewichten tillen en langer trainen</li>
      <li><strong>Verbeterde Uithouding:</strong> Je hebt meer energie voor dagelijkse activiteiten</li>
      <li><strong>Efficiëntere Vetverbranding:</strong> Je lichaam verbrandt vet als brandstof</li>
      <li><strong>Sterkere Botten:</strong> Verhoogde botdichtheid en minder risico op blessures</li>
    </ul>
    
    <h3>Mentale en Emotionele Voordelen:</h3>
    <ul>
      <li><strong>Verhoogd Zelfvertrouwen:</strong> Je voelt je zelfverzekerder in sociale situaties</li>
      <li><strong>Betere Focus:</strong> Je kunt je langer concentreren op taken</li>
      <li><strong>Verhoogde Motivatie:</strong> Je hebt meer drive om je doelen te bereiken</li>
      <li><strong>Stabielere Stemming:</strong> Minder stemmingswisselingen en depressieve gevoelens</li>
      <li><strong>Verbeterd Geheugen:</strong> Betere cognitieve functies en herinnering</li>
      <li><strong>Verhoogd Libido:</strong> Gezonder seksleven en intimiteit</li>
    </ul>
    
    <h3>Sociale en Professionele Impact:</h3>
    <p>Hoge testosteronwaarden hebben ook invloed op hoe anderen je waarnemen:</p>
    <ul>
      <li>Je straalt meer autoriteit en leiderschap uit</li>
      <li>Mensen nemen je serieuzer in professionele settings</li>
      <li>Je hebt meer charisma en aantrekkingskracht</li>
      <li>Betere prestaties in competitieve situaties</li>
    </ul>
    
    <h3>Lange-termijn Gezondheidsvoordelen:</h3>
    <ul>
      <li>Lager risico op hart- en vaatziekten</li>
      <li>Betere insulinegevoeligheid</li>
      <li>Verhoogde levensverwachting</li>
      <li>Betere kwaliteit van leven op latere leeftijd</li>
    </ul>
    
    <p>Het optimaliseren van je testosteron is niet alleen voor je fysieke prestaties - het is een investering in je totale welzijn en levenskwaliteit.</p>
  `,
  
  'Testosteron Killers: Wat moet je Elimineren': `
    <h2>Testosteron Killers: Wat moet je Elimineren</h2>
    
    <p>Veel aspecten van het moderne leven zijn verwoestend voor je testosteronproductie. Hier zijn de belangrijkste factoren die je moet vermijden of minimaliseren.</p>
    
    <h3>1. Slechte Slaapkwaliteit</h3>
    <p><strong>Impact:</strong> Slaaptekort kan je testosteron met 10-15% verlagen</p>
    <ul>
      <li>Streef naar 7-9 uur kwaliteitsslaap per nacht</li>
      <li>Vermijd blauw licht 2-3 uur voor het slapen</li>
      <li>Houd je slaapkamer koel en donker</li>
      <li>Stel een consistent slaapschema in</li>
    </ul>
    
    <h3>2. Chronische Stress</h3>
    <p><strong>Impact:</strong> Cortisol (stresshormoon) blokkeert testosteronproductie</p>
    <ul>
      <li>Beoefen dagelijkse stressmanagement technieken</li>
      <li>Meditatie, ademhalingsoefeningen, of yoga</li>
      <li>Neem regelmatig tijd voor ontspanning</li>
      <li>Vermijd overtraining en burnout</li>
    </ul>
    
    <h3>3. Slechte Voeding</h3>
    <p><strong>Vermijd:</strong></p>
    <ul>
      <li>Overmatige suiker en geraffineerde koolhydraten</li>
      <li>Transvetten en bewerkte voedingsmiddelen</li>
      <li>Overmatig alcoholgebruik</li>
      <li>Te weinig gezonde vetten</li>
      <li>Calorietekort op lange termijn</li>
    </ul>
    
    <h3>4. Sedentaire Levensstijl</h3>
    <p><strong>Impact:</strong> Weinig beweging verlaagt testosteron significant</p>
    <ul>
      <li>Doe regelmatig krachttraining (3-4x per week)</li>
      <li>Incorporeer HIIT trainingen</li>
      <li>Neem regelmatig wandelingen</li>
      <li>Vermijd langdurig zitten</li>
    </ul>
    
    <h3>5. Overgewicht en Visceraal Vet</h3>
    <p><strong>Impact:</strong> Vetweefsel zet testosteron om in oestrogeen</p>
    <ul>
      <li>Focus op het verliezen van buikvet</li>
      <li>Combineer voeding met training</li>
      <li>Monitor je lichaamscompositie</li>
    </ul>
    
    <h3>6. Omgevingsfactoren</h3>
    <ul>
      <li><strong>Xeno-oestrogenen:</strong> In plastic, cosmetica, en pesticiden</li>
      <li><strong>Lage Vitamine D:</strong> Zorg voor voldoende zonlicht of suppletie</li>
      <li><strong>Gebrek aan Zink:</strong> Essentieel mineraal voor testosteronproductie</li>
    </ul>
    
    <h3>7. Medicatie en Drugs</h3>
    <ul>
      <li>Vermijd anabole steroïden (tenzij medisch voorgeschreven)</li>
      <li>Wees voorzichtig met pijnstillers</li>
      <li>Vermijd recreatieve drugs</li>
      <li>Overleg met arts over medicatie die testosteron kan beïnvloeden</li>
    </ul>
    
    <h3>Praktische Actiepunten:</h3>
    <ol>
      <li>Begin met het verbeteren van je slaapkwaliteit</li>
      <li>Implementeer stressmanagement in je dagelijkse routine</li>
      <li>Elimineer de grootste voedingsboosdoeners</li>
      <li>Start met regelmatige krachttraining</li>
      <li>Test je vitamine D en zink niveaus</li>
    </ol>
    
    <p>Door deze testosteron killers te elimineren, creëer je de optimale omgeving voor je lichaam om natuurlijk hoge testosteronwaarden te produceren.</p>
  `,
  
  'De Waarheid over Testosteron Doping': `
    <h2>De Waarheid over Testosteron Doping</h2>
    
    <p>Er is veel verwarring en misinformatie over testosteron doping en anabole steroïden. Het is cruciaal om de feiten te kennen voordat je overweegt om deze route te nemen.</p>
    
    <h3>Wat zijn Anabole Steroïden?</h3>
    <p>Anabole steroïden zijn synthetische versies van testosteron die worden gebruikt om spiergroei en atletische prestaties te verbeteren. Ze zijn illegaal zonder medisch voorschrift in de meeste landen.</p>
    
    <h3>De Risico's van Illegale Steroïden:</h3>
    <ul>
      <li><strong>Leverproblemen:</strong> Hepatotoxiciteit en leverziekte</li>
      <li><strong>Hart- en vaatziekten:</strong> Verhoogde bloeddruk en cholesterol</li>
      <li><strong>Psychologische Effecten:</strong> Agressie, stemmingswisselingen, depressie</li>
      <li><strong>Hormonale Disbalans:</strong> Onderdrukking van natuurlijke testosteronproductie</li>
      <li><strong>Vruchtbaarheidsproblemen:</strong> Verminderde spermakwaliteit</li>
      <li><strong>Gynaecomastie:</strong> Ontwikkeling van borstweefsel bij mannen</li>
      <li><strong>Acne en Haaruitval:</strong> Androgene bijwerkingen</li>
    </ul>
    
    <h3>Waarom Mensen Steroïden Gebruiken:</h3>
    <ul>
      <li>Snellere resultaten dan natuurlijke training</li>
      <li>Druk van sociale media en fitness industrie</li>
      <li>Onrealistische verwachtingen over lichaamsbouw</li>
      <li>Competitieve druk in sport</li>
      <li>Gebrek aan geduld voor natuurlijke progressie</li>
    </ul>
    
    <h3>De Realiteit van Steroïden:</h3>
    <ul>
      <li><strong>Resultaten zijn Tijdelijk:</strong> Spiergroei verdwijnt vaak na stoppen</li>
      <li><strong>Natuurlijke Productie Stopt:</strong> Je lichaam stopt met het maken van testosteron</li>
      <li><strong>Post-Cycle Problemen:</strong> Moeilijke periode na het stoppen</li>
      <li><strong>Afhankelijkheid:</strong> Psychologische en fysieke afhankelijkheid</li>
      <li><strong>Kwaliteit van Leven:</strong> Vaak verslechtering van algehele gezondheid</li>
    </ul>
    
    <h3>Legale Alternatieven:</h3>
    <ul>
      <li><strong>Natuurlijke Testosteron Optimalisatie:</strong> Voeding, training, slaap</li>
      <li><strong>Voedingssupplementen:</strong> Vitamine D, zink, magnesium</li>
      <li><strong>Lifestyle Veranderingen:</strong> Stressmanagement, gewichtsverlies</li>
      <li><strong>Medische TRT:</strong> Alleen onder medisch toezicht</li>
    </ul>
    
    <h3>Wanneer is TRT (Testosteron Replacement Therapy) Geïndiceerd?</h3>
    <p>TRT wordt alleen voorgeschreven voor mannen met klinisch lage testosteronwaarden:</p>
    <ul>
      <li>Testosteron onder 300 ng/dL</li>
      <li>Duidelijke symptomen van lage testosteron</li>
      <li>Uitsluiting van andere oorzaken</li>
      <li>Onder strikt medisch toezicht</li>
    </ul>
    
    <h3>Mijn Visie:</h3>
    <p>Als fitness professional en coach geloof ik sterk in het natuurlijke pad. De risico's van illegale steroïden wegen zelden op tegen de voordelen. Focus op:</p>
    <ul>
      <li>Consistente training en voeding</li>
      <li>Geduld en realistische verwachtingen</li>
      <li>Lange-termijn gezondheid boven snelle resultaten</li>
      <li>Professionele begeleiding bij twijfel</li>
    </ul>
    
    <p>De beste versie van jezelf bouw je op een duurzame, gezonde manier - niet door je gezondheid te riskeren voor tijdelijke gains.</p>
  `,
  
  'TRT en mijn Visie': `
    <h2>TRT en mijn Visie</h2>
    
    <p>Testosteron Replacement Therapy (TRT) is een complex en vaak controversieel onderwerp. Hier deel ik mijn eerlijke visie gebaseerd op jarenlange ervaring in de fitness industrie.</p>
    
    <h3>Wat is TRT?</h3>
    <p>TRT is een medische behandeling waarbij testosteron wordt toegediend aan mannen met klinisch lage testosteronwaarden. Het wordt alleen voorgeschreven door gekwalificeerde artsen na uitgebreide diagnostiek.</p>
    
    <h3>Wanneer is TRT Echt Nodig?</h3>
    <ul>
      <li><strong>Primaire Hypogonadisme:</strong> Testikels produceren onvoldoende testosteron</li>
      <li><strong>Secundaire Hypogonadisme:</strong> Hersenen sturen onvoldoende signalen</li>
      <li><strong>Leeftijdsgerelateerde Daling:</strong> Natuurlijke afname na 40-50 jaar</li>
      <li><strong>Medische Aandoeningen:</strong> Bepaalde ziekten die testosteron beïnvloeden</li>
    </ul>
    
    <h3>De Diagnostische Criteria:</h3>
    <ul>
      <li>Testosteron onder 300 ng/dL (gemeten in de ochtend)</li>
      <li>Duidelijke symptomen van lage testosteron</li>
      <li>Uitsluiting van andere oorzaken</li>
      <li>Meerdere metingen over tijd</li>
    </ul>
    
    <h3>Mijn Visie op TRT:</h3>
    
    <h4>✅ Wanneer ik TRT Ondersteun:</h4>
    <ul>
      <li>Bij bewezen klinisch lage testosteron</li>
      <li>Wanneer alle natuurlijke methoden zijn uitgeput</li>
      <li>Onder strikt medisch toezicht</li>
      <li>Bij mannen die echt lijden onder de symptomen</li>
      <li>Als onderdeel van een holistische gezondheidsaanpak</li>
    </ul>
    
    <h4>❌ Wanneer ik TRT Niet Ondersteun:</h4>
    <ul>
      <li>Voor snelle spiergroei of atletische prestaties</li>
      <li>Zonder eerst natuurlijke optimalisatie te proberen</li>
      <li>Bij normale testosteronwaarden</li>
      <li>Zonder medische begeleiding</li>
      <li>Als vervanging voor gezonde levensstijl</li>
    </ul>
    
    <h3>Het Natuurlijke Pad Eerst:</h3>
    <p>Voordat je TRT overweegt, moet je eerst alle natuurlijke methoden uitputten:</p>
    <ol>
      <li><strong>Optimaliseer je slaap:</strong> 7-9 uur kwaliteitsslaap</li>
      <li><strong>Verbeter je voeding:</strong> Gezonde vetten, eiwitten, micronutriënten</li>
      <li><strong>Start krachttraining:</strong> 3-4x per week intensieve training</li>
      <li><strong>Beheer stress:</strong> Meditatie, ademhaling, ontspanning</li>
      <li><strong>Verlies overtollig vet:</strong> Focus op buikvet reductie</li>
      <li><strong>Test je micronutriënten:</strong> Vitamine D, zink, magnesium</li>
    </ol>
    
    <h3>De Risico's van Onnodige TRT:</h3>
    <ul>
      <li>Onderdrukking van natuurlijke testosteronproductie</li>
      <li>Afhankelijkheid van externe testosteron</li>
      <li>Potentiële bijwerkingen en gezondheidsrisico's</li>
      <li>Hoge kosten op lange termijn</li>
      <li>Mogelijke vruchtbaarheidsproblemen</li>
    </ul>
    
    <h3>Mijn Aanbeveling:</h3>
    <p>Als je vermoedt dat je lage testosteron hebt:</p>
    <ol>
      <li>Begin met het optimaliseren van je levensstijl</li>
      <li>Laat je testosteron meten door een arts</li>
      <li>Zoek een endocrinoloog of uroloog met TRT ervaring</li>
      <li>Vraag om uitgebreide diagnostiek</li>
      <li>Overweeg TRT alleen als laatste redmiddel</li>
    </ol>
    
    <h3>De Toekomst van TRT:</h3>
    <p>TRT wordt steeds meer geaccepteerd als legitieme medische behandeling, maar het moet verantwoordelijk worden gebruikt. De focus moet liggen op het verbeteren van kwaliteit van leven, niet op cosmetische doelen.</p>
    
    <p><strong>Mijn boodschap:</strong> TRT kan levensveranderend zijn voor de juiste persoon, maar het is geen wondermiddel. De beste aanpak is altijd eerst je natuurlijke potentieel te maximaliseren voordat je externe interventies overweegt.</p>
  `
};

async function fixTestosteronLessonContent() {
  try {
    console.log('🔧 Fixing Testosteron lesson content...\n');

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

    // 3. Update each lesson with detailed content
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

    console.log(`\n🎉 Content update completed!`);
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

fixTestosteronLessonContent();
