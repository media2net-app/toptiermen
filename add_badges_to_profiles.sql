-- Add badges column to profiles table
-- This column will store the number of badges a user has earned

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS badges INTEGER DEFAULT 0;

-- Add index for better performance on badges queries
CREATE INDEX IF NOT EXISTS idx_profiles_badges ON profiles(badges);

-- Add comment for documentation
COMMENT ON COLUMN profiles.badges IS 'Number of badges earned by the user';

-- Update existing profiles to have 0 badges if they don't have any
UPDATE profiles 
SET badges = 0 
WHERE badges IS NULL; 