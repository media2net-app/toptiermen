import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up workout sessions tables...');

    // Create workout_sessions table
    const { error: sessionsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workout_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
          day_number INTEGER NOT NULL,
          mode VARCHAR(20) DEFAULT 'interactive' CHECK (mode IN ('interactive', 'quick')),
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          duration_minutes INTEGER,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (sessionsError) {
      console.log('❌ Workout sessions table error:', sessionsError.message);
    } else {
      console.log('✅ Workout sessions table created');
    }

    // Create workout_exercises table
    const { error: exercisesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workout_exercises (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
          exercise_id UUID NOT NULL REFERENCES training_schema_exercises(id) ON DELETE CASCADE,
          sets_completed INTEGER DEFAULT 0,
          reps_completed TEXT,
          weight_used DECIMAL(5,2),
          rest_time_seconds INTEGER,
          notes TEXT,
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (exercisesError) {
      console.log('❌ Workout exercises table error:', exercisesError.message);
    } else {
      console.log('✅ Workout exercises table created');
    }

    // Create user_training_day_progress table
    const { error: dayProgressError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_training_day_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          schema_day_id UUID NOT NULL REFERENCES training_schema_days(id) ON DELETE CASCADE,
          completed BOOLEAN DEFAULT false,
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, schema_day_id)
        );
      `
    });

    if (dayProgressError) {
      console.log('❌ User training day progress table error:', dayProgressError.message);
    } else {
      console.log('✅ User training day progress table created');
    }

    // Create user_training_progress table
    const { error: progressError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_training_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
          current_day INTEGER DEFAULT 1,
          completed_days INTEGER DEFAULT 0,
          total_days INTEGER,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, schema_id)
        );
      `
    });

    if (progressError) {
      console.log('❌ User training progress table error:', progressError.message);
    } else {
      console.log('✅ User training progress table created');
    }

    // Create indexes for better performance
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_workout_sessions_schema_id ON workout_sessions(schema_id);
        CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at ON workout_sessions(started_at);
        CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id ON workout_exercises(session_id);
        CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
        CREATE INDEX IF NOT EXISTS idx_user_training_day_progress_user_id ON user_training_day_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_training_day_progress_schema_day_id ON user_training_day_progress(schema_day_id);
        CREATE INDEX IF NOT EXISTS idx_user_training_progress_user_id ON user_training_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_training_progress_schema_id ON user_training_progress(schema_id);
      `
    });

    if (indexError) {
      console.log('❌ Index creation error:', indexError.message);
    } else {
      console.log('✅ Indexes created');
    }

    // Enable RLS
    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_training_day_progress ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_training_progress ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.log('❌ RLS enable error:', rlsError.message);
    } else {
      console.log('✅ RLS enabled');
    }

    // Create RLS policies
    const { error: policyError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Workout sessions policies
        CREATE POLICY "Users can view own workout sessions" ON workout_sessions
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own workout sessions" ON workout_sessions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own workout sessions" ON workout_sessions
          FOR UPDATE USING (auth.uid() = user_id);

        -- Workout exercises policies
        CREATE POLICY "Users can view own workout exercises" ON workout_exercises
          FOR SELECT USING (auth.uid() = (SELECT user_id FROM workout_sessions WHERE id = session_id));
        
        CREATE POLICY "Users can insert own workout exercises" ON workout_exercises
          FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM workout_sessions WHERE id = session_id));
        
        CREATE POLICY "Users can update own workout exercises" ON workout_exercises
          FOR UPDATE USING (auth.uid() = (SELECT user_id FROM workout_sessions WHERE id = session_id));

        -- User training day progress policies
        CREATE POLICY "Users can view own day progress" ON user_training_day_progress
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own day progress" ON user_training_day_progress
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own day progress" ON user_training_day_progress
          FOR UPDATE USING (auth.uid() = user_id);

        -- User training progress policies
        CREATE POLICY "Users can view own training progress" ON user_training_progress
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own training progress" ON user_training_progress
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own training progress" ON user_training_progress
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    if (policyError) {
      console.log('❌ Policy creation error:', policyError.message);
    } else {
      console.log('✅ RLS policies created');
    }

    console.log('✅ Workout sessions tables setup completed');

    return NextResponse.json({
      success: true,
      message: 'Workout sessions tables created successfully',
      tables: [
        'workout_sessions',
        'workout_exercises', 
        'user_training_day_progress',
        'user_training_progress'
      ]
    });

  } catch (error) {
    console.error('❌ Error setting up workout sessions tables:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
