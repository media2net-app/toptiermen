-- SQL Script om lessen correct te koppelen aan modules
-- Run dit script in je Supabase SQL editor

-- Stap 1: Bekijk welke modules er zijn
SELECT id, title, status FROM academy_modules ORDER BY order_index;

-- Stap 2: Bekijk welke lessen er zijn en hun huidige module_id
SELECT 
    l.id,
    l.title,
    l.module_id,
    m.title as module_title
FROM academy_lessons l
LEFT JOIN academy_modules m ON l.module_id = m.id
ORDER BY l.order_index;

-- Stap 3: Update alle lessen om ze te koppelen aan de juiste module
-- Eerst: Discipline & Identiteit module ID ophalen
DO $$
DECLARE
    discipline_module_id UUID;
BEGIN
    -- Haal de module ID op voor "Discipline & Identiteit"
    SELECT id INTO discipline_module_id 
    FROM academy_modules 
    WHERE title = 'Discipline & Identiteit' 
    LIMIT 1;
    
    -- Update alle lessen om ze te koppelen aan deze module
    UPDATE academy_lessons 
    SET module_id = discipline_module_id
    WHERE module_id IS NULL OR module_id NOT IN (SELECT id FROM academy_modules);
    
    RAISE NOTICE 'Lessen gekoppeld aan module ID: %', discipline_module_id;
END $$;

-- Stap 4: Controleer het resultaat
SELECT 
    l.id,
    l.title,
    l.module_id,
    m.title as module_title,
    l.status,
    l.order_index
FROM academy_lessons l
LEFT JOIN academy_modules m ON l.module_id = m.id
ORDER BY l.order_index;

-- Stap 5: Update de lessons_count in de modules tabel
UPDATE academy_modules 
SET lessons_count = (
    SELECT COUNT(*) 
    FROM academy_lessons 
    WHERE module_id = academy_modules.id
);

-- Stap 6: Controleer de finale status
SELECT 
    m.title as module_title,
    m.lessons_count,
    COUNT(l.id) as actual_lessons
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id
GROUP BY m.id, m.title, m.lessons_count
ORDER BY m.order_index; 