-- Add last_active column to profiles table if it doesn't exist
-- This column tracks when a user was last active on the platform

-- Add the column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active DESC);

-- Update existing users to have a last_active timestamp
UPDATE profiles 
SET last_active = updated_at 
WHERE last_active IS NULL AND updated_at IS NOT NULL;

-- If updated_at is also NULL, use created_at
UPDATE Kiprofiles 
SET last_active = created_at 
WHERE last_active IS NULL;

-- Create a function to automatically update last_active
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update last_active on profile updates
DROP TRIGGER IF EXISTS trigger_update_last_active ON profiles;
CREATE TRIGGER trigger_update_last_active
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

-- Verify the changes
SELECT 
  COUNT(*) as total_users,
  COUNT(last_active) as users_with_last_active,
  MAX(last_active) as most_recent_activity
FROM profiles;

