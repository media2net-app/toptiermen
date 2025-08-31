-- Add test_video_watched column to onboarding_status table
ALTER TABLE onboarding_status 
ADD COLUMN IF NOT EXISTS test_video_watched BOOLEAN DEFAULT FALSE;

-- Update existing records to have test_video_watched = false
UPDATE onboarding_status 
SET test_video_watched = FALSE 
WHERE test_video_watched IS NULL;

-- Add comment to the column
COMMENT ON COLUMN onboarding_status.test_video_watched IS 'Whether the test user has watched the special test video before onboarding';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'onboarding_status' 
AND column_name = 'test_video_watched';
