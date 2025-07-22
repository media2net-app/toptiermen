-- SIMPLE ACADEMY TEST SCRIPT
-- Run this to quickly check if academy is working

-- 1. Check if academy tables exist
SELECT 
    'Tables Check' as test,
    COUNT(*) as academy_tables_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%academy%';

-- 2. Check basic data
SELECT 'Modules Count' as test, COUNT(*) as count FROM academy_modules;
SELECT 'Published Modules' as test, COUNT(*) as count FROM academy_modules WHERE status = 'published';
SELECT 'Lessons Count' as test, COUNT(*) as count FROM academy_lessons;
SELECT 'Published Lessons' as test, COUNT(*) as count FROM academy_lessons WHERE status = 'published';

-- 3. Show first published module
SELECT 
    'First Module' as test,
    id,
    title,
    status,
    order_index,
    lessons_count,
    slug
FROM academy_modules 
WHERE status = 'published'
ORDER BY order_index 
LIMIT 1;

-- 4. Show lessons for first module
WITH first_module AS (
    SELECT id 
    FROM academy_modules 
    WHERE status = 'published'
    ORDER BY order_index 
    LIMIT 1
)
SELECT 
    'First Module Lessons' as test,
    l.id,
    l.title,
    l.status,
    l.order_index
FROM academy_lessons l
INNER JOIN first_module fm ON l.module_id = fm.id
WHERE l.status = 'published'
ORDER BY l.order_index;

-- 5. Check RLS is enabled
SELECT 
    'RLS Check' as test,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('academy_modules', 'academy_lessons')
  AND schemaname = 'public';

-- 6. Test a simple query that users would run
SELECT 
    'User Query Test' as test,
    id,
    title,
    status
FROM academy_modules 
WHERE status = 'published'
ORDER BY order_index; 