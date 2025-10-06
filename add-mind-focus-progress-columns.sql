-- Add progress tracking columns to user_mind_profiles table
-- Run this in your Supabase SQL editor

-- Add current_active_week column
ALTER TABLE user_mind_profiles 
ADD COLUMN IF NOT EXISTS current_active_week INTEGER DEFAULT 1;

-- Add completed_weeks column  
ALTER TABLE user_mind_profiles 
ADD COLUMN IF NOT EXISTS completed_weeks JSONB DEFAULT '[]'::jsonb;

-- Update existing records to have default values
UPDATE user_mind_profiles 
SET current_active_week = 1 
WHERE current_active_week IS NULL;

UPDATE user_mind_profiles 
SET completed_weeks = '[]'::jsonb 
WHERE completed_weeks IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN user_mind_profiles.current_active_week IS 'The current active week in the 6-month Mind & Focus program (1-24)';
COMMENT ON COLUMN user_mind_profiles.completed_weeks IS 'Array of completed week numbers in the Mind & Focus program';

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_mind_profiles' 
AND column_name IN ('current_active_week', 'completed_weeks');
