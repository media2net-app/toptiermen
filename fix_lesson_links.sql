-- Eenvoudig script om lessen te koppelen aan modules
-- Run dit script in je Supabase SQL editor

-- 1. Update alle lessen om ze te koppelen aan de "Discipline & Identiteit" module
UPDATE academy_lessons 
SET module_id = (
    SELECT id 
    FROM academy_modules 
    WHERE title = 'Discipline & Identiteit' 
    LIMIT 1
)
WHERE module_id IS NULL 
   OR module_id NOT IN (SELECT id FROM academy_modules);

-- 2. Update de lessons_count in de modules tabel
UPDATE academy_modules 
SET lessons_count = (
    SELECT COUNT(*) 
    FROM academy_lessons 
    WHERE module_id = academy_modules.id
);

-- 3. Controleer het resultaat
SELECT 
    m.title as module_title,
    m.lessons_count,
    COUNT(l.id) as actual_lessons
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id
GROUP BY m.id, m.title, m.lessons_count
ORDER BY m.order_index; 