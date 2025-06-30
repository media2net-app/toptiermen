-- Add missing columns to academy_lessons table
-- These columns are needed for the lesson management functionality

ALTER TABLE academy_lessons
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS examQuestions jsonb DEFAULT '[]'::jsonb;

-- Update existing lessons to have empty arrays for these columns
UPDATE academy_lessons 
SET 
    attachments = '[]'::jsonb,
    examQuestions = '[]'::jsonb
WHERE attachments IS NULL OR examQuestions IS NULL;

-- Add comments to document the columns
COMMENT ON COLUMN academy_lessons.attachments IS 'Array of attachment objects for the lesson (PDFs, worksheets, etc.)';
COMMENT ON COLUMN academy_lessons.examQuestions IS 'Array of exam/reflection questions for the lesson'; 