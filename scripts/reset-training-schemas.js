const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetTrainingSchemas() {
  try {
    console.log('🔄 Starting training schema reset...');

    // Step 1: Get all exercises from database
    console.log('📋 Fetching exercises from database...');
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });

    if (exercisesError) {
      console.error('❌ Error fetching exercises:', exercisesError);
      return;
    }

    console.log(`✅ Found ${exercises.length} exercises`);

    // Group exercises by muscle group
    const exercisesByMuscle = {};
    exercises.forEach(exercise => {
      const muscle = exercise.primary_muscle;
      if (!exercisesByMuscle[muscle]) {
        exercisesByMuscle[muscle] = [];
      }
      exercisesByMuscle[muscle].push(exercise);
    });

    console.log('📊 Exercises grouped by muscle:');
    Object.keys(exercisesByMuscle).forEach(muscle => {
      console.log(`  ${muscle}: ${exercisesByMuscle[muscle].length} exercises`);
    });

    // Step 2: Remove user schema selections (skip if table doesn't exist)
    console.log('🗑️ Removing user schema selections...');
    try {
      const { error: userSchemaError } = await supabase
        .from('user_training_schemas')
        .delete()
        .neq('id', 0); // Delete all

      if (userSchemaError) {
        console.log('⚠️ User schema selections table does not exist, skipping...');
      } else {
        console.log('✅ User schema selections removed');
      }
    } catch (error) {
      console.log('⚠️ User schema selections table does not exist, skipping...');
    }

    // Step 3: Remove all training schema exercises
    console.log('🗑️ Removing training schema exercises...');
    const { error: schemaExercisesError } = await supabase
      .from('training_schema_exercises')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (schemaExercisesError) {
      console.error('❌ Error removing schema exercises:', schemaExercisesError);
    } else {
      console.log('✅ Training schema exercises removed');
    }

    // Step 4: Remove all training schema days
    console.log('🗑️ Removing training schema days...');
    const { error: schemaDaysError } = await supabase
      .from('training_schema_days')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (schemaDaysError) {
      console.error('❌ Error removing schema days:', schemaDaysError);
    } else {
      console.log('✅ Training schema days removed');
    }

    // Step 5: Remove all training schemas
    console.log('🗑️ Removing training schemas...');
    const { error: schemasError } = await supabase
      .from('training_schemas')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (schemasError) {
      console.error('❌ Error removing training schemas:', schemasError);
    } else {
      console.log('✅ Training schemas removed');
    }

    // Step 6: Create new training schemas
    console.log('🏗️ Creating new training schemas...');

    const newSchemas = [
      {
        name: 'Full Body 1x per week',
        description: 'Complete full body workout voor 1x per week training',
        category: 'Gym',
        difficulty: 'Beginner',
        status: 'published',
        days: 1
      },
      {
        name: 'Full Body 2x per week',
        description: 'Complete full body workout voor 2x per week training',
        category: 'Gym',
        difficulty: 'Beginner',
        status: 'published',
        days: 2
      },
      {
        name: '3x Split Training',
        description: '3 dagen split: Borst/Triceps, Rug/Biceps, Benen/Schouders',
        category: 'Gym',
        difficulty: 'Intermediate',
        status: 'published',
        days: 3
      },
      {
        name: '4x Split Training',
        description: '4 dagen split: Borst/Triceps/Voorkant Schouders, Rug/Biceps, Achterkant Schouders, Voorkant Benen/Kuiten, Hamstrings/Billen',
        category: 'Gym',
        difficulty: 'Intermediate',
        status: 'published',
        days: 4
      },
      {
        name: '5x Split Training',
        description: '5 dagen split: Rug, Borst/Schouders, Armen, Benen, Rug',
        category: 'Gym',
        difficulty: 'Advanced',
        status: 'published',
        days: 5
      },
      {
        name: '6x Split Training',
        description: '6 dagen split: Borst/Triceps, Rug/Biceps, Benen/Schouders (herhaald)',
        category: 'Gym',
        difficulty: 'Advanced',
        status: 'published',
        days: 6
      }
    ];

    for (const schema of newSchemas) {
      console.log(`📝 Creating schema: ${schema.name}`);
      
      // Create the schema
      const { data: newSchema, error: createSchemaError } = await supabase
        .from('training_schemas')
        .insert([{
          name: schema.name,
          description: schema.description,
          category: schema.category,
          difficulty: schema.difficulty,
          status: schema.status
        }])
        .select()
        .single();

      if (createSchemaError) {
        console.error(`❌ Error creating schema ${schema.name}:`, createSchemaError);
        continue;
      }

      console.log(`✅ Created schema: ${newSchema.name} (ID: ${newSchema.id})`);

      // Create days and exercises based on schema type
      await createSchemaDays(newSchema.id, schema, exercisesByMuscle);
    }

    console.log('✅ Training schema reset completed successfully!');

  } catch (error) {
    console.error('❌ Error during schema reset:', error);
  }
}

