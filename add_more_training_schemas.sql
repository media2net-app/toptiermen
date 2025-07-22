-- Add More Training Schemas for Better Variety
-- Run this SQL in your Supabase SQL editor to add more schema options

-- Schema 2: 2-Daags Full Body (Intermediate)
DO $$
DECLARE
  schema_id uuid;
  day1_id uuid;
  day2_id uuid;
BEGIN
  -- Insert schema
  INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
  VALUES (
    '2-Daags Full Body Intermediate',
    'Gevorderde 2-daags schema voor lifters met ervaring. Intensieve full body workouts voor kracht en massa.',
    'Gym',
    '/images/mind/2.png',
    'published',
    'Intermediate',
    '60 min',
    'Intermediate lifters, 2x per week trainen'
  ) RETURNING id INTO schema_id;

  -- Insert day 1
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 1, 'Dag 1: Upper Body Focus',
    'Intensieve bovenlichaam training met compound en isolatie oefeningen.',
    'Upper Body (Borst, Rug, Schouders, Armen)',
    1
  ) RETURNING id INTO day1_id;

  -- Insert day 2
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 2, 'Dag 2: Lower Body Focus',
    'Complete onderlichaam training met focus op kracht en stabiliteit.',
    'Lower Body (Quadriceps, Hamstrings, Glutes, Core)',
    2
  ) RETURNING id INTO day2_id;

  -- Insert exercises for day 1
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Bench Press', 4, '6-8', '120 sec', 1, 'Compound borst'),
    (day1_id, 'Pull-ups', 4, '6-10', '120 sec', 2, 'Rug breedte'),
    (day1_id, 'Overhead Press', 3, '6-8', '120 sec', 3, 'Schouder kracht'),
    (day1_id, 'Barbell Row', 3, '8-10', '90 sec', 4, 'Rug dikte'),
    (day1_id, 'Incline Bench Press', 3, '8-10', '90 sec', 5, 'Bovenste borst'),
    (day1_id, 'Bicep Curls', 3, '10-12', '60 sec', 6, 'Bicep isolatie'),
    (day1_id, 'Tricep Dips', 3, '8-12', '60 sec', 7, 'Tricep compound');

  -- Insert exercises for day 2
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Squat', 4, '6-8', '120 sec', 1, 'Compound quadriceps'),
    (day2_id, 'Deadlift', 4, '5-7', '180 sec', 2, 'Posterior chain'),
    (day2_id, 'Leg Press', 3, '8-10', '120 sec', 3, 'Quadriceps volume'),
    (day2_id, 'Romanian Deadlift', 3, '8-10', '120 sec', 4, 'Hamstring focus'),
    (day2_id, 'Hip Thrusts', 3, '10-12', '90 sec', 5, 'Glute isolatie'),
    (day2_id, 'Standing Calf Raises', 4, '15-20', '60 sec', 6, 'Kuit training'),
    (day2_id, 'Planks', 3, '60 sec', '60 sec', 7, 'Core stabiliteit');
END $$;

-- Schema 3: 3-Daags Full Body (Beginner)
DO $$
DECLARE
  schema_id uuid;
  day1_id uuid;
  day2_id uuid;
  day3_id uuid;
