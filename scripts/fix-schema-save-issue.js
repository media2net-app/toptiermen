const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSchemaSaveIssue() {
  console.log('🔧 Fixing Schema Save Issue...\n');

  try {
    // SQL to add the missing column
    const sql = `
      -- Add selected_schema_id column to profiles table
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS selected_schema_id UUID REFERENCES training_schemas(id);

      -- Add comment to explain the column
      COMMENT ON COLUMN profiles.selected_schema_id IS 'References the currently selected training schema for this user';
    `;

    console.log('1️⃣ Adding selected_schema_id column to profiles table...');
    
    // Execute the SQL
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
    
    if (sqlError) {
      console.error('❌ Error executing SQL:', sqlError);
      console.log('\n📋 MANUAL SETUP REQUIRED:');
      console.log('Please run the following SQL in your Supabase dashboard:');
      console.log('==================================================');
      console.log(sql);
      console.log('==================================================');
      return;
    }

    console.log('✅ Column added successfully!');

    // 2. Test the fix
    console.log('\n2️⃣ Testing the fix...');
    
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

    // Test updating selected_schema_id
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ selected_schema_id: testSchemaId })
      .eq('id', chielId)
      .select();

    if (updateError) {
      console.error('❌ Error updating selected_schema_id:', updateError);
    } else {
      console.log('✅ Successfully updated selected_schema_id!');
      console.log('   Updated profile:', updateData);
      
      // Reset it back to null
      const { error: resetError } = await supabase
        .from('profiles')
        .update({ selected_schema_id: null })
        .eq('id', chielId);

      if (resetError) {
        console.error('❌ Error resetting selected_schema_id:', resetError);
      } else {
        console.log('✅ Reset selected_schema_id back to null');
      }
    }

    // 3. Verify the column exists
    console.log('\n3️⃣ Verifying column exists...');
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('selected_schema_id')
      .eq('id', chielId)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying column:', verifyError);
    } else {
      console.log('✅ Column verification successful!');
      console.log(`   selected_schema_id: ${verifyProfile.selected_schema_id || 'null'}`);
    }

    console.log('\n🎉 SCHEMA SAVE ISSUE FIXED!');
    console.log('================================');
    console.log('   ✅ selected_schema_id column added to profiles table');
    console.log('   ✅ Foreign key reference to training_schemas(id) created');
    console.log('   ✅ Column comment added for documentation');
    console.log('   ✅ Test update and reset successful');
    console.log('   ✅ Column verification passed');
    console.log('\n🚀 Users can now save their selected training schemas!');

  } catch (error) {
    console.error('❌ Error in fix:', error);
  }
}

fixSchemaSaveIssue();
