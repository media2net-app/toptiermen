-- Fix ontbrekende oefeningen in de oefeningen-bibliotheek
-- Dit script voegt automatisch alle ontbrekende oefeningen toe die gebruikt worden in trainingsschema's

-- Eerst alle gebruikte exercise_id's ophalen uit training_schema_exercises
-- en vergelijken met bestaande oefeningen in de exercises tabel
-- Voeg ontbrekende oefeningen toe met placeholder informatie

INSERT INTO exercises (id, name, category, video_url)
SELECT 
    tse.exercise_id,
    'Oefening ' || tse.exercise_id, -- Placeholder naam
    'Algemeen', -- Default categorie
    NULL -- Geen video URL
FROM training_schema_exercises tse
LEFT JOIN exercises e ON tse.exercise_id = e.id
WHERE e.id IS NULL;

-- Toon resultaat
SELECT 
    'Toegevoegde oefeningen:' as message,
    COUNT(*) as count
FROM training_schema_exercises tse
LEFT JOIN exercises e ON tse.exercise_id = e.id
WHERE e.id IS NULL;

-- Toon alle oefeningen die nu bestaan
SELECT 
    'Alle oefeningen in bibliotheek:' as message,
    COUNT(*) as total_exercises
FROM exercises;

-- Toon alle gebruikte oefeningen in schema's
SELECT 
    'Alle oefeningen in trainingsschema''s:' as message,
    COUNT(DISTINCT exercise_id) as unique_exercises_in_schemas
FROM training_schema_exercises;

-- Voeg alle ontbrekende oefeningen toe aan de exercises tabel
-- Met alle benodigde velden ingevuld

