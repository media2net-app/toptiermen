const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkKrachtConditieExercises() {
  console.log('🔍 Checking Kracht/Conditie 6 dagen per week exercises...');
  
  // Find the specific schema
  const { data: schemas, error } = await supabase
    .from('training_schemas')
    .select('*')
    .ilike('name', '%Kracht/Conditie 6 dagen per week%')
    .limit(1);
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (schemas.length === 0) {
    console.log('❌ No Kracht/Conditie 6 dagen per week schema found');
    return;
  }
  
  const schema = schemas[0];
  console.log(`\n🏋️ Found schema: ${schema.name}`);
  console.log(`   - ID: ${schema.id}`);
  console.log(`   - Equipment: ${schema.equipment_type}`);
  
  // Get exercises for this schema
  const { data: exercises, error: exError } = await supabase
    .from('training_exercises')
    .select('*')
    .eq('schema_id', schema.id)
    .order('day_number, exercise_order');
    
  if (exError) {
    console.error('❌ Error fetching exercises:', exError);
    return;
  }
  
  console.log(`\n📝 Found ${exercises.length} exercises`);
  
  // Group by day
  const exercisesByDay = {};
  exercises.forEach(ex => {
    if (!exercisesByDay[ex.day_number]) {
      exercisesByDay[ex.day_number] = [];
    }
    exercisesByDay[ex.day_number].push(ex);
  });
  
  Object.keys(exercisesByDay).forEach(day => {
    console.log(`\n📅 Dag ${day}:`);
    exercisesByDay[day].forEach(ex => {
      console.log(`   - ${ex.exercise_name}: ${ex.sets} sets x ${ex.reps} reps, ${ex.rest_time}s rust`);
    });
  });
  
  // Check if we need to update rest times and reps
  const needsUpdate = exercises.some(ex => ex.rest_time !== 60 || ex.reps !== '15-20');
  if (needsUpdate) {
    console.log('\n⚠️  Some exercises need updating:');
    exercises.forEach(ex => {
      if (ex.rest_time !== 60 || ex.reps !== '15-20') {
        console.log(`   - ${ex.exercise_name}: Currently ${ex.sets} sets x ${ex.reps} reps, ${ex.rest_time}s rust`);
        console.log(`     Should be: ${ex.sets} sets x 15-20 reps, 60s rust`);
      }
    });
  } else {
    console.log('\n✅ All exercises have correct rest times and reps');
  }
}

checkKrachtConditieExercises().catch(console.error);