async function createSchemaDays(schemaId, schema, exercisesByMuscle) {
  const days = [];

  switch (schema.name) {
    case 'Full Body 1x per week':
      days.push({
        day_number: 1,
        name: 'Full Body',
        description: 'Complete full body workout',
        exercises: getFullBodyExercises(exercisesByMuscle)
      });
      break;

    case 'Full Body 2x per week':
      days.push(
        {
          day_number: 1,
          name: 'Full Body A',
          description: 'Full body workout variant A',
          exercises: getFullBodyExercises(exercisesByMuscle, 'A')
        },
        {
          day_number: 2,
          name: 'Full Body B',
          description: 'Full body workout variant B',
          exercises: getFullBodyExercises(exercisesByMuscle, 'B')
        }
      );
      break;

    case '3x Split Training':
      days.push(
        {
          day_number: 1,
          name: 'Borst & Triceps',
          description: 'Focus op borst en triceps',
          exercises: getChestTricepsExercises(exercisesByMuscle)
        },
        {
          day_number: 2,
          name: 'Rug & Biceps',
          description: 'Focus op rug en biceps',
          exercises: getBackBicepsExercises(exercisesByMuscle)
        },
        {
          day_number: 3,
          name: 'Benen & Schouders',
          description: 'Focus op benen en schouders',
          exercises: getLegsShouldersExercises(exercisesByMuscle)
        }
      );
      break;

    case '4x Split Training':
      days.push(
        {
          day_number: 1,
          name: 'Borst, Triceps & Voorkant Schouders',
          description: 'Push dag',
          exercises: getChestTricepsFrontShouldersExercises(exercisesByMuscle)
        },
        {
          day_number: 2,
          name: 'Rug & Biceps',
          description: 'Pull dag',
          exercises: getBackBicepsExercises(exercisesByMuscle)
        },
        {
          day_number: 3,
          name: 'Achterkant Schouders',
          description: 'Focus op achterkant schouders',
          exercises: getRearShouldersExercises(exercisesByMuscle)
        },
        {
          day_number: 4,
          name: 'Voorkant Benen & Kuiten',
          description: 'Focus op quadriceps en kuiten',
          exercises: getFrontLegsCalvesExercises(exercisesByMuscle)
        }
      );
      break;

    case '5x Split Training':
      days.push(
        {
          day_number: 1,
          name: 'Rug',
          description: 'Focus op rug',
          exercises: getBackExercises(exercisesByMuscle)
        },
        {
          day_number: 2,
          name: 'Borst & Schouders',
          description: 'Focus op borst en schouders',
          exercises: getChestShouldersExercises(exercisesByMuscle)
        },
        {
          day_number: 3,
          name: 'Armen',
          description: 'Focus op biceps en triceps',
          exercises: getArmsExercises(exercisesByMuscle)
        },
        {
          day_number: 4,
          name: 'Benen',
          description: 'Focus op benen',
          exercises: getLegsExercises(exercisesByMuscle)
        },
        {
          day_number: 5,
          name: 'Rug',
          description: 'Focus op rug (herhaling)',
          exercises: getBackExercises(exercisesByMuscle, true)
        }
      );
      break;

    case '6x Split Training':
      days.push(
        {
          day_number: 1,
          name: 'Borst & Triceps',
          description: 'Focus op borst en triceps',
          exercises: getChestTricepsExercises(exercisesByMuscle)
        },
        {
          day_number: 2,
          name: 'Rug & Biceps',
          description: 'Focus op rug en biceps',
          exercises: getBackBicepsExercises(exercisesByMuscle)
        },
        {
          day_number: 3,
          name: 'Benen & Schouders',
          description: 'Focus op benen en schouders',
          exercises: getLegsShouldersExercises(exercisesByMuscle)
        },
        {
          day_number: 4,
          name: 'Borst & Triceps',
          description: 'Focus op borst en triceps (herhaling)',
          exercises: getChestTricepsExercises(exercisesByMuscle, true)
        },
        {
          day_number: 5,
          name: 'Rug & Biceps',
          description: 'Focus op rug en biceps (herhaling)',
          exercises: getBackBicepsExercises(exercisesByMuscle, true)
        },
        {
          day_number: 6,
          name: 'Benen & Schouders',
          description: 'Focus op benen en schouders (herhaling)',
          exercises: getLegsShouldersExercises(exercisesByMuscle, true)
        }
      );
      break;
  }

  // Create days and exercises
  for (const day of days) {
    console.log(`  📅 Creating day: ${day.name}`);
    
         const { data: newDay, error: createDayError } = await supabase
       .from('training_schema_days')
       .insert([{
         schema_id: schemaId,
         day_number: day.day_number,
         name: day.name,
         description: day.description
       }])
       .select()
       .single();

    if (createDayError) {
      console.error(`❌ Error creating day ${day.name}:`, createDayError);
      continue;
    }

    console.log(`    ✅ Created day: ${newDay.name} (ID: ${newDay.id})`);

    // Create exercises for this day
    for (let i = 0; i < day.exercises.length; i++) {
      const exercise = day.exercises[i];
      
             const { error: createExerciseError } = await supabase
         .from('training_schema_exercises')
         .insert([{
           schema_day_id: newDay.id,
           exercise_id: exercise.id,
           exercise_name: exercise.name,
           sets: exercise.sets || 3,
           reps: exercise.reps || 10,
           rest_time: exercise.rest_time || 90,
           order_index: i
         }]);

      if (createExerciseError) {
        console.error(`❌ Error creating exercise ${exercise.name}:`, createExerciseError);
      }
    }

    console.log(`    ✅ Added ${day.exercises.length} exercises to day ${day.name}`);
  }
}

