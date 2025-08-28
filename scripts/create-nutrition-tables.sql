-- Create nutrition_plans table
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon VARCHAR(10),
  color VARCHAR(100),
  meals JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create nutrition_weekplans table
CREATE TABLE IF NOT EXISTS nutrition_weekplans (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(50) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  meal_plan JSONB NOT NULL,
  total_calories INTEGER,
  total_protein INTEGER,
  total_carbs INTEGER,
  total_fat INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(plan_id, day_of_week)
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  meal_type VARCHAR(50),
  category VARCHAR(50),
  plan_type VARCHAR(100),
  goal VARCHAR(100),
  day VARCHAR(20),
  ingredients JSONB,
  instructions JSONB,
  nutrition_info JSONB,
  prep_time INTEGER,
  difficulty VARCHAR(50),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample nutrition plans
INSERT INTO nutrition_plans (plan_id, name, subtitle, description, icon, color, meals, is_active) VALUES
(
  'balanced',
  'Gebalanceerd Dieet',
  'Voor optimale gezondheid en energie',
  'Een gebalanceerd voedingsplan met een mix van alle voedingsgroepen voor optimale gezondheid en energie.',
  '🥗',
  'from-green-500 to-blue-600',
  '[
    {
      "id": "breakfast-1",
      "name": "Havermout met Bessen",
      "image": "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&h=600&fit=crop",
      "ingredients": [
        {"name": "Havermout", "amount": 50, "unit": "gram"},
        {"name": "Bessen", "amount": 30, "unit": "gram"},
        {"name": "Noten", "amount": 20, "unit": "gram"},
        {"name": "Honing", "amount": 10, "unit": "gram"}
      ],
      "time": "08:00",
      "type": "breakfast"
    },
    {
      "id": "lunch-1",
      "name": "Gegrilde Kip Salade",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
      "ingredients": [
        {"name": "Kipfilet", "amount": 150, "unit": "gram"},
        {"name": "Sla", "amount": 50, "unit": "gram"},
        {"name": "Tomaat", "amount": 30, "unit": "gram"},
        {"name": "Komkommer", "amount": 30, "unit": "gram"}
      ],
      "time": "13:00",
      "type": "lunch"
    },
    {
      "id": "dinner-1",
      "name": "Zalm met Groenten",
      "image": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop",
      "ingredients": [
        {"name": "Zalmfilet", "amount": 200, "unit": "gram"},
        {"name": "Broccoli", "amount": 100, "unit": "gram"},
        {"name": "Zoete aardappel", "amount": 150, "unit": "gram"},
        {"name": "Olijfolie", "amount": 15, "unit": "ml"}
      ],
      "time": "19:00",
      "type": "dinner"
    }
  ]'::jsonb,
  true
),
(
  'carnivore',
  'Carnivoor (Rick''s Aanpak)',
  'Voor maximale eenvoud en het elimineren van potentiële triggers',
  'Eet zoals de oprichter. Volledig carnivoor dieet met orgaanvlees, vlees, vis en eieren.',
  '🥩',
  'from-red-500 to-orange-600',
  '[
    {
      "id": "breakfast-1",
      "name": "Ribeye Steak",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
      "ingredients": [
        {"name": "Ribeye steak", "amount": 250, "unit": "gram"},
        {"name": "Roomboter", "amount": 20, "unit": "gram"},
        {"name": "Zout", "amount": 5, "unit": "gram"}
      ],
      "time": "08:00",
      "type": "breakfast"
    },
    {
      "id": "lunch-1",
      "name": "Kipfilet met Roomboter",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
      "ingredients": [
        {"name": "Kipfilet", "amount": 200, "unit": "gram"},
        {"name": "Roomboter", "amount": 30, "unit": "gram"},
        {"name": "Zout", "amount": 5, "unit": "gram"}
      ],
      "time": "13:00",
      "type": "lunch"
    },
    {
      "id": "dinner-1",
      "name": "Lamskotelet",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
      "ingredients": [
        {"name": "Lamskotelet", "amount": 250, "unit": "gram"},
        {"name": "Roomboter", "amount": 25, "unit": "gram"},
        {"name": "Zout", "amount": 5, "unit": "gram"}
      ],
      "time": "19:00",
      "type": "dinner"
    }
  ]'::jsonb,
  true
),
(
  'high_protein',
  'High Protein',
  'Voor spieropbouw en herstel',
  'Een voedingsplan met extra veel eiwitten voor optimale spieropbouw en herstel.',
  '🍗',
  'from-purple-500 to-pink-600',
  '[
    {
      "id": "breakfast-1",
      "name": "Eiwitrijke Smoothie",
      "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop",
      "ingredients": [
        {"name": "Whey proteïne", "amount": 30, "unit": "gram"},
        {"name": "Banaan", "amount": 1, "unit": "stuk"},
        {"name": "Amandelmelk", "amount": 250, "unit": "ml"},
        {"name": "Pindakaas", "amount": 15, "unit": "gram"}
      ],
      "time": "08:00",
      "type": "breakfast"
    },
    {
      "id": "lunch-1",
      "name": "Tonijn Salade",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
      "ingredients": [
        {"name": "Tonijn", "amount": 200, "unit": "gram"},
        {"name": "Eieren", "amount": 2, "unit": "stuks"},
        {"name": "Avocado", "amount": 1, "unit": "stuk"},
        {"name": "Sla", "amount": 50, "unit": "gram"}
      ],
      "time": "13:00",
      "type": "lunch"
    },
    {
      "id": "dinner-1",
      "name": "Kalkoenfilet met Quinoa",
      "image": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop",
      "ingredients": [
        {"name": "Kalkoenfilet", "amount": 250, "unit": "gram"},
        {"name": "Quinoa", "amount": 100, "unit": "gram"},
        {"name": "Groene groenten", "amount": 150, "unit": "gram"},
        {"name": "Olijfolie", "amount": 15, "unit": "ml"}
      ],
      "time": "19:00",
      "type": "dinner"
    }
  ]'::jsonb,
  true
)
ON CONFLICT (plan_id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  meals = EXCLUDED.meals,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert sample carnivore weekplan
INSERT INTO nutrition_weekplans (plan_id, day_of_week, meal_plan, total_calories, total_protein, total_carbs, total_fat) VALUES
(
  'carnivore',
  'monday',
  '{
    "breakfast": {
      "name": "Ribeye Steak & Eieren",
      "ingredients": [
        {"name": "Ribeye steak", "amount": 200, "unit": "g"},
        {"name": "Eieren", "amount": 3, "unit": "stuks"},
        {"name": "Roomboter", "amount": 30, "unit": "g"},
        {"name": "Zout", "amount": 5, "unit": "g"}
      ],
      "calories": 650,
      "protein": 45,
      "carbs": 2,
      "fat": 50
    },
    "lunch": {
      "name": "Kipfilet met Roomboter",
      "ingredients": [
        {"name": "Kipfilet", "amount": 250, "unit": "g"},
        {"name": "Roomboter", "amount": 40, "unit": "g"},
        {"name": "Zout", "amount": 5, "unit": "g"}
      ],
      "calories": 520,
      "protein": 55,
      "carbs": 0,
      "fat": 30
    },
    "dinner": {
      "name": "Lamskotelet",
      "ingredients": [
        {"name": "Lamskotelet", "amount": 300, "unit": "g"},
        {"name": "Roomboter", "amount": 30, "unit": "g"},
        {"name": "Zout", "amount": 5, "unit": "g"}
      ],
      "calories": 680,
      "protein": 52,
      "carbs": 0,
      "fat": 50
    },
    "snack": {
      "name": "Gerookte Zalm",
      "ingredients": [
        {"name": "Gerookte zalm", "amount": 100, "unit": "g"}
      ],
      "calories": 200,
      "protein": 22,
      "carbs": 0,
      "fat": 12
    }
  }'::jsonb,
  2050,
  174,
  2,
  142
)
ON CONFLICT (plan_id, day_of_week) DO UPDATE SET
  meal_plan = EXCLUDED.meal_plan,
  total_calories = EXCLUDED.total_calories,
  total_protein = EXCLUDED.total_protein,
  total_carbs = EXCLUDED.total_carbs,
  total_fat = EXCLUDED.total_fat,
  updated_at = NOW();

