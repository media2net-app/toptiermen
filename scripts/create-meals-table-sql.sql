-- Create meals table for Top Tier Men platform
-- Execute this in Supabase Dashboard > SQL Editor

-- Create the meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('ontbijt', 'lunch', 'diner', 'snack')),
  category TEXT NOT NULL CHECK (category IN ('carnivoor', 'flexibel', 'vegetarisch')),
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT[] NOT NULL DEFAULT '{}',
  nutrition_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  prep_time INTEGER NOT NULL DEFAULT 15,
  difficulty TEXT NOT NULL DEFAULT 'makkelijk' CHECK (difficulty IN ('makkelijk', 'gemiddeld', 'moeilijk')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for meals table
DROP TRIGGER IF EXISTS update_meals_updated_at ON meals;
CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON meals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type);
CREATE INDEX IF NOT EXISTS idx_meals_category ON meals(category);
CREATE INDEX IF NOT EXISTS idx_meals_featured ON meals(is_featured);
CREATE INDEX IF NOT EXISTS idx_meals_active ON meals(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Enable all access for authenticated users" ON meals
  FOR ALL USING (auth.role() = 'authenticated');

-- Verify the table was created successfully
SELECT 
  'Meals table created successfully!' as status,
  COUNT(*) as meal_count 
FROM meals;
