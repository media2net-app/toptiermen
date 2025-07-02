-- Add worksheet_url column to exercises table
-- This allows admins to upload PDF workbooks for exercises

ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS worksheet_url text;

-- Add comment to document the purpose
COMMENT ON COLUMN exercises.worksheet_url IS 'URL to PDF workbook file for this exercise';

-- Update existing exercises to have NULL worksheet_url
UPDATE exercises 
SET worksheet_url = NULL 
WHERE worksheet_url IS NULL; 