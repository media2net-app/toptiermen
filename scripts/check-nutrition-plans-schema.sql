-- Check the nutrition_plans table schema
-- Run this first to see the correct column names

-- Method 1: Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'nutrition_plans'
ORDER BY ordinal_position;

-- Method 2: Alternative way to see table structure
\d nutrition_plans;

-- Method 3: See existing data structure if any exists
SELECT * FROM nutrition_plans LIMIT 1;
