-- Insert lessons for module 3: Mindset & Focus
-- Run this SQL in your Supabase SQL editor

INSERT INTO academy_lessons (
    module_id,
    title,
    duration,
    type,
    status,
    order_index,
    views,
    completion_rate,
    video_url,
    content,
    created_at,
    updated_at
) VALUES 
(
    (SELECT id FROM academy_modules WHERE title = 'Mindset & Focus' LIMIT 1),
    'De Kracht van Mindset',
    '30m',
    'video',
    'published',
    1,
    0,
    0,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    '',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title = 'Mindset & Focus' LIMIT 1),
    'Growth vs Fixed Mindset',
    '25m',
    'text',
    'published',
    2,
    0,
    0,
    '',
    '<h2>Growth vs Fixed Mindset: De Fundamentele Verschillen</h2>

<p>Je mindset bepaalt hoe je naar uitdagingen, fouten en groei kijkt. Het verschil tussen een growth en fixed mindset kan je leven volledig veranderen.</p>

<h3>Fixed Mindset Kenmerken:</h3>
<ul>
<li>Gelooft dat intelligentie en talent vaststaan</li>
<li>Vermijdt uitdagingen uit angst om te falen</li>
<li>Geeft snel op bij obstakels</li>
<li>Ziet kritiek als persoonlijke aanval</li>
<li>Voelt zich bedreigd door succes van anderen</li>
</ul>

<h3>Growth Mindset Kenmerken:</h3>
<ul>
<li>Gelooft dat intelligentie en talent ontwikkeld kunnen worden</li>
<li>Omarmt uitdagingen als leerkansen</li>
<li>Persisteert bij obstakels en ziet ze als tijdelijke</li>
<li>Leert van kritiek en feedback</li>
<li>Inspireert zich aan succes van anderen</li>
</ul>

<h3>Praktische Oefeningen:</h3>

<h4>1. Dagelijkse Mindset Check</h4>
<p>Stel jezelf elke ochtend deze vragen:</p>
<ul>
<li>Welke uitdaging ga ik vandaag aan?</li>
<li>Wat kan ik leren van gisteren?</li>
<li>Hoe kan ik vandaag groeien?</li>
</ul>

<h4>2. Falen Herdefiniëren</h4>
<p>Zie falen niet als het einde, maar als feedback. Elke "fout" is een leermoment.</p>

<h4>3. Het Woord "Nog" Toevoegen</h4>
<p>In plaats van "Ik kan dit niet" → "Ik kan dit nog niet"</p>

<h3>Mindset Verandering in Actie:</h3>

<p><strong>Fixed:</strong> "Ik ben gewoon niet goed in wiskunde"<br>
<strong>Growth:</strong> "Ik moet nog meer oefenen met wiskunde"</p>

<p><strong>Fixed:</strong> "Hij is gewoon talentvol"<br>
<strong>Growth:</strong> "Hij heeft hard gewerkt om dat niveau te bereiken"</p>

<p><strong>Fixed:</strong> "Ik ben te oud om te veranderen"<br>
<strong>Growth:</strong> "Het is nooit te laat om te leren en groeien"</p>

<h3>Dagelijkse Praktijk:</h3>
<ol>
<li>Begin elke dag met een groei-georiënteerde affirmatie</li>
<li>Celebreer inspanning, niet alleen resultaat</li>
<li>Zoek feedback op en leer ervan</li>
<li>Omarm uitdagingen als groeikansen</li>
<li>Reflecteer dagelijks op je leermomenten</li>
</ol>

<p>Onthoud: Je mindset is geen vaststaand feit, maar een keuze die je elke dag opnieuw kunt maken. Kies voor groei.</p>',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title = 'Mindset & Focus' LIMIT 1),
    'Focus en Concentratie',
    '20m',
    'text',
    'published',
    3,
    0,
    0,
    '',
    '<h2>Focus en Concentratie: De Kunst van Diepe Aandacht</h2>

<p>In een wereld vol afleidingen is focus een superpower. Leer hoe je je concentratie kunt trainen en behouden.</p>

<h3>Waarom Focus Zo Belangrijk Is:</h3>
<ul>
<li>Verhoogt productiviteit en kwaliteit van werk</li>
<li>Vermindert stress en mentale vermoeidheid</li>
<li>Versnelt leren en vaardigheidsontwikkeling</li>
<li>Verbetert besluitvorming en probleemoplossing</li>
<li>Verhoogt gevoel van voldoening en flow</li>
</ul>

<h3>De Wet van Parkinson</h3>
<p>Werk vult de beschikbare tijd. Geef jezelf kortere, realistische deadlines om focus te verhogen.</p>

<h3>Focus Technieken:</h3>

