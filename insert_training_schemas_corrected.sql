-- Insert Training Schemas with Days and Exercises (CORRECTED VERSION)
-- Run this SQL in your Supabase SQL editor after creating the tables

-- Schema 1: 2-Daags Full Body (Beginner)
DO $$
DECLARE
  schema_id uuid;
  day1_id uuid;
  day2_id uuid;
BEGIN
  -- Insert schema
  INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
  VALUES (
    '2-Daags Full Body Beginner',
    'Perfect voor beginners die 2x per week willen trainen. Complete full body workouts voor kracht en conditie.',
    'Gym',
    '/images/mind/1.png',
    'published',
    'Beginner',
    '45 min',
    'Beginners, 2x per week trainen'
  ) RETURNING id INTO schema_id;

  -- Insert day 1
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 1, 'Dag 1: Push Focus',
    'Focus op borst, schouders en triceps. Perfecte start van de week.',
    'Push (Borst, Schouders, Triceps)',
    1
  ) RETURNING id INTO day1_id;

  -- Insert day 2
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 2, 'Dag 2: Pull Focus',
    'Focus op rug, biceps en achterste schouders. Compleet bovenlichaam.',
    'Pull (Rug, Biceps, Achterste Schouders)',
    2
  ) RETURNING id INTO day2_id;

  -- Insert exercises for day 1
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Bench Press', 3, '8-12', '90 sec', 1, 'Focus op goede vorm'),
    (day1_id, 'Dumbbell Shoulder Press', 3, '8-12', '90 sec', 2, 'Controleer de beweging'),
    (day1_id, 'Incline Dumbbell Press', 3, '10-12', '90 sec', 3, '30-45 graden helling'),
    (day1_id, 'Lateral Raises', 3, '12-15', '60 sec', 4, 'Lichte gewichten, perfecte vorm'),
    (day1_id, 'Tricep Dips', 3, '8-12', '60 sec', 5, 'Of machine als alternatief'),
    (day1_id, 'Push-ups', 3, 'Max reps', '60 sec', 6, 'Cool-down oefening');

  -- Insert exercises for day 2
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Deadlift', 3, '6-8', '120 sec', 1, 'Focus op techniek'),
    (day2_id, 'Pull-ups', 3, '6-10', '90 sec', 2, 'Assisted als nodig'),
    (day2_id, 'Barbell Row', 3, '8-12', '90 sec', 3, 'Houd rug recht'),
    (day2_id, 'Lat Pulldown', 3, '10-12', '90 sec', 4, 'Controleer schouderbladen'),
    (day2_id, 'Bicep Curls', 3, '12-15', '60 sec', 5, 'Strikte vorm'),
    (day2_id, 'Face Pulls', 3, '12-15', '60 sec', 6, 'Voor schouder gezondheid');
END $$;

