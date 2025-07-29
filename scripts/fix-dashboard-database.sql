-- Fix Dashboard Database Issues
-- This script creates missing tables and columns for the admin dashboard

-- 1. Create user_academy_progress table
CREATE TABLE IF NOT EXISTS public.user_academy_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID,
  lesson_id UUID,
  completed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_academy_progress
ALTER TABLE public.user_academy_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own academy progress" ON public.user_academy_progress;
CREATE POLICY "Users can view their own academy progress" ON public.user_academy_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own academy progress" ON public.user_academy_progress;
CREATE POLICY "Users can insert their own academy progress" ON public.user_academy_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own academy progress" ON public.user_academy_progress;
CREATE POLICY "Users can update their own academy progress" ON public.user_academy_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Create user_training_progress table
CREATE TABLE IF NOT EXISTS public.user_training_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  training_schema_id UUID,
  exercise_id UUID,
  completed BOOLEAN DEFAULT false,
  sets_completed INTEGER DEFAULT 0,
  reps_completed INTEGER DEFAULT 0,
  weight_used DECIMAL(5,2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_training_progress
ALTER TABLE public.user_training_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own training progress" ON public.user_training_progress;
CREATE POLICY "Users can view their own training progress" ON public.user_training_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own training progress" ON public.user_training_progress;
CREATE POLICY "Users can insert their own training progress" ON public.user_training_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own training progress" ON public.user_training_progress;
CREATE POLICY "Users can update their own training progress" ON public.user_training_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. Create book_reviews table
CREATE TABLE IF NOT EXISTS public.book_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for book_reviews
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all book reviews" ON public.book_reviews;
CREATE POLICY "Users can view all book reviews" ON public.book_reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own book reviews" ON public.book_reviews;
CREATE POLICY "Users can insert their own book reviews" ON public.book_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own book reviews" ON public.book_reviews;
CREATE POLICY "Users can update their own book reviews" ON public.book_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Create user_xp table
CREATE TABLE IF NOT EXISTS public.user_xp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_xp
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own XP" ON public.user_xp;
CREATE POLICY "Users can view their own XP" ON public.user_xp
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own XP" ON public.user_xp;
CREATE POLICY "Users can insert their own XP" ON public.user_xp
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own XP" ON public.user_xp;
CREATE POLICY "Users can update their own XP" ON public.user_xp
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Add missing columns to existing tables

-- Add parent_id to forum_posts if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forum_posts' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE public.forum_posts ADD COLUMN parent_id UUID REFERENCES public.forum_posts(id);
  END IF;
END $$;

-- Add xp_amount to user_xp if it doesn't exist (in case table already existed)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_xp' AND column_name = 'xp_amount'
  ) THEN
    ALTER TABLE public.user_xp ADD COLUMN xp_amount INTEGER DEFAULT 0;
  END IF;
END $$;

-- 6. Insert sample data for testing
INSERT INTO public.user_academy_progress (user_id, module_id, lesson_id, completed, progress_percentage)
SELECT 
  u.id,
  'sample-module-1'::UUID,
  'sample-lesson-1'::UUID,
  true,
  100
FROM auth.users u
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.user_training_progress (user_id, training_schema_id, exercise_id, completed, sets_completed, reps_completed)
SELECT 
  u.id,
  'sample-schema-1'::UUID,
  'sample-exercise-1'::UUID,
  true,
  3,
  12
FROM auth.users u
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.user_xp (user_id, xp_amount, level, total_xp_earned)
SELECT 
  u.id,
  1250,
  5,
  1250
FROM auth.users u
LIMIT 1
ON CONFLICT DO NOTHING;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_academy_progress_user_id ON public.user_academy_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_training_progress_user_id ON public.user_training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user_id ON public.book_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON public.user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON public.forum_posts(parent_id); 