BEGIN
  -- Insert schema
  INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
  VALUES (
    '3-Daags Full Body Beginner',
    'Perfect voor beginners die 3x per week willen trainen. Complete full body workouts met focus op techniek.',
    'Gym',
    '/images/mind/3.png',
    'published',
    'Beginner',
    '45 min',
    'Beginners, 3x per week trainen'
  ) RETURNING id INTO schema_id;

  -- Insert days
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES
    (schema_id, 1, 'Dag 1: Push Focus', 'Focus op borst, schouders en triceps. Perfecte start van de week.', 'Push (Borst, Schouders, Triceps)', 1),
    (schema_id, 2, 'Dag 2: Pull Focus', 'Focus op rug, biceps en achterste schouders. Compleet bovenlichaam.', 'Pull (Rug, Biceps, Achterste Schouders)', 2),
    (schema_id, 3, 'Dag 3: Legs Focus', 'Focus op benen en core. Complete onderlichaam training.', 'Legs (Quadriceps, Hamstrings, Glutes, Core)', 3)
  RETURNING id INTO day1_id;

  -- Get day IDs
  SELECT id INTO day2_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2 LIMIT 1;
  SELECT id INTO day3_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 3 LIMIT 1;

  -- Insert exercises for day 1
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Push-ups', 3, '8-12', '90 sec', 1, 'Borst compound'),
    (day1_id, 'Dumbbell Press', 3, '8-10', '90 sec', 2, 'Schouder kracht'),
    (day1_id, 'Incline Push-ups', 3, '6-10', '90 sec', 3, 'Bovenste borst'),
    (day1_id, 'Lateral Raises', 3, '10-12', '60 sec', 4, 'Schouder breedte'),
    (day1_id, 'Tricep Pushdowns', 3, '10-12', '60 sec', 5, 'Tricep isolatie');

  -- Insert exercises for day 2
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Assisted Pull-ups', 3, '6-8', '120 sec', 1, 'Rug compound'),
    (day2_id, 'Dumbbell Row', 3, '8-10', '90 sec', 2, 'Rug dikte'),
    (day2_id, 'Lat Pulldown', 3, '8-10', '90 sec', 3, 'Rug breedte'),
    (day2_id, 'Bicep Curls', 3, '10-12', '60 sec', 4, 'Bicep isolatie'),
    (day2_id, 'Face Pulls', 3, '10-12', '60 sec', 5, 'Schouder gezondheid');

  -- Insert exercises for day 3
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day3_id, 'Bodyweight Squats', 3, '12-15', '90 sec', 1, 'Quadriceps compound'),
    (day3_id, 'Romanian Deadlift', 3, '8-10', '120 sec', 2, 'Hamstring focus'),
    (day3_id, 'Lunges', 3, '10-12 per been', '90 sec', 3, 'Unilaterale training'),
    (day3_id, 'Glute Bridges', 3, '12-15', '60 sec', 4, 'Glute isolatie'),
    (day3_id, 'Planks', 3, '30-45 sec', '60 sec', 5, 'Core stabiliteit');
END $$;

-- Schema 4: 4-Daags Push/Pull/Legs/Full Body
DO $$
DECLARE
  schema_id uuid;
  day1_id uuid;
  day2_id uuid;
  day3_id uuid;
  day4_id uuid;
