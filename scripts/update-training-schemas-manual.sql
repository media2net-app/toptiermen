-- Update Training Schemas for Rick's Requirements
-- Run this script in Supabase Dashboard > SQL Editor

-- 1. Add new columns to training_schemas table
ALTER TABLE training_schemas 
ADD COLUMN IF NOT EXISTS training_goal VARCHAR(50) DEFAULT 'spiermassa',
ADD COLUMN IF NOT EXISTS rep_range VARCHAR(20) DEFAULT '8-12',
ADD COLUMN IF NOT EXISTS rest_time_seconds INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS equipment_type VARCHAR(20) DEFAULT 'gym';

-- 2. Add new columns to training_schema_exercises table
ALTER TABLE training_schema_exercises 
ADD COLUMN IF NOT EXISTS target_reps VARCHAR(20),
ADD COLUMN IF NOT EXISTS target_sets INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS rest_time_seconds INTEGER DEFAULT 90;

-- 3. Update existing schemas to have training_goal = 'spiermassa'
UPDATE training_schemas 
SET 
  training_goal = 'spiermassa',
  rep_range = '8-12',
  rest_time_seconds = 90,
  equipment_type = 'gym'
WHERE training_goal IS NULL;

-- 4. Update existing exercises to have default values
UPDATE training_schema_exercises 
SET 
  target_reps = '8-12',
  target_sets = 4,
  rest_time_seconds = 90
WHERE target_reps IS NULL;

-- 5. Update all exercises with 10 reps to show 8-12 range
UPDATE training_schema_exercises 
SET 
  reps = '10',
  target_reps = '8-12'
WHERE reps = '10';

-- 6. Add muscle failure warning to all schema descriptions
UPDATE training_schemas 
SET description = description || E'\n\n⚠️ **BELANGRIJK:** We adviseren ten alle tijden om het aantal herhalingen te doen tot spierfalen moment voor optimale resultaten.'
WHERE description NOT LIKE '%spierfalen%' 
AND description NOT LIKE '%Spierfalen%';

-- 7. Add muscle failure warning to all schema day descriptions
UPDATE training_schema_days 
SET description = COALESCE(description, '') || E'\n\n⚠️ **BELANGRIJK:** Doe alle oefeningen tot spierfalen voor optimale resultaten.'
WHERE description NOT LIKE '%spierfalen%' 
AND description NOT LIKE '%Spierfalen%';

-- 8. Verify the changes
SELECT 
  'Training schemas updated successfully!' as status,
  COUNT(*) as total_schemas,
  COUNT(CASE WHEN training_goal = 'spiermassa' THEN 1 END) as muscle_mass_schemas,
  COUNT(CASE WHEN rep_range = '8-12' THEN 1 END) as correct_rep_range_schemas
FROM training_schemas;

SELECT 
  'Training exercises updated successfully!' as status,
  COUNT(*) as total_exercises,
  COUNT(CASE WHEN target_reps = '8-12' THEN 1 END) as correct_target_reps_exercises,
  COUNT(CASE WHEN reps = '10' THEN 1 END) as exercises_with_10_reps
FROM training_schema_exercises;
