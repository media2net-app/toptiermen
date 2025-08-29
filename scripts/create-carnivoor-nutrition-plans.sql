-- Create Carnivoor Nutrition Plans
-- Run this SQL script in your Supabase SQL Editor

-- First, delete any existing nutrition plans to ensure clean state
DELETE FROM nutrition_plans;

-- Insert the 3 Carnivoor nutrition plans
INSERT INTO nutrition_plans (
  name,
  description,
  target_calories,
  target_protein,
  target_carbs,
  target_fat,
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

-- Verify the insertion
SELECT 
  id,
  name,
  target_calories,
  target_protein,
  target_carbs,
  target_fat,
  goal,
  difficulty,
  created_at
FROM nutrition_plans 
ORDER BY name;