<h4>1. Time Blocking</h4>
<p>Plan specifieke tijdsblokken voor verschillende taken. Bijvoorbeeld:</p>
<ul>
<li>09:00-10:30: Diep werk (geen afleidingen)</li>
<li>10:30-11:00: Pauze</li>
<li>11:00-12:00: Meetings/communicatie</li>
<li>12:00-13:00: Lunch</li>
<li>13:00-15:00: Diep werk</li>
</ul>

<h4>2. De Pomodoro Techniek</h4>
<ol>
<li>Kies een taak</li>
<li>Zet timer op 25 minuten</li>
<li>Werk zonder onderbreking</li>
<li>Neem 5 minuten pauze</li>
<li>Na 4 pomodoros, neem 15-30 minuten pauze</li>
</ol>

<h4>3. Omgevingsoptimalisatie</h4>
<ul>
<li>Verwijder visuele afleidingen</li>
<li>Gebruik noise-cancelling headphones</li>
<li>Zet telefoon op vliegtuigmodus</li>
<li>Sluit onnodige browser tabs</li>
<li>Werk in een opgeruimde ruimte</li>
</ul>

<h4>4. Mindful Focus</h4>
<p>Wanneer je merkt dat je afdwaalt:</p>
<ol>
<li>Erken de afleiding zonder oordeel</li>
<li>Adem diep in en uit</li>
<li>Breng je aandacht terug naar je taak</li>
<li>Herhaal zo vaak als nodig</li>
</ol>

<h3>Focus Oefeningen:</h3>

<h4>1. De 5-4-3-2-1 Oefening</h4>
<p>Neem 1 minuut om te focussen op:</p>
<ul>
<li>5 dingen die je kunt zien</li>
<li>4 dingen die je kunt aanraken</li>
<li>3 dingen die je kunt horen</li>
<li>2 dingen die je kunt ruiken</li>
<li>1 ding dat je kunt proeven</li>
</ul>

<h4>2. Single-Tasking</h4>
<p>Doe één ding tegelijk. Multitasking is een mythe en vermindert je effectiviteit.</p>

<h4>3. Focus Timer</h4>
<p>Begin met 10 minuten ononderbroken focus en bouw op naar langere periodes.</p>

<h3>Digitale Afleidingen Beheren:</h3>
<ul>
<li>Gebruik apps als Forest of Freedom</li>
<li>Zet notificaties uit tijdens focus tijd</li>
<li>Plan specifieke tijden voor social media</li>
<li>Gebruik website blockers tijdens werk</li>
<li>Houd je telefoon in een andere kamer</li>
</ul>

<h3>Focus Herstellen:</h3>
<p>Wanneer je focus weg is:</p>
<ol>
<li>Sta op en beweeg 5 minuten</li>
<li>Drink water</li>
<li>Doe een korte ademhalingsoefening</li>
<li>Begin opnieuw met een korte, haalbare taak</li>
</ol>

<h3>Dagelijkse Focus Ritueel:</h3>
<ol>
<li>Plan je belangrijkste taak de avond ervoor</li>
<li>Begin je dag met 30 minuten focus op die taak</li>
<li>Neem regelmatige pauzes</li>
<li>Evalueer je focus aan het einde van de dag</li>
</ol>

<p>Focus is een spier die je kunt trainen. Begin vandaag met kleine stappen en bouw geleidelijk op naar langere focus periodes.</p>',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title = 'Mindset & Focus' LIMIT 1),
    'Meditatie en Mindfulness',
    '35m',
    'video',
    'published',
    4,
    0,
    0,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    '',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title = 'Mindset & Focus' LIMIT 1),
    'Emotionele Intelligentie',
    '28m',
    'text',
    'published',
    5,
    0,
    0,
    '',
    '<h2>Emotionele Intelligentie: De Vergeten Superpower</h2>

<p>Emotionele intelligentie (EQ) is vaak belangrijker dan IQ voor succes in leven en werk. Leer hoe je je EQ kunt ontwikkelen.</p>

<h3>Wat is Emotionele Intelligentie?</h3>
<p>EQ bestaat uit vijf kerncomponenten:</p>

<h4>1. Zelfbewustzijn</h4>
<ul>
<li>Je eigen emoties herkennen en begrijpen</li>
<li>Weten hoe je emoties je gedrag beïnvloeden</li>
<li>Je sterke en zwakke punten kennen</li>
<li>Zelfvertrouwen hebben</li>
</ul>

<h4>2. Zelfregulering</h4>
<ul>
<li>Je emoties beheersen en controleren</li>
<li>Flexibel zijn en je aanpassen aan verandering</li>
<li>Betrouwbaar en integer zijn</li>
<li>Verantwoordelijkheid nemen voor je acties</li>
</ul>

