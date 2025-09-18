-- Create table for storing workout set progress
CREATE TABLE IF NOT EXISTS user_workout_set_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    exercise_id TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    reps TEXT,
    weight TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of user, session, exercise, and set
    UNIQUE(user_id, session_id, exercise_id, set_number)
);

-- Enable RLS
ALTER TABLE user_workout_set_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own set progress" ON user_workout_set_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own set progress" ON user_workout_set_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own set progress" ON user_workout_set_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_workout_set_progress_user_id ON user_workout_set_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_set_progress_session_id ON user_workout_set_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_set_progress_exercise_id ON user_workout_set_progress(exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_set_progress_user_session ON user_workout_set_progress(user_id, session_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_workout_set_progress_updated_at 
    BEFORE UPDATE ON user_workout_set_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
