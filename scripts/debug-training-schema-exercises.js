const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugTrainingSchemaExercises() {
  console.log('🔍 Debugging Training Schema Exercises...\n');

  try {
    // 1. Check training_schemas table structure
    console.log('1️⃣ Checking training_schemas table...');
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select('*')
      .limit(5);

    if (schemasError) {
      console.error('❌ Error fetching training schemas:', schemasError);
      return;
    }

    console.log(`✅ Found ${schemas?.length || 0} training schemas:`);
    schemas?.forEach((schema, index) => {
      console.log(`   ${index + 1}. ${schema.name}`);
      console.log(`      ID: ${schema.id}`);
      console.log(`      Category: ${schema.category}`);
      console.log(`      Difficulty: ${schema.difficulty}`);
      console.log(`      Description: ${schema.description?.substring(0, 100)}...`);
      console.log(`      Columns: ${Object.keys(schema).join(', ')}`);
    });

    // 2. Check if there are exercise-related tables
    console.log('\n2️⃣ Checking for exercise-related tables...');
    
    // Try to find tables with 'exercise' in the name
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .ilike('table_name', '%exercise%');

    if (tablesError) {
      console.log('   Note: Could not query information_schema, checking manually...');
    } else {
      console.log('   Tables with "exercise" in name:', tables?.map(t => t.table_name) || []);
    }

    // 3. Check for workout-related tables
    console.log('\n3️⃣ Checking for workout-related tables...');
    
    const { data: workoutTables, error: workoutTablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .ilike('table_name', '%workout%');

    if (workoutTablesError) {
      console.log('   Note: Could not query information_schema, checking manually...');
    } else {
      console.log('   Tables with "workout" in name:', workoutTables?.map(t => t.table_name) || []);
    }

    // 4. Check if exercises are stored in JSON format in training_schemas
    console.log('\n4️⃣ Checking if exercises are stored in JSON format...');
    
    if (schemas && schemas.length > 0) {
      const firstSchema = schemas[0];
      console.log(`   Checking schema: ${firstSchema.name}`);
      
      // Look for JSON fields that might contain exercises
      const jsonFields = ['exercises', 'workout_days', 'training_plan', 'schema_data'];
      
      jsonFields.forEach(field => {
        if (firstSchema[field]) {
          console.log(`   ✅ Found ${field} field:`, typeof firstSchema[field]);
          if (typeof firstSchema[field] === 'object') {
            console.log(`      Content: ${JSON.stringify(firstSchema[field]).substring(0, 200)}...`);
          }
        }
      });
    }

    // 5. Check if there's a separate exercises table
    console.log('\n5️⃣ Checking for exercises table...');
    try {
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .limit(5);

      if (exercisesError) {
        console.log('   ❌ No exercises table found or error accessing it');
      } else {
        console.log(`   ✅ Found exercises table with ${exercises?.length || 0} exercises`);
        exercises?.forEach((exercise, index) => {
          console.log(`      ${index + 1}. ${exercise.name || 'Unnamed exercise'}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Exercises table does not exist');
    }

    // 6. Check for workout_days table
    console.log('\n6️⃣ Checking for workout_days table...');
    try {
      const { data: workoutDays, error: workoutDaysError } = await supabase
        .from('workout_days')
        .select('*')
        .limit(5);

      if (workoutDaysError) {
        console.log('   ❌ No workout_days table found or error accessing it');
      } else {
        console.log(`   ✅ Found workout_days table with ${workoutDays?.length || 0} workout days`);
        workoutDays?.forEach((day, index) => {
          console.log(`      ${index + 1}. Day ${day.day_number || 'Unknown'}: ${day.name || 'Unnamed day'}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Workout_days table does not exist');
    }

    console.log('\n📊 SUMMARY:');
    console.log('================================');
    console.log('   - Checked training_schemas table structure');
    console.log('   - Looked for exercise-related tables');
    console.log('   - Checked for JSON fields containing exercises');
    console.log('   - Verified if separate exercises table exists');
    console.log('   - Checked for workout_days table');
    console.log('   - Next step: Create exercises data or use existing structure');

  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugTrainingSchemaExercises();
