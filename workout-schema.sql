-- Workout Database Schema
-- Created: 2024-12-19

-- Workout Categories
CREATE TABLE IF NOT EXISTS workout_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7) DEFAULT '#8BAE5A',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise Types
CREATE TABLE IF NOT EXISTS exercise_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  muscle_groups TEXT[], -- Array of muscle groups
  equipment_required TEXT[], -- Array of required equipment
  difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT[] NOT NULL, -- Array of instruction steps
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  exercise_type_id UUID REFERENCES exercise_types(id),
  category_id UUID REFERENCES workout_categories(id),
  muscle_groups TEXT[], -- Primary muscle groups
  secondary_muscles TEXT[], -- Secondary muscle groups
  equipment_type VARCHAR(50) DEFAULT 'bodyweight' CHECK (equipment_type IN ('bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'kettlebell')),
  difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise Alternatives
CREATE TABLE IF NOT EXISTS exercise_alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  alternative_exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL, -- Why this is an alternative
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exercise_id, alternative_exercise_id)
);

-- Workout Templates
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES workout_categories(id),
  difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes INTEGER DEFAULT 60,
  equipment_needed TEXT[], -- Array of required equipment
  target_audience VARCHAR(100), -- e.g., 'beginners', 'advanced', 'rehabilitation'
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Template Exercises
CREATE TABLE IF NOT EXISTS workout_template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  sets INTEGER DEFAULT 3,
  reps VARCHAR(50) DEFAULT '8-12', -- Can be range like "8-12" or specific like "10"
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Workout Sessions
CREATE TABLE IF NOT EXISTS user_workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES workout_templates(id),
  session_name VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Exercise Performances
CREATE TABLE IF NOT EXISTS user_exercise_performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight_kg DECIMAL(5,2),
  reps_completed INTEGER,
  reps_target VARCHAR(50),
  rest_seconds INTEGER,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Workout Progress
CREATE TABLE IF NOT EXISTS user_workout_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  max_weight_kg DECIMAL(5,2),
  max_reps INTEGER,
  total_volume DECIMAL(8,2), -- weight * reps
  personal_record BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_id, date)
);

-- Workout Plans (User's custom workout schedules)
CREATE TABLE IF NOT EXISTS user_workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency_per_week INTEGER DEFAULT 3,
  duration_weeks INTEGER DEFAULT 12,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Plan Days
CREATE TABLE IF NOT EXISTS user_workout_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES user_workout_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  day_name VARCHAR(20) NOT NULL, -- 'Monday', 'Tuesday', etc.
  template_id UUID REFERENCES workout_templates(id),
  is_rest_day BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category_id);
CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(exercise_type_id);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment_type);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_workout_templates_category ON workout_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_workout_templates_public ON workout_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_user_workout_sessions_user ON user_workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_sessions_date ON user_workout_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_exercise_performances_session ON user_exercise_performances(session_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_progress_user ON user_workout_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_progress_date ON user_workout_progress(date);
CREATE INDEX IF NOT EXISTS idx_user_workout_plans_user ON user_workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_plans_active ON user_workout_plans(is_active);

-- RLS Policies
ALTER TABLE workout_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_plan_days ENABLE ROW LEVEL SECURITY;

-- Workout Categories: Anyone can view
CREATE POLICY "Anyone can view workout categories" ON workout_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage workout categories" ON workout_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Exercise Types: Anyone can view
CREATE POLICY "Anyone can view exercise types" ON exercise_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage exercise types" ON exercise_types FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Exercises: Anyone can view
CREATE POLICY "Anyone can view exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "Admins can manage exercises" ON exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Exercise Alternatives: Anyone can view
CREATE POLICY "Anyone can view exercise alternatives" ON exercise_alternatives FOR SELECT USING (true);
CREATE POLICY "Admins can manage exercise alternatives" ON exercise_alternatives FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Workout Templates: Anyone can view public templates
CREATE POLICY "Anyone can view public workout templates" ON workout_templates FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own templates" ON workout_templates FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create workout templates" ON workout_templates FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own templates" ON workout_templates FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own templates" ON workout_templates FOR DELETE USING (auth.uid() = created_by);

-- Workout Template Exercises: Anyone can view
CREATE POLICY "Anyone can view workout template exercises" ON workout_template_exercises FOR SELECT USING (true);
CREATE POLICY "Users can manage template exercises for their templates" ON workout_template_exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM workout_templates wt WHERE wt.id = workout_template_exercises.template_id AND wt.created_by = auth.uid())
);

-- User Workout Sessions: Users can only access their own sessions
CREATE POLICY "Users can view their own workout sessions" ON user_workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own workout sessions" ON user_workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workout sessions" ON user_workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workout sessions" ON user_workout_sessions FOR DELETE USING (auth.uid() = user_id);

-- User Exercise Performances: Users can only access their own performances
CREATE POLICY "Users can view their own exercise performances" ON user_exercise_performances FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_workout_sessions uws WHERE uws.id = user_exercise_performances.session_id AND uws.user_id = auth.uid())
);
CREATE POLICY "Users can create their own exercise performances" ON user_exercise_performances FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_workout_sessions uws WHERE uws.id = user_exercise_performances.session_id AND uws.user_id = auth.uid())
);
CREATE POLICY "Users can update their own exercise performances" ON user_exercise_performances FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_workout_sessions uws WHERE uws.id = user_exercise_performances.session_id AND uws.user_id = auth.uid())
);
CREATE POLICY "Users can delete their own exercise performances" ON user_exercise_performances FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_workout_sessions uws WHERE uws.id = user_exercise_performances.session_id AND uws.user_id = auth.uid())
);

-- User Workout Progress: Users can only access their own progress
CREATE POLICY "Users can view their own workout progress" ON user_workout_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own workout progress" ON user_workout_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workout progress" ON user_workout_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workout progress" ON user_workout_progress FOR DELETE USING (auth.uid() = user_id);

-- User Workout Plans: Users can only access their own plans
CREATE POLICY "Users can view their own workout plans" ON user_workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own workout plans" ON user_workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workout plans" ON user_workout_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workout plans" ON user_workout_plans FOR DELETE USING (auth.uid() = user_id);

-- User Workout Plan Days: Users can only access their own plan days
CREATE POLICY "Users can view their own workout plan days" ON user_workout_plan_days FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_workout_plans uwp WHERE uwp.id = user_workout_plan_days.plan_id AND uwp.user_id = auth.uid())
);
CREATE POLICY "Users can create their own workout plan days" ON user_workout_plan_days FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_workout_plans uwp WHERE uwp.id = user_workout_plan_days.plan_id AND uwp.user_id = auth.uid())
);
CREATE POLICY "Users can update their own workout plan days" ON user_workout_plan_days FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_workout_plans uwp WHERE uwp.id = user_workout_plan_days.plan_id AND uwp.user_id = auth.uid())
);
CREATE POLICY "Users can delete their own workout plan days" ON user_workout_plan_days FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_workout_plans uwp WHERE uwp.id = user_workout_plan_days.plan_id AND uwp.user_id = auth.uid())
);
