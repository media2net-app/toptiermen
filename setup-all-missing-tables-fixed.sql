-- Complete Database Setup Script for Toptiermen Admin Dashboard (FIXED)
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- 1. Add parent_id column to forum_posts for threaded discussions (FIXED for integer ID)
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES forum_posts(id);

-- 2. Add xp_amount column to user_xp for experience points
ALTER TABLE user_xp 
ADD COLUMN IF NOT EXISTS xp_amount INTEGER DEFAULT 0;

-- 3. Create user_academy_progress table for tracking course progress
CREATE TABLE IF NOT EXISTS public.user_academy_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_lessons TEXT[] DEFAULT '{}',
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 4. Create user_training_progress table for tracking workout progress
CREATE TABLE IF NOT EXISTS public.user_training_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    training_id VARCHAR(100) NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_exercises TEXT[] DEFAULT '{}',
    total_workouts INTEGER DEFAULT 0,
    last_workout_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, training_id)
);

-- 5. Create book_reviews table for book ratings and reviews
CREATE TABLE IF NOT EXISTS public.book_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id VARCHAR(100) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_academy_progress_user_id ON user_academy_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_academy_progress_course_id ON user_academy_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_training_progress_user_id ON user_training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_training_progress_training_id ON user_training_progress(training_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user_id ON book_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_book_id ON book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON forum_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_user_xp_xp_amount ON user_xp(xp_amount);

-- 7. Add Row Level Security (RLS) policies
ALTER TABLE user_academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policy for user_academy_progress
CREATE POLICY "Users can view their own academy progress" ON user_academy_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own academy progress" ON user_academy_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own academy progress" ON user_academy_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all academy progress" ON user_academy_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- RLS Policy for user_training_progress
CREATE POLICY "Users can view their own training progress" ON user_training_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training progress" ON user_training_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training progress" ON user_training_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all training progress" ON user_training_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- RLS Policy for book_reviews
CREATE POLICY "Users can view all book reviews" ON book_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own book reviews" ON book_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book reviews" ON book_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all book reviews" ON book_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 8. Add sample data for testing
-- Sample academy progress
INSERT INTO user_academy_progress (user_id, course_id, progress_percentage, completed_lessons)
SELECT 
    id as user_id,
    'mindset-basics' as course_id,
    75 as progress_percentage,
    ARRAY['lesson-1', 'lesson-2', 'lesson-3'] as completed_lessons
FROM auth.users 
WHERE email = 'chiel@media2net.nl'
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Sample training progress
INSERT INTO user_training_progress (user_id, training_id, progress_percentage, completed_exercises, total_workouts)
SELECT 
    id as user_id,
    'strength-basics' as training_id,
    60 as progress_percentage,
    ARRAY['push-ups', 'squats', 'planks'] as completed_exercises,
    12 as total_workouts
FROM auth.users 
WHERE email = 'chiel@media2net.nl'
ON CONFLICT (user_id, training_id) DO NOTHING;

-- Sample book review
INSERT INTO book_reviews (user_id, book_id, rating, review_text)
SELECT 
    id as user_id,
    'canthurtme' as book_id,
    5 as rating,
    'Excellent book on mental toughness!' as review_text
FROM auth.users 
WHERE email = 'chiel@media2net.nl'
ON CONFLICT (user_id, book_id) DO NOTHING;

-- 9. Update existing user_xp records to have xp_amount
UPDATE user_xp 
SET xp_amount = COALESCE(xp_amount, 0)
WHERE xp_amount IS NULL;

-- 10. Add comments for documentation
COMMENT ON TABLE user_academy_progress IS 'Tracks user progress through academy courses';
COMMENT ON TABLE user_training_progress IS 'Tracks user progress through training programs';
COMMENT ON TABLE book_reviews IS 'User reviews and ratings for books in the library';
COMMENT ON COLUMN forum_posts.parent_id IS 'For threaded discussions - references parent post';
COMMENT ON COLUMN user_xp.xp_amount IS 'Experience points earned by user';

-- Success message
SELECT '✅ All database tables and columns have been set up successfully!' as status; 