BEGIN
  -- Insert schema
  INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
  VALUES (
    '4-Daags Push/Pull/Legs/Full Body',
    'Gevarieerd 4-daags schema met Push/Pull/Legs en een full body dag. Perfect voor balans en variatie.',
    'Gym',
    '/images/mind/4.png',
    'published',
    'Intermediate',
    '60 min',
    'Intermediate lifters, 4x per week'
  ) RETURNING id INTO schema_id;

  -- Insert days
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES
    (schema_id, 1, 'Push Day', 'Borst, schouders en triceps focus met compound bewegingen.', 'Push (Borst, Schouders, Triceps)', 1),
    (schema_id, 2, 'Pull Day', 'Rug en biceps focus met compound bewegingen.', 'Pull (Rug, Biceps)', 2),
    (schema_id, 3, 'Legs Day', 'Complete been training met focus op kracht.', 'Legs (Quadriceps, Hamstrings, Glutes)', 3),
    (schema_id, 4, 'Full Body Day', 'Complete full body workout voor conditie en herstel.', 'Full Body (Alle spiergroepen)', 4)
  RETURNING id INTO day1_id;

  -- Get day IDs
  SELECT id INTO day2_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2 LIMIT 1;
  SELECT id INTO day3_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 3 LIMIT 1;
  SELECT id INTO day4_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 4 LIMIT 1;

  -- Insert exercises for Push Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Bench Press', 4, '6-8', '120 sec', 1, 'Compound borst'),
    (day1_id, 'Overhead Press', 3, '6-8', '120 sec', 2, 'Schouder kracht'),
    (day1_id, 'Incline Bench Press', 3, '8-10', '90 sec', 3, 'Bovenste borst'),
    (day1_id, 'Dumbbell Flyes', 3, '10-12', '90 sec', 4, 'Borst isolatie'),
    (day1_id, 'Lateral Raises', 3, '12-15', '60 sec', 5, 'Schouder breedte'),
    (day1_id, 'Tricep Pushdowns', 3, '12-15', '60 sec', 6, 'Tricep isolatie');

  -- Insert exercises for Pull Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Deadlift', 4, '5-7', '180 sec', 1, 'Rug kracht'),
    (day2_id, 'Pull-ups', 4, '6-10', '120 sec', 2, 'Rug breedte'),
    (day2_id, 'Barbell Row', 3, '8-10', '120 sec', 3, 'Rug dikte'),
    (day2_id, 'Lat Pulldown', 3, '10-12', '90 sec', 4, 'Rug isolatie'),
    (day2_id, 'Bicep Curls', 3, '10-12', '60 sec', 5, 'Bicep isolatie'),
    (day2_id, 'Face Pulls', 3, '12-15', '60 sec', 6, 'Schouder gezondheid');

  -- Insert exercises for Legs Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day3_id, 'Squat', 4, '6-8', '120 sec', 1, 'Compound quadriceps'),
    (day3_id, 'Romanian Deadlift', 4, '8-10', '120 sec', 2, 'Hamstring compound'),
    (day3_id, 'Leg Press', 3, '8-10', '120 sec', 3, 'Quadriceps volume'),
    (day3_id, 'Leg Curls', 3, '10-12', '90 sec', 4, 'Hamstring isolatie'),
    (day3_id, 'Hip Thrusts', 3, '10-12', '120 sec', 5, 'Glute focus'),
    (day3_id, 'Standing Calf Raises', 4, '15-20', '60 sec', 6, 'Kuit training');

  -- Insert exercises for Full Body Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day4_id, 'Clean and Press', 3, '5-7', '120 sec', 1, 'Full body compound'),
    (day4_id, 'Dumbbell Squat', 3, '8-10', '90 sec', 2, 'Been kracht'),
    (day4_id, 'Push-ups', 3, '10-15', '90 sec', 3, 'Borst conditie'),
    (day4_id, 'Bent Over Row', 3, '8-10', '90 sec', 4, 'Rug kracht'),
    (day4_id, 'Planks', 3, '45-60 sec', '60 sec', 5, 'Core stabiliteit'),
    (day4_id, 'Burpees', 3, '8-12', '90 sec', 6, 'Cardio element');
END $$;

-- Schema 5: 5-Daags Upper/Lower/Upper/Lower/Full Body
DO $$
DECLARE
  schema_id uuid;
  day1_id uuid;
  day2_id uuid;
  day3_id uuid;
  day4_id uuid;
  day5_id uuid;
