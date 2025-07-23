-- Fix forum RLS policies to work with anon key
-- This script updates the RLS policies to allow public read access

-- Drop existing policies
DROP POLICY IF EXISTS "Forum categories are viewable by authenticated users" ON forum_categories;
DROP POLICY IF EXISTS "Forum topics are viewable by authenticated users" ON forum_topics;
DROP POLICY IF EXISTS "Forum posts are viewable by authenticated users" ON forum_posts;
DROP POLICY IF EXISTS "Forum likes are viewable by authenticated users" ON forum_likes;
DROP POLICY IF EXISTS "Forum views are viewable by authenticated users" ON forum_views;

-- Create new policies that work with anon key
CREATE POLICY "Forum categories are viewable by all" ON forum_categories
    FOR SELECT USING (true);

CREATE POLICY "Forum topics are viewable by all" ON forum_topics
    FOR SELECT USING (true);

CREATE POLICY "Forum posts are viewable by all" ON forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Forum likes are viewable by all" ON forum_likes
    FOR SELECT USING (true);

CREATE POLICY "Forum views are viewable by all" ON forum_views
    FOR SELECT USING (true);

-- Keep insert/update/delete policies for authenticated users only
CREATE POLICY "Users can create forum topics" ON forum_topics
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own forum topics" ON forum_topics
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum topics" ON forum_topics
    FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can create forum posts" ON forum_posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own forum posts" ON forum_posts
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum posts" ON forum_posts
    FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can create forum likes" ON forum_likes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own forum likes" ON forum_likes
    FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can create forum views" ON forum_views
    FOR INSERT WITH CHECK (auth.role() = 'authenticated'); 