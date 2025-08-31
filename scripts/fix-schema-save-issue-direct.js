const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSchemaSaveIssueDirect() {
  console.log('🔧 Fixing Schema Save Issue (Direct Method)...\n');

  try {
    // Since we can't execute DDL directly, let's check if we can work around it
    // by creating a new table or using an existing column
    
    console.log('1️⃣ Checking if we can use an existing column...');
    
    // Check if there's already a column we can use
    const { data: sampleProfile, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Error fetching sample profile:', sampleError);
      return;
    }

    console.log('✅ Current profile columns:', Object.keys(sampleProfile[0]));
    
    // Check if we can use an existing column like 'main_goal' or create a new approach
    const existingColumns = Object.keys(sampleProfile[0]);
    
    // Look for any column that might store schema information
    const possibleSchemaColumns = existingColumns.filter(col => 
      col.includes('schema') || col.includes('training') || col.includes('workout')
    );
    
    if (possibleSchemaColumns.length > 0) {
      console.log('📋 Found potential schema columns:', possibleSchemaColumns);
    } else {
      console.log('📋 No existing schema columns found');
    }

    // Alternative approach: Create a separate user_schema_selections table
    console.log('\n2️⃣ Creating alternative solution...');
    
    // Check if user_schema_selections table exists
    const { data: schemaSelections, error: schemaSelectionsError } = await supabase
      .from('user_schema_selections')
      .select('*')
      .limit(1);

    if (schemaSelectionsError && schemaSelectionsError.message.includes('does not exist')) {
      console.log('📋 user_schema_selections table does not exist, creating it...');
      
      // We can't create tables directly, so let's provide manual instructions
      console.log('\n📋 MANUAL SETUP REQUIRED:');
      console.log('Please run the following SQL in your Supabase dashboard:');
      console.log('==================================================');
      console.log(`
-- Option 1: Add column to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS selected_schema_id UUID REFERENCES training_schemas(id);

-- Option 2: Create a separate table for schema selections
CREATE TABLE IF NOT EXISTS user_schema_selections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  schema_id UUID REFERENCES training_schemas(id) ON DELETE CASCADE,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE user_schema_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schema selections" ON user_schema_selections
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schema selections" ON user_schema_selections
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schema selections" ON user_schema_selections
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schema selections" ON user_schema_selections
FOR DELETE USING (auth.uid() = user_id);
      `);
      console.log('==================================================');
      
      console.log('\n🎯 RECOMMENDATION:');
      console.log('   Use Option 1 (adding column to profiles table) for simplicity');
      console.log('   Use Option 2 (separate table) for better data organization');
      
      return;
    } else if (schemaSelectionsError) {
      console.error('❌ Error checking user_schema_selections:', schemaSelectionsError);
    } else {
      console.log('✅ user_schema_selections table exists!');
      
      // Test using the existing table
      console.log('\n3️⃣ Testing with existing user_schema_selections table...');
      
      // Find Chiel's user ID
      const { data: chielProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .or('full_name.ilike.%chiel%,email.ilike.%chiel%')
        .limit(1);

      if (profileError || !chielProfile || chielProfile.length === 0) {
        console.error('❌ Chiel not found');
        return;
      }

      const chielId = chielProfile[0].id;
      console.log(`👤 Testing with: ${chielProfile[0].full_name} (${chielProfile[0].email})`);

      // Get a test schema
      const { data: schemas, error: schemasError } = await supabase
        .from('training_schemas')
        .select('id, name')
        .limit(1);

      if (schemasError || !schemas || schemas.length === 0) {
        console.error('❌ No training schemas found');
        return;
      }

      const testSchemaId = schemas[0].id;
      console.log(`📋 Testing with schema: ${schemas[0].name} (ID: ${testSchemaId})`);

      // Test upserting schema selection
      const { data: upsertData, error: upsertError } = await supabase
        .from('user_schema_selections')
        .upsert({
          user_id: chielId,
          schema_id: testSchemaId
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (upsertError) {
        console.error('❌ Error upserting schema selection:', upsertError);
      } else {
        console.log('✅ Successfully saved schema selection!');
        console.log('   Saved selection:', upsertData);
        
        // Clean up
        const { error: deleteError } = await supabase
          .from('user_schema_selections')
          .delete()
          .eq('user_id', chielId);

        if (deleteError) {
          console.error('❌ Error cleaning up:', deleteError);
        } else {
          console.log('✅ Cleaned up test data');
        }
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log('================================');
    console.log('   - Checked existing database structure');
    console.log('   - Provided manual setup instructions');
    console.log('   - Tested alternative solutions');

  } catch (error) {
    console.error('❌ Error in fix:', error);
  }
}

fixSchemaSaveIssueDirect();
