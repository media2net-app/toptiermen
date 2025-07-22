-- Fix Training Schema Days
-- Add the missing training days for the new schemas

-- First, let's see what schemas we have and their current days
SELECT 
  ts.name,
  ts.target_audience,
  COUNT(tsd.id) as current_days
FROM training_schemas ts
LEFT JOIN training_schema_days tsd ON ts.id = tsd.schema_id
WHERE ts.status = 'published'
GROUP BY ts.id, ts.name, ts.target_audience
ORDER BY ts.name;

-- Now let's add the missing days for each schema

-- Schema: 2-Daags Full Body Intermediate
DO $$
DECLARE
  schema_id uuid;
BEGIN
  -- Get the schema ID
  SELECT id INTO schema_id FROM training_schemas 
  WHERE name = '2-Daags Full Body Intermediate' AND status = 'published';
  
  -- Add days if they don't exist
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 1) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 1, 'Dag 1: Upper Body Focus',
      'Intensieve bovenlichaam training met compound en isolatie oefeningen.',
      'Upper Body (Borst, Rug, Schouders, Armen)',
      1
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 2, 'Dag 2: Lower Body Focus',
      'Complete onderlichaam training met focus op kracht en stabiliteit.',
      'Lower Body (Quadriceps, Hamstrings, Glutes, Core)',
      2
    );
  END IF;
END $$;

-- Schema: 3-Daags Full Body Beginner
DO $$
DECLARE
  schema_id uuid;
BEGIN
  -- Get the schema ID
  SELECT id INTO schema_id FROM training_schemas 
  WHERE name = '3-Daags Full Body Beginner' AND status = 'published';
  
  -- Add days if they don't exist
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 1) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 1, 'Dag 1: Push Focus',
      'Focus op borst, schouders en triceps. Perfecte start van de week.',
      'Push (Borst, Schouders, Triceps)',
      1
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 2, 'Dag 2: Pull Focus',
      'Focus op rug, biceps en achterste schouders. Compleet bovenlichaam.',
      'Pull (Rug, Biceps, Achterste Schouders)',
      2
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 3) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 3, 'Dag 3: Legs Focus',
      'Focus op benen en core. Complete onderlichaam training.',
      'Legs (Quadriceps, Hamstrings, Glutes, Core)',
      3
    );
  END IF;
END $$;

-- Schema: 4-Daags Push/Pull/Legs/Full Body
DO $$
DECLARE
  schema_id uuid;
BEGIN
  -- Get the schema ID
  SELECT id INTO schema_id FROM training_schemas 
  WHERE name = '4-Daags Push/Pull/Legs/Full Body' AND status = 'published';
  
  -- Add days if they don't exist
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 1) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 1, 'Push Day',
      'Borst, schouders en triceps focus met compound bewegingen.',
      'Push (Borst, Schouders, Triceps)',
      1
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 2, 'Pull Day',
      'Rug en biceps focus met compound bewegingen.',
      'Pull (Rug, Biceps)',
      2
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 3) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 3, 'Legs Day',
      'Complete been training met focus op kracht.',
      'Legs (Quadriceps, Hamstrings, Glutes)',
      3
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 4) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 4, 'Full Body Day',
      'Complete full body workout voor conditie en herstel.',
      'Full Body (Alle spiergroepen)',
      4
    );
  END IF;
END $$;

-- Schema: 5-Daags Upper/Lower Split
DO $$
DECLARE
  schema_id uuid;
BEGIN
  -- Get the schema ID
  SELECT id INTO schema_id FROM training_schemas 
  WHERE name = '5-Daags Upper/Lower Split' AND status = 'published';
  
  -- Add days if they don't exist
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 1) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 1, 'Upper A',
      'Dag 1: Borst en triceps focus met compound bewegingen.',
      'Upper Body A (Borst, Triceps)',
      1
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 2, 'Lower A',
      'Dag 2: Quadriceps en kuiten focus.',
      'Lower Body A (Quadriceps, Calves)',
      2
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 3) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 3, 'Upper B',
      'Dag 3: Rug en biceps focus met compound bewegingen.',
      'Upper Body B (Rug, Biceps)',
      3
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 4) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 4, 'Lower B',
      'Dag 4: Hamstrings en glutes focus.',
      'Lower Body B (Hamstrings, Glutes)',
      4
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 5) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 5, 'Full Body',
      'Dag 5: Complete full body workout voor conditie.',
      'Full Body (Alle spiergroepen)',
      5
    );
  END IF;
