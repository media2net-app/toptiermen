-- COMPREHENSIVE ACADEMY FIX SCRIPT
-- Run this in your Supabase SQL editor to fix all academy issues

-- ========================================
-- PHASE 1: FIX MODULE SLUGS
-- ========================================

-- 1. Add slug column if it doesn't exist
ALTER TABLE academy_modules ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Update existing modules with slugs based on title
UPDATE academy_modules 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- 3. Make slug unique and not-null
ALTER TABLE academy_modules ALTER COLUMN slug SET NOT NULL;

-- 4. Add unique constraint (drop if exists first)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_module_slug') THEN
        ALTER TABLE academy_modules DROP CONSTRAINT unique_module_slug;
    END IF;
END $$;

ALTER TABLE academy_modules ADD CONSTRAINT unique_module_slug UNIQUE (slug);

-- ========================================
-- PHASE 2: FIX LESSON-MODULE RELATIONSHIPS
-- ========================================

-- 1. Check for orphaned lessons and fix them
UPDATE academy_lessons 
SET module_id = (
    SELECT id 
    FROM academy_modules 
    WHERE title = 'Discipline & Identiteit' 
    LIMIT 1
)
WHERE module_id IS NULL 
   OR module_id NOT IN (SELECT id FROM academy_modules);

-- 2. Update lesson counts in modules table
UPDATE academy_modules 
SET lessons_count = (
    SELECT COUNT(*) 
    FROM academy_lessons 
    WHERE module_id = academy_modules.id
    AND status = 'published'
);

-- ========================================
-- PHASE 3: VERIFY PROGRESS TABLES
-- ========================================

-- 1. Ensure user_lesson_progress table exists with correct structure
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, lesson_id)
);

-- 2. Ensure user_module_unlocks table exists
CREATE TABLE IF NOT EXISTS user_module_unlocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES academy_modules(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, module_id)
);

-- 3. Add RLS policies for progress tables
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_unlocks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own lesson progress" ON user_lesson_progress;
DROP POLICY IF EXISTS "Users can update their own lesson progress" ON user_lesson_progress;
DROP POLICY IF EXISTS "Users can insert their own lesson progress" ON user_lesson_progress;

DROP POLICY IF EXISTS "Users can read their own module unlocks" ON user_module_unlocks;
DROP POLICY IF EXISTS "Users can update their own module unlocks" ON user_module_unlocks;
DROP POLICY IF EXISTS "Users can insert their own module unlocks" ON user_module_unlocks;

-- Create new policies
CREATE POLICY "Users can read their own lesson progress" ON user_lesson_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own lesson progress" ON user_lesson_progress
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own lesson progress" ON user_lesson_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their own module unlocks" ON user_module_unlocks
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own module unlocks" ON user_module_unlocks
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own module unlocks" ON user_module_unlocks
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ========================================
-- PHASE 4: VERIFICATION QUERIES
-- ========================================

-- 1. Show final module state
SELECT '=== FINAL MODULE STATE ===' as info;

SELECT 
    id,
    title,
    slug,
    status,
    order_index,
    lessons_count
FROM academy_modules
ORDER BY order_index;

-- 2. Show lesson-module relationships
SELECT '=== LESSON-MODULE RELATIONSHIPS ===' as info;

SELECT 
    l.id as lesson_id,
    l.title as lesson_title,
    l.status as lesson_status,
    l.module_id,
    m.title as module_title,
    m.slug as module_slug
FROM academy_lessons l
LEFT JOIN academy_modules m ON l.module_id = m.id
WHERE l.status = 'published'
ORDER BY l.order_index;

-- 3. Count lessons per module
SELECT '=== LESSON COUNTS PER MODULE ===' as info;

SELECT 
    m.title as module_title,
    m.slug as module_slug,
    m.lessons_count as stored_count,
    COUNT(l.id) as actual_lessons
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id AND l.status = 'published'
GROUP BY m.id, m.title, m.slug, m.lessons_count
ORDER BY m.order_index;

