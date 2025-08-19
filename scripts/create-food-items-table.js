const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabaseUrl = 'https://wkjvstuttbeyqzyjayxj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndranZzdHV0dGJleXF6eWpheXhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI1MDI1NSwiZXhwIjoyMDY1ODI2MjU1fQ.LOo6OJaQunCtZvY8oODK3DcrvYte45h2DC7Qf6ERJFo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createFoodItemsTable() {
  console.log('🔧 Creating food_items table...');
  
  try {
    // Create the food_items table
    console.log('📋 Creating table structure...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS food_items (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          calories INTEGER NOT NULL,
          protein DECIMAL(5,2) NOT NULL,
          carbs DECIMAL(5,2) NOT NULL,
          fat DECIMAL(5,2) NOT NULL,
          fiber DECIMAL(5,2) DEFAULT 0,
          sugar DECIMAL(5,2) DEFAULT 0,
          sodium DECIMAL(5,2) DEFAULT 0,
          allergens TEXT[] DEFAULT '{}',
          diet_tags TEXT[] DEFAULT '{}',
          description TEXT,
          serving_size VARCHAR(100) DEFAULT '100g',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.error('❌ Error creating table:', createError);
      return;
    }
    
    console.log('✅ Table created successfully');
    
    // Insert the food items data
    console.log('📋 Inserting food items...');
    const foodItems = [
      { name: 'Havermout', category: 'Granen', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
      { name: 'Whey eiwit Shakes', category: 'Eiwitten', calories: 120, protein: 25, carbs: 3, fat: 1.5 },
      { name: 'Volkoren crackers', category: 'Granen', calories: 350, protein: 12, carbs: 65, fat: 8 },
      { name: 'Rijstwafels', category: 'Granen', calories: 35, protein: 0.8, carbs: 7.5, fat: 0.2 },
      { name: 'Pindakaas', category: 'Vetten', calories: 588, protein: 25, carbs: 20, fat: 50 },
      { name: 'Volkoren en groenten wraps', category: 'Granen', calories: 280, protein: 10, carbs: 50, fat: 4 },
      { name: 'Blauwe bessen', category: 'Fruit', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3 },
      { name: 'Bananen', category: 'Fruit', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      { name: 'Appels', category: 'Fruit', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      { name: 'Melk', category: 'Zuivel', calories: 42, protein: 3.4, carbs: 5, fat: 1 },
      { name: 'Kipfilet plakjes', category: 'Vlees', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      { name: 'Kipfilet', category: 'Vlees', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      { name: 'Carpaccio', category: 'Vlees', calories: 250, protein: 25, carbs: 0, fat: 15 },
      { name: 'Blikjes tonijn olijfolie', category: 'Vis', calories: 200, protein: 30, carbs: 0, fat: 8 },
      { name: 'Salades', category: 'Groente', calories: 25, protein: 2, carbs: 5, fat: 0.3 },
      { name: 'Eieren', category: 'Zuivel', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      { name: 'Kaas', category: 'Zuivel', calories: 400, protein: 25, carbs: 1, fat: 33 },
      { name: 'Krentenbol', category: 'Granen', calories: 280, protein: 8, carbs: 55, fat: 3 },
      { name: 'Koolhydraten arm brood', category: 'Granen', calories: 200, protein: 12, carbs: 25, fat: 8 },
      { name: 'Basmati Rijst', category: 'Granen', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      { name: 'Volkoren pasta', category: 'Granen', calories: 124, protein: 5, carbs: 25, fat: 1.1 },
      { name: 'Noodles', category: 'Granen', calories: 110, protein: 4, carbs: 22, fat: 0.5 },
      { name: 'Spaghetti', category: 'Granen', calories: 124, protein: 5, carbs: 25, fat: 1.1 },
      { name: 'Macaroni', category: 'Granen', calories: 124, protein: 5, carbs: 25, fat: 1.1 },
      { name: 'Zoete aardappel', category: 'Groente', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
      { name: 'Witte aardappel', category: 'Groente', calories: 77, protein: 2, carbs: 17, fat: 0.1 },
      { name: 'Witvis', category: 'Vis', calories: 100, protein: 20, carbs: 0, fat: 2 },
      { name: 'Mager rundergehakt', category: 'Vlees', calories: 250, protein: 26, carbs: 0, fat: 15 },
      { name: 'Biefstuk', category: 'Vlees', calories: 271, protein: 26, carbs: 0, fat: 18 },
      { name: 'Kip', category: 'Vlees', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      { name: 'Kalkoenfilet', category: 'Vlees', calories: 135, protein: 30, carbs: 0, fat: 1 },
      { name: 'Tartaar', category: 'Vlees', calories: 250, protein: 25, carbs: 0, fat: 15 },
      { name: 'Duitse biefstuk', category: 'Vlees', calories: 271, protein: 26, carbs: 0, fat: 18 },
      { name: 'Magere kwark', category: 'Zuivel', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
      { name: 'Skyr', category: 'Zuivel', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
      { name: 'Walnoten', category: 'Noten', calories: 654, protein: 15, carbs: 14, fat: 65 },
      { name: 'Amandelen', category: 'Noten', calories: 579, protein: 21, carbs: 22, fat: 50 },
      { name: 'Halfvolle kwark', category: 'Zuivel', calories: 80, protein: 12, carbs: 4, fat: 2 }
    ];
    
    const { data: insertData, error: insertError } = await supabase
      .from('food_items')
      .insert(foodItems)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting food items:', insertError);
    } else {
      console.log('✅ Food items inserted successfully:', insertData?.length || 0, 'items');
    }
    
    // Disable RLS on food_items table
    console.log('🔧 Disabling RLS on food_items table...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE food_items DISABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.error('❌ Error disabling RLS:', rlsError);
    } else {
      console.log('✅ RLS disabled on food_items table');
    }
    
    // Test reading from the table
    console.log('🧪 Testing read access...');
    const { data: testData, error: testError } = await supabase
      .from('food_items')
      .select('*')
      .limit(5);
    
    if (testError) {
      console.error('❌ Error testing read access:', testError);
    } else {
      console.log('✅ Read access test successful:', testData?.length || 0, 'items');
      console.log('📋 Sample data:', testData);
    }
    
  } catch (err) {
    console.error('❌ Exception during table creation:', err);
  }
}

createFoodItemsTable();
