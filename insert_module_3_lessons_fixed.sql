-- Insert lessons for module 3: Mindset & Focus (Fixed version)
-- Run this SQL in your Supabase SQL editor
-- This script tries multiple possible module titles

-- First, let's check what the actual module title is
SELECT id, title FROM academy_modules WHERE title ILIKE '%mindset%' OR title ILIKE '%focus%' OR title ILIKE '%mentale%' OR title ILIKE '%mind%';

-- Insert lessons using the correct module ID
-- Replace 'Mindset & Focus' with the actual title from your database

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
    (SELECT id FROM academy_modules WHERE title ILIKE '%mindset%' OR title ILIKE '%focus%' OR title ILIKE '%mentale%' OR title ILIKE '%mind%' LIMIT 1),
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
    (SELECT id FROM academy_modules WHERE title ILIKE '%mindset%' OR title ILIKE '%focus%' OR title ILIKE '%mentale%' OR title ILIKE '%mind%' LIMIT 1),
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
    (SELECT id FROM academy_modules WHERE title ILIKE '%mindset%' OR title ILIKE '%focus%' OR title ILIKE '%mentale%' OR title ILIKE '%mind%' LIMIT 1),
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
<li>Verander van omgeving</li>
<li>Begin met een eenvoudige taak</li>
</ol>

<p>Onthoud: Focus is een spier die je kunt trainen. Begin klein en bouw geleidelijk op.</p>',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title ILIKE '%mindset%' OR title ILIKE '%focus%' OR title ILIKE '%mentale%' OR title ILIKE '%mind%' LIMIT 1),
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
    (SELECT id FROM academy_modules WHERE title ILIKE '%mindset%' OR title ILIKE '%focus%' OR title ILIKE '%mentale%' OR title ILIKE '%mind%' LIMIT 1),
    'Emotionele Intelligentie',
    '28m',
    'text',
    'published',
    5,
    0,
    0,
    '',
    '<h2>Emotionele Intelligentie: De Sleutel tot Succes</h2>

<p>Emotionele intelligentie (EQ) is vaak belangrijker dan IQ voor succes in het leven. Leer hoe je je emoties kunt begrijpen en beheren.</p>

<h3>De Vier Pijlers van EQ:</h3>

<h4>1. Zelfbewustzijn</h4>
<p>Het vermogen om je eigen emoties te herkennen en begrijpen.</p>
<ul>
<li>Herken je emotionele triggers</li>
<li>Begrijp je sterke en zwakke punten</li>
<li>Weet hoe je emoties je gedrag beïnvloeden</li>
<li>Heb een realistisch zelfbeeld</li>
</ul>

<h4>2. Zelfmanagement</h4>
<p>Het vermogen om je emoties en impulsen te beheren.</p>
<ul>
<li>Blijf kalm onder druk</li>
<li>Beheer stress effectief</li>
<li>Pas je aan veranderende omstandigheden aan</li>
<li>Houd je aan je doelen</li>
</ul>

<h4>3. Sociaal Bewustzijn</h4>
<p>Het vermogen om andermans emoties en sociale dynamieken te begrijpen.</p>
<ul>
<li>Lees emoties van anderen</li>
<li>Begrijp sociale signalen</li>
<li>Toon empathie</li>
<li>Navigeer complexe sociale situaties</li>
</ul>

<h4>4. Relatie Management</h4>
<p>Het vermogen om relaties te bouwen en te onderhouden.</p>
<ul>
<li>Communiceer effectief</li>
<li>Los conflicten op</li>
<li>Inspireer en beïnvloed anderen</li>
<li>Werk goed in teams</li>
</ul>

<h3>Praktische EQ Oefeningen:</h3>

<h4>1. Emotie Dagboek</h4>
<p>Houd een dagboek bij van je emoties:</p>
<ul>
<li>Wanneer voelde je je gefrustreerd?</li>
<li>Wat was de trigger?</li>
<li>Hoe reageerde je?</li>
<li>Wat had je anders kunnen doen?</li>
</ul>

<h4>2. De Pauze Techniek</h4>
<p>Wanneer je een sterke emotie voelt:</p>
<ol>
<li>Stop en adem diep in</li>
<li>Tel tot 10</li>
<li>Vraag jezelf: "Wat voel ik precies?"</li>
<li>Bedenk wat de beste reactie is</li>
<li>Handel bewust</li>
</ol>

<h4>3. Empathie Oefening</h4>
<p>Oefen jezelf in het zien van andermans perspectief:</p>
<ul>
<li>Luister zonder oordeel</li>
<li>Vraag door om te begrijpen</li>
<li>Valideer andermans gevoelens</li>
<li>Toon begrip, ook als je het niet eens bent</li>
</ul>

<h3>Emotionele Triggers Herkennen:</h3>
<p>Veel voorkomende triggers:</p>
<ul>
<li>Kritiek of afwijzing</li>
<li>Controle verliezen</li>
<li>Onrechtvaardigheid</li>
<li>Falen of fouten maken</li>
<li>Verwachtingen niet waarmaken</li>
</ul>

