-- Training Schemas Database Tables
-- Run this SQL in your Supabase SQL editor

-- 1. Training Schemas Table
CREATE TABLE IF NOT EXISTS training_schemas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Gym', 'Outdoor', 'Bodyweight')),
    cover_image VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    difficulty VARCHAR(20) DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    estimated_duration VARCHAR(50) DEFAULT '30 min',
    target_audience VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. Training Schema Days Table
CREATE TABLE IF NOT EXISTS training_schema_days (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    focus_area VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(schema_id, day_number)
);

-- 3. Training Schema Exercises Table
CREATE TABLE IF NOT EXISTS training_schema_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schema_day_id UUID NOT NULL REFERENCES training_schema_days(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE SET NULL,
    exercise_name VARCHAR(255) NOT NULL,
    sets INTEGER DEFAULT 3,
    reps VARCHAR(50) DEFAULT '8-12',
    rest_time VARCHAR(50) DEFAULT '90 sec',
    order_index INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Training Schema Progress Table
CREATE TABLE IF NOT EXISTS user_training_schema_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
    current_day INTEGER DEFAULT 1,
    completed_days INTEGER DEFAULT 0,
    total_days INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, schema_id)
);

-- 5. User Training Day Progress Table
CREATE TABLE IF NOT EXISTS user_training_day_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    schema_day_id UUID NOT NULL REFERENCES training_schema_days(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(user_id, schema_day_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_schemas_status ON training_schemas(status);
CREATE INDEX IF NOT EXISTS idx_training_schemas_category ON training_schemas(category);
CREATE INDEX IF NOT EXISTS idx_training_schema_days_schema_id ON training_schema_days(schema_id);
CREATE INDEX IF NOT EXISTS idx_training_schema_exercises_day_id ON training_schema_exercises(schema_day_id);
CREATE INDEX IF NOT EXISTS idx_user_training_schema_progress_user_id ON user_training_schema_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_training_day_progress_user_id ON user_training_day_progress(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE training_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_schema_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_schema_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_training_schema_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_training_day_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_schemas
CREATE POLICY "Allow all users to select published training schemas" ON training_schemas
FOR SELECT
USING (status = 'published');

CREATE POLICY "Allow authenticated users to select all training schemas" ON training_schemas
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert training schemas" ON training_schemas
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update training schemas" ON training_schemas
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete training schemas" ON training_schemas
FOR DELETE
USING (auth.role() = 'authenticated');

-- RLS Policies for training_schema_days
CREATE POLICY "Allow all users to select training schema days" ON training_schema_days
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert training schema days" ON training_schema_days
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update training schema days" ON training_schema_days
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete training schema days" ON training_schema_days
FOR DELETE
USING (auth.role() = 'authenticated');

-- RLS Policies for training_schema_exercises
CREATE POLICY "Allow all users to select training schema exercises" ON training_schema_exercises
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert training schema exercises" ON training_schema_exercises
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update training schema exercises" ON training_schema_exercises
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete training schema exercises" ON training_schema_exercises
FOR DELETE
USING (auth.role() = 'authenticated');

-- RLS Policies for user_training_schema_progress
CREATE POLICY "Allow users to select their own training schema progress" ON user_training_schema_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own training schema progress" ON user_training_schema_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own training schema progress" ON user_training_schema_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own training schema progress" ON user_training_schema_progress
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for user_training_day_progress
CREATE POLICY "Allow users to select their own training day progress" ON user_training_day_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own training day progress" ON user_training_day_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own training day progress" ON user_training_day_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own training day progress" ON user_training_day_progress
FOR DELETE
USING (auth.uid() = user_id); 