BEGIN
  -- Insert schema
  INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
  VALUES (
    '5-Daags Upper/Lower Split',
    'Geavanceerde 5-daags split met Upper/Lower verdeling en een full body dag. Voor serieuze lifters.',
    'Gym',
    '/images/mind/5.png',
    'published',
    'Advanced',
    '75 min',
    'Gevorderde lifters, 5x per week'
  ) RETURNING id INTO schema_id;

  -- Insert days
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES
    (schema_id, 1, 'Upper A', 'Dag 1: Borst en triceps focus met compound bewegingen.', 'Upper Body A (Borst, Triceps)', 1),
    (schema_id, 2, 'Lower A', 'Dag 2: Quadriceps en kuiten focus.', 'Lower Body A (Quadriceps, Calves)', 2),
    (schema_id, 3, 'Upper B', 'Dag 3: Rug en biceps focus met compound bewegingen.', 'Upper Body B (Rug, Biceps)', 3),
    (schema_id, 4, 'Lower B', 'Dag 4: Hamstrings en glutes focus.', 'Lower Body B (Hamstrings, Glutes)', 4),
    (schema_id, 5, 'Full Body', 'Dag 5: Complete full body workout voor conditie.', 'Full Body (Alle spiergroepen)', 5)
  RETURNING id INTO day1_id;

  -- Get day IDs
  SELECT id INTO day2_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2 LIMIT 1;
  SELECT id INTO day3_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 3 LIMIT 1;
  SELECT id INTO day4_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 4 LIMIT 1;
  SELECT id INTO day5_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 5 LIMIT 1;

  -- Insert exercises for Upper A
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Bench Press', 4, '6-8', '120 sec', 1, 'Compound borst'),
    (day1_id, 'Incline Bench Press', 3, '8-10', '120 sec', 2, 'Bovenste borst'),
    (day1_id, 'Dumbbell Flyes', 3, '10-12', '90 sec', 3, 'Borst isolatie'),
    (day1_id, 'Overhead Press', 3, '6-8', '120 sec', 4, 'Schouder kracht'),
    (day1_id, 'Tricep Pushdowns', 3, '12-15', '60 sec', 5, 'Tricep isolatie'),
    (day1_id, 'Diamond Push-ups', 3, '8-12', '60 sec', 6, 'Tricep compound');

  -- Insert exercises for Lower A
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Squat', 4, '6-8', '120 sec', 1, 'Compound quadriceps'),
    (day2_id, 'Leg Press', 3, '8-10', '120 sec', 2, 'Quadriceps volume'),
    (day2_id, 'Leg Extensions', 3, '10-12', '90 sec', 3, 'Quadriceps isolatie'),
    (day2_id, 'Walking Lunges', 3, '10-12 per been', '90 sec', 4, 'Unilaterale training'),
    (day2_id, 'Standing Calf Raises', 4, '15-20', '60 sec', 5, 'Kuit training'),
    (day2_id, 'Seated Calf Raises', 3, '15-20', '60 sec', 6, 'Kuit isolatie');

  -- Insert exercises for Upper B
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day3_id, 'Deadlift', 4, '5-7', '180 sec', 1, 'Rug kracht'),
    (day3_id, 'Pull-ups', 4, '6-10', '120 sec', 2, 'Rug breedte'),
    (day3_id, 'Barbell Row', 3, '8-10', '120 sec', 3, 'Rug dikte'),
    (day3_id, 'Lat Pulldown', 3, '10-12', '90 sec', 4, 'Rug isolatie'),
    (day3_id, 'Bicep Curls', 3, '10-12', '60 sec', 5, 'Bicep isolatie'),
    (day3_id, 'Hammer Curls', 3, '10-12', '60 sec', 6, 'Bicep variatie');

  -- Insert exercises for Lower B
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day4_id, 'Romanian Deadlift', 4, '8-10', '120 sec', 1, 'Hamstring compound'),
    (day4_id, 'Leg Curls', 3, '10-12', '90 sec', 2, 'Hamstring isolatie'),
    (day4_id, 'Hip Thrusts', 3, '10-12', '120 sec', 3, 'Glute focus'),
    (day4_id, 'Good Mornings', 3, '8-10', '90 sec', 4, 'Posterior chain'),
    (day4_id, 'Glute Bridges', 3, '12-15', '60 sec', 5, 'Glute isolatie'),
    (day4_id, 'Planks', 3, '60 sec', '60 sec', 6, 'Core stabiliteit');

  -- Insert exercises for Full Body
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day5_id, 'Clean and Press', 3, '5-7', '120 sec', 1, 'Full body compound'),
    (day5_id, 'Dumbbell Squat', 3, '8-10', '90 sec', 2, 'Been kracht'),
    (day5_id, 'Push-ups', 3, '10-15', '90 sec', 3, 'Borst conditie'),
    (day5_id, 'Bent Over Row', 3, '8-10', '90 sec', 4, 'Rug kracht'),
    (day5_id, 'Burpees', 3, '8-12', '90 sec', 5, 'Cardio element'),
    (day5_id, 'Mountain Climbers', 3, '30 sec', '60 sec', 6, 'Core cardio');
