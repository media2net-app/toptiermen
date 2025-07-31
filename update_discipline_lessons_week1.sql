-- Update Discipline & Identiteit Module Lessons - Week 1 Content Creation
-- Run this SQL in your Supabase SQL editor

-- =====================================================
-- STEP 1: UPDATE MODULE INFORMATION
-- =====================================================

UPDATE academy_modules 
SET 
    description = 'Leer de fundamenten van discipline en ontwikkel een sterke identiteit. Dit is de fundering voor alle andere modules en helpt je om consistent te zijn in je acties en beslissingen.',
    short_description = 'Ontwikkel discipline en ontdek je ware identiteit',
    status = 'published',
    updated_at = NOW()
WHERE title = 'Discipline & Identiteit';

-- =====================================================
-- STEP 2: UPDATE LESSON 1 - DE BASIS VAN DISCIPLINE
-- =====================================================

UPDATE academy_lessons 
SET 
    title = 'De Basis van Discipline',
    duration = '25 minuten',
    type = 'video',
    status = 'published',
    order_index = 1,
    video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', -- Placeholder URL
    content = 'Discipline is de fundering van alle succes. In deze les leer je wat discipline echt betekent en hoe je het kunt ontwikkelen.

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

Door deze principes toe te passen, ontwikkel je een sterke basis van discipline die je helpt om alle andere doelen te bereiken.',
    updated_at = NOW()
WHERE title = 'De Basis van Discipline' AND module_id = (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1);

-- =====================================================
-- STEP 3: UPDATE LESSON 2 - JE IDENTITEIT DEFINIËREN
-- =====================================================

UPDATE academy_lessons 
SET 
    title = 'Je Identiteit Definiëren',
    duration = '30 minuten',
    type = 'text',
    status = 'published',
    order_index = 2,
    content = 'Je identiteit is wie je bent als persoon. Het bepaalt je gedrag, je keuzes en je resultaten. In deze les leer je hoe je een sterke, authentieke identiteit kunt ontwikkelen.

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

Door een sterke identiteit te ontwikkelen, word je consistenter in je acties en bereik je je doelen effectiever.',
    updated_at = NOW()
WHERE title = 'Je Identiteit Definiëren' AND module_id = (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1);

-- =====================================================
-- STEP 4: UPDATE LESSON 3 - DAGELIJKSE ROUTINES
-- =====================================================

UPDATE academy_lessons 
SET 
    title = 'Dagelijkse Routines',
    duration = '20 minuten',
    type = 'video',
    status = 'published',
    order_index = 3,
    video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', -- Placeholder URL
    content = 'Dagelijkse routines zijn de bouwstenen van discipline en succes. In deze les leer je hoe je effectieve routines kunt opbouwen die je helpen om je doelen te bereiken.

## Waarom routines belangrijk zijn:

- Ze verminderen beslissingsmoeheid
- Ze maken goede keuzes automatisch
- Ze bouwen momentum op
- Ze creëren voorspelbaarheid en rust

## De perfecte ochtendroutine:

### 5:30 AM - Wakker worden
- Sta direct op, geen snooze
- Drink een glas water
- Open de gordijnen voor natuurlijk licht

### 5:35 AM - Hydratatie
- Drink 500ml water met citroen
- Neem je supplementen
- Plan je dag

### 5:45 AM - Beweging
- 10 minuten stretching
- 20 minuten cardio of krachttraining
- Koud douchen (30 seconden)

### 6:15 AM - Mindfulness
- 10 minuten meditatie
- 5 minuten journaling
- 10 minuten lezen

### 6:40 AM - Ontbijt
- Eiwitrijk ontbijt
- Plan je lunch
- Check je agenda

## De perfecte avondroutine:

### 9:00 PM - Voorbereiding
- Plan morgen
- Leg je kleren klaar
- Maak je lunch

### 9:15 PM - Ontspanning
- Lees een boek
- Luister naar muziek
- Praat met familie

### 9:45 PM - Voorbereiding voor slaap
- Dim de lichten
- Zet je telefoon op stil
- Doe een korte meditatie

### 10:00 PM - Slaap
- Ga naar bed
- Focus op je ademhaling
- Visualiseer je doelen

## Routines voor verschillende doelen:

### Voor fysieke gezondheid:
- Dagelijkse beweging
- Gezonde voeding
- Voldoende slaap
- Hydratatie

### Voor mentale gezondheid:
- Meditatie
- Journaling
- Lezen
- Natuur tijd

### Voor productiviteit:
- Planning
- Time blocking
- Review sessies
- Learning time

## Tips voor het opbouwen van routines:

1. **Start klein**: Begin met 1-2 nieuwe gewoonten
2. **Wees consistent**: Doe het elke dag, ook als je geen zin hebt
3. **Track je voortgang**: Gebruik een habit tracker
4. **Maak het makkelijk**: Elimineer obstakels
5. **Beloon jezelf**: Vier kleine overwinningen

## Veelgemaakte fouten:

- Te veel tegelijk willen veranderen
- Niet realistisch zijn over tijd
- Geen backup plan hebben
- Niet flexibel zijn

## Belangrijke inzichten:

- Routines zijn persoonlijk, kopieer niet blind
- Consistentie is belangrijker dan perfectie
- Routines evolueren met je doelen
- Kleine veranderingen leiden tot grote resultaten

Door effectieve routines te ontwikkelen, maak je succes een gewoonte in plaats van een uitzondering.',
    updated_at = NOW()
WHERE title = 'Dagelijkse Routines' AND module_id = (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1);

