-- Create Carnivoor Nutrition Plans - Final Correct Version
-- Based on actual table schema

DELETE FROM nutrition_plans;

INSERT INTO nutrition_plans (
  plan_id,
  name,
  subtitle,
  description,
  icon,
  color,
  meals,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  'carnivoor-droogtrainen',
  'Carnivoor - Droogtrainen',
  'Vetverlies met behoud van spiermassa',
  'Carnivoor dieet geoptimaliseerd voor vetverlies met behoud van spiermassa. Focus op hoge eiwitinname en lage koolhydraten. 1870 calorieën, 198g eiwit, 154g koolhydraten, 66g vet.',
  '🔥',
  '#ef4444',
  '{
    "target_calories": 1870,
    "target_protein": 198,
    "target_carbs": 154,
    "target_fat": 66,
    "goal": "Droogtrainen",
    "difficulty": "intermediate",
    "duration_weeks": 12,
    "meal_distribution": {
      "ontbijt": {"percentage": 25, "calories": 468},
      "lunch": {"percentage": 35, "calories": 655},
      "diner": {"percentage": 40, "calories": 748}
    }
  }'::jsonb,
  true,
  NOW(),
  NOW()
),
(
  'carnivoor-onderhoud',
  'Carnivoor - Onderhoud',
  'Behoud van lichaamscompositie',
  'Carnivoor dieet voor behoud van huidige lichaamscompositie. Gebalanceerde macro-verdeling binnen carnivoor kader. 2200 calorieën, 165g eiwit, 220g koolhydraten, 73g vet.',
  '⚖️',
  '#3b82f6',
  '{
    "target_calories": 2200,
    "target_protein": 165,
    "target_carbs": 220,
    "target_fat": 73,
    "goal": "Onderhoud",
    "difficulty": "beginner",
    "duration_weeks": 12,
    "meal_distribution": {
      "ontbijt": {"percentage": 25, "calories": 550},
      "lunch": {"percentage": 35, "calories": 770},
      "diner": {"percentage": 40, "calories": 880}
    }
  }'::jsonb,
  true,
  NOW(),
  NOW()
),
(
  'carnivoor-spiermassa',
  'Carnivoor - Spiermassa',
  'Spiergroei en krachttoename',
  'Carnivoor dieet geoptimaliseerd voor spiergroei en krachttoename. Verhoogde calorie- en eiwitinname. 2530 calorieën, 215g eiwit, 264g koolhydraten, 80g vet.',
  '💪',
  '#10b981',
  '{
    "target_calories": 2530,
    "target_protein": 215,
    "target_carbs": 264,
    "target_fat": 80,
    "goal": "Spiermassa",
    "difficulty": "intermediate",
    "duration_weeks": 12,
    "meal_distribution": {
      "ontbijt": {"percentage": 25, "calories": 633},
      "lunch": {"percentage": 35, "calories": 886},
      "diner": {"percentage": 40, "calories": 1012}
    }
  }'::jsonb,
  true,
  NOW(),
  NOW()
);

-- Verify the insertion
SELECT 
  plan_id,
  name,
  subtitle,
  description,
  icon,
  color,
  meals->>'target_calories' as calories,
  meals->>'target_protein' as protein,
  meals->>'goal' as goal,
  is_active,
  created_at
FROM nutrition_plans 
ORDER BY name;
