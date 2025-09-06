-- Add is_carnivore column to nutrition_ingredients table
-- Run this SQL in Supabase SQL Editor

-- Step 1: Add the column
ALTER TABLE nutrition_ingredients 
ADD COLUMN IF NOT EXISTS is_carnivore BOOLEAN DEFAULT false;

-- Step 2: Update existing ingredients based on categories
-- Set carnivore = true for carnivore-friendly categories
UPDATE nutrition_ingredients 
SET is_carnivore = true 
WHERE category IN (
  'vlees', 'vis', 'eieren', 'zuivel', 'carnivoor', 'vetten',
  'Vlees', 'Vis', 'Eieren', 'Zuivel', 'Carnivoor', 'Vetten'
);

-- Step 3: Specifically set "test 1234" to carnivore
UPDATE nutrition_ingredients 
SET is_carnivore = true 
WHERE name = 'test 1234';

-- Step 4: Verify the changes
SELECT 
  name, 
  category, 
  is_carnivore,
  CASE 
    WHEN is_carnivore THEN 'Carnivoor Geschikt' 
    ELSE 'Standaard' 
  END as status
FROM nutrition_ingredients 
ORDER BY is_carnivore DESC, name;

-- Step 5: Count carnivore vs non-carnivore ingredients
SELECT 
  is_carnivore,
  COUNT(*) as count,
  CASE 
    WHEN is_carnivore THEN 'Carnivoor Geschikt' 
    ELSE 'Standaard' 
  END as type
FROM nutrition_ingredients 
GROUP BY is_carnivore
ORDER BY is_carnivore DESC;
