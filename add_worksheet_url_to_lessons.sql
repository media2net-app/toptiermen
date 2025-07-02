-- Add worksheet_url column to academy_lessons table
-- This allows admins to upload PDF workbooks for lessons

ALTER TABLE academy_lessons 
ADD COLUMN IF NOT EXISTS worksheet_url text;

-- Add comment to document the purpose
COMMENT ON COLUMN academy_lessons.worksheet_url IS 'URL to PDF workbook file for this lesson'; 