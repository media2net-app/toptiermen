-- Update nutrition plans to have 6 total plans
-- Run this SQL in Supabase SQL Editor

-- First, update existing "Balans" plan to "Onderhoud" if it exists
UPDATE nutrition_plans 
SET 
  name = 'Onderhoud',
  description = 'Gebalanceerd voedingsplan voor behoud van huidige lichaamscompositie. Mix van alle macronutriënten voor duurzame energie.',
  target_calories = 2100,
  target_protein = 140,
  target_carbs = 245,
  target_fat = 70,
  goal = 'Onderhoud',
  updated_at = NOW()
WHERE name = 'Balans' OR name ILIKE '%balans%';

-- Insert new plans if they don't exist already
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
) 
SELECT * FROM (VALUES
  (
    'Op maat - Droogtrainen',
    'Volledig aangepast voedingsplan voor optimaal vetverlies. Persoonlijke macro-verdeling op basis van jouw specifieke doelen en voorkeuren.',
    1650,
    175,
    120,
    55,
    16,
    'intermediate',
    'Droogtrainen',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    'High Protein',
    'Eiwitrijk voedingsplan geoptimaliseerd voor spiergroei en herstel. Perfect voor intensieve trainingsperiodes.',
    2350,
    200,
    200,
    75,
    12,
    'intermediate',
    'Spiermassa',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    'Onderhoud',
    'Gebalanceerd voedingsplan voor behoud van huidige lichaamscompositie. Mix van alle macronutriënten voor duurzame energie.',
    2100,
    140,
    245,
    70,
    12,
    'beginner',
    'Onderhoud',
    true,
    true,
    NOW(),
    NOW()
  )
) AS new_plans(name, description, target_calories, target_protein, target_carbs, target_fat, duration_weeks, difficulty, goal, is_featured, is_public, created_at, updated_at)
WHERE NOT EXISTS (
  SELECT 1 FROM nutrition_plans WHERE nutrition_plans.name = new_plans.name
);

-- Verify the final result - should show 6 plans total
SELECT 
  id,
  name,
  target_calories as kcal,
  target_protein as protein,
  target_carbs as carbs,
  target_fat as fat,
  goal,
  difficulty,
  duration_weeks as weeks
FROM nutrition_plans 
ORDER BY 
  CASE goal
    WHEN 'Droogtrainen' THEN 1
    WHEN 'Onderhoud' THEN 2
    WHEN 'Spiermassa' THEN 3
    ELSE 4
  END,
  name;

-- Count total plans
SELECT 
  goal,
  COUNT(*) as count,
  STRING_AGG(name, ', ' ORDER BY name) as plan_names
FROM nutrition_plans 
GROUP BY goal
ORDER BY goal;

-- Show summary
SELECT 
  COUNT(*) as total_plans,
  COUNT(CASE WHEN goal = 'Droogtrainen' THEN 1 END) as droogtrainen_plans,
  COUNT(CASE WHEN goal = 'Onderhoud' THEN 1 END) as onderhoud_plans,
  COUNT(CASE WHEN goal = 'Spiermassa' THEN 1 END) as spiermassa_plans
FROM nutrition_plans;