<h4>3. Motivatie</h4>
<ul>
<li>Gedreven zijn door innerlijke doelen</li>
<li>Volharden bij tegenslagen</li>
<li>Optimistisch blijven</li>
<li>Hoge standaarden nastreven</li>
</ul>

<h4>4. Empathie</h4>
<ul>
<li>Anderen emoties begrijpen</li>
<li>Perspectief kunnen innemen</li>
<li>Service-georiënteerd zijn</li>
<li>Diversiteit waarderen</li>
</ul>

<h4>5. Sociale Vaardigheden</h4>
<ul>
<li>Effectief communiceren</li>
<li>Conflicten oplossen</li>
<li>Leiderschap tonen</li>
<li>Teams bouwen en samenwerken</li>
</ul>

<h3>EQ Ontwikkelen: Praktische Oefeningen</h3>

<h4>1. Emotie Dagboek</h4>
<p>Houd een dagboek bij van je emoties:</p>
<ul>
<li>Wanneer voelde je je gefrustreerd?</li>
<li>Wat triggerde die emotie?</li>
<li>Hoe reageerde je?</li>
<li>Wat had je anders kunnen doen?</li>
</ul>

<h4>2. De Pause Techniek</h4>
<p>Wanneer je een sterke emotie voelt:</p>
<ol>
<li>Stop en adem diep in</li>
<li>Identificeer de emotie</li>
<li>Vraag jezelf: "Wat wil deze emotie me vertellen?"</li>
<li>Kies een bewuste reactie</li>
</ol>

<h4>3. Empathie Oefening</h4>
<p>Oefen actief luisteren:</p>
<ul>
<li>Focus volledig op de spreker</li>
<li>Stel open vragen</li>
<li>Reflecteer wat je hoort</li>
<li>Valideer hun gevoelens</li>
</ul>

<h4>4. Emotie Labeling</h4>
<p>Leer je emoties preciezer te benoemen:</p>
<p>In plaats van "Ik voel me slecht" → "Ik voel me gefrustreerd, teleurgesteld en onzeker"</p>

<h3>Emotionele Triggers Herkennen</h3>
<p>Identificeer wat je emotioneel triggert:</p>
<ul>
<li>Kritiek of afwijzing</li>
<li>Controle verliezen</li>
<li>Onrechtvaardigheid</li>
<li>Falen of fouten</li>
<li>Verwachtingen die niet worden waargemaakt</li>
</ul>

<h3>Emotionele Regulering Strategieën</h3>

<h4>1. Cognitieve Herstructurering</h4>
<p>Verander je gedachten om je emoties te beïnvloeden:</p>
<ul>
<li>Identificeer negatieve gedachten</li>
<li>Vraag jezelf: "Is dit waar?"</li>
<li>Vervang door meer realistische gedachten</li>
</ul>

<h4>2. Fysieke Technieken</h4>
<ul>
<li>Diepe ademhaling</li>
<li>Progressieve spierontspanning</li>
<li>Beweging en lichaamsbeweging</li>
<li>Mindfulness en meditatie</li>
</ul>

<h4>3. Sociale Ondersteuning</h4>
<ul>
<li>Praat met vertrouwde vrienden</li>
<li>Zoek professionele hulp indien nodig</li>
<li>Sluit je aan bij support groepen</li>
</ul>

<h3>EQ in Praktijk</h3>

<h4>Op het Werk:</h4>
<ul>
<li>Blijf kalm onder druk</li>
<li>Geef constructieve feedback</li>
<li>Los conflicten vreedzaam op</li>
<li>Inspireer en motiveer anderen</li>
</ul>

<h4>In Relaties:</h4>
<ul>
<li>Luister zonder oordeel</li>
<li>Valideer gevoelens</li>
<li>Communiceer je eigen behoeften</li>
<li>Compromis en samenwerking</li>
</ul>

<h4>Met Jezelf:</h4>
<ul>
<li>Wees vriendelijk voor jezelf</li>
<li>Leer van fouten zonder jezelf te veroordelen</li>
<li>Vier je successen</li>
<li>Stel gezonde grenzen</li>
</ul>

<h3>Dagelijkse EQ Praktijk</h3>
<ol>
<li>Begin je dag met zelfreflectie</li>
<li>Oefen actief luisteren in elke conversatie</li>
<li>Pauzeer voor je reageert op emotionele situaties</li>
<li>Reflecteer aan het einde van de dag op je emotionele reacties</li>
<li>Leer één nieuwe emotie per dag</li>
</ol>

<p>Emotionele intelligentie is een vaardigheid die je je hele leven kunt blijven ontwikkelen. Begin vandaag met bewustwording en oefening.</p>',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title = 'Mindset & Focus' LIMIT 1),
    'Reflectie & Integratie',
    '15m',
    'exam',
    'published',
    6,
    0,
    0,
    '',
    '',
    NOW(),
    NOW()
); 