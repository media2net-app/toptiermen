-- Create nutrition ingredients table
CREATE TABLE IF NOT EXISTS nutrition_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  calories_per_100g DECIMAL(8,2) NOT NULL,
  protein_per_100g DECIMAL(8,2) NOT NULL,
  carbs_per_100g DECIMAL(8,2) NOT NULL,
  fat_per_100g DECIMAL(8,2) NOT NULL,
  fiber_per_100g DECIMAL(8,2),
  sugar_per_100g DECIMAL(8,2),
  sodium_per_100g DECIMAL(8,2),
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutrition recipes table
CREATE TABLE IF NOT EXISTS nutrition_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER NOT NULL DEFAULT 1,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine_type VARCHAR(100),
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories_per_serving DECIMAL(8,2),
  protein_per_serving DECIMAL(8,2),
  carbs_per_serving DECIMAL(8,2),
  fat_per_serving DECIMAL(8,2),
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutrition plans table
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_calories DECIMAL(8,2),
  target_protein DECIMAL(8,2),
  target_carbs DECIMAL(8,2),
  target_fat DECIMAL(8,2),
  duration_weeks INTEGER NOT NULL DEFAULT 1,
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  goal VARCHAR(20) CHECK (goal IN ('weight_loss', 'muscle_gain', 'maintenance', 'performance')),
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutrition educational hubs table
CREATE TABLE IF NOT EXISTS nutrition_educational_hubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  author_id UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe ingredients junction table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES nutrition_recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES nutrition_ingredients(id) ON DELETE CASCADE,
  amount DECIMAL(8,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, ingredient_id)
);

-- Create plan recipes junction table
CREATE TABLE IF NOT EXISTS plan_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES nutrition_recipes(id) ON DELETE CASCADE,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, recipe_id, meal_type, day_of_week)
);

-- Create user nutrition preferences table
CREATE TABLE IF NOT EXISTS user_nutrition_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_calories DECIMAL(8,2),
  target_protein DECIMAL(8,2),
  target_carbs DECIMAL(8,2),
  target_fat DECIMAL(8,2),
  dietary_restrictions TEXT[],
  allergies TEXT[],
  preferred_cuisines TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user meal logs table
CREATE TABLE IF NOT EXISTS user_meal_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES nutrition_recipes(id),
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calories_consumed DECIMAL(8,2),
  protein_consumed DECIMAL(8,2),
  carbs_consumed DECIMAL(8,2),
  fat_consumed DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nutrition_ingredients_category ON nutrition_ingredients(category);
CREATE INDEX IF NOT EXISTS idx_nutrition_ingredients_active ON nutrition_ingredients(is_active);
CREATE INDEX IF NOT EXISTS idx_nutrition_recipes_meal_type ON nutrition_recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_nutrition_recipes_featured ON nutrition_recipes(is_featured);
CREATE INDEX IF NOT EXISTS idx_nutrition_recipes_public ON nutrition_recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_goal ON nutrition_plans(goal);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_featured ON nutrition_plans(is_featured);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_public ON nutrition_plans(is_public);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_plan_recipes_plan ON plan_recipes(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_recipes_recipe ON plan_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_meal_logs_user_date ON user_meal_logs(user_id, consumed_at);

-- Enable Row Level Security
ALTER TABLE nutrition_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_educational_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meal_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Ingredients: Public read, admin write
CREATE POLICY "Ingredients public read" ON nutrition_ingredients FOR SELECT USING (is_active = true);
CREATE POLICY "Ingredients admin write" ON nutrition_ingredients FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Recipes: Public read, admin write
CREATE POLICY "Recipes public read" ON nutrition_recipes FOR SELECT USING (is_public = true);
CREATE POLICY "Recipes admin write" ON nutrition_recipes FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Plans: Public read, admin write
CREATE POLICY "Plans public read" ON nutrition_plans FOR SELECT USING (is_public = true);
CREATE POLICY "Plans admin write" ON nutrition_plans FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Educational hubs: Public read published, admin write
CREATE POLICY "Hubs public read" ON nutrition_educational_hubs FOR SELECT USING (is_published = true);
CREATE POLICY "Hubs admin write" ON nutrition_educational_hubs FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Junction tables: Admin only
CREATE POLICY "Recipe ingredients admin" ON recipe_ingredients FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Plan recipes admin" ON plan_recipes FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- User preferences: User can read/write own, admin can read all
CREATE POLICY "User preferences own" ON user_nutrition_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User preferences admin read" ON user_nutrition_preferences FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- User meal logs: User can read/write own, admin can read all
CREATE POLICY "User meal logs own" ON user_meal_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User meal logs admin read" ON user_meal_logs FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Insert some sample data
INSERT INTO nutrition_ingredients (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, description) VALUES
('Kipfilet', 'Vlees', 165, 31, 0, 3.6, 'Mager eiwit, perfect voor spieropbouw'),
('Zalm', 'Vis', 208, 25, 0, 12, 'Rijk aan omega-3 vetzuren'),
('Broccoli', 'Groenten', 34, 2.8, 7, 0.4, 'Vitamine C en vezels'),
('Quinoa', 'Granen', 120, 4.4, 22, 1.9, 'Complete eiwitbron'),
('Avocado', 'Fruit', 160, 2, 9, 15, 'Gezonde vetten en vezels')
ON CONFLICT DO NOTHING;

INSERT INTO nutrition_recipes (name, description, meal_type, servings, difficulty, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving) VALUES
('Gegrilde Kipfilet', 'Gezonde maaltijd met mager eiwit', 'dinner', 1, 'easy', 300, 50, 0, 10),
('Havermout Ontbijt', 'Energierijk ontbijt', 'breakfast', 1, 'easy', 250, 12, 40, 8),
('Zalm met Groenten', 'Omega-3 rijke maaltijd', 'dinner', 1, 'medium', 400, 35, 15, 25)
ON CONFLICT DO NOTHING;

INSERT INTO nutrition_plans (name, description, target_calories, target_protein, target_carbs, target_fat, duration_weeks, difficulty, goal) VALUES
('Spieropbouw Plan', 'Plan voor spiergroei en kracht', 2500, 180, 250, 80, 8, 'intermediate', 'muscle_gain'),
('Afvallen Plan', 'Plan voor gewichtsverlies', 1800, 150, 150, 60, 12, 'beginner', 'weight_loss'),
('Onderhoud Plan', 'Plan voor gewichtsbehoud', 2200, 160, 200, 70, 4, 'beginner', 'maintenance')
ON CONFLICT DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_nutrition_ingredients_updated_at BEFORE UPDATE ON nutrition_ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_recipes_updated_at BEFORE UPDATE ON nutrition_recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_plans_updated_at BEFORE UPDATE ON nutrition_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_educational_hubs_updated_at BEFORE UPDATE ON nutrition_educational_hubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_nutrition_preferences_updated_at BEFORE UPDATE ON user_nutrition_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON nutrition_ingredients TO authenticated;
GRANT ALL ON nutrition_recipes TO authenticated;
GRANT ALL ON nutrition_plans TO authenticated;
GRANT ALL ON nutrition_educational_hubs TO authenticated;
GRANT ALL ON recipe_ingredients TO authenticated;
GRANT ALL ON plan_recipes TO authenticated;
GRANT ALL ON user_nutrition_preferences TO authenticated;
GRANT ALL ON user_meal_logs TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 