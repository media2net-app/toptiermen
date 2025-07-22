-- Test and Fix Lesson-Module Connections
-- Run this in your Supabase SQL editor

-- 1. First, let's see the current state
SELECT '=== CURRENT STATE ===' as info;

-- Check all lessons and their module connections
SELECT 
    l.id as lesson_id,
    l.title as lesson_title,
    l.status as lesson_status,
    l.module_id,
    m.title as module_title,
    m.status as module_status
FROM academy_lessons l
LEFT JOIN academy_modules m ON l.module_id = m.id
ORDER BY l.order_index;

-- 2. Check for orphaned lessons
SELECT '=== ORPHANED LESSONS ===' as info;

SELECT 
    l.id,
    l.title,
    l.status,
    l.module_id
FROM academy_lessons l
WHERE l.module_id IS NULL 
   OR l.module_id NOT IN (SELECT id FROM academy_modules);

-- 3. Check for modules without lessons
SELECT '=== MODULES WITHOUT LESSONS ===' as info;

SELECT 
    m.id,
    m.title,
    m.status
FROM academy_modules m
WHERE m.id NOT IN (
    SELECT DISTINCT module_id 
    FROM academy_lessons 
    WHERE module_id IS NOT NULL
);

-- 4. Count lessons per module
SELECT '=== LESSON COUNTS PER MODULE ===' as info;

SELECT 
    m.title as module_title,
    m.status as module_status,
    COUNT(l.id) as lesson_count
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id
GROUP BY m.id, m.title, m.status
ORDER BY m.order_index;

-- 5. If there are orphaned lessons, fix them
SELECT '=== FIXING ORPHANED LESSONS ===' as info;

-- Update orphaned lessons to link to the first module
UPDATE academy_lessons 
SET module_id = (
    SELECT id 
    FROM academy_modules 
    WHERE title = 'Discipline & Identiteit' 
    LIMIT 1
)
WHERE module_id IS NULL 
   OR module_id NOT IN (SELECT id FROM academy_modules);

-- 6. Update lesson counts in modules
UPDATE academy_modules 
SET lessons_count = (
    SELECT COUNT(*) 
    FROM academy_lessons 
    WHERE module_id = academy_modules.id
);

-- 7. Final check
SELECT '=== FINAL STATE ===' as info;

SELECT 
    m.title as module_title,
    m.lessons_count,
    COUNT(l.id) as actual_lessons
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id
GROUP BY m.id, m.title, m.lessons_count
ORDER BY m.order_index;

-- 8. Show all published lessons for testing
SELECT '=== PUBLISHED LESSONS FOR TESTING ===' as info;

SELECT 
    l.id,
    l.title,
    l.status,
    l.module_id,
    m.title as module_title,
    m.id as module_id
FROM academy_lessons l
LEFT JOIN academy_modules m ON l.module_id = m.id
WHERE l.status = 'published'
ORDER BY l.order_index; 