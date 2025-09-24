-- Workout Database Schema - Fixed Version
-- Only creates new tables, doesn't modify existing ones

-- Workout Templates
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'strength',
  difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER DEFAULT 60,
  equipment_needed TEXT[],
  target_muscles TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Workout Sessions
CREATE TABLE IF NOT EXISTS user_workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES workout_templates(id),
  session_name VARCHAR(255) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Exercise Performances
CREATE TABLE IF NOT EXISTS user_exercise_performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_workout_sessions(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id),
  exercise_name VARCHAR(255) NOT NULL,
  sets_completed INTEGER DEFAULT 0,
  reps_completed INTEGER DEFAULT 0,
  weight_kg DECIMAL(5,2),
  rest_time_seconds INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Workout Progress
CREATE TABLE IF NOT EXISTS user_workout_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES workout_templates(id),
  total_sessions INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  last_workout_date DATE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_templates_created_by ON workout_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_workout_templates_category ON workout_templates(category);
CREATE INDEX IF NOT EXISTS idx_workout_templates_difficulty ON workout_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_workout_sessions_user_id ON user_workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_sessions_template_id ON user_workout_sessions(template_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_sessions_started_at ON user_workout_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_exercise_performances_session_id ON user_exercise_performances(session_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_progress_user_id ON user_workout_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_progress_template_id ON user_workout_progress(template_id);

-- RLS Policies
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_progress ENABLE ROW LEVEL SECURITY;

-- Workout Templates: Anyone can view public templates
CREATE POLICY "Anyone can view public templates" ON workout_templates FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own templates" ON workout_templates FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create templates" ON workout_templates FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own templates" ON workout_templates FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own templates" ON workout_templates FOR DELETE USING (auth.uid() = created_by);

-- User Workout Sessions: Users can only access their own sessions
CREATE POLICY "Users can view their own sessions" ON user_workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON user_workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON user_workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON user_workout_sessions FOR DELETE USING (auth.uid() = user_id);

-- User Exercise Performances: Users can only access their own performances
CREATE POLICY "Users can view their own performances" ON user_exercise_performances FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_workout_sessions uws WHERE uws.id = user_exercise_performances.session_id AND uws.user_id = auth.uid())
);
CREATE POLICY "Users can create their own performances" ON user_exercise_performances FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_workout_sessions uws WHERE uws.id = user_exercise_performances.session_id AND uws.user_id = auth.uid())
);
CREATE POLICY "Users can update their own performances" ON user_exercise_performances FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_workout_sessions uws WHERE uws.id = user_exercise_performances.session_id AND uws.user_id = auth.uid())
);
CREATE POLICY "Users can delete their own performances" ON user_exercise_performances FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_workout_sessions uws WHERE uws.id = user_exercise_performances.session_id AND uws.user_id = auth.uid())
);

-- User Workout Progress: Users can only access their own progress
CREATE POLICY "Users can view their own progress" ON user_workout_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progress" ON user_workout_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON user_workout_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own progress" ON user_workout_progress FOR DELETE USING (auth.uid() = user_id);
