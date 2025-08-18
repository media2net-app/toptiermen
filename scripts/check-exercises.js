const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkExercises() {
  try {
    console.log('🔍 Checking exercises in database...');

    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('id, name, primary_muscle, secondary_muscles')
      .order('name', { ascending: true });

    if (error) {
      console.log('❌ Error fetching exercises:', error.message);
      return;
    }

    console.log(`✅ Found ${exercises.length} exercises in database`);
    
    // Group by primary_muscle
    const muscleGroups = {};
    exercises.forEach(exercise => {
      const muscle = exercise.primary_muscle || 'Unknown';
      if (!muscleGroups[muscle]) {
        muscleGroups[muscle] = [];
      }
      muscleGroups[muscle].push(exercise.name);
    });

    console.log('\n📊 Exercises grouped by primary_muscle:');
    Object.keys(muscleGroups).sort().forEach(muscle => {
      console.log(`\n${muscle} (${muscleGroups[muscle].length} exercises):`);
      muscleGroups[muscle].forEach(name => {
        console.log(`  - ${name}`);
      });
    });

    // Check for "Armen" specifically
    const armenExercises = exercises.filter(ex => 
      ex.primary_muscle === 'Armen' || 
      (ex.secondary_muscles && ex.secondary_muscles.includes('Armen'))
    );
    
    console.log(`\n🔍 Exercises with "Armen" as primary or secondary muscle: ${armenExercises.length}`);
    armenExercises.forEach(ex => {
      console.log(`  - ${ex.name} (primary: ${ex.primary_muscle}, secondary: ${JSON.stringify(ex.secondary_muscles)})`);
    });

  } catch (error) {
    console.error('❌ Error checking exercises:', error);
  }
}

checkExercises();
