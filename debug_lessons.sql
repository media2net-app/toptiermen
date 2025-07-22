-- Debug Lessons and Module Connections
-- Run this SQL in your Supabase SQL editor

-- 1. Check all lessons and their module connections
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

-- 2. Count lessons per module
SELECT 
    m.title as module_title,
    m.status as module_status,
    COUNT(l.id) as lesson_count
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id
GROUP BY m.id, m.title, m.status
ORDER BY m.order_index;

-- 3. Check for orphaned lessons (lessons without modules)
SELECT 
    l.id,
    l.title,
    l.status,
    l.module_id
FROM academy_lessons l
WHERE l.module_id IS NULL 
   OR l.module_id NOT IN (SELECT id FROM academy_modules);

-- 4. Check for modules without lessons
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

-- 5. Show all published lessons
SELECT 
    l.id,
    l.title,
    l.status,
    l.module_id,
    m.title as module_title
FROM academy_lessons l
LEFT JOIN academy_modules m ON l.module_id = m.id
WHERE l.status = 'published'
ORDER BY l.order_index; 