// Helper functions to get exercises for different muscle groups
function getFullBodyExercises(exercisesByMuscle, variant = 'A') {
  const exercises = [];
  
  // Add exercises from different muscle groups
  if (variant === 'A') {
    if (exercisesByMuscle['Borst']) exercises.push(...exercisesByMuscle['Borst'].slice(0, 2));
    if (exercisesByMuscle['Rug']) exercises.push(...exercisesByMuscle['Rug'].slice(0, 2));
    if (exercisesByMuscle['Benen']) exercises.push(...exercisesByMuscle['Benen'].slice(0, 2));
    if (exercisesByMuscle['Schouders']) exercises.push(...exercisesByMuscle['Schouders'].slice(0, 1));
    if (exercisesByMuscle['Biceps']) exercises.push(...exercisesByMuscle['Biceps'].slice(0, 1));
    if (exercisesByMuscle['Triceps']) exercises.push(...exercisesByMuscle['Triceps'].slice(0, 1));
  } else {
    if (exercisesByMuscle['Borst']) exercises.push(...exercisesByMuscle['Borst'].slice(2, 4));
    if (exercisesByMuscle['Rug']) exercises.push(...exercisesByMuscle['Rug'].slice(2, 4));
    if (exercisesByMuscle['Benen']) exercises.push(...exercisesByMuscle['Benen'].slice(2, 4));
    if (exercisesByMuscle['Schouders']) exercises.push(...exercisesByMuscle['Schouders'].slice(1, 2));
    if (exercisesByMuscle['Biceps']) exercises.push(...exercisesByMuscle['Biceps'].slice(1, 2));
    if (exercisesByMuscle['Triceps']) exercises.push(...exercisesByMuscle['Triceps'].slice(1, 2));
  }

  return exercises.slice(0, 8); // Limit to 8 exercises
}

