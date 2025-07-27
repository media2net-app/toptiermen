const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createNutritionTables() {
  console.log('🚀 Creating nutrition tables...');

  try {
    // Create nutrition_ingredients table
    const { error: ingredientsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS nutrition_ingredients (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          calories_per_100g DECIMAL(8,2) NOT NULL,
          protein_per_100g DECIMAL(8,2) NOT NULL,
          carbs_per_100g DECIMAL(8,2) NOT NULL,
          fat_per_100g DECIMAL(8,2) NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (ingredientsError) {
      console.error('❌ Error creating nutrition_ingredients table:', ingredientsError);
    } else {
      console.log('✅ nutrition_ingredients table created');
    }

    // Create nutrition_recipes table
    const { error: recipesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS nutrition_recipes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
          servings INTEGER NOT NULL DEFAULT 1,
          difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
          calories_per_serving DECIMAL(8,2),
          protein_per_serving DECIMAL(8,2),
          carbs_per_serving DECIMAL(8,2),
          fat_per_serving DECIMAL(8,2),
          is_featured BOOLEAN DEFAULT false,
          is_public BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (recipesError) {
      console.error('❌ Error creating nutrition_recipes table:', recipesError);
    } else {
      console.log('✅ nutrition_recipes table created');
    }

    // Create nutrition_plans table
    const { error: plansError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (plansError) {
      console.error('❌ Error creating nutrition_plans table:', plansError);
    } else {
      console.log('✅ nutrition_plans table created');
    }

    // Insert sample data
    const { error: sampleDataError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO nutrition_ingredients (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, description) VALUES
        ('Kipfilet', 'Vlees', 165, 31, 0, 3.6, 'Mager eiwit, perfect voor spieropbouw'),
        ('Zalm', 'Vis', 208, 25, 0, 12, 'Rijk aan omega-3 vetzuren'),
        ('Broccoli', 'Groenten', 34, 2.8, 7, 0.4, 'Vitamine C en vezels'),
        ('Quinoa', 'Granen', 120, 4.4, 22, 1.9, 'Complete eiwitbron'),
        ('Avocado', 'Fruit', 160, 2, 9, 15, 'Gezonde vetten en vezels')
        ON CONFLICT DO NOTHING;
      `
    });

    if (sampleDataError) {
      console.error('❌ Error inserting sample data:', sampleDataError);
    } else {
      console.log('✅ Sample data inserted');
    }

    console.log('🎉 Nutrition tables setup completed!');

  } catch (error) {
    console.error('❌ Error creating nutrition tables:', error);
  }
}

createNutritionTables(); 