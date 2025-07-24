const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkWorkoutTables() {
  try {
    console.log('🔍 Checking workout tables...');

    // Check workout_sessions table
    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.log('❌ workout_sessions table error:', sessionsError.message);
    } else {
      console.log('✅ workout_sessions table exists and is accessible');
    }

    // Check workout_exercises table
    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select('*')
      .limit(1);

    if (exercisesError) {
      console.log('❌ workout_exercises table error:', exercisesError.message);
    } else {
      console.log('✅ workout_exercises table exists and is accessible');
    }

    // Test insert into workout_sessions
    const { data: testInsert, error: insertError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
        schema_id: 'test-schema-id',
        day_number: 1,
        mode: 'interactive'
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
    } else {
      console.log('✅ Insert test successful:', testInsert.id);
      
      // Clean up test data
      await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', testInsert.id);
      
      console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Error in checkWorkoutTables:', error);
  }
}

checkWorkoutTables(); 