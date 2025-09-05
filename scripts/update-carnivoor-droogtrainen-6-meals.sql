-- Update Carnivoor - Droogtrainen Plan to 6 Meals
-- This script updates the existing plan from 3 to 6 meals for better portion distribution

-- First, let's check the current plan structure
SELECT plan_id, name, meals FROM nutrition_plans WHERE plan_id = 'carnivoor-droogtrainen';

-- Update the Carnivoor - Droogtrainen plan with 6 meals structure
UPDATE nutrition_plans 
SET meals = '{
  "target_calories": 1870,
  "target_protein": 198,
  "target_carbs": 154,
  "target_fat": 66,
  "goal": "Droogtrainen",
  "difficulty": "intermediate",
  "duration_weeks": 12,
  "meal_distribution": {
    "ontbijt": {"percentage": 20, "calories": 374},
    "ochtend_snack": {"percentage": 10, "calories": 187},
    "lunch": {"percentage": 25, "calories": 468},
    "lunch_snack": {"percentage": 10, "calories": 187},
    "diner": {"percentage": 25, "calories": 468},
    "avond_snack": {"percentage": 10, "calories": 187}
  },
  "weekly_plan": {
    "monday": {
      "ontbijt": [
        {"name": "Runderlever", "amount": 60, "unit": "g", "calories": 162, "protein": 24, "carbs": 4, "fat": 4},
        {"name": "Eieren", "amount": 2, "unit": "stuks", "calories": 140, "protein": 12, "carbs": 1, "fat": 10},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "ochtend_snack": [
        {"name": "Gerookte Zalm", "amount": 50, "unit": "g", "calories": 117, "protein": 20, "carbs": 0, "fat": 4}
      ],
      "lunch": [
        {"name": "Ribeye Steak", "amount": 150, "unit": "g", "calories": 375, "protein": 35, "carbs": 0, "fat": 25},
        {"name": "Roomboter", "amount": 15, "unit": "g", "calories": 108, "protein": 0, "carbs": 0, "fat": 12}
      ],
      "lunch_snack": [
        {"name": "Eieren", "amount": 1, "unit": "stuks", "calories": 70, "protein": 6, "carbs": 0, "fat": 5},
        {"name": "Spek", "amount": 20, "unit": "g", "calories": 92, "protein": 3, "carbs": 0, "fat": 9}
      ],
      "diner": [
        {"name": "Lamskotelet", "amount": 180, "unit": "g", "calories": 360, "protein": 32, "carbs": 0, "fat": 25},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "avond_snack": [
        {"name": "Goudse Kaas", "amount": 30, "unit": "g", "calories": 108, "protein": 7, "carbs": 0, "fat": 9}
      ]
    },
    "tuesday": {
      "ontbijt": [
        {"name": "Runderhart", "amount": 80, "unit": "g", "calories": 120, "protein": 20, "carbs": 0, "fat": 4},
        {"name": "Eieren", "amount": 2, "unit": "stuks", "calories": 140, "protein": 12, "carbs": 1, "fat": 10},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "ochtend_snack": [
        {"name": "Droge Worst", "amount": 40, "unit": "g", "calories": 140, "protein": 8, "carbs": 0, "fat": 12}
      ],
      "lunch": [
        {"name": "T-Bone Steak", "amount": 160, "unit": "g", "calories": 400, "protein": 38, "carbs": 0, "fat": 26},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "lunch_snack": [
        {"name": "Tonijn in Olijfolie", "amount": 60, "unit": "g", "calories": 120, "protein": 20, "carbs": 0, "fat": 4}
      ],
      "diner": [
        {"name": "Entrecote", "amount": 170, "unit": "g", "calories": 425, "protein": 40, "carbs": 0, "fat": 28},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "avond_snack": [
        {"name": "Griekse Yoghurt", "amount": 50, "unit": "g", "calories": 50, "protein": 5, "carbs": 3, "fat": 3}
      ]
    },
    "wednesday": {
      "ontbijt": [
        {"name": "Orgaanvlees Mix", "amount": 70, "unit": "g", "calories": 105, "protein": 18, "carbs": 0, "fat": 3},
        {"name": "Eieren", "amount": 2, "unit": "stuks", "calories": 140, "protein": 12, "carbs": 1, "fat": 10},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "ochtend_snack": [
        {"name": "Goudse Kaas", "amount": 30, "unit": "g", "calories": 108, "protein": 7, "carbs": 0, "fat": 9}
      ],
      "lunch": [
        {"name": "Biefstuk", "amount": 150, "unit": "g", "calories": 375, "protein": 35, "carbs": 0, "fat": 25},
        {"name": "Roomboter", "amount": 15, "unit": "g", "calories": 108, "protein": 0, "carbs": 0, "fat": 12}
      ],
      "lunch_snack": [
        {"name": "Eieren", "amount": 1, "unit": "stuks", "calories": 70, "protein": 6, "carbs": 0, "fat": 5},
        {"name": "Ham", "amount": 25, "unit": "g", "calories": 50, "protein": 8, "carbs": 0, "fat": 2}
      ],
      "diner": [
        {"name": "Kipfilet (Gegrild)", "amount": 180, "unit": "g", "calories": 324, "protein": 54, "carbs": 0, "fat": 7},
        {"name": "Roomboter", "amount": 15, "unit": "g", "calories": 108, "protein": 0, "carbs": 0, "fat": 12}
      ],
      "avond_snack": [
        {"name": "Gerookte Zalm", "amount": 40, "unit": "g", "calories": 94, "protein": 16, "carbs": 0, "fat": 3}
      ]
    },
    "thursday": {
      "ontbijt": [
        {"name": "Runderlever", "amount": 60, "unit": "g", "calories": 162, "protein": 24, "carbs": 4, "fat": 4},
        {"name": "Eieren", "amount": 2, "unit": "stuks", "calories": 140, "protein": 12, "carbs": 1, "fat": 10},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "ochtend_snack": [
        {"name": "Droge Worst", "amount": 35, "unit": "g", "calories": 123, "protein": 7, "carbs": 0, "fat": 10}
      ],
      "lunch": [
        {"name": "Zalm (Wild)", "amount": 160, "unit": "g", "calories": 320, "protein": 48, "carbs": 0, "fat": 14},
        {"name": "Roomboter", "amount": 15, "unit": "g", "calories": 108, "protein": 0, "carbs": 0, "fat": 12}
      ],
      "lunch_snack": [
        {"name": "Eieren", "amount": 1, "unit": "stuks", "calories": 70, "protein": 6, "carbs": 0, "fat": 5},
        {"name": "Spek", "amount": 20, "unit": "g", "calories": 92, "protein": 3, "carbs": 0, "fat": 9}
      ],
      "diner": [
        {"name": "Ribeye Steak", "amount": 170, "unit": "g", "calories": 425, "protein": 40, "carbs": 0, "fat": 28},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "avond_snack": [
        {"name": "Goudse Kaas", "amount": 30, "unit": "g", "calories": 108, "protein": 7, "carbs": 0, "fat": 9}
      ]
    },
    "friday": {
      "ontbijt": [
        {"name": "Runderhart", "amount": 80, "unit": "g", "calories": 120, "protein": 20, "carbs": 0, "fat": 4},
        {"name": "Eieren", "amount": 2, "unit": "stuks", "calories": 140, "protein": 12, "carbs": 1, "fat": 10},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "ochtend_snack": [
        {"name": "Gerookte Zalm", "amount": 50, "unit": "g", "calories": 117, "protein": 20, "carbs": 0, "fat": 4}
      ],
      "lunch": [
        {"name": "T-Bone Steak", "amount": 160, "unit": "g", "calories": 400, "protein": 38, "carbs": 0, "fat": 26},
        {"name": "Roomboter", "amount": 15, "unit": "g", "calories": 108, "protein": 0, "carbs": 0, "fat": 12}
      ],
      "lunch_snack": [
        {"name": "Tonijn in Olijfolie", "amount": 60, "unit": "g", "calories": 120, "protein": 20, "carbs": 0, "fat": 4}
      ],
      "diner": [
        {"name": "Lamskotelet", "amount": 180, "unit": "g", "calories": 360, "protein": 32, "carbs": 0, "fat": 25},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "avond_snack": [
        {"name": "Griekse Yoghurt", "amount": 50, "unit": "g", "calories": 50, "protein": 5, "carbs": 3, "fat": 3}
      ]
    },
    "saturday": {
      "ontbijt": [
        {"name": "Orgaanvlees Mix", "amount": 70, "unit": "g", "calories": 105, "protein": 18, "carbs": 0, "fat": 3},
        {"name": "Eieren", "amount": 2, "unit": "stuks", "calories": 140, "protein": 12, "carbs": 1, "fat": 10},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "ochtend_snack": [
        {"name": "Droge Worst", "amount": 40, "unit": "g", "calories": 140, "protein": 8, "carbs": 0, "fat": 12}
      ],
      "lunch": [
        {"name": "Biefstuk", "amount": 150, "unit": "g", "calories": 375, "protein": 35, "carbs": 0, "fat": 25},
        {"name": "Roomboter", "amount": 15, "unit": "g", "calories": 108, "protein": 0, "carbs": 0, "fat": 12}
      ],
      "lunch_snack": [
        {"name": "Eieren", "amount": 1, "unit": "stuks", "calories": 70, "protein": 6, "carbs": 0, "fat": 5},
        {"name": "Ham", "amount": 25, "unit": "g", "calories": 50, "protein": 8, "carbs": 0, "fat": 2}
      ],
      "diner": [
        {"name": "Entrecote", "amount": 170, "unit": "g", "calories": 425, "protein": 40, "carbs": 0, "fat": 28},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "avond_snack": [
        {"name": "Goudse Kaas", "amount": 30, "unit": "g", "calories": 108, "protein": 7, "carbs": 0, "fat": 9}
      ]
    },
    "sunday": {
      "ontbijt": [
        {"name": "Runderlever", "amount": 60, "unit": "g", "calories": 162, "protein": 24, "carbs": 4, "fat": 4},
        {"name": "Eieren", "amount": 2, "unit": "stuks", "calories": 140, "protein": 12, "carbs": 1, "fat": 10},
        {"name": "Roomboter", "amount": 10, "unit": "g", "calories": 72, "protein": 0, "carbs": 0, "fat": 8}
      ],
      "ochtend_snack": [
        {"name": "Gerookte Zalm", "amount": 50, "unit": "g", "calories": 117, "protein": 20, "carbs": 0, "fat": 4}
      ],
      "lunch": [
        {"name": "Kipfilet (Gegrild)", "amount": 180, "unit": "g", "calories": 324, "protein": 54, "carbs": 0, "fat": 7},
        {"name": "Roomboter", "amount": 15, "unit": "g", "calories": 108, "protein": 0, "carbs": 0, "fat": 12}
      ],
      "lunch_snack": [
        {"name": "Tonijn in Olijfolie", "amount": 60, "unit": "g", "calories": 120, "protein": 20, "carbs": 0, "fat": 4}
      ],
      "diner": [
        {"name": "Zalm (Wild)", "amount": 160, "unit": "g", "calories": 320, "protein": 48, "carbs": 0, "fat": 14},
        {"name": "Roomboter", "amount": 15, "unit": "g", "calories": 108, "protein": 0, "carbs": 0, "fat": 12}
      ],
      "avond_snack": [
        {"name": "Griekse Yoghurt", "amount": 50, "unit": "g", "calories": 50, "protein": 5, "carbs": 3, "fat": 3}
      ]
    }
  }
}'::jsonb,
    updated_at = NOW()
WHERE plan_id = 'carnivoor-droogtrainen';

-- Verify the update
SELECT plan_id, name, meals->'meal_distribution' as meal_distribution FROM nutrition_plans WHERE plan_id = 'carnivoor-droogtrainen';

-- Show the new meal structure
SELECT 
  plan_id,
  name,
  jsonb_pretty(meals->'meal_distribution') as meal_distribution
FROM nutrition_plans 
WHERE plan_id = 'carnivoor-droogtrainen';
