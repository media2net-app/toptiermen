-- Create Academy Completion Tables
-- Execute this SQL in Supabase SQL Editor

-- Create academy_lesson_completions table
CREATE TABLE IF NOT EXISTS academy_lesson_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create academy_module_completions table
CREATE TABLE IF NOT EXISTS academy_module_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE academy_lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_module_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own lesson completions" ON academy_lesson_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson completions" ON academy_lesson_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson completions" ON academy_lesson_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own module completions" ON academy_module_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module completions" ON academy_module_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module completions" ON academy_module_completions
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert completion data for Rick (rick@toptiermen.eu)
-- First, let's complete all lessons for Rick
INSERT INTO academy_lesson_completions (user_id, lesson_id, completed_at, score, time_spent)
SELECT 
  '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'::uuid as user_id,
  id as lesson_id,
  NOW() as completed_at,
  100 as score,
  300 as time_spent
FROM academy_lessons
ON CONFLICT (user_id, lesson_id) DO NOTHING;

-- Then, complete all modules for Rick
INSERT INTO academy_module_completions (user_id, module_id, completed_at, total_lessons, completed_lessons)
SELECT 
  '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'::uuid as user_id,
  m.id as module_id,
  NOW() as completed_at,
  COUNT(l.id) as total_lessons,
  COUNT(l.id) as completed_lessons
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id
GROUP BY m.id
ON CONFLICT (user_id, module_id) DO NOTHING;
