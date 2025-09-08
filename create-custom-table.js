require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createCustomNutritionPlansTable() {
  try {
    console.log('🔧 Creating custom_nutrition_plans table...');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create custom_nutrition_plans table
        CREATE TABLE IF NOT EXISTS custom_nutrition_plans (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          base_plan_id TEXT NOT NULL,
          plan_name TEXT NOT NULL,
          plan_data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create unique constraint on user_id and base_plan_id
        CREATE UNIQUE INDEX IF NOT EXISTS custom_nutrition_plans_user_base_plan_unique 
        ON custom_nutrition_plans(user_id, base_plan_id);

        -- Create index for faster queries
        CREATE INDEX IF NOT EXISTS custom_nutrition_plans_user_id_idx 
        ON custom_nutrition_plans(user_id);

        CREATE INDEX IF NOT EXISTS custom_nutrition_plans_base_plan_id_idx 
        ON custom_nutrition_plans(base_plan_id);

        -- Enable RLS
        ALTER TABLE custom_nutrition_plans ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Users can view their own custom plans" ON custom_nutrition_plans
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own custom plans" ON custom_nutrition_plans
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own custom plans" ON custom_nutrition_plans
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own custom plans" ON custom_nutrition_plans
          FOR DELETE USING (auth.uid() = user_id);
      `
    });

    if (error) {
      console.error('❌ Error creating table:', error);
      return;
    }

    console.log('✅ Custom nutrition plans table created successfully!');
    console.log('📊 Table structure:');
    console.log('   - id: UUID (Primary Key)');
    console.log('   - user_id: UUID (Foreign Key to auth.users)');
    console.log('   - base_plan_id: TEXT');
    console.log('   - plan_name: TEXT');
    console.log('   - plan_data: JSONB');
    console.log('   - created_at: TIMESTAMP');
    console.log('   - updated_at: TIMESTAMP');
    console.log('   - RLS enabled with user-specific policies');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createCustomNutritionPlansTable();
