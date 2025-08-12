const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addExercisesToSchema() {
  try {
    console.log('🏋️ Adding exercises to 5-Daags Upper/Lower Split schema...\n');

    // 1. Find the schema
    console.log('1️⃣ Finding the schema...');
    const { data: schema, error: schemaError } = await supabase
      .from('training_schemas')
      .select('*')
      .eq('name', '5-Daags Upper/Lower Split')
      .single();

    if (schemaError) {
      console.log('❌ Error finding schema:', schemaError.message);
      return;
    }

    console.log(`✅ Found schema: ${schema.name} (ID: ${schema.id})`);

    // 2. Get the days for this schema
    console.log('\n2️⃣ Getting schema days...');
    const { data: days, error: daysError } = await supabase
      .from('training_schema_days')
      .select('*')
      .eq('schema_id', schema.id)
      .order('day_number');

    if (daysError) {
      console.log('❌ Error getting days:', daysError.message);
      return;
    }

    console.log(`✅ Found ${days?.length || 0} days`);

    if (!days || days.length === 0) {
      console.log('❌ No days found for this schema');
      return;
    }

    // 3. Define exercises for each day
    const exercisesPerDay = {
      1: [ // Upper A
        { exercise_name: 'Bench Press', sets: 4, reps: 6, rest_time: 120 },
        { exercise_name: 'Incline Dumbbell Press', sets: 3, reps: 8, rest_time: 90 },
        { exercise_name: 'Overhead Press', sets: 3, reps: 8, rest_time: 90 },
        { exercise_name: 'Lateral Raises', sets: 3, reps: 12, rest_time: 60 },
        { exercise_name: 'Tricep Dips', sets: 3, reps: 10, rest_time: 60 },
        { exercise_name: 'Tricep Pushdowns', sets: 3, reps: 12, rest_time: 60 }
      ],
      2: [ // Lower A
        { exercise_name: 'Squat', sets: 4, reps: 6, rest_time: 180 },
        { exercise_name: 'Leg Press', sets: 3, reps: 8, rest_time: 120 },
        { exercise_name: 'Romanian Deadlift', sets: 3, reps: 8, rest_time: 120 },
        { exercise_name: 'Leg Extensions', sets: 3, reps: 12, rest_time: 60 },
        { exercise_name: 'Leg Curls', sets: 3, reps: 12, rest_time: 60 },
        { exercise_name: 'Standing Calf Raises', sets: 4, reps: 15, rest_time: 60 }
      ],
      3: [ // Upper B
        { exercise_name: 'Deadlift', sets: 4, reps: 5, rest_time: 180 },
        { exercise_name: 'Pull-ups', sets: 4, reps: 8, rest_time: 120 },
        { exercise_name: 'Barbell Row', sets: 3, reps: 8, rest_time: 90 },
        { exercise_name: 'Lat Pulldown', sets: 3, reps: 10, rest_time: 90 },
        { exercise_name: 'Bicep Curls', sets: 3, reps: 12, rest_time: 60 },
        { exercise_name: 'Hammer Curls', sets: 3, reps: 12, rest_time: 60 }
      ],
      4: [ // Lower B
        { exercise_name: 'Front Squat', sets: 3, reps: 8, rest_time: 150 },
        { exercise_name: 'Walking Lunges', sets: 3, reps: 10, rest_time: 90 },
        { exercise_name: 'Hip Thrusts', sets: 3, reps: 10, rest_time: 90 },
        { exercise_name: 'Good Mornings', sets: 3, reps: 8, rest_time: 90 },
        { exercise_name: 'Seated Calf Raises', sets: 4, reps: 20, rest_time: 60 },
        { exercise_name: 'Planks', sets: 3, reps: 60, rest_time: 60 }
      ],
      5: [ // Full Body
        { exercise_name: 'Deadlift', sets: 3, reps: 6, rest_time: 180 },
        { exercise_name: 'Bench Press', sets: 3, reps: 8, rest_time: 120 },
        { exercise_name: 'Pull-ups', sets: 3, reps: 8, rest_time: 120 },
        { exercise_name: 'Overhead Press', sets: 3, reps: 8, rest_time: 90 },
        { exercise_name: 'Squat', sets: 3, reps: 8, rest_time: 150 },
        { exercise_name: 'Planks', sets: 3, reps: 60, rest_time: 60 }
      ]
    };

    // 4. Add exercises to each day
    console.log('\n3️⃣ Adding exercises to each day...');
    for (const day of days) {
      const dayExercises = exercisesPerDay[day.day_number];
      if (!dayExercises) {
        console.log(`⚠️ No exercises defined for day ${day.day_number}`);
        continue;
      }

      console.log(`📅 Adding ${dayExercises.length} exercises to ${day.name} (Day ${day.day_number})`);

      for (let i = 0; i < dayExercises.length; i++) {
        const exercise = dayExercises[i];
        const { error: insertError } = await supabase
          .from('training_schema_exercises')
          .insert({
            schema_day_id: day.id,
            exercise_name: exercise.exercise_name,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_time: exercise.rest_time,
            order_index: i + 1
          });

        if (insertError) {
          console.log(`❌ Error adding exercise ${exercise.exercise_name}:`, insertError.message);
        } else {
          console.log(`   ✅ Added: ${exercise.exercise_name} (${exercise.sets}x${exercise.reps}, ${exercise.rest_time}s)`);
        }
      }
    }

    // 5. Verify the exercises were added
    console.log('\n4️⃣ Verifying exercises were added...');
    const { data: verifySchema, error: verifyError } = await supabase
      .from('training_schemas')
      .select(`
        *,
        training_schema_days (
          *,
          training_schema_exercises (*)
        )
      `)
      .eq('id', schema.id)
      .single();

    if (verifyError) {
      console.log('❌ Error verifying schema:', verifyError.message);
    } else {
      console.log(`✅ Verification complete: ${verifySchema.name}`);
      console.log(`📅 Days: ${verifySchema.training_schema_days?.length || 0}`);
      
      if (verifySchema.training_schema_days) {
        let totalExercises = 0;
        verifySchema.training_schema_days.forEach((day) => {
          const exerciseCount = day.training_schema_exercises?.length || 0;
          totalExercises += exerciseCount;
          console.log(`   Dag ${day.day_number}: ${day.name} - ${exerciseCount} oefeningen`);
        });
        console.log(`\n🎯 Total exercises added: ${totalExercises}`);
      }
    }

    console.log('\n🎉 Exercises added successfully!');

  } catch (error) {
    console.error('❌ Error adding exercises:', error);
  }
}

addExercisesToSchema();
