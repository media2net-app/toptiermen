-- Insert dummy lessons for the module 'Discipline & Identiteit'
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
    (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1),
    'De Basis van Discipline',
    '25m',
    'video',
    'published',
    1,
    1247,
    89.2,
    'https://www.youtube.com/watch?v=example1',
    '',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1),
    'Je Identiteit Definiëren',
    '30m',
    'text',
    'published',
    2,
    1102,
    76.4,
    '',
    'Dit is een uitgebreide tekst over het definiëren van je identiteit. In deze les leer je hoe je je ware zelf kunt ontdekken en hoe je een sterke identiteit kunt ontwikkelen die je helpt om je doelen te bereiken.\n\n## Wat is identiteit?\n\nJe identiteit is wie je bent als persoon. Het omvat je waarden, overtuigingen, doelen en de manier waarop je jezelf ziet. Een sterke identiteit helpt je om consistent te zijn in je acties en beslissingen.\n\n## Stappen om je identiteit te definiëren:\n\n1. **Reflecteer op je waarden** - Wat is echt belangrijk voor jou?\n2. **Identificeer je sterke punten** - Waar ben je goed in?\n3. **Stel je doelen vast** - Wat wil je bereiken?\n4. **Ontwikkel je visie** - Hoe zie je je toekomst?\n\n## Praktische oefeningen:\n\n- Schrijf elke dag 3 dingen op waar je dankbaar voor bent\n- Maak een lijst van je top 5 waarden\n- Visualiseer je ideale toekomst zelf\n- Praat met mensen die je bewondert\n\nDoor deze stappen te volgen, kun je een sterke en authentieke identiteit ontwikkelen die je helpt om je doelen te bereiken.',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1),
    'Dagelijkse Routines',
    '20m',
    'exam',
    'published',
    3,
    987,
    71.5,
    '',
    '',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1),
    'Doelen Stellen en Behouden',
    '35m',
    'video',
    'published',
    4,
    856,
    83.7,
    'https://www.youtube.com/watch?v=example2',
    '',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1),
    'Overwin Procrastinatie',
    '28m',
    'text',
    'published',
    5,
    743,
    69.8,
    '',
    'Procrastinatie is een van de grootste obstakels voor succes. In deze les leer je praktische strategieën om uitstelgedrag te overwinnen en meer gedaan te krijgen.\n\n## Waarom stellen we uit?\n\n- Angst voor falen\n- Perfectionisme\n- Gebrek aan motivatie\n- Overweldiging\n- Slechte gewoonten\n\n## Strategieën om procratinatie te overwinnen:\n\n### 1. De 2-minuten regel\nAls iets minder dan 2 minuten duurt, doe het dan direct.\n\n### 2. Time blocking\nPlan specifieke tijdsblokken voor je taken.\n\n### 3. De Pomodoro techniek\nWerk 25 minuten, neem dan 5 minuten pauze.\n\n### 4. Break down grote taken\nDeel grote projecten op in kleinere, beheersbare taken.\n\n### 5. Elimineer afleidingen\nZet je telefoon op stil en sluit onnodige tabs.\n\n## Praktische tips:\n\n- Begin met de moeilijkste taak van de dag\n- Beloon jezelf na het voltooien van taken\n- Houd je voortgang bij\n- Zoek een accountability partner\n\nDoor deze strategieën consistent toe te passen, kun je procratinatie overwinnen en meer gedaan krijgen.',
    NOW(),
    NOW()
); 