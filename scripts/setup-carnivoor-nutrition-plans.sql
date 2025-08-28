-- Setup Carnivoor Nutrition Plans Database
-- This script creates and populates the nutrition_plans table with 3 carnivore plans

-- First, ensure the nutrition_plans table exists
CREATE TABLE IF NOT EXISTS nutrition_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    target_calories INTEGER,
    target_protein INTEGER,
    target_carbs INTEGER,
    target_fat INTEGER,
    duration_weeks INTEGER DEFAULT 12,
    difficulty VARCHAR(50) DEFAULT 'Makkelijk',
    goal VARCHAR(50),
    is_featured BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nutrition_plans_updated_at 
    BEFORE UPDATE ON nutrition_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Clear existing carnivore plans (if any)
DELETE FROM nutrition_plans WHERE category = 'carnivoor';

-- Insert 3 carnivore nutrition plans
INSERT INTO nutrition_plans (
    plan_id,
    name,
    description,
    category,
    target_calories,
    target_protein,
    target_carbs,
    target_fat,
    duration_weeks,
    difficulty,
    goal,
    is_featured,
    is_public
) VALUES 
(
    'carnivoor_droogtrainen',
    'Carnivoor Droogtrainen',
    'Een carnivoor voedingsplan specifiek gericht op vetverbranding en droogtrainen. Hoog in eiwitten, laag in koolhydraten, perfect voor het verliezen van lichaamsvet terwijl je spiermassa behoudt.',
    'carnivoor',
    2000,
    200,
    15,
    120,
    12,
    'Makkelijk',
    'droogtrainen',
    true,
    true
),
(
    'carnivoor_onderhoud',
    'Carnivoor Onderhoud',
    'Een carnivoor voedingsplan voor het behouden van je huidige lichaamscompositie en gezondheid. Gebalanceerd voor langdurige gezondheid en welzijn.',
    'carnivoor',
    2400,
    180,
    25,
    150,
    12,
    'Makkelijk',
    'onderhoud',
    true,
    true
),
(
    'carnivoor_spiermassa',
    'Carnivoor Spiermassa',
    'Een carnivoor voedingsplan voor spieropbouw en krachttoename. Hoog in eiwitten en gezonde vetten, perfect voor het opbouwen van spiermassa en kracht.',
    'carnivoor',
    2800,
    220,
    20,
    180,
    12,
    'Makkelijk',
    'spiermassa',
    true,
    true
);

-- Create nutrition_weekplans table if it doesn't exist
CREATE TABLE IF NOT EXISTS nutrition_weekplans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id VARCHAR(100) REFERENCES nutrition_plans(plan_id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    activity_type VARCHAR(100),
    macro_focus VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plan_id, week_number, day_of_week)
);

-- Create trigger for nutrition_weekplans
CREATE TRIGGER update_nutrition_weekplans_updated_at 
    BEFORE UPDATE ON nutrition_weekplans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create meals table if it doesn't exist
CREATE TABLE IF NOT EXISTS meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id VARCHAR(100) REFERENCES nutrition_plans(plan_id) ON DELETE CASCADE,
    meal_name VARCHAR(100) NOT NULL,
    meal_time TIME,
    calories_percentage INTEGER,
    description TEXT,
    ingredients TEXT[],
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for meals
CREATE TRIGGER update_meals_updated_at 
    BEFORE UPDATE ON meals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert week plans for each carnivore plan
-- Carnivoor Droogtrainen Week Plan
INSERT INTO nutrition_weekplans (plan_id, week_number, day_of_week, activity_type, macro_focus) VALUES
('carnivoor_droogtrainen', 1, 'Maandag', 'Training Dag', 'Protein'),
('carnivoor_droogtrainen', 1, 'Dinsdag', 'Herstel', 'Protein'),
('carnivoor_droogtrainen', 1, 'Woensdag', 'Rust Dag', 'Protein'),
('carnivoor_droogtrainen', 1, 'Donderdag', 'Training Dag', 'Protein'),
('carnivoor_droogtrainen', 1, 'Vrijdag', 'Herstel', 'Protein'),
('carnivoor_droogtrainen', 1, 'Zaterdag', 'Weekend', 'Protein'),
('carnivoor_droogtrainen', 1, 'Zondag', 'Rust', 'Protein');

-- Carnivoor Onderhoud Week Plan
INSERT INTO nutrition_weekplans (plan_id, week_number, day_of_week, activity_type, macro_focus) VALUES
('carnivoor_onderhoud', 1, 'Maandag', 'Training Dag', 'Protein'),
('carnivoor_onderhoud', 1, 'Dinsdag', 'Herstel', 'Protein'),
('carnivoor_onderhoud', 1, 'Woensdag', 'Rust Dag', 'Protein'),
('carnivoor_onderhoud', 1, 'Donderdag', 'Training Dag', 'Protein'),
('carnivoor_onderhoud', 1, 'Vrijdag', 'Herstel', 'Protein'),
('carnivoor_onderhoud', 1, 'Zaterdag', 'Weekend', 'Protein'),
('carnivoor_onderhoud', 1, 'Zondag', 'Rust', 'Protein');