<h3>Stress Management Technieken:</h3>

<h4>1. Ademhalingsoefeningen</h4>
<p>4-7-8 ademhaling:</p>
<ol>
<li>Adem 4 tellen in door je neus</li>
<li>Houd 7 tellen vast</li>
<li>Adem 8 tellen uit door je mond</li>
<li>Herhaal 4 keer</li>
</ol>

<h4>2. Progressieve Spierontspanning</h4>
<p>Span en ontspan elke spiergroep systematisch.</p>

<h4>3. Mindfulness Meditatie</h4>
<p>Focus op je ademhaling en observeer je gedachten zonder oordeel.</p>

<h3>Communicatie Verbeteren:</h3>

<h4>1. Actief Luisteren</h4>
<ul>
<li>Geef volledige aandacht</li>
<li>Maak oogcontact</li>
<li>Knik en gebruik bevestigende geluiden</li>
<li>Vat samen wat je hoort</li>
<li>Stel vragen om te verduidelijken</li>
</ul>

<h4>2. Ik-Boodschappen</h4>
<p>In plaats van: "Je maakt me altijd boos"<br>
Zeg: "Ik voel me gefrustreerd wanneer..."</p>

<h4>3. Non-verbale Communicatie</h4>
<ul>
<li>Let op je lichaamstaal</li>
<li>Gebruik open houdingen</li>
<li>Spiegel subtiel andermans lichaamstaal</li>
<li>Let op andermans non-verbale signalen</li>
</ul>

<h3>Conflicten Oplossen:</h3>
<ol>
<li>Erken het probleem</li>
<li>Luister naar beide kanten</li>
<li>Focus op belangen, niet posities</li>
<li>Zoek naar gemeenschappelijke grond</li>
<li>Bedenk creatieve oplossingen</li>
<li>Kom tot overeenstemming</li>
</ol>

<p>Onthoud: Emotionele intelligentie is een vaardigheid die je kunt ontwikkelen. Begin met zelfbewustzijn en bouw van daaruit verder.</p>',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title ILIKE '%mindset%' OR title ILIKE '%focus%' OR title ILIKE '%mentale%' OR title ILIKE '%mind%' LIMIT 1),
    'Reflectie & Integratie',
    '15m',
    'exam',
    'published',
    6,
    0,
    0,
    '',
    '<h2>Reflectie & Integratie: Wat Heb Je Geleerd?</h2>

<p>Neem de tijd om te reflecteren op wat je hebt geleerd in deze module en hoe je dit kunt toepassen in je dagelijks leven.</p>

<h3>Reflectie Vragen:</h3>

<h4>Over Mindset:</h4>
<ul>
<li>Welke fixed mindset gedachten herken je bij jezelf?</li>
<li>Hoe kun je deze omzetten naar growth mindset gedachten?</li>
<li>Welke uitdagingen ga je bewust aan om te groeien?</li>
</ul>

<h4>Over Focus:</h4>
<ul>
<li>Wat zijn je grootste afleidingen?</li>
<li>Welke focus technieken ga je implementeren?</li>
<li>Hoe ga je je omgeving optimaliseren voor betere focus?</li>
</ul>

<h4>Over Emotionele Intelligentie:</h4>
<ul>
<li>Welke emotionele triggers herken je bij jezelf?</li>
<li>Hoe kun je beter reageren op stressvolle situaties?</li>
<li>Welke communicatie vaardigheden wil je verbeteren?</li>
</ul>

<h3>Actie Plan:</h3>
<p>Maak een concreet plan voor de komende 30 dagen:</p>

<ol>
<li><strong>Week 1:</strong> Begin met dagelijkse mindset check en focus timer</li>
<li><strong>Week 2:</strong> Implementeer ademhalingsoefeningen en actief luisteren</li>
<li><strong>Week 3:</strong> Oefen met empathie en conflictoplossing</li>
<li><strong>Week 4:</strong> Integreer alle technieken in je dagelijkse routine</li>
</ol>

<h3>Meting van Succes:</h3>
<p>Hoe ga je meten of je vooruitgang boekt?</p>
<ul>
<li>Dagelijkse reflectie in je journal</li>
<li>Feedback van anderen</li>
<li>Minder stress en meer focus</li>
<li>Betere relaties en communicatie</li>
<li>Meer zelfvertrouwen en veerkracht</li>
</ul>

<p><strong>Onthoud:</strong> Groei is een proces, geen bestemming. Blijf oefenen en wees geduldig met jezelf.</p>',
    NOW(),
    NOW()
);

-- Verify the insertions
SELECT 
    l.title,
    l.type,
    l.duration,
    m.title as module_title
FROM academy_lessons l
JOIN academy_modules m ON l.module_id = m.id
WHERE m.title ILIKE '%mindset%' OR m.title ILIKE '%focus%' OR m.title ILIKE '%mentale%' OR m.title ILIKE '%mind%'
ORDER BY l.order_index; 