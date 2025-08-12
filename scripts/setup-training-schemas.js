const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTrainingSchemas() {
  try {
    console.log('🔧 Setting up training schema database tables...');

    // 1. Create training_schemas table
    console.log('\n💪 Creating training_schemas table...');
    const { error: schemasError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.training_schemas (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(50) NOT NULL DEFAULT 'Gym',
          difficulty VARCHAR(50) NOT NULL DEFAULT 'Beginner',
          status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
          cover_image VARCHAR(500),
          estimated_duration VARCHAR(100),
          target_audience VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (schemasError) {
      console.log('❌ Error creating training_schemas table:', schemasError.message);
      return;
    }
    console.log('✅ training_schemas table created successfully');

    // 2. Create training_schema_days table
    console.log('\n📅 Creating training_schema_days table...');
    const { error: daysError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.training_schema_days (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
          day_number INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(schema_id, day_number)
        );
      `
    });

    if (daysError) {
      console.log('❌ Error creating training_schema_days table:', daysError.message);
      return;
    }
    console.log('✅ training_schema_days table created successfully');

    // 3. Create training_schema_exercises table
    console.log('\n🏋️ Creating training_schema_exercises table...');
    const { error: exercisesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.training_schema_exercises (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          schema_day_id UUID NOT NULL REFERENCES training_schema_days(id) ON DELETE CASCADE,
          exercise_id UUID,
          exercise_name VARCHAR(255) NOT NULL,
          sets INTEGER NOT NULL DEFAULT 3,
          reps INTEGER NOT NULL DEFAULT 10,
          rest_time INTEGER DEFAULT 60,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (exercisesError) {
      console.log('❌ Error creating training_schema_exercises table:', exercisesError.message);
      return;
    }
    console.log('✅ training_schema_exercises table created successfully');

    // 4. Create exercises table (if it doesn't exist)
    console.log('\n💪 Creating exercises table...');
    const { error: exercisesTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.exercises (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          muscle_group VARCHAR(100),
          equipment VARCHAR(100),
          difficulty VARCHAR(50) DEFAULT 'Beginner',
          instructions TEXT,
          video_url VARCHAR(500),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (exercisesTableError) {
      console.log('❌ Error creating exercises table:', exercisesTableError.message);
    } else {
      console.log('✅ exercises table created successfully');
    }

    // 5. Create user_training_schema_progress table
    console.log('\n📊 Creating user_training_schema_progress table...');
    const { error: progressError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_training_schema_progress (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
          current_day INTEGER DEFAULT 1,
          total_days_completed INTEGER DEFAULT 0,
          total_workouts_completed INTEGER DEFAULT 0,
          last_workout_date TIMESTAMP WITH TIME ZONE,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, schema_id)
        );
      `
    });

    if (progressError) {
      console.log('❌ Error creating user_training_schema_progress table:', progressError.message);
    } else {
      console.log('✅ user_training_schema_progress table created successfully');
    }

    // 6. Enable RLS on all tables
    console.log('\n🔒 Enabling Row Level Security...');
    const tables = ['training_schemas', 'training_schema_days', 'training_schema_exercises', 'exercises', 'user_training_schema_progress'];
    
    for (const table of tables) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`
      });
      if (error) {
        console.log(`⚠️ Could not enable RLS on ${table}:`, error.message);
      } else {
        console.log(`✅ RLS enabled on ${table}`);
      }
    }

    // 7. Create RLS policies
    console.log('\n🔐 Creating RLS policies...');
    
    // Policies for training_schemas (public read, admin write)
    const schemaPolicies = [
      'CREATE POLICY "Anyone can view published training schemas" ON training_schemas FOR SELECT USING (status = \'published\');',
      'CREATE POLICY "Admins can manage all training schemas" ON training_schemas FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = \'admin\'));'
    ];

    // Policies for training_schema_days (public read, admin write)
    const daysPolicies = [
      'CREATE POLICY "Anyone can view published schema days" ON training_schema_days FOR SELECT USING (EXISTS (SELECT 1 FROM training_schemas WHERE training_schemas.id = training_schema_days.schema_id AND training_schemas.status = \'published\'));',
      'CREATE POLICY "Admins can manage all schema days" ON training_schema_days FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = \'admin\'));'
    ];

    // Policies for training_schema_exercises (public read, admin write)
    const exercisePolicies = [
      'CREATE POLICY "Anyone can view published schema exercises" ON training_schema_exercises FOR SELECT USING (EXISTS (SELECT 1 FROM training_schema_days tsd JOIN training_schemas ts ON ts.id = tsd.schema_id WHERE tsd.id = training_schema_exercises.schema_day_id AND ts.status = \'published\'));',
      'CREATE POLICY "Admins can manage all schema exercises" ON training_schema_exercises FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = \'admin\'));'
    ];

    // Policies for exercises (public read, admin write)
    const exercisesTablePolicies = [
      'CREATE POLICY "Anyone can view exercises" ON exercises FOR SELECT USING (true);',
      'CREATE POLICY "Admins can manage exercises" ON exercises FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = \'admin\'));'
    ];

    // Policies for user_training_schema_progress (users can only see their own)
    const progressPolicies = [
      'CREATE POLICY "Users can view own training progress" ON user_training_schema_progress FOR SELECT USING (auth.uid() = user_id);',
      'CREATE POLICY "Users can insert own training progress" ON user_training_schema_progress FOR INSERT WITH CHECK (auth.uid() = user_id);',
      'CREATE POLICY "Users can update own training progress" ON user_training_schema_progress FOR UPDATE USING (auth.uid() = user_id);',
      'CREATE POLICY "Admins can view all training progress" ON user_training_schema_progress FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = \'admin\'));'
    ];

    const allPolicies = [
      ...schemaPolicies,
      ...daysPolicies,
      ...exercisePolicies,
      ...exercisesTablePolicies,
      ...progressPolicies
    ];

    for (const policy of allPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`⚠️ Could not create policy:`, error.message);
        } else {
          console.log(`✅ Policy created successfully`);
        }
      } catch (e) {
        console.log(`⚠️ Policy creation failed:`, e.message);
      }
    }

    // 8. Add sample exercises
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

    // 9. Add sample training schema (Chiel test)
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

    console.log('\n🎉 Training schema database setup completed!');
    console.log('📋 Summary:');
    console.log('   ✅ training_schemas table - Created');
    console.log('   ✅ training_schema_days table - Created');
    console.log('   ✅ training_schema_exercises table - Created');
    console.log('   ✅ exercises table - Created');
    console.log('   ✅ user_training_schema_progress table - Created');
    console.log('   ✅ RLS policies - Created');
    console.log('   ✅ Sample exercises - Added');
    console.log('   ✅ Sample training schema (Chiel test) - Added');
    console.log('\n🔗 Training schema functionality should now work!');

  } catch (error) {
    console.error('❌ Error setting up training schemas:', error);
  }
}

setupTrainingSchemas();
