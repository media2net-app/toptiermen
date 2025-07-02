-- Update Training Schema Exercises to link with exercises library
-- This script will update the existing training_schema_exercises table

-- First, let's add a proper exercise_id column if it doesn't exist
ALTER TABLE training_schema_exercises 
ADD COLUMN IF NOT EXISTS exercise_id INTEGER REFERENCES exercises(id) ON DELETE SET NULL;

-- Update existing exercises to link with the exercises library
-- We'll match by exercise name

-- Update Bench Press exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%bench press%' AND primary_muscle = 'Borst' LIMIT 1)
WHERE exercise_name ILIKE '%bench press%' AND exercise_id IS NULL;

-- Update Deadlift exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%deadlift%' AND primary_muscle = 'Rug' LIMIT 1)
WHERE exercise_name ILIKE '%deadlift%' AND exercise_id IS NULL;

-- Update Squat exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%squat%' AND primary_muscle = 'Benen' LIMIT 1)
WHERE exercise_name ILIKE '%squat%' AND exercise_id IS NULL;

-- Update Pull-ups exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%pull%up%' AND primary_muscle = 'Rug' LIMIT 1)
WHERE exercise_name ILIKE '%pull%up%' AND exercise_id IS NULL;

-- Update Barbell Row exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%barbell row%' AND primary_muscle = 'Rug' LIMIT 1)
WHERE exercise_name ILIKE '%barbell row%' AND exercise_id IS NULL;

-- Update Lat Pulldown exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%lat pulldown%' AND primary_muscle = 'Rug' LIMIT 1)
WHERE exercise_name ILIKE '%lat pulldown%' AND exercise_id IS NULL;

-- Update Bicep Curls exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%bicep curl%' AND primary_muscle = 'Biceps' LIMIT 1)
WHERE exercise_name ILIKE '%bicep curl%' AND exercise_id IS NULL;

-- Update Hammer Curls exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%hammer curl%' AND primary_muscle = 'Biceps' LIMIT 1)
WHERE exercise_name ILIKE '%hammer curl%' AND exercise_id IS NULL;

-- Update Tricep exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%tricep%' AND primary_muscle = 'Triceps' LIMIT 1)
WHERE exercise_name ILIKE '%tricep%' AND exercise_id IS NULL;

-- Update Shoulder exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%shoulder press%' AND primary_muscle = 'Schouders' LIMIT 1)
WHERE exercise_name ILIKE '%shoulder press%' AND exercise_id IS NULL;

-- Update Lateral Raises exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%lateral raise%' AND primary_muscle = 'Schouders' LIMIT 1)
WHERE exercise_name ILIKE '%lateral raise%' AND exercise_id IS NULL;

-- Update Leg Press exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%leg press%' AND primary_muscle = 'Benen' LIMIT 1)
WHERE exercise_name ILIKE '%leg press%' AND exercise_id IS NULL;

-- Update Leg Extensions exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%leg extension%' AND primary_muscle = 'Benen' LIMIT 1)
WHERE exercise_name ILIKE '%leg extension%' AND exercise_id IS NULL;

-- Update Leg Curls exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%leg curl%' AND primary_muscle = 'Benen' LIMIT 1)
WHERE exercise_name ILIKE '%leg curl%' AND exercise_id IS NULL;

-- Update Calf Raises exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%calf raise%' AND primary_muscle = 'Kuiten' LIMIT 1)
WHERE exercise_name ILIKE '%calf raise%' AND exercise_id IS NULL;

-- Update Push-ups exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%push%up%' AND primary_muscle = 'Borst' LIMIT 1)
WHERE exercise_name ILIKE '%push%up%' AND exercise_id IS NULL;

-- Update Face Pulls exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%face pull%' AND primary_muscle = 'Schouders' LIMIT 1)
WHERE exercise_name ILIKE '%face pull%' AND exercise_id IS NULL;

-- Update Planks exercises
UPDATE training_schema_exercises 
SET exercise_id = (SELECT id FROM exercises WHERE name ILIKE '%plank%' AND primary_muscle = 'Core' LIMIT 1)
WHERE exercise_name ILIKE '%plank%' AND exercise_id IS NULL;

-- Show statistics of the update
SELECT 
  COUNT(*) as total_exercises,
  COUNT(exercise_id) as linked_exercises,
  COUNT(*) - COUNT(exercise_id) as unlinked_exercises
FROM training_schema_exercises; 