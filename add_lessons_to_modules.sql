-- Add Lessons to Modules
-- Run this SQL in your Supabase SQL editor

-- First, let's see what modules we have
SELECT id, title, status FROM academy_modules WHERE status = 'published' ORDER BY order_index;

-- Now let's add some sample lessons to the first module (Discipline & Identiteit)
DO $$
DECLARE
    discipline_module_id UUID;
    lesson_id UUID;
BEGIN
    -- Get the Discipline & Identiteit module ID
    SELECT id INTO discipline_module_id 
    FROM academy_modules 
    WHERE title = 'Discipline & Identiteit' 
    AND status = 'published'
    LIMIT 1;
    
    IF discipline_module_id IS NOT NULL THEN
        -- Add sample lessons
        INSERT INTO academy_lessons (module_id, title, content, type, status, order_index, duration) VALUES
        (discipline_module_id, 'Introductie tot Discipline', 'Welkom bij de eerste les over discipline en identiteit. In deze les leer je de fundamenten van discipline en hoe je je ware identiteit kunt ontdekken.', 'text', 'published', 1, '15m'),
        (discipline_module_id, 'De Kracht van Dagelijkse Routines', 'Ontdek hoe dagelijkse routines je kunnen helpen om discipline te ontwikkelen en je doelen te bereiken.', 'video', 'published', 2, '20m'),
        (discipline_module_id, 'Identiteit en Zelfbeeld', 'Leer hoe je zelfbeeld je identiteit vormt en hoe je een positief zelfbeeld kunt ontwikkelen.', 'text', 'published', 3, '25m'),
        (discipline_module_id, 'Discipline in Praktijk', 'Praktische oefeningen en technieken om discipline te ontwikkelen in je dagelijks leven.', 'video', 'published', 4, '30m'),
        (discipline_module_id, 'Reflectie en Integratie', 'Een reflectie op wat je hebt geleerd en hoe je dit kunt integreren in je leven.', 'exam', 'published', 5, '15m');
        
        RAISE NOTICE 'Added 5 lessons to module: %', discipline_module_id;
    ELSE
        RAISE NOTICE 'Discipline & Identiteit module not found';
    END IF;
END $$;

-- Update the lessons_count in the modules table
UPDATE academy_modules 
SET lessons_count = (
    SELECT COUNT(*) 
    FROM academy_lessons 
    WHERE module_id = academy_modules.id
    AND status = 'published'
);

-- Verify the result
SELECT 
    m.title as module_title,
    m.lessons_count,
    COUNT(l.id) as actual_lessons
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id AND l.status = 'published'
GROUP BY m.id, m.title, m.lessons_count
ORDER BY m.order_index; 