END $$;

-- Schema: 6-Daags Upper/Lower Split
DO $$
DECLARE
  schema_id uuid;
BEGIN
  -- Get the schema ID
  SELECT id INTO schema_id FROM training_schemas 
  WHERE name = '6-Daags Upper/Lower Split' AND status = 'published';
  
  -- Add days if they don't exist
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 1) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 1, 'Upper A',
      'Dag 1: Borst en triceps focus - zware compound bewegingen.',
      'Upper Body A (Borst, Triceps)',
      1
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 2, 'Lower A',
      'Dag 2: Quadriceps focus - zware compound bewegingen.',
      'Lower Body A (Quadriceps)',
      2
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 3) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 3, 'Upper B',
      'Dag 3: Rug en biceps focus - zware compound bewegingen.',
      'Upper Body B (Rug, Biceps)',
      3
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 4) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 4, 'Lower B',
      'Dag 4: Hamstrings focus - zware compound bewegingen.',
      'Lower Body B (Hamstrings)',
      4
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 5) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 5, 'Upper C',
      'Dag 5: Schouders en armen focus - isolatie en volume.',
      'Upper Body C (Schouders, Armen)',
      5
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 6) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 6, 'Lower C',
      'Dag 6: Glutes en kuiten focus - isolatie en volume.',
      'Lower Body C (Glutes, Calves)',
      6
    );
  END IF;
END $$;

-- Schema: 2-Daags Bodyweight Beginner
DO $$
DECLARE
  schema_id uuid;
BEGIN
  -- Get the schema ID
  SELECT id INTO schema_id FROM training_schemas 
  WHERE name = '2-Daags Bodyweight Beginner' AND status = 'published';
  
  -- Add days if they don't exist
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 1) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 1, 'Dag 1: Upper Body',
      'Bovenlichaam training met push bewegingen. Perfect voor thuis.',
      'Upper Body (Borst, Schouders, Triceps)',
      1
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 2, 'Dag 2: Lower Body',
      'Onderlichaam training met been oefeningen. Complete thuis workout.',
      'Lower Body (Quadriceps, Hamstrings, Glutes, Core)',
      2
    );
  END IF;
END $$;

-- Schema: 3-Daags Bodyweight Intermediate
DO $$
DECLARE
  schema_id uuid;
BEGIN
  -- Get the schema ID
  SELECT id INTO schema_id FROM training_schemas 
  WHERE name = '3-Daags Bodyweight Intermediate' AND status = 'published';
  
  -- Add days if they don't exist
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 1) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 1, 'Push Day',
      'Push bewegingen voor borst, schouders en triceps.',
      'Push (Borst, Schouders, Triceps)',
      1
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 2, 'Pull Day',
      'Pull bewegingen voor rug en biceps (met banden of meubels).',
      'Pull (Rug, Biceps)',
      2
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM training_schema_days WHERE schema_id = schema_id AND day_number = 3) THEN
    INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
    VALUES (
      schema_id, 3, 'Legs Day',
      'Complete been training met bodyweight oefeningen.',
      'Legs (Quadriceps, Hamstrings, Glutes)',
      3
    );
  END IF;
END $$;

-- Verify the results
SELECT 
  ts.name,
  ts.target_audience,
  COUNT(tsd.id) as total_days
FROM training_schemas ts
LEFT JOIN training_schema_days tsd ON ts.id = tsd.schema_id
WHERE ts.status = 'published'
GROUP BY ts.id, ts.name, ts.target_audience
ORDER BY ts.name; 