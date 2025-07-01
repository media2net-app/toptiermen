-- Create user progress tracking tables for Academy

-- User module progress table
CREATE TABLE IF NOT EXISTS user_module_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES academy_modules(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- User lesson progress table
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES academy_modules(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT FALSE,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Add RLS policies for user_module_progress
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own module progress" ON user_module_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module progress" ON user_module_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module progress" ON user_module_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for user_lesson_progress
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own lesson progress" ON user_lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" ON user_lesson_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id ON user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_module_id ON user_module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_module_id ON user_lesson_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
