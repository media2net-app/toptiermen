-- Create Carnivoor Nutrition Plans - Corrected Version
-- First run this to check the table schema:

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'nutrition_plans'
ORDER BY ordinal_position;

-- Based on common nutrition plan table structures, try these column names:
-- Version 1: Standard column names
DELETE FROM nutrition_plans;

INSERT INTO nutrition_plans (
  name,
  description,
  calories,
  protein,
  carbs,
  fat,
  duration_weeks,
  difficulty,
  goal,
  is_featured,
  is_public,
  created_at,
  updated_at
) VALUES 
(
  'Carnivoor - Droogtrainen',
  'Carnivoor dieet geoptimaliseerd voor vetverlies met behoud van spiermassa. Focus op hoge eiwitinname en lage koolhydraten.',
  1870,
  198,
  154,
  66,
  12,
  'intermediate',
  'Droogtrainen',
  true,
  true,
  NOW(),
  NOW()
),
(
  'Carnivoor - Onderhoud',
  'Carnivoor dieet voor behoud van huidige lichaamscompositie. Gebalanceerde macro-verdeling binnen carnivoor kader.',
  2200,
  165,
  220,
  73,
  12,
  'beginner',
  'Onderhoud',
  true,
  true,
  NOW(),
  NOW()
),
(
  'Carnivoor - Spiermassa',
  'Carnivoor dieet geoptimaliseerd voor spiergroei en krachttoename. Verhoogde calorie- en eiwitinname.',
  2530,
  215,
  264,
  80,
  12,
  'intermediate',
  'Spiermassa',
  true,
  true,
  NOW(),
  NOW()
);

-- If above fails, try Version 2: Alternative column names
-- DELETE FROM nutrition_plans;
-- 
-- INSERT INTO nutrition_plans (
--   name,
--   description,
--   daily_calories,
--   daily_protein,
--   daily_carbs,
--   daily_fat,
--   duration_weeks,
--   difficulty,
--   goal,
--   is_featured,
--   is_public
-- ) VALUES 
-- ('Carnivoor - Droogtrainen', 'Carnivoor dieet geoptimaliseerd voor vetverlies met behoud van spiermassa.', 1870, 198, 154, 66, 12, 'intermediate', 'Droogtrainen', true, true),
-- ('Carnivoor - Onderhoud', 'Carnivoor dieet voor behoud van huidige lichaamscompositie.', 2200, 165, 220, 73, 12, 'beginner', 'Onderhoud', true, true),
-- ('Carnivoor - Spiermassa', 'Carnivoor dieet geoptimaliseerd voor spiergroei en krachttoename.', 2530, 215, 264, 80, 12, 'intermediate', 'Spiermassa', true, true);

-- Verify the insertion
SELECT * FROM nutrition_plans ORDER BY name;
