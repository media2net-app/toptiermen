-- Update nutrition_plans table with missing columns
-- Execute this in Supabase Dashboard > SQL Editor

-- Add missing columns to nutrition_plans table
ALTER TABLE nutrition_plans 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS parent_plan_id UUID REFERENCES nutrition_plans(id),
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_category ON nutrition_plans(category);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_parent_id ON nutrition_plans(parent_plan_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_goal ON nutrition_plans(goal);

-- Update existing records to have default values
UPDATE nutrition_plans 
SET 
  category = 'flexibel',
  is_featured = false,
  is_public = true
WHERE category IS NULL;

-- Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'nutrition_plans'
ORDER BY ordinal_position;

-- Show sample data
SELECT 
  name,
  category,
  goal,
  target_calories,
  target_protein,
  target_carbs,
  target_fat,
  is_featured,
  is_public
FROM nutrition_plans 
LIMIT 5;
