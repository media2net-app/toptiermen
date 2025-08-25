const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndCreateMealsTable() {
  try {
    console.log('🔍 Checking if meals table exists...');
    
    // Try to select from meals table
    const { data, error } = await supabase
      .from('meals')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Meals table does not exist, creating it...');
      
      // Create the meals table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS meals (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          meal_type TEXT NOT NULL CHECK (meal_type IN ('ontbijt', 'lunch', 'diner', 'snack')),
          category TEXT NOT NULL CHECK (category IN ('carnivoor', 'flexibel', 'vegetarisch')),
          plan_type TEXT NOT NULL,
          goal TEXT NOT NULL,
          day TEXT,
          is_cheat_day BOOLEAN DEFAULT FALSE,
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
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('❌ Error creating meals table:', createError);
        return;
      }
      
      console.log('✅ Meals table created successfully!');
      
      // Create updated_at trigger
      const triggerSQL = `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        DROP TRIGGER IF EXISTS update_meals_updated_at ON meals;
        CREATE TRIGGER update_meals_updated_at
          BEFORE UPDATE ON meals
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `;
      
      const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSQL });
      
      if (triggerError) {
        console.log('⚠️ Warning: Could not create updated_at trigger:', triggerError);
      } else {
        console.log('✅ Updated_at trigger created successfully!');
      }
      
    } else {
      console.log('✅ Meals table already exists!');
    }
    
    // Test the table by trying to insert a test record
    console.log('🧪 Testing meals table with a test record...');
    
    const testMeal = {
      name: 'Test Maaltijd',
      description: 'Dit is een test maaltijd om te controleren of de tabel werkt',
      meal_type: 'ontbijt',
      category: 'carnivoor',
      plan_type: 'Carnivoor / Animal Based',
      goal: 'Spiermassa',
      ingredients: [
        { name: 'Test Ingrediënt', quantity: 100, unit: 'gram' }
      ],
      instructions: ['Test instructie'],
      nutrition_info: {
        calories: 200,
        protein: 20,
        carbs: 10,
        fat: 5
      },
      prep_time: 10,
      difficulty: 'makkelijk',
      is_featured: false,
      is_active: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('meals')
      .insert(testMeal)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting test meal:', insertError);
      return;
    }
    
    console.log('✅ Test meal inserted successfully:', insertData[0].id);
    
    // Clean up test record
    const { error: deleteError } = await supabase
      .from('meals')
      .delete()
      .eq('name', 'Test Maaltijd');
    
    if (deleteError) {
      console.log('⚠️ Warning: Could not delete test meal:', deleteError);
    } else {
      console.log('✅ Test meal cleaned up successfully');
    }
    
    console.log('🎉 Meals table is ready to use!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndCreateMealsTable();
