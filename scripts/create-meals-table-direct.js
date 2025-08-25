const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMealsTableDirect() {
  try {
    console.log('🍽️ Creating meals table directly...');

    // Try to create the table using a simple insert to trigger table creation
    const testMeal = {
      name: 'Test Meal',
      description: 'Test meal for table creation',
      meal_type: 'ontbijt',
      category: 'flexibel',
      ingredients: [],
      instructions: [],
      nutrition_info: {},
      prep_time: 5,
      difficulty: 'makkelijk',
      is_featured: false,
      is_active: true
    };

    console.log('📋 Attempting to create table via insert...');
    const { data, error } = await supabase
      .from('meals')
      .insert([testMeal])
      .select();

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Meals table does not exist. Creating it manually...');
        console.log('📋 Please execute this SQL in Supabase Dashboard > SQL Editor:');
        console.log(`
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type);
CREATE INDEX IF NOT EXISTS idx_meals_category ON meals(category);
CREATE INDEX IF NOT EXISTS idx_meals_featured ON meals(is_featured);
CREATE INDEX IF NOT EXISTS idx_meals_active ON meals(is_active);

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
        `);
        
        console.log('📋 After creating the table, run: node scripts/add-meals.js');
        return;
      } else {
        console.error('❌ Error creating meals table:', error);
        return;
      }
    }

    console.log('✅ Meals table created successfully!');
    console.log('📋 Test meal added:', data[0].name);
    
    // Clean up test meal
    console.log('🧹 Cleaning up test meal...');
    const { error: deleteError } = await supabase
      .from('meals')
      .delete()
      .eq('name', 'Test Meal');

    if (deleteError) {
      console.error('❌ Error cleaning up test meal:', deleteError);
    } else {
      console.log('✅ Test meal cleaned up');
    }

    console.log('📋 You can now run: node scripts/add-meals.js');

  } catch (error) {
    console.error('❌ Error creating meals table:', error);
  }
}

createMealsTableDirect();