END $$;

-- Schema 6: 6-Daags Upper/Lower/Upper/Lower/Upper/Lower
DO $$
DECLARE
  schema_id uuid;
  day1_id uuid;
  day2_id uuid;
  day3_id uuid;
  day4_id uuid;
  day5_id uuid;
  day6_id uuid;
BEGIN
  -- Insert schema
  INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
  VALUES (
    '6-Daags Upper/Lower Split',
    'Intensieve 6-daags split voor ervaren lifters. Dubbele Upper/Lower cyclus per week voor maximale frequentie.',
    'Gym',
    '/images/mind/1.png',
    'published',
    'Advanced',
    '60 min',
    'Ervaren lifters, 6x per week'
  ) RETURNING id INTO schema_id;

  -- Insert days
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES
    (schema_id, 1, 'Upper A', 'Dag 1: Borst en triceps focus - zware compound bewegingen.', 'Upper Body A (Borst, Triceps)', 1),
    (schema_id, 2, 'Lower A', 'Dag 2: Quadriceps focus - zware compound bewegingen.', 'Lower Body A (Quadriceps)', 2),
    (schema_id, 3, 'Upper B', 'Dag 3: Rug en biceps focus - zware compound bewegingen.', 'Upper Body B (Rug, Biceps)', 3),
    (schema_id, 4, 'Lower B', 'Dag 4: Hamstrings focus - zware compound bewegingen.', 'Lower Body B (Hamstrings)', 4),
    (schema_id, 5, 'Upper C', 'Dag 5: Schouders en armen focus - isolatie en volume.', 'Upper Body C (Schouders, Armen)', 5),
    (schema_id, 6, 'Lower C', 'Dag 6: Glutes en kuiten focus - isolatie en volume.', 'Lower Body C (Glutes, Calves)', 6)
  RETURNING id INTO day1_id;

  -- Get day IDs
  SELECT id INTO day2_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2 LIMIT 1;
  SELECT id INTO day3_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 3 LIMIT 1;
  SELECT id INTO day4_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 4 LIMIT 1;
  SELECT id INTO day5_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 5 LIMIT 1;
  SELECT id INTO day6_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 6 LIMIT 1;

  -- Insert exercises for Upper A (Heavy)
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Bench Press', 4, '6-8', '120 sec', 1, 'Compound borst'),
    (day1_id, 'Incline Bench Press', 3, '6-8', '120 sec', 2, 'Bovenste borst'),
    (day1_id, 'Dumbbell Press', 3, '8-10', '90 sec', 3, 'Schouder kracht'),
    (day1_id, 'Tricep Pushdowns', 3, '10-12', '60 sec', 4, 'Tricep isolatie'),
    (day1_id, 'Diamond Push-ups', 3, '8-12', '60 sec', 5, 'Tricep compound');

  -- Insert exercises for Lower A (Heavy)
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Squat', 4, '6-8', '120 sec', 1, 'Compound quadriceps'),
    (day2_id, 'Leg Press', 3, '8-10', '120 sec', 2, 'Quadriceps volume'),
    (day2_id, 'Leg Extensions', 3, '10-12', '90 sec', 3, 'Quadriceps isolatie'),
    (day2_id, 'Walking Lunges', 3, '10-12 per been', '90 sec', 4, 'Unilaterale training');

  -- Insert exercises for Upper B (Heavy)
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day3_id, 'Deadlift', 4, '5-7', '180 sec', 1, 'Rug kracht'),
    (day3_id, 'Pull-ups', 4, '6-10', '120 sec', 2, 'Rug breedte'),
    (day3_id, 'Barbell Row', 3, '8-10', '120 sec', 3, 'Rug dikte'),
    (day3_id, 'Bicep Curls', 3, '10-12', '60 sec', 4, 'Bicep isolatie'),
    (day3_id, 'Hammer Curls', 3, '10-12', '60 sec', 5, 'Bicep variatie');

  -- Insert exercises for Lower B (Heavy)
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day4_id, 'Romanian Deadlift', 4, '8-10', '120 sec', 1, 'Hamstring compound'),
    (day4_id, 'Leg Curls', 3, '10-12', '90 sec', 2, 'Hamstring isolatie'),
    (day4_id, 'Good Mornings', 3, '8-10', '90 sec', 3, 'Posterior chain'),
    (day4_id, 'Single Leg Deadlift', 3, '8-10 per been', '90 sec', 4, 'Unilaterale hamstring');

  -- Insert exercises for Upper C (Volume)
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day5_id, 'Lateral Raises', 4, '12-15', '60 sec', 1, 'Schouder breedte'),
    (day5_id, 'Front Raises', 3, '12-15', '60 sec', 2, 'Schouder voorkant'),
    (day5_id, 'Rear Delt Flyes', 3, '12-15', '60 sec', 3, 'Schouder achterkant'),
    (day5_id, 'Tricep Extensions', 3, '12-15', '60 sec', 4, 'Tricep volume'),
    (day5_id, 'Bicep Curls', 3, '12-15', '60 sec', 5, 'Bicep volume');

  -- Insert exercises for Lower C (Volume)
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day6_id, 'Hip Thrusts', 4, '12-15', '90 sec', 1, 'Glute focus'),
    (day6_id, 'Glute Bridges', 3, '15-20', '60 sec', 2, 'Glute isolatie'),
    (day6_id, 'Standing Calf Raises', 4, '15-20', '60 sec', 3, 'Kuit training'),
    (day6_id, 'Seated Calf Raises', 3, '15-20', '60 sec', 4, 'Kuit isolatie'),
    (day6_id, 'Planks', 3, '60 sec', '60 sec', 5, 'Core stabiliteit');
