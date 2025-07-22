-- Quick debug check for academy data
-- Run this in Supabase SQL editor

-- Check published modules
SELECT 
    'Published Modules' as type,
    COUNT(*) as count
FROM academy_modules 
WHERE status = 'published';

-- Check published lessons  
SELECT 
    'Published Lessons' as type,
    COUNT(*) as count
FROM academy_lessons 
WHERE status = 'published';

-- List all published modules with their details
SELECT 
    id,
    title,
    status,
    order_index,
    created_at
FROM academy_modules 
WHERE status = 'published'
ORDER BY order_index;

-- Count lessons per published module
SELECT 
    m.title as module_name,
    COUNT(l.id) as lesson_count
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id AND l.status = 'published'
WHERE m.status = 'published'
GROUP BY m.id, m.title
ORDER BY m.order_index; 