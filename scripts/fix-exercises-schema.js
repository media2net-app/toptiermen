const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixExercisesSchema() {
  try {
    console.log('🔧 Fixing exercises table schema...');

    // First, let's check what columns currently exist
    console.log('📋 Checking current exercises table structure...');
    const { data: testData, error: testError } = await supabase
      .from('exercises')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ Error accessing exercises table:', testError.message);
      return;
    }

    console.log('✅ Successfully connected to exercises table');
    console.log('📋 Current columns:', Object.keys(testData[0] || {}));

    // Now let's try to insert a test record with the new fields
    console.log('🧪 Testing insert with new fields...');
    const testRecord = {
      name: 'Test Exercise',
      primary_muscle: 'Borst',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      video_url: null,
      instructions: null,
      worksheet_url: null,
      secondary_muscles: []
    };

    const { data: insertData, error: insertError } = await supabase
      .from('exercises')
      .insert([testRecord])
      .select()
      .single();

    if (insertError) {
      console.log('❌ Error inserting test record:', insertError.message);
      console.log('❌ Error details:', insertError);
      
      // If the error is about missing columns, we need to add them
      if (insertError.message.includes('muscle_group') || insertError.message.includes('primary_muscle')) {
        console.log('🔧 Need to add missing columns to database...');
        console.log('⚠️ Please run the following SQL commands in your Supabase dashboard:');
        console.log(`
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS primary_muscle TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS worksheet_url TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS secondary_muscles TEXT[];
        `);
      }
      return;
    }

    console.log('✅ Successfully inserted test record:', insertData);

    // Clean up test record
    const { error: deleteError } = await supabase
      .from('exercises')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.log('⚠️ Warning: Could not delete test record:', deleteError.message);
    } else {
      console.log('✅ Test record cleaned up');
    }

    console.log('✅ Exercises table schema is ready!');

  } catch (error) {
    console.error('❌ Error fixing exercises schema:', error);
  }
}

fixExercisesSchema();
