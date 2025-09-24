const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createMissingTables() {
  console.log('🔧 Creating missing workout tables...\n');
  
  try {
    // Create workout_templates table
    console.log('Creating workout_templates table...');
    const { error: templatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workout_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
          estimated_duration_minutes INTEGER,
          equipment_needed TEXT[],
          muscle_groups TEXT[],
          is_active BOOLEAN DEFAULT true,
          created_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (templatesError) {
      console.log('❌ Error creating workout_templates:', templatesError.message);
    } else {
      console.log('✅ workout_templates table created successfully');
    }
    
    // Create workout_session_exercises table
    console.log('Creating workout_session_exercises table...');
    const { error: exercisesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workout_session_exercises (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
          exercise_name VARCHAR(255) NOT NULL,
          sets_completed INTEGER DEFAULT 0,
          reps_completed VARCHAR(50),
          weight_used DECIMAL(8,2),
          rest_time_seconds INTEGER,
          notes TEXT,
          completed_at TIMESTAMP WITH TIME ZONE,
          sort_order INTEGER DEFAULT 0
        );
      `
    });
    
    if (exercisesError) {
      console.log('❌ Error creating workout_session_exercises:', exercisesError.message);
    } else {
      console.log('✅ workout_session_exercises table created successfully');
    }
    
    // Enable RLS
    console.log('Enabling RLS for workout tables...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;'
    });
    
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE workout_session_exercises ENABLE ROW LEVEL SECURITY;'
    });
    
    // Create RLS policies
    console.log('Creating RLS policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Workout templates are viewable by everyone" ON workout_templates
          FOR SELECT USING (true);
      `
    });
    
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can view their own session exercises" ON workout_session_exercises
          FOR SELECT USING (auth.uid() = (SELECT user_id FROM workout_sessions WHERE id = session_id));
      `
    });
    
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can insert their own session exercises" ON workout_session_exercises
          FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM workout_sessions WHERE id = session_id));
      `
    });
    
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can update their own session exercises" ON workout_session_exercises
          FOR UPDATE USING (auth.uid() = (SELECT user_id FROM workout_sessions WHERE id = session_id));
      `
    });
    
    console.log('\n✅ All missing tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

createMissingTables();