WITH missing_exercises AS (
  SELECT DISTINCT exercise_name
  FROM training_schema_exercises
  WHERE exercise_id IS NULL
    AND exercise_name IS NOT NULL
    AND TRIM(exercise_name) <> ''
)
, numbered AS (
  SELECT exercise_name, ROW_NUMBER() OVER (ORDER BY exercise_name) + 34 AS new_id
  FROM missing_exercises
)
INSERT INTO exercises (
  id,
  name,
  primary_muscle,
  secondary_muscles,
  equipment,
  video_url,
  instructions,
  difficulty,
  created_at,
  updated_at
)
SELECT 
  new_id,
  exercise_name,
  CASE 
    -- Borst oefeningen
    WHEN LOWER(exercise_name) LIKE '%bench%' OR LOWER(exercise_name) LIKE '%press%' OR LOWER(exercise_name) LIKE '%fly%' THEN 'Borst'
    -- Rug oefeningen
    WHEN LOWER(exercise_name) LIKE '%deadlift%' OR LOWER(exercise_name) LIKE '%row%' OR LOWER(exercise_name) LIKE '%pull%' OR LOWER(exercise_name) LIKE '%lat%' THEN 'Rug'
    -- Schouder oefeningen
    WHEN LOWER(exercise_name) LIKE '%shoulder%' OR LOWER(exercise_name) LIKE '%lateral%' OR LOWER(exercise_name) LIKE '%front%' OR LOWER(exercise_name) LIKE '%rear%' OR LOWER(exercise_name) LIKE '%shrug%' THEN 'Schouders'
    -- Bicep oefeningen
    WHEN LOWER(exercise_name) LIKE '%curl%' OR LOWER(exercise_name) LIKE '%bicep%' THEN 'Biceps'
    -- Tricep oefeningen
    WHEN LOWER(exercise_name) LIKE '%tricep%' OR LOWER(exercise_name) LIKE '%dip%' OR LOWER(exercise_name) LIKE '%extension%' THEN 'Triceps'
    -- Been oefeningen
    WHEN LOWER(exercise_name) LIKE '%squat%' OR LOWER(exercise_name) LIKE '%leg%' OR LOWER(exercise_name) LIKE '%calf%' OR LOWER(exercise_name) LIKE '%lunge%' OR LOWER(exercise_name) LIKE '%hip%' OR LOWER(exercise_name) LIKE '%thrust%' THEN 'Benen'
    -- Core oefeningen
    WHEN LOWER(exercise_name) LIKE '%plank%' OR LOWER(exercise_name) LIKE '%crunch%' OR LOWER(exercise_name) LIKE '%sit%up%' THEN 'Core'
    -- Push-ups
    WHEN LOWER(exercise_name) LIKE '%push%up%' THEN 'Borst'
    -- Face pulls
    WHEN LOWER(exercise_name) LIKE '%face%pull%' THEN 'Schouders'
    -- Good mornings
    WHEN LOWER(exercise_name) LIKE '%good%morning%' THEN 'Benen'
    -- Default
    ELSE 'Algemeen'
  END as primary_muscle,
  CASE 
    WHEN LOWER(exercise_name) LIKE '%bench%' OR LOWER(exercise_name) LIKE '%press%' THEN ARRAY['Triceps', 'Schouders']
    WHEN LOWER(exercise_name) LIKE '%deadlift%' THEN ARRAY['Benen', 'Core']
    WHEN LOWER(exercise_name) LIKE '%squat%' THEN ARRAY['Core', 'Glutes']
    WHEN LOWER(exercise_name) LIKE '%row%' OR LOWER(exercise_name) LIKE '%pull%' THEN ARRAY['Biceps', 'Schouders']
    WHEN LOWER(exercise_name) LIKE '%curl%' THEN ARRAY['Onderarmen']
    WHEN LOWER(exercise_name) LIKE '%dip%' THEN ARRAY['Borst', 'Schouders']
    WHEN LOWER(exercise_name) LIKE '%push%up%' THEN ARRAY['Triceps', 'Schouders', 'Core']
    ELSE ARRAY[]::text[]
  END as secondary_muscles,
  CASE 
    WHEN LOWER(exercise_name) LIKE '%barbell%' THEN 'Barbell'
    WHEN LOWER(exercise_name) LIKE '%dumbbell%' THEN 'Dumbbell'
    WHEN LOWER(exercise_name) LIKE '%cable%' THEN 'Cable Machine'
    WHEN LOWER(exercise_name) LIKE '%machine%' THEN 'Machine'
    WHEN LOWER(exercise_name) LIKE '%leg%press%' THEN 'Leg Press Machine'
    WHEN LOWER(exercise_name) LIKE '%lat%pulldown%' THEN 'Lat Pulldown Machine'
    WHEN LOWER(exercise_name) LIKE '%leg%extension%' THEN 'Leg Extension Machine'
    WHEN LOWER(exercise_name) LIKE '%leg%curl%' THEN 'Leg Curl Machine'
    WHEN LOWER(exercise_name) LIKE '%calf%' THEN 'Calf Machine'
    WHEN LOWER(exercise_name) LIKE '%push%up%' THEN 'Bodyweight'
    WHEN LOWER(exercise_name) LIKE '%pull%up%' THEN 'Pull-up Bar'
    WHEN LOWER(exercise_name) LIKE '%dip%' THEN 'Dip Bars'
    WHEN LOWER(exercise_name) LIKE '%plank%' THEN 'Bodyweight'
    WHEN LOWER(exercise_name) LIKE '%lunge%' THEN 'Bodyweight'
    WHEN LOWER(exercise_name) LIKE '%hip%thrust%' THEN 'Barbell'
    ELSE 'Barbell'
  END as equipment,
  '/video-placeholder.jpg' as video_url,
  CASE 
    WHEN LOWER(exercise_name) LIKE '%bench%press%' THEN '1. Ga liggen op de bank met je voeten plat op de grond\n2. Pak de barbell met een grip die iets breder is dan schouderbreedte\n3. Laat de stang gecontroleerd naar je borst zakken\n4. Duw de stang explosief omhoog naar de startpositie\n5. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%deadlift%' THEN '1. Sta met je voeten schouderbreedte uit elkaar\n2. Pak de barbell met een overhandse grip\n3. Houd je rug recht en til de stang op door je benen en heupen te strekken\n4. Sta volledig rechtop met je schouders naar achteren\n5. Laat de stang gecontroleerd zakken naar de grond'
    WHEN LOWER(exercise_name) LIKE '%squat%' THEN '1. Plaats de barbell op je schouders\n2. Sta met je voeten schouderbreedte uit elkaar\n3. Zak gecontroleerd naar benen tot je dijen parallel zijn aan de grond\n4. Duw explosief omhoog naar de startpositie\n5. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%pull%up%' THEN '1. Hang aan de pull-up bar met je handen iets breder dan schouderbreedte\n2. Trek je lichaam omhoog tot je kin boven de stang is\n3. Laat je lichaam gecontroleerd zakken naar de startpositie\n4. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%barbell%row%' THEN '1. Buig voorover met je rug recht en je knieën licht gebogen\n2. Pak de barbell met een overhandse grip\n3. Trek de stang naar je onderbuik\n4. Laat de stang gecontroleerd zakken naar de startpositie\n5. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%overhead%press%' THEN '1. Houd de barbell op schouderhoogte\n2. Duw de stang explosief omhoog boven je hoofd\n3. Laat de stang gecontroleerd zakken naar de startpositie\n4. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%bicep%curl%' THEN '1. Houd de dumbbells naast je lichaam\n2. Krul de gewichten omhoog naar je schouders\n3. Laat de gewichten gecontroleerd zakken naar de startpositie\n4. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%tricep%dip%' THEN '1. Plaats je handen op de dip bars\n2. Laat je lichaam zakken tot je armen parallel zijn aan de grond\n3. Duw je lichaam omhoog naar de startpositie\n4. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%push%up%' THEN '1. Begin in een plank positie met je handen iets breder dan schouderbreedte\n2. Laat je lichaam zakken tot je borst bijna de grond raakt\n3. Duw je lichaam omhoog naar de startpositie\n4. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%lateral%raise%' THEN '1. Houd de dumbbells naast je lichaam\n2. Til de gewichten zijwaarts omhoog tot schouderhoogte\n3. Laat de gewichten gecontroleerd zakken naar de startpositie\n4. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%face%pull%' THEN '1. Pak het touw van de cable machine\n2. Trek het touw naar je gezicht terwijl je je schouderbladen samenknijpt\n3. Laat het touw gecontroleerd terug naar de startpositie\n4. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%good%morning%' THEN '1. Plaats de barbell op je schouders\n2. Buig voorover vanuit je heupen met je rug recht\n3. Keer terug naar de startpositie\n4. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%hip%thrust%' THEN '1. Ga zitten met je rug tegen een bank en de barbell op je heupen\n2. Duw je heupen omhoog tot je lichaam een rechte lijn vormt\n3. Laat je heupen gecontroleerd zakken naar de startpositie\n4. Herhaal voor het gewenste aantal herhalingen'
    WHEN LOWER(exercise_name) LIKE '%plank%' THEN '1. Begin in een push-up positie\n2. Houd je lichaam in een rechte lijn van hoofd tot tenen\n3. Houd deze positie vast voor de gewenste tijd\n4. Ontspan en herhaal'
    ELSE 'Voer de oefening uit volgens de standaard techniek. Focus op goede vorm en controle.'
  END as instructions,
  CASE 
    WHEN LOWER(exercise_name) LIKE '%deadlift%' OR LOWER(exercise_name) LIKE '%squat%' OR LOWER(exercise_name) LIKE '%bench%press%' THEN 'Intermediate'
    WHEN LOWER(exercise_name) LIKE '%pull%up%' OR LOWER(exercise_name) LIKE '%dip%' THEN 'Intermediate'
    WHEN LOWER(exercise_name) LIKE '%push%up%' OR LOWER(exercise_name) LIKE '%plank%' THEN 'Beginner'
    ELSE 'Beginner'
  END as difficulty,
  NOW() as created_at,
  NOW() as updated_at
FROM numbered
WHERE NOT EXISTS (
  SELECT 1 FROM exercises WHERE name = numbered.exercise_name
);

-- Toon resultaat
SELECT 
  'Toegevoegde oefeningen' as status,
  COUNT(*) as aantal
FROM exercises 
WHERE id > 34;

-- Toon alle nieuwe oefeningen
SELECT 
  id,
  name,
  primary_muscle,
  difficulty
FROM exercises 
WHERE id > 34
ORDER BY id; 