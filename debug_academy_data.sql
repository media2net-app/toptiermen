-- Debug Academy Data
-- Run this SQL in your Supabase SQL editor to check academy data

-- 1. Check all modules and their status
SELECT 
    id,
    title,
    status,
    order_index,
    lessons_count,
    created_at
FROM academy_modules 
ORDER BY order_index;

-- 2. Check published modules specifically
SELECT 
    id,
    title,
    status,
    order_index
FROM academy_modules 
WHERE status = 'published'
ORDER BY order_index;

-- 3. Check all lessons and their module connections
SELECT 
    l.id,
    l.title,
    l.status,
    l.order_index,
    l.module_id,
    m.title as module_title
FROM academy_lessons l
LEFT JOIN academy_modules m ON l.module_id = m.id
ORDER BY l.order_index;

-- 4. Check published lessons specifically
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

-- 5. Count modules and lessons
SELECT 
    'modules' as type,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published
FROM academy_modules
UNION ALL
SELECT 
    'lessons' as type,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published
FROM academy_lessons;

-- 6. Check RLS policies (if you have admin access)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('academy_modules', 'academy_lessons')
ORDER BY tablename, policyname; 