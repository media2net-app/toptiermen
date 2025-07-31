-- Clear all video URLs from academy lessons and exercises
-- This script removes all video URLs so they can be re-uploaded later

-- =====================================================
-- STEP 1: ACADEMY LESSONS
-- =====================================================

-- First, let's see what video URLs currently exist in academy_lessons
SELECT 
    'ACADEMY LESSONS' as table_name,
    id,
    title,
    video_url,
    type
FROM academy_lessons 
WHERE video_url IS NOT NULL AND video_url != '';

-- Now clear all video URLs from academy_lessons
UPDATE academy_lessons 
SET 
    video_url = NULL,
    updated_at = NOW()
WHERE video_url IS NOT NULL;

-- =====================================================
-- STEP 2: EXERCISES
-- =====================================================

-- First, let's see what video URLs currently exist in exercises
SELECT 
    'EXERCISES' as table_name,
    id,
    name as title,
    video_url,
    primary_muscle as type
FROM exercises 
WHERE video_url IS NOT NULL AND video_url != '';

-- Now clear all video URLs from exercises
UPDATE exercises 
SET 
    video_url = NULL,
    updated_at = NOW()
WHERE video_url IS NOT NULL;

-- =====================================================
-- STEP 3: VERIFICATION
-- =====================================================

-- Verify academy_lessons update
SELECT 
    'ACADEMY LESSONS - AFTER UPDATE' as table_name,
    COUNT(*) as total_lessons,
    COUNT(CASE WHEN video_url IS NULL THEN 1 END) as lessons_without_video,
    COUNT(CASE WHEN video_url IS NOT NULL THEN 1 END) as lessons_with_video
FROM academy_lessons;

-- Verify exercises update
SELECT 
    'EXERCISES - AFTER UPDATE' as table_name,
    COUNT(*) as total_exercises,
    COUNT(CASE WHEN video_url IS NULL THEN 1 END) as exercises_without_video,
    COUNT(CASE WHEN video_url IS NOT NULL THEN 1 END) as exercises_with_video
FROM exercises;

-- Final summary
SELECT 
    'FINAL SUMMARY' as status,
    'All video URLs have been cleared from academy_lessons and exercises tables' as message,
    NOW() as cleared_at; 