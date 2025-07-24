-- =============================================
-- Update Missions Table for Daily Tracking
-- Execute this in Supabase SQL Editor
-- =============================================

-- Add last_completion_date column to user_missions table
ALTER TABLE user_missions 
ADD COLUMN IF NOT EXISTS last_completion_date DATE;

-- Add index for better performance on date queries
CREATE INDEX IF NOT EXISTS idx_user_missions_completion_date 
ON user_missions(user_id, last_completion_date);

-- Update existing completed missions to have today's date as completion date
-- (This is for existing data migration)
UPDATE user_missions 
SET last_completion_date = CURRENT_DATE 
WHERE status = 'completed' AND last_completion_date IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN user_missions.last_completion_date IS 
'Date when the mission was last completed (for daily missions, this tracks daily completion)';

-- Success message
SELECT 'Missions table updated for daily tracking! 🎯' as result; 