-- Insert sample meals
INSERT INTO meals (name, description, meal_type, category, plan_type, goal, day, ingredients, instructions, nutrition_info, prep_time, difficulty, is_featured, is_active) VALUES
(
  '🥩 Maandag - Carnivoor Ontbijt - Ribeye & Eieren',
  'Een stevig carnivoor ontbijt met ribeye steak en eieren. Perfect voor carnivoor dieet.',
  'ontbijt',
  'carnivoor',
  'Carnivoor / Animal Based',
  'Spiermassa',
  'maandag',
  '[
    {"name": "Ribeye steak", "quantity": 200, "unit": "gram"},
    {"name": "Eieren", "quantity": 3, "unit": "stuks"},
    {"name": "Roomboter", "quantity": 30, "unit": "gram"},
    {"name": "Zout", "quantity": 5, "unit": "gram"}
  ]'::jsonb,
  '[
    "Bak de ribeye steak medium-rare (3-4 minuten per kant)",
    "Bak de eieren in dezelfde pan",
    "Serveer met een klontje boter en zout"
  ]'::jsonb,
  '{"calories": 650, "protein": 45, "carbs": 2, "fat": 50}'::jsonb,
  15,
  'makkelijk',
  true,
  true
),
(
  '🍗 Maandag - Carnivoor Lunch - Kipfilet met Roomboter',
  'Een eenvoudige maar voedzame lunch met kipfilet en roomboter.',
  'lunch',
  'carnivoor',
  'Carnivoor / Animal Based',
  'Spiermassa',
  'maandag',
  '[
    {"name": "Kipfilet", "quantity": 250, "unit": "gram"},
    {"name": "Roomboter", "quantity": 40, "unit": "gram"},
    {"name": "Zout", "quantity": 5, "unit": "gram"}
  ]'::jsonb,
  '[
    "Bak de kipfilet in roomboter",
    "Kruid met zout",
    "Serveer warm"
  ]'::jsonb,
  '{"calories": 520, "protein": 55, "carbs": 0, "fat": 30}'::jsonb,
  20,
  'makkelijk',
  true,
  true
),
(
  '🍖 Maandag - Carnivoor Diner - Lamskotelet',
  'Een heerlijke lamskotelet voor het diner. Rijk aan eiwitten en gezonde vetten.',
  'diner',
  'carnivoor',
  'Carnivoor / Animal Based',
  'Spiermassa',
  'maandag',
  '[
    {"name": "Lamskotelet", "quantity": 300, "unit": "gram"},
    {"name": "Roomboter", "quantity": 30, "unit": "gram"},
    {"name": "Zout", "quantity": 5, "unit": "gram"}
  ]'::jsonb,
  '[
    "Grill de lamskotelet medium-rare",
    "Basteer met roomboter",
    "Kruid met zout en serveer"
  ]'::jsonb,
  '{"calories": 680, "protein": 52, "carbs": 0, "fat": 50}'::jsonb,
  25,
  'gemiddeld',
  true,
  true
)
ON CONFLICT DO NOTHING;
