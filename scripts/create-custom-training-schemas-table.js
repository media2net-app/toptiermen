const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCustomTrainingSchemasTable() {
  try {
    console.log('🏋️ Creating custom_training_schemas table...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-custom-training-schemas-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Error creating custom_training_schemas table:', error);
      return false;
    }

    console.log('✅ Custom training schemas table created successfully!');
    
    // Test the table by inserting a sample record
    console.log('🧪 Testing table with sample data...');
    
    const { data: testData, error: testError } = await supabase
      .from('custom_training_schemas')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for testing
        base_schema_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for testing
        custom_name: 'Test Custom Schema',
        custom_description: 'Test description',
        custom_data: { test: 'data' }
      })
      .select();

    if (testError) {
      console.log('⚠️ Test insert failed (expected if user/schema doesn\'t exist):', testError.message);
    } else {
      console.log('✅ Test insert successful:', testData);
      
      // Clean up test data
      await supabase
        .from('custom_training_schemas')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
    }

    return true;

  } catch (error) {
    console.error('❌ Error in createCustomTrainingSchemasTable:', error);
    return false;
  }
}

// Run the script
createCustomTrainingSchemasTable()
  .then((success) => {
    if (success) {
      console.log('🎉 Custom training schemas table setup completed successfully!');
    } else {
      console.log('💥 Custom training schemas table setup failed!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
