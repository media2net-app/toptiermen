-- Add macro percentage columns to nutrition_plans table
-- Execute this in Supabase Dashboard > SQL Editor

-- Add protein_percentage column
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS protein_percentage INTEGER;

-- Add carbs_percentage column  
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS carbs_percentage INTEGER;

-- Add fat_percentage column
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS fat_percentage INTEGER;

-- Update existing records with calculated percentages
UPDATE nutrition_plans 
SET 
  protein_percentage = CASE 
    WHEN target_calories > 0 AND target_protein > 0 
    THEN ROUND((target_protein * 4.0 / target_calories) * 100)
    ELSE NULL 
  END,
  carbs_percentage = CASE 
    WHEN target_calories > 0 AND target_carbs > 0 
    THEN ROUND((target_carbs * 4.0 / target_calories) * 100)
    ELSE NULL 
  END,
  fat_percentage = CASE 
    WHEN target_calories > 0 AND target_fat > 0 
    THEN ROUND((target_fat * 9.0 / target_calories) * 100)
    ELSE NULL 
  END
WHERE target_calories IS NOT NULL 
  AND target_protein IS NOT NULL 
  AND target_carbs IS NOT NULL 
  AND target_fat IS NOT NULL;

-- Show the updated records
SELECT 
  plan_id,
  name,
  target_calories,
  target_protein,
  target_carbs,
  target_fat,
  protein_percentage,
  carbs_percentage,
  fat_percentage,
  (protein_percentage + carbs_percentage + fat_percentage) as total_percentage
FROM nutrition_plans 
WHERE target_calories IS NOT NULL
ORDER BY plan_id;