function getChestTricepsExercises(exercisesByMuscle, isRepeat = false) {
  const exercises = [];
  const startIndex = isRepeat ? 2 : 0;
  
  if (exercisesByMuscle['Borst']) {
    exercises.push(...exercisesByMuscle['Borst'].slice(startIndex, startIndex + 3));
  }
  if (exercisesByMuscle['Triceps']) {
    exercises.push(...exercisesByMuscle['Triceps'].slice(startIndex, startIndex + 2));
  }
  
  return exercises;
}

function getBackBicepsExercises(exercisesByMuscle, isRepeat = false) {
  const exercises = [];
  const startIndex = isRepeat ? 2 : 0;
  
  if (exercisesByMuscle['Rug']) {
    exercises.push(...exercisesByMuscle['Rug'].slice(startIndex, startIndex + 3));
  }
  if (exercisesByMuscle['Biceps']) {
    exercises.push(...exercisesByMuscle['Biceps'].slice(startIndex, startIndex + 2));
  }
  
  return exercises;
}

function getLegsShouldersExercises(exercisesByMuscle, isRepeat = false) {
  const exercises = [];
  const startIndex = isRepeat ? 2 : 0;
  
  if (exercisesByMuscle['Benen']) {
    exercises.push(...exercisesByMuscle['Benen'].slice(startIndex, startIndex + 3));
  }
  if (exercisesByMuscle['Schouders']) {
    exercises.push(...exercisesByMuscle['Schouders'].slice(startIndex, startIndex + 2));
  }
  
  return exercises;
}

function getChestTricepsFrontShouldersExercises(exercisesByMuscle) {
  const exercises = [];
  
  if (exercisesByMuscle['Borst']) {
    exercises.push(...exercisesByMuscle['Borst'].slice(0, 2));
  }
  if (exercisesByMuscle['Triceps']) {
    exercises.push(...exercisesByMuscle['Triceps'].slice(0, 2));
  }
  if (exercisesByMuscle['Schouders']) {
    exercises.push(...exercisesByMuscle['Schouders'].slice(0, 1));
  }
  
  return exercises;
}

function getRearShouldersExercises(exercisesByMuscle) {
  const exercises = [];
  
  if (exercisesByMuscle['Schouders']) {
    exercises.push(...exercisesByMuscle['Schouders'].slice(0, 4));
  }
  
  return exercises;
}

function getFrontLegsCalvesExercises(exercisesByMuscle) {
  const exercises = [];
  
  if (exercisesByMuscle['Benen']) {
    exercises.push(...exercisesByMuscle['Benen'].slice(0, 3));
  }
  if (exercisesByMuscle['Kuiten']) {
    exercises.push(...exercisesByMuscle['Kuiten'].slice(0, 2));
  }
  
  return exercises;
}

function getBackExercises(exercisesByMuscle, isRepeat = false) {
  const exercises = [];
  const startIndex = isRepeat ? 3 : 0;
  
  if (exercisesByMuscle['Rug']) {
    exercises.push(...exercisesByMuscle['Rug'].slice(startIndex, startIndex + 4));
  }
  
  return exercises;
}

function getChestShouldersExercises(exercisesByMuscle) {
  const exercises = [];
  
  if (exercisesByMuscle['Borst']) {
    exercises.push(...exercisesByMuscle['Borst'].slice(0, 3));
  }
  if (exercisesByMuscle['Schouders']) {
    exercises.push(...exercisesByMuscle['Schouders'].slice(0, 2));
  }
  
  return exercises;
}

function getArmsExercises(exercisesByMuscle) {
  const exercises = [];
  
  if (exercisesByMuscle['Biceps']) {
    exercises.push(...exercisesByMuscle['Biceps'].slice(0, 2));
  }
  if (exercisesByMuscle['Triceps']) {
    exercises.push(...exercisesByMuscle['Triceps'].slice(0, 2));
  }
  
  return exercises;
}

function getLegsExercises(exercisesByMuscle) {
  const exercises = [];
  
  if (exercisesByMuscle['Benen']) {
    exercises.push(...exercisesByMuscle['Benen'].slice(0, 4));
  }
  if (exercisesByMuscle['Kuiten']) {
    exercises.push(...exercisesByMuscle['Kuiten'].slice(0, 1));
  }
  
  return exercises;
}

resetTrainingSchemas();