-- 4. Check for any remaining issues
SELECT '=== REMAINING ISSUES CHECK ===' as info;

-- Check for modules without slugs
SELECT 'Modules without slugs:' as issue, COUNT(*) as count
FROM academy_modules 
WHERE slug IS NULL OR slug = '';

-- Check for orphaned lessons
SELECT 'Orphaned lessons:' as issue, COUNT(*) as count
FROM academy_lessons l
WHERE l.module_id IS NULL 
   OR l.module_id NOT IN (SELECT id FROM academy_modules);

-- Check for modules without lessons
SELECT 'Modules without lessons:' as issue, COUNT(*) as count
FROM academy_modules m
WHERE m.id NOT IN (
    SELECT DISTINCT module_id 
    FROM academy_lessons 
    WHERE module_id IS NOT NULL
);

-- ========================================
-- PHASE 5: TEST DATA FOR DEVELOPMENT
-- ========================================

-- 1. Ensure we have test lessons for the first module
DO $$
DECLARE
    discipline_module_id UUID;
    lesson_count INTEGER;
BEGIN
    -- Get the Discipline & Identiteit module ID
    SELECT id INTO discipline_module_id 
    FROM academy_modules 
    WHERE title = 'Discipline & Identiteit' 
    AND status = 'published'
    LIMIT 1;
    
    -- Count existing lessons
    SELECT COUNT(*) INTO lesson_count
    FROM academy_lessons 
    WHERE module_id = discipline_module_id 
    AND status = 'published';
    
    -- Add test lessons if none exist
    IF lesson_count = 0 AND discipline_module_id IS NOT NULL THEN
        INSERT INTO academy_lessons (module_id, title, content, type, status, order_index, duration) VALUES
        (discipline_module_id, 'Introductie tot Discipline', 'Welkom bij de eerste les over discipline en identiteit.', 'text', 'published', 1, '15m'),
        (discipline_module_id, 'De Kracht van Dagelijkse Routines', 'Ontdek hoe dagelijkse routines je kunnen helpen om discipline te ontwikkelen.', 'video', 'published', 2, '20m'),
        (discipline_module_id, 'Identiteit en Zelfbeeld', 'Leer hoe je zelfbeeld je identiteit vormt en hoe je een positief zelfbeeld kunt ontwikkelen.', 'text', 'published', 3, '25m');
        
        RAISE NOTICE 'Added 3 test lessons to module: %', discipline_module_id;
    ELSE
        RAISE NOTICE 'Module has % lessons, no need to add test data', lesson_count;
    END IF;
END $$;

-- 2. Update lesson counts again
UPDATE academy_modules 
SET lessons_count = (
    SELECT COUNT(*) 
    FROM academy_lessons 
    WHERE module_id = academy_modules.id
    AND status = 'published'
);

-- ========================================
-- FINAL VERIFICATION
-- ========================================

SELECT '=== ACADEMY FIX COMPLETE ===' as info;

-- Show summary
SELECT 
    'Published Modules' as type,
    COUNT(*) as count
FROM academy_modules 
WHERE status = 'published'

UNION ALL

SELECT 
    'Published Lessons' as type,
    COUNT(*) as count
FROM academy_lessons 
WHERE status = 'published'

UNION ALL

SELECT 
    'Modules with Slugs' as type,
    COUNT(*) as count
FROM academy_modules 
WHERE slug IS NOT NULL AND slug != '';

-- Show all published modules ready for testing
SELECT '=== READY FOR TESTING ===' as info;

SELECT 
    m.id,
    m.title,
    m.slug,
    m.lessons_count,
    COUNT(l.id) as actual_lessons
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id AND l.status = 'published'
WHERE m.status = 'published'
GROUP BY m.id, m.title, m.slug, m.lessons_count
ORDER BY m.order_index; 