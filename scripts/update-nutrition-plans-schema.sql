-- Update Nutrition Plans Schema for Fitness Goals
-- Run this script in Supabase Dashboard > SQL Editor

-- 1. Add fitness_goal column to nutrition_plans table
ALTER TABLE nutrition_plans 
ADD COLUMN IF NOT EXISTS fitness_goal VARCHAR(20) DEFAULT 'spiermassa';

-- 2. Add daily_plans column to nutrition_plans table (JSONB for storing meal plans)
ALTER TABLE nutrition_plans 
ADD COLUMN IF NOT EXISTS daily_plans JSONB;

-- 3. Update existing plans to have default fitness_goal
UPDATE nutrition_plans 
SET fitness_goal = 'spiermassa'
WHERE fitness_goal IS NULL;

-- 4. Verify the changes
SELECT 
  'Nutrition plans schema updated successfully!' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'nutrition_plans' 
AND column_name IN ('fitness_goal', 'daily_plans')
ORDER BY column_name;
