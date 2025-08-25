require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTrainingSchemasUpdate() {
  try {
    console.log('🔍 Checking training schemas update status...\n');

    // 1. Check training_schemas table
    console.log('📋 Checking training_schemas table...');
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select('id, name, training_goal, rep_range, description')
      .eq('status', 'published')
      .limit(5);

    if (schemasError) {
      console.log('❌ Error fetching schemas:', schemasError.message);
      return;
    }

    console.log(`✅ Found ${schemas?.length || 0} published schemas`);
    
    if (schemas && schemas.length > 0) {
      console.log('\n📊 Sample schema data:');
      schemas.forEach((schema, index) => {
        console.log(`${index + 1}. ${schema.name}`);
        console.log(`   - Training Goal: ${schema.training_goal || 'Not set'}`);
        console.log(`   - Rep Range: ${schema.rep_range || 'Not set'}`);
        console.log(`   - Has Muscle Failure Warning: ${schema.description?.includes('spierfalen') ? '✅ Yes' : '❌ No'}`);
        console.log('');
      });
    }

    // 2. Check training_schema_exercises table
    console.log('🏋️ Checking training_schema_exercises table...');
    const { data: exercises, error: exercisesError } = await supabase
      .from('training_schema_exercises')
      .select('id, exercise_name, reps, target_reps, sets')
      .limit(10);

    if (exercisesError) {
      console.log('❌ Error fetching exercises:', exercisesError.message);
      return;
    }

    console.log(`✅ Found ${exercises?.length || 0} exercises`);
    
    if (exercises && exercises.length > 0) {
      console.log('\n📊 Sample exercise data:');
      exercises.forEach((exercise, index) => {
        console.log(`${index + 1}. ${exercise.exercise_name}`);
        console.log(`   - Reps: ${exercise.reps}`);
        console.log(`   - Target Reps: ${exercise.target_reps || 'Not set'}`);
        console.log(`   - Sets: ${exercise.sets}`);
        console.log('');
      });
    }

    // 3. Check training_schema_days table
    console.log('📅 Checking training_schema_days table...');
    const { data: days, error: daysError } = await supabase
      .from('training_schema_days')
      .select('id, name, description')
      .limit(5);

    if (daysError) {
      console.log('❌ Error fetching days:', daysError.message);
      return;
    }

    console.log(`✅ Found ${days?.length || 0} schema days`);
    
    if (days && days.length > 0) {
      console.log('\n📊 Sample day data:');
      days.forEach((day, index) => {
        console.log(`${index + 1}. ${day.name}`);
        console.log(`   - Has Muscle Failure Warning: ${day.description?.includes('spierfalen') ? '✅ Yes' : '❌ No'}`);
        console.log('');
      });
    }

    // 4. Summary statistics
    console.log('📈 Summary Statistics:');
    
    const { count: totalSchemas } = await supabase
      .from('training_schemas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    const { count: totalExercises } = await supabase
      .from('training_schema_exercises')
      .select('*', { count: 'exact', head: true });

    const { count: totalDays } = await supabase
      .from('training_schema_days')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total Published Schemas: ${totalSchemas || 0}`);
    console.log(`🏋️ Total Exercises: ${totalExercises || 0}`);
    console.log(`📅 Total Schema Days: ${totalDays || 0}`);

    // 5. Check for specific patterns
    console.log('\n🔍 Checking for specific patterns...');
    
    const { data: muscleMassSchemas } = await supabase
      .from('training_schemas')
      .select('id')
      .eq('training_goal', 'spiermassa')
      .eq('status', 'published');

    const { data: correctRepRangeSchemas } = await supabase
      .from('training_schemas')
      .select('id')
      .eq('rep_range', '8-12')
      .eq('status', 'published');

    const { data: exercisesWithTargetReps } = await supabase
      .from('training_schema_exercises')
      .select('id')
      .eq('target_reps', '8-12');

    console.log(`✅ Schemas with 'spiermassa' goal: ${muscleMassSchemas?.length || 0}`);
    console.log(`✅ Schemas with '8-12' rep range: ${correctRepRangeSchemas?.length || 0}`);
    console.log(`✅ Exercises with '8-12' target reps: ${exercisesWithTargetReps?.length || 0}`);

    console.log('\n🎉 Training schemas update verification completed!');

  } catch (error) {
    console.error('❌ Error checking training schemas:', error);
  }
}

checkTrainingSchemasUpdate();
