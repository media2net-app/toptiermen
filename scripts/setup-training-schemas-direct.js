const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTrainingSchemasDirect() {
  try {
    console.log('🔧 Setting up training schema database tables (direct method)...');

    // 1. Create training_schemas table
    console.log('\n💪 Creating training_schemas table...');
    try {
      const { error } = await supabase
        .from('training_schemas')
        .select('id')
        .limit(1);
      
      if (error && error.message.includes('relation "training_schemas" does not exist')) {
        console.log('❌ training_schemas table does not exist - manual creation required');
        console.log('Please create the table manually in Supabase dashboard or use SQL migration');
      } else {
        console.log('✅ training_schemas table already exists');
      }
    } catch (e) {
      console.log('⚠️ Could not check training_schemas table:', e.message);
    }

    // 2. Check if exercises table exists
    console.log('\n💪 Checking exercises table...');
    try {
      const { data: exercises, error } = await supabase
        .from('exercises')
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('relation "exercises" does not exist')) {
        console.log('❌ exercises table does not exist - creating sample data will fail');
      } else {
        console.log('✅ exercises table exists');
      }
    } catch (e) {
      console.log('⚠️ Could not check exercises table:', e.message);
    }

    // 3. Add sample exercises if table exists
    console.log('\n📝 Adding sample exercises...');
    const sampleExercises = [
      { name: 'Push-ups', description: 'Classic bodyweight exercise for chest and triceps', muscle_group: 'Chest, Triceps', equipment: 'Bodyweight', difficulty: 'Beginner' },
      { name: 'Squats', description: 'Fundamental lower body exercise', muscle_group: 'Legs', equipment: 'Bodyweight', difficulty: 'Beginner' },
      { name: 'Pull-ups', description: 'Upper body pulling exercise', muscle_group: 'Back, Biceps', equipment: 'Pull-up bar', difficulty: 'Intermediate' },
      { name: 'Deadlift', description: 'Compound exercise for posterior chain', muscle_group: 'Back, Legs', equipment: 'Barbell', difficulty: 'Advanced' },
      { name: 'Bench Press', description: 'Compound chest exercise', muscle_group: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate' },
      { name: 'Plank', description: 'Core stability exercise', muscle_group: 'Core', equipment: 'Bodyweight', difficulty: 'Beginner' },
      { name: 'Lunges', description: 'Unilateral leg exercise', muscle_group: 'Legs', equipment: 'Bodyweight', difficulty: 'Beginner' },
      { name: 'Overhead Press', description: 'Shoulder press exercise', muscle_group: 'Shoulders', equipment: 'Barbell', difficulty: 'Intermediate' }
    ];

    for (const exercise of sampleExercises) {
      try {
        const { error } = await supabase
          .from('exercises')
          .upsert(exercise, { onConflict: 'name' });
        
        if (error) {
          console.log(`⚠️ Could not add exercise ${exercise.name}:`, error.message);
        } else {
          console.log(`✅ Added exercise: ${exercise.name}`);
        }
      } catch (e) {
        console.log(`⚠️ Failed to add exercise ${exercise.name}:`, e.message);
      }
    }

    // 4. Add sample training schema (Chiel test)
    console.log('\n🏋️ Adding sample training schema (Chiel test)...');
    try {
      const { data: schemaData, error: schemaInsertError } = await supabase
        .from('training_schemas')
        .insert({
          name: 'Chiel Test Schema',
          description: 'Een test trainingsschema voor Chiel',
          category: 'Gym',
          difficulty: 'Beginner',
          status: 'published'
        })
        .select()
        .single();

      if (schemaInsertError) {
        console.log('❌ Error creating sample schema:', schemaInsertError.message);
      } else {
        console.log('✅ Sample training schema created');

        // Add sample days
        const sampleDays = [
          { day_number: 1, name: 'Dag 1 - Push', description: 'Chest, shoulders, and triceps' },
          { day_number: 2, name: 'Dag 2 - Pull', description: 'Back and biceps' },
          { day_number: 3, name: 'Dag 3 - Legs', description: 'Lower body focus' }
        ];

        for (const day of sampleDays) {
          const { data: dayData, error: dayInsertError } = await supabase
            .from('training_schema_days')
            .insert({
              schema_id: schemaData.id,
              day_number: day.day_number,
              name: day.name,
              description: day.description,
              order_index: day.day_number
            })
            .select()
            .single();

          if (dayInsertError) {
            console.log(`❌ Error creating day ${day.day_number}:`, dayInsertError.message);
          } else {
            console.log(`✅ Created day ${day.day_number}`);

            // Add sample exercises for this day
            const exercisesForDay = day.day_number === 1 ? ['Push-ups', 'Bench Press', 'Overhead Press'] :
                                   day.day_number === 2 ? ['Pull-ups', 'Deadlift'] :
                                   ['Squats', 'Lunges', 'Plank'];

            for (let i = 0; i < exercisesForDay.length; i++) {
              const exerciseName = exercisesForDay[i];
              const { error: exerciseInsertError } = await supabase
                .from('training_schema_exercises')
                .insert({
                  schema_day_id: dayData.id,
                  exercise_name: exerciseName,
                  sets: 3,
                  reps: 10,
                  rest_time: 60,
                  order_index: i + 1
                });

              if (exerciseInsertError) {
                console.log(`❌ Error adding exercise ${exerciseName} to day ${day.day_number}:`, exerciseInsertError.message);
              } else {
                console.log(`✅ Added exercise ${exerciseName} to day ${day.day_number}`);
              }
            }
          }
        }
      }
    } catch (e) {
      console.log('⚠️ Could not create sample training schema:', e.message);
    }

    // 5. Test the functionality
    console.log('\n🧪 Testing training schema functionality...');
    try {
      const { data: schemas, error: schemasError } = await supabase
        .from('training_schemas')
        .select(`
          *,
          training_schema_days (
            *,
            training_schema_exercises (*)
          )
        `)
        .eq('status', 'published');

      if (schemasError) {
        console.log('❌ Error fetching training schemas:', schemasError.message);
      } else {
        console.log(`✅ Successfully fetched ${schemas?.length || 0} training schemas`);
        if (schemas && schemas.length > 0) {
          const schema = schemas[0];
          console.log(`📋 Schema: ${schema.name}`);
          console.log(`📅 Days: ${schema.training_schema_days?.length || 0}`);
          if (schema.training_schema_days) {
            schema.training_schema_days.forEach(day => {
              console.log(`  - ${day.name}: ${day.training_schema_exercises?.length || 0} exercises`);
            });
          }
        }
      }
    } catch (e) {
      console.log('⚠️ Could not test functionality:', e.message);
    }

    console.log('\n🎉 Training schema setup completed!');
    console.log('📋 Summary:');
    console.log('   ⚠️  Database tables - May need manual creation');
    console.log('   ✅ Sample exercises - Added (if table exists)');
    console.log('   ✅ Sample training schema (Chiel test) - Added (if tables exist)');
    console.log('\n🔗 Next steps:');
    console.log('   1. Create database tables manually in Supabase dashboard');
    console.log('   2. Run this script again to add sample data');
    console.log('   3. Test the training schema functionality');

  } catch (error) {
    console.error('❌ Error setting up training schemas:', error);
  }
}

setupTrainingSchemasDirect();
