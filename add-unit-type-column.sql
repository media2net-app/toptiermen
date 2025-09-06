-- Add unit_type column to nutrition_ingredients table
-- Run this SQL in Supabase SQL Editor
--
-- UNIT STANDARDS:
-- - per_100g: Standaard (vlees, vis, etc.)
-- - per_30g: Per 30 gram (whey protein scoops)
-- - per_piece: Per stuk (fruit, eieren) 
-- - per_handful: Per handje (noten) = 25 gram per handje

-- Step 1: Add the column
ALTER TABLE nutrition_ingredients 
ADD COLUMN IF NOT EXISTS unit_type VARCHAR(20) DEFAULT 'per_100g';

-- Step 2: Update existing ingredients based on categories and naming patterns
-- Set unit_type = 'per_piece' for Fruit and Eieren
UPDATE nutrition_ingredients 
SET unit_type = 'per_piece' 
WHERE category IN ('Fruit', 'Eieren') 
   OR name LIKE '%1 Ei%'
   OR name LIKE '%1 Appel%'
   OR name LIKE '%1 Banaan%';

-- Step 3: Set unit_type = 'per_handful' for Noten (1 handje = 25 gram)
UPDATE nutrition_ingredients 
SET unit_type = 'per_handful' 
WHERE category = 'Noten'
   OR name LIKE '%1 Handje%';

-- Step 3.5: Set unit_type = 'per_30g' for Whey Protein
UPDATE nutrition_ingredients 
SET unit_type = 'per_30g' 
WHERE (name ILIKE '%whey%' OR name ILIKE '%wei%') 
   AND (name ILIKE '%eiwit%' OR name ILIKE '%protein%' OR name ILIKE '%shake%');

-- Step 4: Ensure all other ingredients default to per_100g
UPDATE nutrition_ingredients 
SET unit_type = 'per_100g' 
WHERE unit_type IS NULL;

-- Step 5: Verify the changes
SELECT 
  unit_type,
  COUNT(*) as count,
  CASE 
    WHEN unit_type = 'per_piece' THEN 'Per stuk (fruit, eieren)'
    WHEN unit_type = 'per_handful' THEN 'Per handje (noten = 25g)'
    WHEN unit_type = 'per_30g' THEN 'Per 30 gram (whey protein)'
    WHEN unit_type = 'per_100g' THEN 'Per 100 gram (standaard)'
    ELSE 'Onbekend'
  END as description
FROM nutrition_ingredients 
GROUP BY unit_type
ORDER BY count DESC;

-- Step 6: Show examples of each unit type
SELECT name, category, unit_type, calories_per_100g
FROM nutrition_ingredients 
WHERE unit_type = 'per_piece'
ORDER BY name
LIMIT 10;

SELECT name, category, unit_type, calories_per_100g
FROM nutrition_ingredients 
WHERE unit_type = 'per_handful'
ORDER BY name
LIMIT 10;
