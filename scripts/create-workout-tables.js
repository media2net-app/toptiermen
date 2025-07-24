const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createWorkoutTables() {
  try {
    console.log('🔧 Creating workout tracking tables...');

    // Create workout_sessions table
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS workout_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
          day_number INTEGER NOT NULL,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          duration_minutes INTEGER,
          mode VARCHAR(20) DEFAULT 'interactive' CHECK (mode IN ('interactive', 'quick')),
          notes TEXT,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (sessionsError) {
      console.log('❌ Error creating workout_sessions table:', sessionsError.message);
      return;
    }

    console.log('✅ workout_sessions table created successfully');

    // Create workout_exercises table
    const { error: exercisesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS workout_exercises (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
          exercise_name VARCHAR(255) NOT NULL,
          sets_completed INTEGER DEFAULT 0,
          reps_completed INTEGER DEFAULT 0,
          weight_kg DECIMAL(5,2),
          rest_time_seconds INTEGER DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (exercisesError) {
      console.log('❌ Error creating workout_exercises table:', exercisesError.message);
      return;
    }

    console.log('✅ workout_exercises table created successfully');

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_workout_sessions_schema_id ON workout_sessions(schema_id);',
      'CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at ON workout_sessions(started_at);',
      'CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id ON workout_exercises(session_id);'
    ];

    for (const index of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: index });
      if (error) {
        console.log('❌ Error creating index:', error.message);
      } else {
        console.log('✅ Index created successfully');
      }
    }

    // Enable RLS on workout_sessions
    const { error: rlsSessionsError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsSessionsError) {
      console.log('❌ Error enabling RLS on workout_sessions:', rlsSessionsError.message);
    } else {
      console.log('✅ RLS enabled on workout_sessions');
    }

    // Enable RLS on workout_exercises
    const { error: rlsExercisesError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsExercisesError) {
      console.log('❌ Error enabling RLS on workout_exercises:', rlsExercisesError.message);
    } else {
      console.log('✅ RLS enabled on workout_exercises');
    }

    // Create RLS policies for workout_sessions
    const sessionPolicies = [
      {
        name: 'Users can view own workout sessions',
        sql: `CREATE POLICY "Users can view own workout sessions" ON workout_sessions FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can insert own workout sessions',
        sql: `CREATE POLICY "Users can insert own workout sessions" ON workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: 'Users can update own workout sessions',
        sql: `CREATE POLICY "Users can update own workout sessions" ON workout_sessions FOR UPDATE USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can delete own workout sessions',
        sql: `CREATE POLICY "Users can delete own workout sessions" ON workout_sessions FOR DELETE USING (auth.uid() = user_id);`
      }
    ];

    for (const policy of sessionPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: policy.sql });
      if (error) {
        console.log(`❌ Error creating policy "${policy.name}":`, error.message);
      } else {
        console.log(`✅ Policy "${policy.name}" created successfully`);
      }
    }

    // Create RLS policies for workout_exercises
    const exercisePolicies = [
      {
        name: 'Users can view own workout exercises',
        sql: `CREATE POLICY "Users can view own workout exercises" ON workout_exercises FOR SELECT USING (EXISTS (SELECT 1 FROM workout_sessions WHERE workout_sessions.id = workout_exercises.session_id AND workout_sessions.user_id = auth.uid()));`
      },
      {
        name: 'Users can insert own workout exercises',
        sql: `CREATE POLICY "Users can insert own workout exercises" ON workout_exercises FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM workout_sessions WHERE workout_sessions.id = workout_exercises.session_id AND workout_sessions.user_id = auth.uid()));`
      },
      {
        name: 'Users can update own workout exercises',
        sql: `CREATE POLICY "Users can update own workout exercises" ON workout_exercises FOR UPDATE USING (EXISTS (SELECT 1 FROM workout_sessions WHERE workout_sessions.id = workout_exercises.session_id AND workout_sessions.user_id = auth.uid()));`
      },
      {
        name: 'Users can delete own workout exercises',
        sql: `CREATE POLICY "Users can delete own workout exercises" ON workout_exercises FOR DELETE USING (EXISTS (SELECT 1 FROM workout_sessions WHERE workout_sessions.id = workout_exercises.session_id AND workout_sessions.user_id = auth.uid()));`
      }
    ];

    for (const policy of exercisePolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: policy.sql });
      if (error) {
        console.log(`❌ Error creating policy "${policy.name}":`, error.message);
      } else {
        console.log(`✅ Policy "${policy.name}" created successfully`);
      }
    }

    console.log('🎉 Workout tracking tables setup completed!');

  } catch (error) {
    console.error('❌ Error in createWorkoutTables:', error);
  }
}

createWorkoutTables(); 