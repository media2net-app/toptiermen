-- Quick Academy Debug Script
-- Run this in your Supabase SQL editor to check academy data

-- 1. Check if modules exist and their status
SELECT 
    '=== MODULES CHECK ===' as info;

SELECT 
    id,
    title,
    status,
    order_index,
    created_at
FROM academy_modules 
ORDER BY order_index;

-- 2. Check if lessons exist and their module connections
SELECT 
    '=== LESSONS CHECK ===' as info;

SELECT 
    l.id,
    l.title,
    l.status,
    l.module_id,
    m.title as module_title
FROM academy_lessons l
LEFT JOIN academy_modules m ON l.module_id = m.id
ORDER BY l.order_index;

-- 3. Count published content
SELECT 
    '=== PUBLISHED CONTENT COUNT ===' as info;

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

-- 4. Check RLS policies
SELECT 
    '=== RLS POLICIES CHECK ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('academy_modules', 'academy_lessons')
ORDER BY tablename, policyname;

-- 5. Test a simple query as authenticated user would see
SELECT 
    '=== TEST QUERY (should show published modules) ===' as info;

-- This simulates what the app is trying to fetch
SELECT 
    id,
    title,
    status,
    order_index
FROM academy_modules 
WHERE status = 'published'
ORDER BY order_index; 