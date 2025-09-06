-- Update Training Schema Exercises: 4 sets for all, 8-12 reps for exercises currently at 10 reps
-- This script updates all training exercises to have 4 sets and 8-12 reps for exercises that currently have 10 reps

-- 1. Update ALL exercises to have 4 sets
UPDATE training_schema_exercises 
SET 
  sets = 4,
  updated_at = NOW()
WHERE sets != 4;

-- 2. Update exercises that currently have 10 reps to have 8-12 reps
UPDATE training_schema_exercises 
SET 
  reps = '12',  -- Using 12 as the upper limit of 8-12 range
  updated_at = NOW()
WHERE reps = '10';

-- 3. Verify the updates
SELECT 
  'Total exercises updated to 4 sets' as description,
  COUNT(*) as count
FROM training_schema_exercises 
WHERE sets = 4

UNION ALL

SELECT 
  'Exercises with 8-12 reps (updated from 10)' as description,
  COUNT(*) as count
FROM training_schema_exercises 
WHERE reps = '12'

UNION ALL

SELECT 
  'Total exercises in database' as description,
  COUNT(*) as count
FROM training_schema_exercises;

-- 4. Show sample of updated exercises
SELECT 
  exercise_name,
  sets,
  reps,
  rest_time,
  updated_at
FROM training_schema_exercises 
ORDER BY updated_at DESC 
LIMIT 10;
