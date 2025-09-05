-- Add is_carnivore column to nutrition_ingredients table
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE nutrition_ingredients 
ADD COLUMN IF NOT EXISTS is_carnivore BOOLEAN DEFAULT false;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'nutrition_ingredients' 
AND column_name = 'is_carnivore';
