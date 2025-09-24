-- Academy Completions Schema
-- Create tables for tracking lesson and module completions

-- 1. Create academy_lesson_completions table
CREATE TABLE IF NOT EXISTS academy_lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percentage INTEGER DEFAULT 100,
  time_spent_minutes INTEGER DEFAULT 15,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 2. Create academy_module_completions table
CREATE TABLE IF NOT EXISTS academy_module_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percentage INTEGER DEFAULT 100,
  time_spent_minutes INTEGER DEFAULT 90,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_academy_lesson_completions_user_id ON academy_lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_lesson_completions_lesson_id ON academy_lesson_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_academy_module_completions_user_id ON academy_module_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_module_completions_module_id ON academy_module_completions(module_id);

-- 4. Enable RLS
ALTER TABLE academy_lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_module_completions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
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
