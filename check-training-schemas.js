const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTrainingSchemas() {
  console.log('🔍 Checking training schemas in database...');
  
  const { data: schemas, error } = await supabase
    .from('training_schemas')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📊 Found', schemas.length, 'training schemas:');
  
  schemas.forEach(schema => {
    console.log(`\n🏋️ Schema: ${schema.name}`);
    console.log(`   - Doel: ${schema.goal}`);
    console.log(`   - Equipment: ${schema.equipment_type}`);
    console.log(`   - Frequentie: ${schema.training_frequency}`);
    console.log(`   - Status: ${schema.status}`);
  });
  
  // Check exercises for kracht/conditie schemas
  const krachtSchemas = schemas.filter(s => s.goal && s.goal.toLowerCase().includes('kracht'));
  console.log(`\n💪 Found ${krachtSchemas.length} kracht/conditie schemas`);
  
  for (const schema of krachtSchemas) {
    console.log(`\n🔍 Checking exercises for: ${schema.name}`);
    
    const { data: exercises, error: exError } = await supabase
      .from('training_exercises')
      .select('*')
      .eq('schema_id', schema.id)
      .order('day_number, exercise_order');
      
    if (exError) {
      console.error('❌ Error fetching exercises:', exError);
      continue;
    }
    
    console.log(`   📝 Found ${exercises.length} exercises`);
    
    // Group by day
    const exercisesByDay = {};
    exercises.forEach(ex => {
      if (!exercisesByDay[ex.day_number]) {
        exercisesByDay[ex.day_number] = [];
      }
      exercisesByDay[ex.day_number].push(ex);
    });
    
    Object.keys(exercisesByDay).forEach(day => {
      console.log(`   📅 Dag ${day}:`);
      exercisesByDay[day].forEach(ex => {
        console.log(`      - ${ex.exercise_name}: ${ex.sets} sets x ${ex.reps} reps, ${ex.rest_time}s rust`);
      });
    });
  }
}

checkTrainingSchemas().catch(console.error);