END $$;

-- Schema 7: 2-Daags Bodyweight (Beginner)
DO $$
DECLARE
  schema_id uuid;
  day1_id uuid;
  day2_id uuid;
BEGIN
  -- Insert schema
  INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
  VALUES (
    '2-Daags Bodyweight Beginner',
    'Perfect voor beginners die thuis willen trainen. Complete bodyweight workouts voor kracht en conditie.',
    'Bodyweight',
    '/images/mind/2.png',
    'published',
    'Beginner',
    '30 min',
    'Beginners, 2x per week trainen, thuis'
  ) RETURNING id INTO schema_id;

  -- Insert day 1
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 1, 'Dag 1: Upper Body',
    'Bovenlichaam training met push bewegingen. Perfect voor thuis.',
    'Upper Body (Borst, Schouders, Triceps)',
    1
  ) RETURNING id INTO day1_id;

  -- Insert day 2
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 2, 'Dag 2: Lower Body',
    'Onderlichaam training met been oefeningen. Complete thuis workout.',
    'Lower Body (Quadriceps, Hamstrings, Glutes, Core)',
    2
  ) RETURNING id INTO day2_id;

  -- Insert exercises for day 1
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Push-ups', 3, '8-12', '90 sec', 1, 'Borst compound'),
    (day1_id, 'Incline Push-ups', 3, '10-15', '90 sec', 2, 'Bovenste borst'),
    (day1_id, 'Pike Push-ups', 3, '6-10', '90 sec', 3, 'Schouder kracht'),
    (day1_id, 'Diamond Push-ups', 3, '5-8', '90 sec', 4, 'Tricep focus'),
    (day1_id, 'Plank Hold', 3, '30-45 sec', '60 sec', 5, 'Core stabiliteit');

  -- Insert exercises for day 2
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Bodyweight Squats', 3, '15-20', '90 sec', 1, 'Quadriceps compound'),
    (day2_id, 'Lunges', 3, '10-12 per been', '90 sec', 2, 'Unilaterale training'),
    (day2_id, 'Glute Bridges', 3, '15-20', '60 sec', 3, 'Glute isolatie'),
    (day2_id, 'Wall Sit', 3, '30-45 sec', '60 sec', 4, 'Quadriceps endurance'),
    (day2_id, 'Mountain Climbers', 3, '20-30 sec', '60 sec', 5, 'Core cardio');
