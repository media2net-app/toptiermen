-- Workout Database Schema - Fixed Version 2
-- Create tables in correct order to avoid foreign key errors

-- 1. First create workout_templates table
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

-- 2. Then create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_name VARCHAR(255) NOT NULL,
  sets INTEGER DEFAULT 1,
  reps VARCHAR(50),
  weight DECIMAL(8,2),
  rest_time_seconds INTEGER DEFAULT 60,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Then create workout_sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES workout_templates(id),
  session_name VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Finally create workout_session_exercises table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workout_templates_category ON workout_templates(category);
CREATE INDEX IF NOT EXISTS idx_workout_templates_difficulty ON workout_templates(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_template_id ON workout_exercises(template_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_template_id ON workout_sessions(template_id);
CREATE INDEX IF NOT EXISTS idx_workout_session_exercises_session_id ON workout_session_exercises(session_id);

-- Enable RLS
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_session_exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Workout templates are viewable by everyone" ON workout_templates
  FOR SELECT USING (true);

CREATE POLICY "Workout exercises are viewable by everyone" ON workout_exercises
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own workout sessions" ON workout_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout sessions" ON workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions" ON workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own session exercises" ON workout_session_exercises
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM workout_sessions WHERE id = session_id));

CREATE POLICY "Users can insert their own session exercises" ON workout_session_exercises
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM workout_sessions WHERE id = session_id));

CREATE POLICY "Users can update their own session exercises" ON workout_session_exercises
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM workout_sessions WHERE id = session_id));
