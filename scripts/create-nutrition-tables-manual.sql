-- Create nutrition tables for Top Tier Men platform
-- Execute this in Supabase Dashboard > SQL Editor

-- =====================================================
-- STEP 1: Drop existing tables (if they exist)
-- =====================================================
DROP TABLE IF EXISTS nutrition_plans CASCADE;
DROP TABLE IF EXISTS nutrition_weekplans CASCADE;
DROP TABLE IF EXISTS meals CASCADE;

-- =====================================================
-- STEP 2: Create nutrition_plans table
-- =====================================================
CREATE TABLE nutrition_plans (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon VARCHAR(10),
  color VARCHAR(100),
  meals JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: Create nutrition_weekplans table
-- =====================================================
CREATE TABLE nutrition_weekplans (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(50) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  meal_plan JSONB NOT NULL,
  total_calories INTEGER,
  total_protein INTEGER,
  total_carbs INTEGER,
  total_fat INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, day_of_week)
);

-- =====================================================
-- STEP 4: Create meals table
-- =====================================================
CREATE TABLE meals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  meal_type VARCHAR(50),
  category VARCHAR(50),
  plan_type VARCHAR(100),
  goal VARCHAR(100),
  day VARCHAR(20),
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions JSONB DEFAULT '[]'::jsonb,
  nutrition_info JSONB DEFAULT '{}'::jsonb,
  prep_time INTEGER,
  difficulty VARCHAR(50),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 5: Create indexes for better performance
-- =====================================================
CREATE INDEX idx_nutrition_plans_plan_id ON nutrition_plans(plan_id);
CREATE INDEX idx_nutrition_plans_active ON nutrition_plans(is_active);
CREATE INDEX idx_nutrition_weekplans_plan_day ON nutrition_weekplans(plan_id, day_of_week);
CREATE INDEX idx_meals_meal_type ON meals(meal_type);
CREATE INDEX idx_meals_category ON meals(category);
CREATE INDEX idx_meals_featured ON meals(is_featured);
CREATE INDEX idx_meals_active ON meals(is_active);

-- =====================================================
-- STEP 6: Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_weekplans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: Create RLS policies
-- =====================================================
-- Nutrition plans policies
CREATE POLICY "Allow authenticated users to read nutrition plans" ON nutrition_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage nutrition plans" ON nutrition_plans
  FOR ALL USING (auth.role() = 'authenticated');

-- Nutrition weekplans policies
CREATE POLICY "Allow authenticated users to read nutrition weekplans" ON nutrition_weekplans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage nutrition weekplans" ON nutrition_weekplans
  FOR ALL USING (auth.role() = 'authenticated');

-- Meals policies
CREATE POLICY "Allow authenticated users to read meals" ON meals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage meals" ON meals
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- STEP 8: Create updated_at trigger function
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- STEP 9: Create triggers for updated_at
-- =====================================================
CREATE TRIGGER update_nutrition_plans_updated_at
  BEFORE UPDATE ON nutrition_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_weekplans_updated_at
  BEFORE UPDATE ON nutrition_weekplans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON meals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 10: Insert sample nutrition plans
-- =====================================================
INSERT INTO nutrition_plans (plan_id, name, subtitle, description, icon, color, meals, is_active) VALUES
(
  'balanced',
  'Gebalanceerd Dieet',
  'Voor optimale gezondheid en energie',
  'Een gebalanceerd dieet met alle macronutriënten voor duurzame energie en algehele gezondheid.',
  '🥗',
  'from-green-500 to-emerald-600',
  '[]'::jsonb,
  true
),
(
  'carnivore',
  'Carnivoor (Rick''s Aanpak)',
  'Voor maximale eenvoud en het elimineren van potentiële triggers',
  'Eet zoals de oprichter - eenvoudig en effectief voor maximale resultaten.',
  '🥩',
  'from-red-500 to-orange-600',
  '[]'::jsonb,
  true
),
(
  'high_protein',
  'High Protein',
  'Voor spieropbouw en herstel',
  'Hoog in eiwitten voor optimale spieropbouw en herstel na training.',
  '💪',
  'from-blue-500 to-cyan-600',
  '[]'::jsonb,
  true
);

-- =====================================================
-- STEP 11: Insert sample meals
-- =====================================================
INSERT INTO meals (name, description, meal_type, category, plan_type, goal, ingredients, instructions, nutrition_info, prep_time, difficulty, is_featured) VALUES
(
  'Carnivoor Ontbijt',
  'Eenvoudig en effectief ontbijt voor carnivoor dieet',
  'ontbijt',
  'carnivoor',
  'carnivore',
  'vetverbranding',
  '["eieren", "spek", "boter"]'::jsonb,
  '["Bak de eieren in boter", "Bak de spek knapperig", "Serveer samen"]'::jsonb,
  '{"calories": 450, "protein": 35, "carbs": 2, "fat": 32}'::jsonb,
  15,
  'makkelijk',
  true
),
(
  'Gebalanceerde Lunch',
  'Gezonde lunch met alle macronutriënten',
  'lunch',
  'flexibel',
  'balanced',
  'energie',
  '["kipfilet", "rijst", "groenten"]'::jsonb,
  '["Grill de kipfilet", "Kook de rijst", "Bak de groenten"]'::jsonb,
  '{"calories": 550, "protein": 45, "carbs": 45, "fat": 15}'::jsonb,
  25,
  'gemiddeld',
  true
),
(
  'High Protein Diner',
  'Eiwitrijk diner voor spieropbouw',
  'diner',
  'flexibel',
  'high_protein',
  'spieropbouw',
  '["zalm", "quinoa", "broccoli"]'::jsonb,
  '["Bak de zalm", "Kook de quinoa", "Stoom de broccoli"]'::jsonb,
  '{"calories": 650, "protein": 55, "carbs": 35, "fat": 25}'::jsonb,
  30,
  'gemiddeld',
  true
);

-- =====================================================
-- STEP 12: Verify the setup
-- =====================================================
SELECT 
  'Nutrition tables created successfully!' as status,
  (SELECT COUNT(*) FROM nutrition_plans) as nutrition_plans_count,
  (SELECT COUNT(*) FROM meals) as meals_count,
  (SELECT COUNT(*) FROM nutrition_weekplans) as nutrition_weekplans_count;
