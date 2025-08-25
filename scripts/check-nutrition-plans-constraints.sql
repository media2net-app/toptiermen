-- Check nutrition_plans table constraints
-- Execute this in Supabase Dashboard > SQL Editor

-- Check table structure and constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'nutrition_plans'::regclass;

-- Check what values are allowed for difficulty
SELECT DISTINCT difficulty FROM nutrition_plans;

-- Check what values are allowed for goal
SELECT DISTINCT goal FROM nutrition_plans;

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'nutrition_plans'
ORDER BY ordinal_position;
