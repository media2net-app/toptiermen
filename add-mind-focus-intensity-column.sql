-- Add mind_focus_intensity column to user_mind_profiles table
ALTER TABLE user_mind_profiles 
ADD COLUMN IF NOT EXISTS mind_focus_intensity INTEGER DEFAULT 3;

-- Update existing records to have default value
UPDATE user_mind_profiles 
SET mind_focus_intensity = 3 
WHERE mind_focus_intensity IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_mind_profiles.mind_focus_intensity IS 'Number of days per week user wants to engage with Mind & Focus program (1-7)';