-- Carnivoor Spiermassa Week Plan
INSERT INTO nutrition_weekplans (plan_id, week_number, day_of_week, activity_type, macro_focus) VALUES
('carnivoor_spiermassa', 1, 'Maandag', 'Training Dag', 'Protein'),
('carnivoor_spiermassa', 1, 'Dinsdag', 'Herstel', 'Protein'),
('carnivoor_spiermassa', 1, 'Woensdag', 'Rust Dag', 'Protein'),
('carnivoor_spiermassa', 1, 'Donderdag', 'Training Dag', 'Protein'),
('carnivoor_spiermassa', 1, 'Vrijdag', 'Herstel', 'Protein'),
('carnivoor_spiermassa', 1, 'Zaterdag', 'Weekend', 'Protein'),
('carnivoor_spiermassa', 1, 'Zondag', 'Rust', 'Protein');

-- Insert meals for each carnivore plan
-- Carnivoor Droogtrainen Meals
INSERT INTO meals (plan_id, meal_name, meal_time, calories_percentage, description, ingredients, instructions) VALUES
('carnivoor_droogtrainen', 'Ontbijt', '08:00', 25, 'Eiwitrijk ontbijt voor droogtrainen', ARRAY['Eieren', 'Spek', 'Avocado'], 'Bereid eieren met spek en avocado voor een eiwitrijk ontbijt'),
('carnivoor_droogtrainen', 'Snack 1', '10:30', 10, 'Lichte snack', ARRAY['Noten', 'Kaas'], 'Kleine portie noten en kaas'),
('carnivoor_droogtrainen', 'Lunch', '13:00', 30, 'Hoofdmaaltijd', ARRAY['Rundvlees', 'Groenten', 'Olijfolie'], 'Rundvlees met groenten en olijfolie'),
('carnivoor_droogtrainen', 'Snack 2', '15:30', 10, 'Pre-workout snack', ARRAY['Vis', 'Avocado'], 'Vis met avocado'),
('carnivoor_droogtrainen', 'Diner', '19:00', 25, 'Avondmaaltijd', ARRAY['Kip', 'Groenten', 'Boter'], 'Kip met groenten en boter');

-- Carnivoor Onderhoud Meals
INSERT INTO meals (plan_id, meal_name, meal_time, calories_percentage, description, ingredients, instructions) VALUES
('carnivoor_onderhoud', 'Ontbijt', '08:00', 25, 'Gebalanceerd ontbijt', ARRAY['Eieren', 'Spek', 'Avocado'], 'Eieren met spek en avocado'),
('carnivoor_onderhoud', 'Snack 1', '10:30', 10, 'Lichte snack', ARRAY['Noten', 'Kaas'], 'Noten en kaas'),
('carnivoor_onderhoud', 'Lunch', '13:00', 30, 'Hoofdmaaltijd', ARRAY['Rundvlees', 'Groenten', 'Olijfolie'], 'Rundvlees met groenten'),
('carnivoor_onderhoud', 'Snack 2', '15:30', 10, 'Snack', ARRAY['Vis', 'Avocado'], 'Vis met avocado'),
('carnivoor_onderhoud', 'Diner', '19:00', 25, 'Avondmaaltijd', ARRAY['Kip', 'Groenten', 'Boter'], 'Kip met groenten');

-- Carnivoor Spiermassa Meals
INSERT INTO meals (plan_id, meal_name, meal_time, calories_percentage, description, ingredients, instructions) VALUES
('carnivoor_spiermassa', 'Ontbijt', '08:00', 25, 'Eiwitrijk ontbijt voor spieropbouw', ARRAY['Eieren', 'Spek', 'Avocado', 'Kaas'], 'Eieren met spek, avocado en extra kaas'),
('carnivoor_spiermassa', 'Snack 1', '10:30', 10, 'Eiwitrijke snack', ARRAY['Noten', 'Kaas', 'Vlees'], 'Noten, kaas en vlees'),
('carnivoor_spiermassa', 'Lunch', '13:00', 30, 'Grote hoofdmaaltijd', ARRAY['Rundvlees', 'Groenten', 'Olijfolie', 'Boter'], 'Grote portie rundvlees met groenten'),
('carnivoor_spiermassa', 'Snack 2', '15:30', 10, 'Pre-workout snack', ARRAY['Vis', 'Avocado', 'Eieren'], 'Vis met avocado en eieren'),
('carnivoor_spiermassa', 'Diner', '19:00', 25, 'Grote avondmaaltijd', ARRAY['Kip', 'Groenten', 'Boter', 'Kaas'], 'Grote portie kip met groenten');

-- Set up Row Level Security (RLS)
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_weekplans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Create policies for nutrition_plans
CREATE POLICY "Public nutrition plans are viewable by everyone" ON nutrition_plans
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own nutrition plans" ON nutrition_plans
    FOR SELECT USING (auth.uid()::text = created_by OR is_public = true);

-- Create policies for nutrition_weekplans
CREATE POLICY "Public week plans are viewable by everyone" ON nutrition_weekplans
    FOR SELECT USING (true);

-- Create policies for meals
CREATE POLICY "Public meals are viewable by everyone" ON meals
    FOR SELECT USING (true);

-- Verify the setup
SELECT 
    'Nutrition Plans Created:' as info,
    COUNT(*) as count
FROM nutrition_plans 
WHERE category = 'carnivoor';

SELECT 
    'Week Plans Created:' as info,
    COUNT(*) as count
FROM nutrition_weekplans;

SELECT 
    'Meals Created:' as info,
    COUNT(*) as count
FROM meals;

-- Show the created carnivore plans
SELECT 
    plan_id,
    name,
    target_calories,
    target_protein,
    target_carbs,
    target_fat,
    goal
FROM nutrition_plans 
WHERE category = 'carnivoor'
ORDER BY plan_id;
