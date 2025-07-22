-- Quick Academy RLS Fix
-- Run this in your Supabase SQL editor to fix RLS policies

-- 1. Enable RLS on academy tables
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published modules" ON academy_modules;
DROP POLICY IF EXISTS "Anyone can view lessons from published modules" ON academy_lessons;

-- 3. Create simple policies that allow viewing published content
-- Everyone can view published modules
CREATE POLICY "Anyone can view published modules" ON academy_modules
  FOR SELECT USING (status = 'published');

-- Everyone can view lessons from published modules
CREATE POLICY "Anyone can view lessons from published modules" ON academy_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM academy_modules 
      WHERE academy_modules.id = academy_lessons.module_id 
      AND academy_modules.status = 'published'
    )
  );

-- 4. Add some test data if no modules exist
DO $$
DECLARE
    module_count INTEGER;
BEGIN
    -- Check if we have any modules
    SELECT COUNT(*) INTO module_count FROM academy_modules;
    
    -- If no modules exist, add some test data
    IF module_count = 0 THEN
        INSERT INTO academy_modules (title, description, short_description, status, order_index) VALUES
        ('Discipline & Identiteit', 'Leer hoe je discipline ontwikkelt en je ware identiteit ontdekt.', 'Ontwikkel discipline en ontdek je ware identiteit', 'published', 1),
        ('Fysieke Dominantie', 'Bouw een sterk, gezond lichaam en ontwikkel fysieke kracht.', 'Bouw een sterk en gezond lichaam', 'published', 2),
        ('Mindset & Focus', 'Ontwikkel een groei mindset en verbeter je focus.', 'Ontwikkel een groei mindset en verbeter je focus', 'published', 3);
        
        RAISE NOTICE 'Added 3 test modules';
    ELSE
        RAISE NOTICE 'Modules already exist: %', module_count;
    END IF;
END $$;

-- 5. Add test lessons if no lessons exist
DO $$
DECLARE
    lesson_count INTEGER;
    discipline_module_id UUID;
BEGIN
    -- Check if we have any lessons
    SELECT COUNT(*) INTO lesson_count FROM academy_lessons;
    
    -- If no lessons exist, add some test lessons
    IF lesson_count = 0 THEN
        -- Get the first module ID
        SELECT id INTO discipline_module_id 
        FROM academy_modules 
        WHERE status = 'published' 
        ORDER BY order_index 
        LIMIT 1;
        
        IF discipline_module_id IS NOT NULL THEN
            INSERT INTO academy_lessons (module_id, title, content, type, status, order_index, duration) VALUES
            (discipline_module_id, 'Introductie tot Discipline', 'Welkom bij de eerste les over discipline en identiteit.', 'text', 'published', 1, '15m'),
            (discipline_module_id, 'De Kracht van Dagelijkse Routines', 'Ontdek hoe dagelijkse routines je kunnen helpen om discipline te ontwikkelen.', 'video', 'published', 2, '20m'),
            (discipline_module_id, 'Identiteit en Zelfbeeld', 'Leer hoe je zelfbeeld je identiteit vormt en hoe je een positief zelfbeeld kunt ontwikkelen.', 'text', 'published', 3, '25m');
            
            RAISE NOTICE 'Added 3 test lessons to module: %', discipline_module_id;
        END IF;
    ELSE
        RAISE NOTICE 'Lessons already exist: %', lesson_count;
    END IF;
END $$;

-- 6. Verify the fix
SELECT 
    '=== VERIFICATION ===' as info;

SELECT 
    'Published modules:' as type,
    COUNT(*) as count
FROM academy_modules 
WHERE status = 'published'
UNION ALL
SELECT 
    'Published lessons:' as type,
    COUNT(*) as count
FROM academy_lessons 
WHERE status = 'published'; 