const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createV2Table() {
  try {
    console.log('🔧 Creating nutrition_profiles_v2 table...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create V2 nutrition profiles table for better data management
        CREATE TABLE IF NOT EXISTS nutrition_profiles_v2 (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            weight DECIMAL(5,2) NOT NULL CHECK (weight > 0 AND weight < 500),
            height INTEGER NOT NULL CHECK (height > 0 AND height < 300),
            age INTEGER NOT NULL CHECK (age > 0 AND age < 120),
            gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
            activity_level VARCHAR(20) NOT NULL CHECK (activity_level IN ('sedentary', 'moderate', 'very_active')),
            fitness_goal VARCHAR(20) NOT NULL CHECK (fitness_goal IN ('droogtrainen', 'onderhoud', 'spiermassa')),
            target_calories INTEGER,
            target_protein DECIMAL(6,2),
            target_carbs DECIMAL(6,2),
            target_fat DECIMAL(6,2),
            bmr DECIMAL(8,2),
            tdee DECIMAL(8,2),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
      `
    });

    if (error) {
      console.error('Error creating table:', error);
      return;
    }

    console.log('✅ Table created successfully');
    
    // Create index
    console.log('🔧 Creating index...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_nutrition_profiles_v2_user_id ON nutrition_profiles_v2(user_id);'
    });

    if (indexError) {
      console.error('Error creating index:', indexError);
    } else {
      console.log('✅ Index created successfully');
    }

    // Enable RLS
    console.log('🔧 Enabling RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE nutrition_profiles_v2 ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    console.log('🎉 V2 table setup completed!');

  } catch (error) {
    console.error('Error:', error);
  }
}

createV2Table();
