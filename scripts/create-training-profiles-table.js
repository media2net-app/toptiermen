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

async function createTrainingProfilesTable() {
  try {
    console.log('🏋️ Creating training_profiles table...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-training-profiles-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Error creating training_profiles table:', error);
      return false;
    }

    console.log('✅ Training profiles table created successfully!');
    
    // Test the table by inserting a sample record
    console.log('🧪 Testing table with sample data...');
    
    const { data: testData, error: testError } = await supabase
      .from('training_profiles')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for testing
        training_goal: 'spiermassa',
        training_frequency: 3,
        experience_level: 'beginner',
        equipment_type: 'gym'
      })
      .select();

    if (testError) {
      console.log('⚠️ Test insert failed (expected if user doesn\'t exist):', testError.message);
    } else {
      console.log('✅ Test insert successful:', testData);
      
      // Clean up test data
      await supabase
        .from('training_profiles')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
    }

    return true;

  } catch (error) {
    console.error('❌ Error in createTrainingProfilesTable:', error);
    return false;
  }
}

// Run the script
createTrainingProfilesTable()
  .then((success) => {
    if (success) {
      console.log('🎉 Training profiles table setup completed successfully!');
    } else {
      console.log('💥 Training profiles table setup failed!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
