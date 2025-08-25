const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupMealsTable() {
  try {
    console.log('🍽️ Setting up meals table...');

    // Create meals table
    const createTableSQL = `
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
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.error('❌ Error creating meals table:', createError);
      return;
    }

    console.log('✅ Meals table created successfully');

    // Create indexes
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type);
      CREATE INDEX IF NOT EXISTS idx_meals_category ON meals(category);
      CREATE INDEX IF NOT EXISTS idx_meals_featured ON meals(is_featured);
      CREATE INDEX IF NOT EXISTS idx_meals_active ON meals(is_active);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexesSQL });
    
    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Enable RLS
    const rlsSQL = `
      ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
    
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    // Create RLS policies
    const policiesSQL = `
      DROP POLICY IF EXISTS "Meals are viewable by authenticated users" ON meals;
      DROP POLICY IF EXISTS "Meals are insertable by admin users" ON meals;
      DROP POLICY IF EXISTS "Meals are updatable by admin users" ON meals;
      DROP POLICY IF EXISTS "Meals are deletable by admin users" ON meals;
      
      CREATE POLICY "Meals are viewable by authenticated users" ON meals
        FOR SELECT USING (auth.role() = 'authenticated');

      CREATE POLICY "Meals are insertable by admin users" ON meals
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');

      CREATE POLICY "Meals are updatable by admin users" ON meals
        FOR UPDATE USING (auth.role() = 'authenticated');

      CREATE POLICY "Meals are deletable by admin users" ON meals
        FOR DELETE USING (auth.role() = 'authenticated');
    `;

    const { error: policyError } = await supabase.rpc('exec_sql', { sql: policiesSQL });
    
    if (policyError) {
      console.error('❌ Error creating policies:', policyError);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    console.log('✅ Meals table setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up meals table:', error);
  }
}

setupMealsTable();
