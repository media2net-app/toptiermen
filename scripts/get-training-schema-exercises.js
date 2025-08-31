const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getTrainingSchemaExercises() {
  console.log('🔍 Getting Training Schema Exercises...\n');

  try {
    // 1. Get all exercises
    console.log('1️⃣ Fetching all exercises...');
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (exercisesError) {
      console.error('❌ Error fetching exercises:', exercisesError);
      return;
    }

    console.log(`✅ Found ${exercises?.length || 0} exercises`);

    // 2. Get training schemas
    console.log('\n2️⃣ Fetching training schemas...');
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select('*')
      .eq('status', 'published');

    if (schemasError) {
      console.error('❌ Error fetching schemas:', schemasError);
      return;
    }

    console.log(`✅ Found ${schemas?.length || 0} training schemas`);

    // 3. Create sample workout data for each schema
    console.log('\n3️⃣ Creating sample workout data...');
    
    const workoutData = {};
    
    schemas?.forEach((schema, index) => {
      console.log(`   Creating data for: ${schema.name}`);
      
      // Create workout days based on schema type
      let days = [];
      
      if (schema.name.includes('Upper/Lower')) {
        days = [
          {
            day: 1,
            name: 'Upper Body',
            focus: 'Bovenlichaam (Push)',
            exercises: getRandomExercises(exercises, 'upper', 5)
          },
          {
            day: 2,
            name: 'Lower Body',
            focus: 'Onderlichaam',
            exercises: getRandomExercises(exercises, 'lower', 5)
          },
          {
            day: 3,
            name: 'Upper Body',
            focus: 'Bovenlichaam (Pull)',
            exercises: getRandomExercises(exercises, 'upper', 5)
          },
          {
            day: 4,
            name: 'Lower Body',
            focus: 'Onderlichaam',
            exercises: getRandomExercises(exercises, 'lower', 5)
          }
        ];
      } else if (schema.name.includes('Split')) {
        days = [
          {
            day: 1,
            name: 'Chest & Triceps',
            focus: 'Borst & Triceps',
            exercises: getRandomExercises(exercises, 'chest', 4)
          },
          {
            day: 2,
            name: 'Back & Biceps',
            focus: 'Rug & Biceps',
            exercises: getRandomExercises(exercises, 'back', 4)
          },
          {
            day: 3,
            name: 'Legs & Shoulders',
            focus: 'Benen & Schouders',
            exercises: getRandomExercises(exercises, 'legs', 4)
          }
        ];
      } else if (schema.name.includes('Push/Pull/Legs')) {
        days = [
          {
            day: 1,
            name: 'Push Day',
            focus: 'Push Oefeningen',
            exercises: getRandomExercises(exercises, 'push', 5)
          },
          {
            day: 2,
            name: 'Pull Day',
            focus: 'Pull Oefeningen',
            exercises: getRandomExercises(exercises, 'pull', 5)
          },
          {
            day: 3,
            name: 'Legs Day',
            focus: 'Been Oefeningen',
            exercises: getRandomExercises(exercises, 'legs', 5)
          }
        ];
      } else {
        // Default full body
        days = [
          {
            day: 1,
            name: 'Full Body A',
            focus: 'Volledige Lichaam',
            exercises: getRandomExercises(exercises, 'full', 6)
          },
          {
            day: 2,
            name: 'Full Body B',
            focus: 'Volledige Lichaam',
            exercises: getRandomExercises(exercises, 'full', 6)
          }
        ];
      }
      
      workoutData[schema.id] = {
        id: schema.id,
        name: schema.name,
        frequency: days.length,
        style: schema.category === 'Gym' ? 'gym' : 'bodyweight',
        description: schema.description,
        days: days
      };
    });

    // 4. Save workout data to a file for use in the frontend
    const fs = require('fs');
    const workoutDataFile = 'src/data/training-schema-workouts.json';
    
    // Ensure directory exists
    const dir = require('path').dirname(workoutDataFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(workoutDataFile, JSON.stringify(workoutData, null, 2));
    console.log(`\n✅ Saved workout data to ${workoutDataFile}`);
    
    // 5. Show sample data
    console.log('\n4️⃣ Sample workout data:');
    const firstSchemaId = Object.keys(workoutData)[0];
    const firstWorkout = workoutData[firstSchemaId];
    
    console.log(`   Schema: ${firstWorkout.name}`);
    console.log(`   Frequency: ${firstWorkout.frequency} days`);
    console.log(`   Days:`);
    firstWorkout.days.forEach(day => {
      console.log(`     Day ${day.day}: ${day.name} - ${day.focus}`);
      console.log(`       Exercises: ${day.exercises.map(ex => ex.name).join(', ')}`);
    });

    console.log('\n📊 SUMMARY:');
    console.log('================================');
    console.log('   - Fetched all exercises from database');
    console.log('   - Created workout data for each schema');
    console.log('   - Saved data to JSON file for frontend use');
    console.log('   - Ready to integrate with trainingscentrum page');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function getRandomExercises(allExercises, type, count) {
  // Filter exercises based on type (simplified logic)
  let filteredExercises = allExercises;
  
  if (type === 'upper') {
    filteredExercises = allExercises.filter(ex => 
      ex.name.toLowerCase().includes('bench') ||
      ex.name.toLowerCase().includes('press') ||
      ex.name.toLowerCase().includes('curl') ||
      ex.name.toLowerCase().includes('row') ||
      ex.name.toLowerCase().includes('pull') ||
      ex.name.toLowerCase().includes('push')
    );
  } else if (type === 'lower') {
    filteredExercises = allExercises.filter(ex => 
      ex.name.toLowerCase().includes('squat') ||
      ex.name.toLowerCase().includes('deadlift') ||
      ex.name.toLowerCase().includes('leg') ||
      ex.name.toLowerCase().includes('calf') ||
      ex.name.toLowerCase().includes('lunge')
    );
  } else if (type === 'chest') {
    filteredExercises = allExercises.filter(ex => 
      ex.name.toLowerCase().includes('bench') ||
      ex.name.toLowerCase().includes('press') ||
      ex.name.toLowerCase().includes('fly')
    );
  } else if (type === 'back') {
    filteredExercises = allExercises.filter(ex => 
      ex.name.toLowerCase().includes('row') ||
      ex.name.toLowerCase().includes('pull') ||
      ex.name.toLowerCase().includes('lat')
    );
  } else if (type === 'legs') {
    filteredExercises = allExercises.filter(ex => 
      ex.name.toLowerCase().includes('squat') ||
      ex.name.toLowerCase().includes('deadlift') ||
      ex.name.toLowerCase().includes('leg') ||
      ex.name.toLowerCase().includes('calf')
    );
  } else if (type === 'push') {
    filteredExercises = allExercises.filter(ex => 
      ex.name.toLowerCase().includes('bench') ||
      ex.name.toLowerCase().includes('press') ||
      ex.name.toLowerCase().includes('push')
    );
  } else if (type === 'pull') {
    filteredExercises = allExercises.filter(ex => 
      ex.name.toLowerCase().includes('row') ||
      ex.name.toLowerCase().includes('pull') ||
      ex.name.toLowerCase().includes('curl')
    );
  }
  
  // If no filtered exercises, use all exercises
  if (filteredExercises.length === 0) {
    filteredExercises = allExercises;
  }
  
  // Shuffle and take count
  const shuffled = filteredExercises.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(exercise => ({
    name: exercise.name,
    sets: Math.floor(Math.random() * 3) + 3, // 3-5 sets
    reps: '8-12',
    rest: '60-90 sec',
    alternatives: [],
    feedback: ''
  }));
}

getTrainingSchemaExercises();
