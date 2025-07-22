-- COMPREHENSIVE ACADEMY DEBUG SCRIPT
-- Run this in your Supabase SQL editor to diagnose academy issues

-- =====================================================
-- 1. CHECK TABLE EXISTENCE AND STRUCTURE
-- =====================================================

SELECT 'TABLE EXISTENCE CHECK' as info;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%academy%'
ORDER BY table_name;

-- =====================================================
-- 2. CHECK MODULE DATA
-- =====================================================

SELECT 'MODULE DATA CHECK' as info;

-- Count total and published modules
SELECT 
    COUNT(*) as total_modules,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_modules,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_modules
FROM academy_modules;

-- Show all modules with details
SELECT 
    id,
    title,
    status,
    order_index,
    lessons_count,
    slug,
    created_at
FROM academy_modules 
ORDER BY order_index;

-- =====================================================
-- 3. CHECK LESSON DATA
-- =====================================================

SELECT 'LESSON DATA CHECK' as info;

-- Count total and published lessons
SELECT 
    COUNT(*) as total_lessons,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_lessons,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_lessons
FROM academy_lessons;

-- Show lessons with module relationships
SELECT 
    l.id,
    l.title,
    l.status,
    l.order_index,
    l.module_id,
    m.title as module_title,
    m.status as module_status
FROM academy_lessons l
LEFT JOIN academy_modules m ON l.module_id = m.id
ORDER BY m.order_index, l.order_index;

-- =====================================================
-- 4. CHECK MODULE-LESSON RELATIONSHIPS
-- =====================================================

SELECT 'MODULE-LESSON RELATIONSHIPS' as info;

-- Modules with lesson counts
SELECT 
    m.title as module_title,
    m.status as module_status,
    m.lessons_count as stored_count,
    COUNT(l.id) as actual_count,
    CASE 
        WHEN m.lessons_count = COUNT(l.id) THEN 'MATCH'
        ELSE 'MISMATCH' 
    END as count_status
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id
GROUP BY m.id, m.title, m.status, m.lessons_count, m.order_index
ORDER BY m.order_index;

-- Orphaned lessons (no module)
SELECT 
    'ORPHANED LESSONS' as info,
    COUNT(*) as orphaned_count
FROM academy_lessons l
WHERE l.module_id IS NULL 
   OR l.module_id NOT IN (SELECT id FROM academy_modules);

-- =====================================================
-- 5. CHECK PROGRESS TABLES
-- =====================================================

SELECT 'PROGRESS TABLES CHECK' as info;

-- Check if progress tables exist
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%progress%'
ORDER BY table_name;

-- Check progress table data
SELECT 
    'user_lesson_progress' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT user_id) as unique_users
FROM user_lesson_progress
UNION ALL
SELECT 
    'user_module_unlocks' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT user_id) as unique_users
FROM user_module_unlocks;

-- =====================================================
-- 6. CHECK RLS POLICIES
-- =====================================================

SELECT 'RLS POLICIES CHECK' as info;

SELECT 
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('academy_modules', 'academy_lessons', 'user_lesson_progress', 'user_module_unlocks')
ORDER BY tablename, policyname;

-- =====================================================
-- 7. TEST PUBLISHED CONTENT QUERY
-- =====================================================

SELECT 'PUBLISHED CONTENT TEST' as info;

-- Test what users would see (published modules)
SELECT 
    id,
    title,
    status,
    order_index,
    lessons_count
FROM academy_modules 
WHERE status = 'published'
ORDER BY order_index;

-- Test what users would see (published lessons from published modules)
SELECT 
    l.id,
    l.title,
    l.status,
    l.module_id,
    m.title as module_title
FROM academy_lessons l
INNER JOIN academy_modules m ON l.module_id = m.id
WHERE l.status = 'published' 
  AND m.status = 'published'
ORDER BY m.order_index, l.order_index;

-- =====================================================
-- 8. CHECK FOR FIRST MODULE LESSONS
-- =====================================================

SELECT 'FIRST MODULE LESSONS CHECK' as info;

-- Get first module and its lessons
WITH first_module AS (
    SELECT id, title 
    FROM academy_modules 
    WHERE status = 'published'
    ORDER BY order_index 
    LIMIT 1
)
SELECT 
    'First module lessons' as info,
    fm.title as module_title,
    COUNT(l.id) as lesson_count
FROM first_module fm
LEFT JOIN academy_lessons l ON fm.id = l.module_id AND l.status = 'published'
GROUP BY fm.id, fm.title; 