-- Schema 2: 3-Daags Push/Pull/Legs (Intermediate)
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
    '3-Daags Push/Pull/Legs',
    'Klassiek 3-daags schema voor optimale spiergroei. Push, Pull, Legs splitsing.',
    'Gym',
    '/images/mind/2.png',
    'published',
    'Intermediate',
    '60 min',
    'Intermediate lifters, 3x per week'
  ) RETURNING id INTO schema_id;

  -- Insert day 1
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 1, 'Push Day', 'Borst, schouders en triceps. Compound en isolatie oefeningen.', 'Push (Borst, Schouders, Triceps)', 1
  ) RETURNING id INTO day1_id;

  -- Insert day 2
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 2, 'Pull Day', 'Rug en biceps. Focus op breedte en dikte van de rug.', 'Pull (Rug, Biceps)', 2
  ) RETURNING id INTO day2_id;

  -- Insert day 3
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 3, 'Legs Day', 'Complete been training inclusief kuiten en core.', 'Legs (Quadriceps, Hamstrings, Glutes)', 3
  ) RETURNING id INTO day3_id;

  -- Insert exercises for Push Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Bench Press', 4, '6-8', '120 sec', 1, 'Compound beweging'),
    (day1_id, 'Overhead Press', 3, '6-8', '120 sec', 2, 'Schouder kracht'),
    (day1_id, 'Incline Bench Press', 3, '8-10', '90 sec', 3, 'Bovenste borst'),
    (day1_id, 'Dumbbell Flyes', 3, '10-12', '90 sec', 4, 'Borst isolatie'),
    (day1_id, 'Lateral Raises', 3, '12-15', '60 sec', 5, 'Schouder breedte'),
    (day1_id, 'Tricep Pushdowns', 3, '12-15', '60 sec', 6, 'Tricep isolatie');

  -- Insert exercises for Pull Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Deadlift', 4, '5-7', '180 sec', 1, 'Kracht focus'),
    (day2_id, 'Pull-ups', 4, '6-10', '120 sec', 2, 'Rug breedte'),
    (day2_id, 'Barbell Row', 3, '8-10', '90 sec', 3, 'Rug dikte'),
    (day2_id, 'Lat Pulldown', 3, '10-12', '90 sec', 4, 'Rug isolatie'),
    (day2_id, 'Bicep Curls', 3, '10-12', '60 sec', 5, 'Bicep focus'),
    (day2_id, 'Hammer Curls', 3, '12-15', '60 sec', 6, 'Onderarm en bicep');

  -- Insert exercises for Legs Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day3_id, 'Squat', 4, '6-8', '180 sec', 1, 'Been kracht'),
    (day3_id, 'Romanian Deadlift', 3, '8-10', '120 sec', 2, 'Hamstrings'),
    (day3_id, 'Leg Press', 3, '10-12', '120 sec', 3, 'Quadriceps'),
    (day3_id, 'Leg Extensions', 3, '12-15', '90 sec', 4, 'Quad isolatie'),
    (day3_id, 'Leg Curls', 3, '12-15', '90 sec', 5, 'Hamstring isolatie'),
    (day3_id, 'Calf Raises', 4, '15-20', '60 sec', 6, 'Kuit training');
END $$;

-- Schema 3: 4-Daags Upper/Lower Split (Intermediate)
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
    '4-Daags Upper/Lower Split',
    'Geavanceerde 4-daags split voor serieuze lifters. Upper/Lower verdeling voor optimale herstel.',
    'Gym',
    '/images/mind/3.png',
    'published',
    'Intermediate',
    '75 min',
    'Gevorderde lifters, 4x per week'
  ) RETURNING id INTO schema_id;

  -- Insert day 1
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 1, 'Upper A', 'Dag 1: Borst en triceps focus met compound bewegingen.', 'Upper Body A (Borst, Triceps)', 1
  ) RETURNING id INTO day1_id;

  -- Insert day 2
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 2, 'Lower A', 'Dag 2: Quadriceps en kuiten focus.', 'Lower Body A (Quadriceps, Calves)', 2
  ) RETURNING id INTO day2_id;

  -- Insert day 3
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 3, 'Upper B', 'Dag 3: Rug en biceps focus met compound bewegingen.', 'Upper Body B (Rug, Biceps)', 3
  ) RETURNING id INTO day3_id;

  -- Insert day 4
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 4, 'Lower B', 'Dag 4: Hamstrings en glutes focus.', 'Lower Body B (Hamstrings, Glutes)', 4
  ) RETURNING id INTO day4_id;

  -- Insert exercises for Upper A
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Bench Press', 4, '6-8', '120 sec', 1, 'Compound borst'),
    (day1_id, 'Incline Bench Press', 3, '8-10', '120 sec', 2, 'Bovenste borst'),
    (day1_id, 'Dumbbell Press', 3, '8-10', '90 sec', 3, 'Borst stabiliteit'),
    (day1_id, 'Overhead Press', 3, '6-8', '120 sec', 4, 'Schouder kracht'),
    (day1_id, 'Tricep Dips', 3, '8-12', '90 sec', 5, 'Tricep compound'),
    (day1_id, 'Tricep Pushdowns', 3, '12-15', '60 sec', 6, 'Tricep isolatie');

  -- Insert exercises for Lower A
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Squat', 4, '6-8', '180 sec', 1, 'Quadriceps compound'),
    (day2_id, 'Leg Press', 3, '8-10', '120 sec', 2, 'Quadriceps focus'),
    (day2_id, 'Leg Extensions', 3, '12-15', '90 sec', 3, 'Quadriceps isolatie'),
    (day2_id, 'Walking Lunges', 3, '10 per been', '90 sec', 4, 'Unilaterale training'),
    (day2_id, 'Standing Calf Raises', 4, '15-20', '60 sec', 5, 'Kuit kracht'),
    (day2_id, 'Seated Calf Raises', 3, '20-25', '60 sec', 6, 'Kuit isolatie');

  -- Insert exercises for Upper B
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day3_id, 'Deadlift', 4, '5-7', '180 sec', 1, 'Rug kracht'),
    (day3_id, 'Pull-ups', 4, '6-10', '120 sec', 2, 'Rug breedte'),
    (day3_id, 'Barbell Row', 3, '8-10', '120 sec', 3, 'Rug dikte'),
    (day3_id, 'Lat Pulldown', 3, '10-12', '90 sec', 4, 'Rug isolatie'),
    (day3_id, 'Bicep Curls', 3, '10-12', '90 sec', 5, 'Bicep compound'),
    (day3_id, 'Hammer Curls', 3, '12-15', '60 sec', 6, 'Bicep variatie');

  -- Insert exercises for Lower B
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day4_id, 'Romanian Deadlift', 4, '8-10', '120 sec', 1, 'Hamstring compound'),
    (day4_id, 'Leg Curls', 3, '10-12', '90 sec', 2, 'Hamstring isolatie'),
    (day4_id, 'Hip Thrusts', 3, '10-12', '120 sec', 3, 'Glute focus'),
    (day4_id, 'Good Mornings', 3, '8-10', '90 sec', 4, 'Posterior chain'),
    (day4_id, 'Standing Calf Raises', 4, '15-20', '60 sec', 5, 'Kuit training'),
    (day4_id, 'Planks', 3, '60 sec', '60 sec', 6, 'Core stabiliteit');
