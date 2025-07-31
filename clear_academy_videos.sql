-- Clear all video URLs from academy lessons
-- This script removes all video URLs so they can be re-uploaded later

-- First, let's see what video URLs currently exist
SELECT 
    id,
    title,
    video_url,
    type
FROM academy_lessons 
WHERE video_url IS NOT NULL AND video_url != '';

-- Now clear all video URLs
UPDATE academy_lessons 
SET 
    video_url = NULL,
    updated_at = NOW()
WHERE video_url IS NOT NULL;

-- Verify the update
SELECT 
    id,
    title,
    video_url,
    type
FROM academy_lessons 
WHERE video_url IS NOT NULL;

-- Show summary
SELECT 
    COUNT(*) as total_lessons,
    COUNT(CASE WHEN video_url IS NULL THEN 1 END) as lessons_without_video,
    COUNT(CASE WHEN video_url IS NOT NULL THEN 1 END) as lessons_with_video
FROM academy_lessons; 