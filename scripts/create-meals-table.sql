-- Create meals table
-- Execute this in Supabase Dashboard > SQL Editor

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('ontbijt', 'lunch', 'diner', 'snack')),
  category TEXT NOT NULL CHECK (category IN ('carnivoor', 'flexibel', 'vegetarisch', 'vegan')),
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  nutrition_info JSONB NOT NULL DEFAULT '{}',
  prep_time INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'makkelijk' CHECK (difficulty IN ('makkelijk', 'gemiddeld', 'moeilijk')),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type);
CREATE INDEX IF NOT EXISTS idx_meals_category ON meals(category);
CREATE INDEX IF NOT EXISTS idx_meals_featured ON meals(is_featured);
CREATE INDEX IF NOT EXISTS idx_meals_active ON meals(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_meals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meals_updated_at
  BEFORE UPDATE ON meals
  FOR EACH ROW
  EXECUTE FUNCTION update_meals_updated_at();

-- Enable RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Meals are viewable by authenticated users" ON meals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Meals are insertable by admin users" ON meals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Meals are updatable by admin users" ON meals
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Meals are deletable by admin users" ON meals
  FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'meals'
ORDER BY ordinal_position;