-- =====================================================
-- STEP 5: UPDATE LESSON 4 - DOELEN STELLEN & BEHOUDEN
-- =====================================================

UPDATE academy_lessons 
SET 
    title = 'Doelen Stellen & Behouden',
    duration = '35 minuten',
    type = 'text',
    status = 'published',
    order_index = 4,
    content = 'Doelen stellen is een kunst. In deze les leer je hoe je effectieve doelen kunt stellen en hoe je ze kunt behouden tot je ze bereikt hebt.

## Waarom doelen belangrijk zijn:

- Ze geven richting aan je leven
- Ze motiveren je om te handelen
- Ze helpen je om prioriteiten te stellen
- Ze meten je voortgang

## Het SMART framework:

### S - Specifiek
- Wat wil je precies bereiken?
- Wanneer wil je het bereiken?
- Hoe ga je het bereiken?

### M - Meetbaar
- Hoe ga je je voortgang meten?
- Wat zijn je mijlpalen?
- Hoe weet je dat je succesvol bent?

### A - Haalbaar
- Is het doel realistisch?
- Heb je de middelen en vaardigheden?
- Kun je het binnen de tijd bereiken?

### R - Relevant
- Past het bij je waarden?
- Draagt het bij aan je lange-termijn doelen?
- Is het de moeite waard?

### T - Tijdsgebonden
- Wanneer ga je het bereiken?
- Wat zijn je deadlines?
- Hoe ga je jezelf verantwoordelijk houden?

## Voorbeelden van SMART doelen:

### Slecht doel:
"Ik wil afvallen"

### SMART doel:
"Ik ga 10 kilo afvallen in 6 maanden door 3x per week te trainen en mijn calorie-inname te beperken tot 2000 per dag"

## Lange-termijn vs. Korte-termijn doelen:

### Lange-termijn doelen (1-5 jaar):
- Je visie voor de toekomst
- Grote levensveranderingen
- Carrière doelen
- Financiële doelen

### Korte-termijn doelen (1-12 maanden):
- Stappen naar je lange-termijn doelen
- Gewoonten die je wilt opbouwen
- Vaardigheden die je wilt leren
- Projecten die je wilt voltooien

## Doelen behouden strategieën:

### 1. Visualisatie
- Visualiseer je succes elke dag
- Maak een vision board
- Schrijf je doelen op en lees ze dagelijks

### 2. Accountability
- Deel je doelen met anderen
- Vind een accountability partner
- Houd je voortgang bij

### 3. Mijlpalen
- Vier kleine overwinningen
- Beloon jezelf voor voortgang
- Reflecteer op je prestaties

### 4. Flexibiliteit
- Pas je doelen aan als nodig
- Leer van tegenslagen
- Blijf gefocust op het eindresultaat

## Veelgemaakte fouten:

- Doelen stellen die niet bij je passen
- Te veel doelen tegelijk
- Geen plan hebben
- Geen accountability

## Praktische oefeningen:

### Oefening 1: Doelen Brainstorm
Schrijf 50 dingen op die je wilt bereiken. Kies dan de top 5.

### Oefening 2: Doelen Breakdown
Neem een groot doel en deel het op in 10 kleinere stappen.

### Oefening 3: Obstakels Identificeren
Voor elk doel, schrijf op wat je tegenhoudt en hoe je het kunt overwinnen.

### Oefening 4: Accountability Setup
Vind 3 mensen die je kunnen helpen om je doelen te bereiken.

## Belangrijke inzichten:

- Doelen moeten je uitdagen maar niet overweldigen
- Het proces is belangrijker dan het resultaat
- Doelen evolueren met je groei
- Succes is een reis, geen bestemming

Door effectieve doelen te stellen en te behouden, creëer je een roadmap naar succes.',
    updated_at = NOW()
WHERE title = 'Doelen Stellen en Behouden' AND module_id = (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1);

-- =====================================================
-- STEP 6: UPDATE LESSON 5 - MENTALE KRACHT OPBOUWEN
-- =====================================================

UPDATE academy_lessons 
SET 
    title = 'Mentale Kracht Opbouwen',
    duration = '30 minuten',
    type = 'video',
    status = 'published',
    order_index = 5,
    video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', -- Placeholder URL
    content = 'Mentale kracht is de basis van alle succes. In deze les leer je hoe je mentale veerkracht kunt ontwikkelen en hoe je om kunt gaan met uitdagingen en tegenslagen.

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
- Bereidheid om risico''s te nemen

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
- Neem kleine risico''s
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

Door mentale kracht op te bouwen, word je beter bestand tegen uitdagingen en bereik je je doelen effectiever.',
    updated_at = NOW()
WHERE title = 'Overwin Procrastinatie' AND module_id = (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1);

-- =====================================================
-- STEP 7: VERIFICATION
-- =====================================================

-- Check the updated lessons
SELECT 
    title,
    duration,
    type,
    status,
    order_index,
    LENGTH(content) as content_length
FROM academy_lessons 
WHERE module_id = (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1)
ORDER BY order_index;

-- Update module lesson count
UPDATE academy_modules 
SET 
    lessons_count = (
        SELECT COUNT(*) 
        FROM academy_lessons 
        WHERE module_id = academy_modules.id 
        AND status = 'published'
    ),
    updated_at = NOW()
WHERE title = 'Discipline & Identiteit';

-- Final verification
SELECT 
    m.title as module_title,
    m.lessons_count,
    m.status,
    COUNT(l.id) as actual_lessons
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id AND l.status = 'published'
WHERE m.title = 'Discipline & Identiteit'
GROUP BY m.id, m.title, m.lessons_count, m.status; 