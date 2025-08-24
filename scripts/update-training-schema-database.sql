-- Update Training Schema Database for Rick's Requirements
-- This script adds new columns to support different training goals and rep ranges

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

-- 4. Update existing schema names to include goal (only if they don't already have it)
UPDATE training_schemas 
SET name = name || ' - Spiermassa'
WHERE training_goal = 'spiermassa' 
AND name NOT LIKE '% - %';

-- 5. Update existing exercises to have default values
UPDATE training_schema_exercises 
SET 
  target_reps = '8-12',
  target_sets = 4,
  rest_time_seconds = 90
WHERE target_reps IS NULL;