END $$;

-- Schema 8: 3-Daags Bodyweight (Intermediate)
DO $$
DECLARE
  schema_id uuid;
  day1_id uuid;
  day2_id uuid;
  day3_id uuid;
BEGIN
  -- Insert schema
  INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
  VALUES (
    '3-Daags Bodyweight Intermediate',
    'Gevorderde bodyweight training voor thuis. Intensieve workouts voor kracht en conditie.',
    'Bodyweight',
    '/images/mind/3.png',
    'published',
    'Intermediate',
    '45 min',
    'Intermediate lifters, 3x per week trainen, thuis'
  ) RETURNING id INTO schema_id;

  -- Insert days
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES
    (schema_id, 1, 'Push Day', 'Push bewegingen voor borst, schouders en triceps.', 'Push (Borst, Schouders, Triceps)', 1),
    (schema_id, 2, 'Pull Day', 'Pull bewegingen voor rug en biceps (met banden of meubels).', 'Pull (Rug, Biceps)', 2),
    (schema_id, 3, 'Legs Day', 'Complete been training met bodyweight oefeningen.', 'Legs (Quadriceps, Hamstrings, Glutes)', 3)
  RETURNING id INTO day1_id;

  -- Get day IDs
  SELECT id INTO day2_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 2 LIMIT 1;
  SELECT id INTO day3_id FROM training_schema_days WHERE schema_id = schema_id AND day_number = 3 LIMIT 1;

  -- Insert exercises for Push Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Push-ups', 4, '10-15', '90 sec', 1, 'Borst compound'),
    (day1_id, 'Decline Push-ups', 3, '8-12', '90 sec', 2, 'Zwaardere borst'),
    (day1_id, 'Pike Push-ups', 3, '8-12', '90 sec', 3, 'Schouder kracht'),
    (day1_id, 'Diamond Push-ups', 3, '6-10', '90 sec', 4, 'Tricep focus'),
    (day1_id, 'Handstand Hold', 3, '15-30 sec', '120 sec', 5, 'Schouder stabiliteit');

  -- Insert exercises for Pull Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Pull-ups (als mogelijk)', 4, '5-10', '120 sec', 1, 'Rug compound'),
    (day2_id, 'Inverted Rows', 4, '8-12', '90 sec', 2, 'Rug alternatief'),
    (day2_id, 'Superman Hold', 3, '30-45 sec', '60 sec', 3, 'Rug isolatie'),
    (day2_id, 'Resistance Band Rows', 3, '12-15', '60 sec', 4, 'Rug met band'),
    (day2_id, 'Bicep Curls (met band)', 3, '12-15', '60 sec', 5, 'Bicep isolatie');

  -- Insert exercises for Legs Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day3_id, 'Bodyweight Squats', 4, '20-25', '90 sec', 1, 'Quadriceps compound'),
    (day3_id, 'Jump Squats', 3, '10-15', '90 sec', 2, 'Explosieve kracht'),
    (day3_id, 'Walking Lunges', 3, '15-20 per been', '90 sec', 3, 'Unilaterale training'),
    (day3_id, 'Single Leg Glute Bridges', 3, '12-15 per been', '60 sec', 4, 'Glute isolatie'),
    (day3_id, 'Wall Sit', 3, '45-60 sec', '60 sec', 5, 'Quadriceps endurance');
END $$; 