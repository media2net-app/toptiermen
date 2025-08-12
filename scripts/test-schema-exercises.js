const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSchemaExercises() {
  try {
    console.log('🧪 Testing training schema exercises...\n');

    // Test 1: Get all training schemas
    console.log('1️⃣ Fetching all training schemas...');
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select('*')
      .eq('status', 'published')
      .limit(5);

    if (schemasError) {
      console.log('❌ Error fetching schemas:', schemasError.message);
      return;
    }

    console.log(`✅ Found ${schemas?.length || 0} published schemas`);

    // Test 2: Get schema with days and exercises
    if (schemas && schemas.length > 0) {
      const testSchema = schemas[0];
      console.log(`\n2️⃣ Testing schema: ${testSchema.name} (ID: ${testSchema.id})`);

      const { data: fullSchema, error: fullSchemaError } = await supabase
        .from('training_schemas')
        .select(`
          *,
          training_schema_days (
            *,
            training_schema_exercises (*)
          )
        `)
        .eq('id', testSchema.id)
        .single();

      if (fullSchemaError) {
        console.log('❌ Error fetching full schema:', fullSchemaError.message);
      } else {
        console.log(`✅ Schema details: ${fullSchema.name}`);
        console.log(`📅 Days: ${fullSchema.training_schema_days?.length || 0}`);
        
        if (fullSchema.training_schema_days) {
          fullSchema.training_schema_days.forEach((day, index) => {
            console.log(`   Dag ${day.day_number}: ${day.name}`);
            console.log(`      Oefeningen: ${day.training_schema_exercises?.length || 0}`);
            
            if (day.training_schema_exercises && day.training_schema_exercises.length > 0) {
              day.training_schema_exercises.forEach((exercise, exIndex) => {
                console.log(`         ${exIndex + 1}. ${exercise.exercise_name} (${exercise.sets}x${exercise.reps}, ${exercise.rest_time}s)`);
              });
            } else {
              console.log(`         ⚠️ Geen oefeningen gevonden`);
            }
          });
        }
      }
    }

    // Test 3: Check specific schema by name (5-Daags Upper/Lower Split)
    console.log('\n3️⃣ Testing specific schema: 5-Daags Upper/Lower Split');
    const { data: specificSchema, error: specificError } = await supabase
      .from('training_schemas')
      .select(`
        *,
        training_schema_days (
          *,
          training_schema_exercises (*)
        )
      `)
      .eq('name', '5-Daags Upper/Lower Split')
      .single();

    if (specificError) {
      console.log('❌ Error fetching specific schema:', specificError.message);
    } else if (specificSchema) {
      console.log(`✅ Found schema: ${specificSchema.name}`);
      console.log(`📅 Days: ${specificSchema.training_schema_days?.length || 0}`);
      
      if (specificSchema.training_schema_days) {
        specificSchema.training_schema_days.forEach((day, index) => {
          console.log(`   Dag ${day.day_number}: ${day.name}`);
          console.log(`      Oefeningen: ${day.training_schema_exercises?.length || 0}`);
          
          if (day.training_schema_exercises && day.training_schema_exercises.length > 0) {
            day.training_schema_exercises.forEach((exercise, exIndex) => {
              console.log(`         ${exIndex + 1}. ${exercise.exercise_name} (${exercise.sets}x${exercise.reps}, ${exercise.rest_time}s)`);
            });
          } else {
            console.log(`         ⚠️ Geen oefeningen gevonden`);
          }
        });
      }
    } else {
      console.log('⚠️ Schema "5-Daags Upper/Lower Split" not found');
    }

    // Test 4: Check all exercises in training_schema_exercises table
    console.log('\n4️⃣ Checking all training schema exercises...');
    const { data: allExercises, error: exercisesError } = await supabase
      .from('training_schema_exercises')
      .select('*')
      .limit(10);

    if (exercisesError) {
      console.log('❌ Error fetching exercises:', exercisesError.message);
    } else {
      console.log(`✅ Found ${allExercises?.length || 0} exercises in training_schema_exercises table`);
      if (allExercises && allExercises.length > 0) {
        allExercises.slice(0, 5).forEach((exercise, index) => {
          console.log(`   ${index + 1}. ${exercise.exercise_name} (Day ID: ${exercise.schema_day_id})`);
        });
      }
    }

    // Test 5: Check if there are any orphaned exercises (without valid day)
    console.log('\n5️⃣ Checking for orphaned exercises...');
    const { data: orphanedExercises, error: orphanedError } = await supabase
      .from('training_schema_exercises')
      .select(`
        *,
        training_schema_days!inner(*)
      `)
      .limit(5);

    if (orphanedError) {
      console.log('❌ Error checking orphaned exercises:', orphanedError.message);
    } else {
      console.log(`✅ Found ${orphanedExercises?.length || 0} exercises with valid day references`);
    }

    console.log('\n🎉 Schema exercises test completed!');

  } catch (error) {
    console.error('❌ Error testing schema exercises:', error);
  }
}

testSchemaExercises();