END $$;

-- Schema 4: 5-Daags Bro Split (Advanced)
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
    '5-Daags Bro Split',
    'Klassieke 5-daags spiergroep split. Elke dag focus op één spiergroep voor maximale hypertrofie.',
    'Gym',
    '/images/mind/4.png',
    'published',
    'Advanced',
    '90 min',
    'Gevorderde lifters, 5x per week'
  ) RETURNING id INTO schema_id;

  -- Insert day 1
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 1, 'Chest Day', 'Dag 1: Complete borst training met alle hoeken.', 'Chest (Borst)', 1
  ) RETURNING id INTO day1_id;

  -- Insert day 2
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 2, 'Back Day', 'Dag 2: Rug breedte en dikte ontwikkeling.', 'Back (Rug)', 2
  ) RETURNING id INTO day2_id;

  -- Insert day 3
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 3, 'Shoulders Day', 'Dag 3: Complete schouder training.', 'Shoulders (Schouders)', 3
  ) RETURNING id INTO day3_id;

  -- Insert day 4
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 4, 'Arms Day', 'Dag 4: Biceps en triceps focus.', 'Arms (Armen)', 4
  ) RETURNING id INTO day4_id;

  -- Insert day 5
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 5, 'Legs Day', 'Dag 5: Complete been training.', 'Legs (Benen)', 5
  ) RETURNING id INTO day5_id;

  -- Insert exercises for Chest Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Bench Press', 4, '6-8', '120 sec', 1, 'Compound borst'),
    (day1_id, 'Incline Bench Press', 3, '8-10', '120 sec', 2, 'Bovenste borst'),
    (day1_id, 'Decline Bench Press', 3, '8-10', '120 sec', 3, 'Onderste borst'),
    (day1_id, 'Dumbbell Flyes', 3, '10-12', '90 sec', 4, 'Borst isolatie'),
    (day1_id, 'Cable Flyes', 3, '12-15', '90 sec', 5, 'Borst finishing'),
    (day1_id, 'Push-ups', 3, 'Max reps', '60 sec', 6, 'Cool-down');

  -- Insert exercises for Back Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Deadlift', 4, '5-7', '180 sec', 1, 'Rug kracht'),
    (day2_id, 'Pull-ups', 4, '6-10', '120 sec', 2, 'Rug breedte'),
    (day2_id, 'Barbell Row', 3, '8-10', '120 sec', 3, 'Rug dikte'),
    (day2_id, 'Lat Pulldown', 3, '10-12', '90 sec', 4, 'Rug isolatie'),
    (day2_id, 'Seated Cable Row', 3, '10-12', '90 sec', 5, 'Rug finishing'),
    (day2_id, 'Face Pulls', 3, '12-15', '60 sec', 6, 'Schouder gezondheid');

  -- Insert exercises for Shoulders Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day3_id, 'Overhead Press', 4, '6-8', '120 sec', 1, 'Schouder kracht'),
    (day3_id, 'Dumbbell Shoulder Press', 3, '8-10', '120 sec', 2, 'Schouder compound'),
    (day3_id, 'Lateral Raises', 4, '12-15', '90 sec', 3, 'Middelste deltavleugel'),
    (day3_id, 'Front Raises', 3, '12-15', '90 sec', 4, 'Voorste deltavleugel'),
    (day3_id, 'Rear Delt Flyes', 3, '12-15', '90 sec', 5, 'Achterste deltavleugel'),
    (day3_id, 'Shrugs', 3, '12-15', '60 sec', 6, 'Trapezius');

  -- Insert exercises for Arms Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day4_id, 'Barbell Curls', 4, '8-10', '90 sec', 1, 'Bicep compound'),
    (day4_id, 'Hammer Curls', 3, '10-12', '90 sec', 2, 'Bicep variatie'),
    (day4_id, 'Preacher Curls', 3, '10-12', '90 sec', 3, 'Bicep isolatie'),
    (day4_id, 'Tricep Dips', 4, '8-10', '90 sec', 4, 'Tricep compound'),
    (day4_id, 'Tricep Pushdowns', 3, '12-15', '90 sec', 5, 'Tricep isolatie'),
    (day4_id, 'Overhead Tricep Extension', 3, '12-15', '60 sec', 6, 'Tricep finishing');

  -- Insert exercises for Legs Day
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day5_id, 'Squat', 4, '6-8', '180 sec', 1, 'Been kracht'),
    (day5_id, 'Romanian Deadlift', 3, '8-10', '120 sec', 2, 'Hamstrings'),
    (day5_id, 'Leg Press', 3, '10-12', '120 sec', 3, 'Quadriceps'),
    (day5_id, 'Leg Extensions', 3, '12-15', '90 sec', 4, 'Quad isolatie'),
    (day5_id, 'Leg Curls', 3, '12-15', '90 sec', 5, 'Hamstring isolatie'),
    (day5_id, 'Calf Raises', 4, '15-20', '60 sec', 6, 'Kuit training');
