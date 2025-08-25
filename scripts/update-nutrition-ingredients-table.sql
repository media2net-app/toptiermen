-- Update nutrition_ingredients table with missing columns
-- Execute this in Supabase Dashboard > SQL Editor

-- Add missing columns to nutrition_ingredients table
ALTER TABLE nutrition_ingredients 
ADD COLUMN IF NOT EXISTS serving_size TEXT,
ADD COLUMN IF NOT EXISTS calories_per_serving DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS protein_per_serving DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS carbs_per_serving DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS fat_per_serving DECIMAL(6,2);

-- Update existing records to have default serving sizes
UPDATE nutrition_ingredients 
SET 
  serving_size = '100g',
  calories_per_serving = calories_per_100g,
  protein_per_serving = protein_per_100g,
  carbs_per_serving = carbs_per_100g,
  fat_per_serving = fat_per_100g
WHERE serving_size IS NULL;

-- Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'nutrition_ingredients'
ORDER BY ordinal_position;

-- Show sample data
SELECT 
  name,
  category,
  serving_size,
  calories_per_serving,
  protein_per_serving,
  carbs_per_serving,
  fat_per_serving
FROM nutrition_ingredients 
LIMIT 5;
