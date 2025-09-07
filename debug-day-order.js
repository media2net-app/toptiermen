require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDayOrder() {
  try {
    console.log('🔍 Debugging day order for CHIEL TEST VOLGORDE schema...');
    
    // Get the schema
    const { data: schema, error: schemaError } = await supabase
      .from('training_schemas')
      .select('*')
      .eq('name', 'CHIEL TEST VOLGORDE')
      .single();

    if (schemaError) {
      console.error('❌ Error fetching schema:', schemaError);
      return;
    }

    console.log('📋 Schema:', schema.name, '(ID:', schema.id + ')');

    // Get all days for this schema
    const { data: days, error: daysError } = await supabase
      .from('training_schema_days')
      .select('*')
      .eq('schema_id', schema.id)
      .order('day_number', { ascending: true });

    if (daysError) {
      console.error('❌ Error fetching days:', daysError);
      return;
    }

    console.log('\n📅 Days in database (ordered by day_number):');
    days.forEach((day, index) => {
      console.log(`  ${index + 1}. Day ${day.day_number}: "${day.name}" (ID: ${day.id})`);
    });

    // Get exercises for each day
    console.log('\n💪 Exercises per day:');
    for (const day of days) {
      const { data: exercises, error: exercisesError } = await supabase
        .from('training_schema_exercises')
        .select('*')
        .eq('schema_day_id', day.id)
        .order('order_index', { ascending: true });

      if (exercisesError) {
        console.error(`❌ Error fetching exercises for day ${day.day_number}:`, exercisesError);
        continue;
      }

      console.log(`\n  Day ${day.day_number}: "${day.name}"`);
      exercises.forEach((exercise, index) => {
        console.log(`    ${index + 1}. ${exercise.exercise_name} (order_index: ${exercise.order_index})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugDayOrder();
