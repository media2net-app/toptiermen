-- Academy Database Tables
-- Run this SQL in your Supabase SQL editor

-- 1. Academy Modules Table
CREATE TABLE IF NOT EXISTS academy_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    cover_image VARCHAR(500),
    lessons_count INTEGER DEFAULT 0,
    total_duration VARCHAR(50) DEFAULT '0m',
    enrolled_students INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    unlock_requirement UUID REFERENCES academy_modules(id),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. Academy Lessons Table
CREATE TABLE IF NOT EXISTS academy_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(50) DEFAULT '0m',
    type VARCHAR(20) DEFAULT 'video' CHECK (type IN ('video', 'text', 'exam')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    order_index INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    video_url VARCHAR(500),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 3. Academy Lesson Attachments Table
CREATE TABLE IF NOT EXISTS academy_lesson_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 4. Academy Exam Questions Table
CREATE TABLE IF NOT EXISTS academy_exam_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (type IN ('multiple_choice', 'text', 'true_false')),
    options JSONB, -- For multiple choice questions
    correct_answer TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 5. User Module Progress Table
CREATE TABLE IF NOT EXISTS user_module_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, module_id)
);

-- 6. User Lesson Progress Table
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    watched_duration INTEGER DEFAULT 0, -- in seconds
    exam_score DECIMAL(5,2),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, lesson_id)
);

-- 7. User Exam Answers Table
CREATE TABLE IF NOT EXISTS user_exam_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES academy_exam_questions(id) ON DELETE CASCADE,
    answer TEXT,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_academy_modules_status ON academy_modules(status);
CREATE INDEX IF NOT EXISTS idx_academy_modules_order ON academy_modules(order_index);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_module_id ON academy_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_order ON academy_lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id ON user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lesson_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exam_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for academy_modules
CREATE POLICY "Public read access to published modules" ON academy_modules
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admin full access to modules" ON academy_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for academy_lessons
CREATE POLICY "Public read access to published lessons" ON academy_lessons
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admin full access to lessons" ON academy_lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for other tables
CREATE POLICY "Users can read their own progress" ON user_module_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own progress" ON user_module_progress
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own progress" ON user_module_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Similar policies for other user-related tables
CREATE POLICY "Users can read their own lesson progress" ON user_lesson_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own lesson progress" ON user_lesson_progress
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own lesson progress" ON user_lesson_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin policies for all tables
CREATE POLICY "Admin full access to all academy tables" ON academy_lesson_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admin full access to exam questions" ON academy_exam_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admin full access to user exam answers" ON user_exam_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_academy_modules_updated_at 
    BEFORE UPDATE ON academy_modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academy_lessons_updated_at 
    BEFORE UPDATE ON academy_lessons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 