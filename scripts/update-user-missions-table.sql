-- Add missing columns to existing user_missions table
-- This script adds columns that are expected by the application

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'status' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Add title column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'title' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN title TEXT;
    END IF;
END $$;

-- Add frequency_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'frequency_type' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN frequency_type TEXT DEFAULT 'daily';
    END IF;
END $$;

-- Add category_slug column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'category_slug' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN category_slug TEXT DEFAULT 'health-fitness';
    END IF;
END $$;

-- Add target_value column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'target_value' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN target_value INTEGER DEFAULT 1;
    END IF;
END $$;

-- Add current_progress column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'current_progress' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN current_progress INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add last_completion_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'last_completion_date' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN last_completion_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add icon column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'icon' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN icon TEXT DEFAULT '🎯';
    END IF;
END $$;

-- Add badge_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'badge_name' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN badge_name TEXT DEFAULT 'Mission Badge';
    END IF;
END $$;

-- Add xp_reward column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'xp_reward' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN xp_reward INTEGER DEFAULT 15;
    END IF;
END $$;

-- Add is_shared column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'is_shared' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN is_shared BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'created_at' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_missions' 
                   AND column_name = 'updated_at' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.user_missions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON public.user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON public.user_missions(status);
CREATE INDEX IF NOT EXISTS idx_user_missions_frequency_type ON public.user_missions(frequency_type);
CREATE INDEX IF NOT EXISTS idx_user_missions_category_slug ON public.user_missions(category_slug);
CREATE INDEX IF NOT EXISTS idx_user_missions_last_completion_date ON public.user_missions(last_completion_date);

-- Enable RLS if not already enabled
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_missions' AND policyname = 'Users can view their own missions') THEN
        CREATE POLICY "Users can view their own missions" ON public.user_missions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_missions' AND policyname = 'Users can insert their own missions') THEN
        CREATE POLICY "Users can insert their own missions" ON public.user_missions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_missions' AND policyname = 'Users can update their own missions') THEN
        CREATE POLICY "Users can update their own missions" ON public.user_missions
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;
