-- ACADEMY QUICK FIX SCRIPT
-- Run this to fix all known academy database issues in one go

-- =====================================================
-- STEP 1: ENSURE TABLES EXIST
-- =====================================================

-- Create academy_modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS academy_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    cover_image VARCHAR(500),
    slug TEXT,
    lessons_count INTEGER DEFAULT 0,
    total_duration VARCHAR(50) DEFAULT '0m',
    enrolled_students INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    unlock_requirement UUID REFERENCES academy_modules(id),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create academy_lessons table if it doesn't exist
CREATE TABLE IF NOT EXISTS academy_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(50) DEFAULT '0m',
    type VARCHAR(20) DEFAULT 'video' CHECK (type IN ('video', 'text', 'exam')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    order_index INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    video_url VARCHAR(500),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create user_lesson_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    watched_duration INTEGER DEFAULT 0,
    exam_score DECIMAL(5,2),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, lesson_id)
);

-- Create user_module_unlocks table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_module_unlocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES academy_modules(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, module_id)
);

-- =====================================================
-- STEP 2: FIX COLUMN ISSUES
-- =====================================================

-- Add slug column if missing
ALTER TABLE academy_modules ADD COLUMN IF NOT EXISTS slug TEXT;

-- =====================================================
-- STEP 3: ENSURE TEST DATA EXISTS
-- =====================================================

-- Insert test module if no modules exist
INSERT INTO academy_modules (title, description, short_description, status, order_index, slug, lessons_count)
SELECT 
    'Discipline & Identiteit',
    'Leer de fundamenten van discipline en ontdek je ware identiteit als Top Tier Man.',
    'Ontdek discipline en identiteit',
    'published',
    1,
    'discipline-identiteit',
    5
WHERE NOT EXISTS (SELECT 1 FROM academy_modules LIMIT 1);

-- Get the module ID for lessons
DO $$
DECLARE
    discipline_module_id UUID;
BEGIN
    -- Get the first module ID
    SELECT id INTO discipline_module_id 
    FROM academy_modules 
    WHERE status = 'published'
    ORDER BY order_index 
    LIMIT 1;
    
    -- Insert test lessons if no lessons exist
    IF discipline_module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM academy_lessons LIMIT 1) THEN
        INSERT INTO academy_lessons (module_id, title, content, type, status, order_index, duration) VALUES
        (discipline_module_id, 'Introductie tot Discipline', 'Welkom bij de eerste les over discipline en identiteit.', 'text', 'published', 1, '15m'),
        (discipline_module_id, 'De Kracht van Routines', 'Ontdek hoe routines je helpen discipline te ontwikkelen.', 'video', 'published', 2, '20m'),
        (discipline_module_id, 'Identiteit Ontwikkelen', 'Leer hoe je een sterke identiteit kunt opbouwen.', 'text', 'published', 3, '25m'),
        (discipline_module_id, 'Discipline in Praktijk', 'Praktische oefeningen voor dagelijkse discipline.', 'video', 'published', 4, '30m'),
        (discipline_module_id, 'Reflectie en Groei', 'Een moment van reflectie op je groei.', 'exam', 'published', 5, '15m');
    END IF;
END $$;

-- =====================================================
-- STEP 4: UPDATE LESSON COUNTS
-- =====================================================

-- Update lesson counts in modules
UPDATE academy_modules 
SET lessons_count = (
    SELECT COUNT(*) 
    FROM academy_lessons 
    WHERE module_id = academy_modules.id 
    AND status = 'published'
);

-- Update slugs if missing
UPDATE academy_modules 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- =====================================================
-- STEP 5: ENABLE RLS AND POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_unlocks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view published modules" ON academy_modules;
DROP POLICY IF EXISTS "Anyone can view published lessons" ON academy_lessons;
DROP POLICY IF EXISTS "Users can read their own lesson progress" ON user_lesson_progress;
DROP POLICY IF EXISTS "Users can update their own lesson progress" ON user_lesson_progress;
DROP POLICY IF EXISTS "Users can insert their own lesson progress" ON user_lesson_progress;
DROP POLICY IF EXISTS "Users can read their own module unlocks" ON user_module_unlocks;
DROP POLICY IF EXISTS "Users can update their own module unlocks" ON user_module_unlocks;
DROP POLICY IF EXISTS "Users can insert their own module unlocks" ON user_module_unlocks;

-- Create fresh RLS policies
CREATE POLICY "Anyone can view published modules" ON academy_modules
  FOR SELECT USING (status = 'published');

CREATE POLICY "Anyone can view published lessons" ON academy_lessons
  FOR SELECT USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM academy_modules 
      WHERE academy_modules.id = academy_lessons.module_id 
      AND academy_modules.status = 'published'
    )
  );

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

-- =====================================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_academy_modules_status ON academy_modules(status);
CREATE INDEX IF NOT EXISTS idx_academy_modules_order ON academy_modules(order_index);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_module_id ON academy_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_status ON academy_lessons(status);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_unlocks_user_id ON user_module_unlocks(user_id);

-- =====================================================
-- STEP 7: FINAL VERIFICATION
-- =====================================================

-- Show results
SELECT 'FINAL STATUS' as info;
SELECT 'Modules' as type, COUNT(*) as total, COUNT(CASE WHEN status = 'published' THEN 1 END) as published FROM academy_modules
UNION ALL
SELECT 'Lessons' as type, COUNT(*) as total, COUNT(CASE WHEN status = 'published' THEN 1 END) as published FROM academy_lessons;

-- Show first module with lessons
SELECT 
    m.title as module_title,
    m.status as module_status,
    m.lessons_count,
    COUNT(l.id) as actual_lessons
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id AND l.status = 'published'
WHERE m.status = 'published'
GROUP BY m.id, m.title, m.status, m.lessons_count, m.order_index
ORDER BY m.order_index
LIMIT 1; 