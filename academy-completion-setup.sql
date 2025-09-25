-- Academy Completion Setup for Rick
-- Execute this SQL in Supabase SQL Editor

-- Step 1: Create academy_lesson_completions table
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

-- Step 2: Create academy_module_completions table
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

-- Step 3: Enable RLS
ALTER TABLE academy_lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_module_completions ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
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

-- Step 5: Complete all lessons for Rick (rick@toptiermen.eu)
INSERT INTO academy_lesson_completions (user_id, lesson_id, completed_at, score, time_spent)
SELECT 
  '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'::uuid as user_id,
  id as lesson_id,
  NOW() as completed_at,
  100 as score,
  300 as time_spent
FROM academy_lessons
ON CONFLICT (user_id, lesson_id) DO NOTHING;

-- Step 6: Complete all modules for Rick
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

-- Step 7: Verify completion
SELECT 
  'Rick Academy Completion Summary' as summary,
  (SELECT COUNT(*) FROM academy_lesson_completions WHERE user_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c') as lessons_completed,
  (SELECT COUNT(*) FROM academy_module_completions WHERE user_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c') as modules_completed;