END $$;

-- Schema 5: 6-Daags Push/Pull/Legs (Advanced)
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
    '6-Daags Push/Pull/Legs',
    'Intensief 6-daags schema voor ervaren lifters. Dubbele Push/Pull/Legs cyclus per week.',
    'Gym',
    '/images/mind/1.png',
    'published',
    'Advanced',
    '75 min',
    'Ervaren lifters, 6x per week'
  ) RETURNING id INTO schema_id;

  -- Insert day 1
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 1, 'Push A', 'Dag 1: Borst en triceps focus met compound bewegingen.', 'Push A (Borst, Triceps)', 1
  ) RETURNING id INTO day1_id;

  -- Insert day 2
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 2, 'Pull A', 'Dag 2: Rug en biceps focus met compound bewegingen.', 'Pull A (Rug, Biceps)', 2
  ) RETURNING id INTO day2_id;

  -- Insert day 3
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 3, 'Legs A', 'Dag 3: Quadriceps en kuiten focus.', 'Legs A (Quadriceps, Calves)', 3
  ) RETURNING id INTO day3_id;

  -- Insert day 4
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 4, 'Push B', 'Dag 4: Schouders en triceps focus.', 'Push B (Schouders, Triceps)', 4
  ) RETURNING id INTO day4_id;

  -- Insert day 5
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 5, 'Pull B', 'Dag 5: Rug en biceps focus met isolatie.', 'Pull B (Rug, Biceps)', 5
  ) RETURNING id INTO day5_id;

  -- Insert day 6
  INSERT INTO training_schema_days (schema_id, day_number, name, description, focus_area, order_index)
  VALUES (
    schema_id, 6, 'Legs B', 'Dag 6: Hamstrings en glutes focus.', 'Legs B (Hamstrings, Glutes)', 6
  ) RETURNING id INTO day6_id;

  -- Insert exercises for Push A
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day1_id, 'Bench Press', 4, '6-8', '120 sec', 1, 'Compound borst'),
    (day1_id, 'Incline Bench Press', 3, '8-10', '120 sec', 2, 'Bovenste borst'),
    (day1_id, 'Dumbbell Press', 3, '8-10', '90 sec', 3, 'Borst stabiliteit'),
    (day1_id, 'Tricep Dips', 3, '8-12', '90 sec', 4, 'Tricep compound'),
    (day1_id, 'Tricep Pushdowns', 3, '12-15', '60 sec', 5, 'Tricep isolatie'),
    (day1_id, 'Overhead Tricep Extension', 3, '12-15', '60 sec', 6, 'Tricep finishing');

  -- Insert exercises for Pull A
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day2_id, 'Deadlift', 4, '5-7', '180 sec', 1, 'Rug kracht'),
    (day2_id, 'Pull-ups', 4, '6-10', '120 sec', 2, 'Rug breedte'),
    (day2_id, 'Barbell Row', 3, '8-10', '120 sec', 3, 'Rug dikte'),
    (day2_id, 'Bicep Curls', 3, '10-12', '90 sec', 4, 'Bicep compound'),
    (day2_id, 'Hammer Curls', 3, '12-15', '60 sec', 5, 'Bicep variatie'),
    (day2_id, 'Preacher Curls', 3, '10-12', '60 sec', 6, 'Bicep isolatie');

  -- Insert exercises for Legs A
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day3_id, 'Squat', 4, '6-8', '180 sec', 1, 'Quadriceps compound'),
    (day3_id, 'Leg Press', 3, '8-10', '120 sec', 2, 'Quadriceps focus'),
    (day3_id, 'Leg Extensions', 3, '12-15', '90 sec', 3, 'Quadriceps isolatie'),
    (day3_id, 'Walking Lunges', 3, '10 per been', '90 sec', 4, 'Unilaterale training'),
    (day3_id, 'Standing Calf Raises', 4, '15-20', '60 sec', 5, 'Kuit kracht'),
    (day3_id, 'Seated Calf Raises', 3, '20-25', '60 sec', 6, 'Kuit isolatie');

  -- Insert exercises for Push B
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day4_id, 'Overhead Press', 4, '6-8', '120 sec', 1, 'Schouder kracht'),
    (day4_id, 'Dumbbell Shoulder Press', 3, '8-10', '120 sec', 2, 'Schouder compound'),
    (day4_id, 'Lateral Raises', 4, '12-15', '90 sec', 3, 'Middelste deltavleugel'),
    (day4_id, 'Front Raises', 3, '12-15', '90 sec', 4, 'Voorste deltavleugel'),
    (day4_id, 'Tricep Dips', 3, '8-12', '90 sec', 5, 'Tricep compound'),
    (day4_id, 'Tricep Pushdowns', 3, '12-15', '60 sec', 6, 'Tricep isolatie');

  -- Insert exercises for Pull B
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day5_id, 'Barbell Row', 4, '8-10', '120 sec', 1, 'Rug dikte'),
    (day5_id, 'Lat Pulldown', 3, '10-12', '90 sec', 2, 'Rug breedte'),
    (day5_id, 'Seated Cable Row', 3, '10-12', '90 sec', 3, 'Rug isolatie'),
    (day5_id, 'Face Pulls', 3, '12-15', '90 sec', 4, 'Schouder gezondheid'),
    (day5_id, 'Barbell Curls', 3, '10-12', '90 sec', 5, 'Bicep compound'),
    (day5_id, 'Hammer Curls', 3, '12-15', '60 sec', 6, 'Bicep variatie');

  -- Insert exercises for Legs B
  INSERT INTO training_schema_exercises (schema_day_id, exercise_name, sets, reps, rest_time, order_index, notes)
  VALUES
    (day6_id, 'Romanian Deadlift', 4, '8-10', '120 sec', 1, 'Hamstring compound'),
    (day6_id, 'Leg Curls', 3, '10-12', '90 sec', 2, 'Hamstring isolatie'),
    (day6_id, 'Hip Thrusts', 3, '10-12', '120 sec', 3, 'Glute focus'),
    (day6_id, 'Good Mornings', 3, '8-10', '90 sec', 4, 'Posterior chain'),
    (day6_id, 'Standing Calf Raises', 4, '15-20', '60 sec', 5, 'Kuit training'),
    (day6_id, 'Planks', 3, '60 sec', '60 sec', 6, 'Core stabiliteit');
END $$; 