-- Add RLS policies for forum tables
-- This script enables Row Level Security and adds appropriate policies

-- Enable RLS on all forum tables
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_views ENABLE ROW LEVEL SECURITY;

-- Forum categories policies (read-only for all authenticated users)
CREATE POLICY "Forum categories are viewable by authenticated users" ON forum_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Forum topics policies
CREATE POLICY "Forum topics are viewable by authenticated users" ON forum_topics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create forum topics" ON forum_topics
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own forum topics" ON forum_topics
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum topics" ON forum_topics
    FOR DELETE USING (auth.uid() = author_id);

-- Forum posts policies
CREATE POLICY "Forum posts are viewable by authenticated users" ON forum_posts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create forum posts" ON forum_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own forum posts" ON forum_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum posts" ON forum_posts
    FOR DELETE USING (auth.uid() = author_id);

-- Forum likes policies
CREATE POLICY "Forum likes are viewable by authenticated users" ON forum_likes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create forum likes" ON forum_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forum likes" ON forum_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Forum views policies
CREATE POLICY "Forum views are viewable by authenticated users" ON forum_views
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create forum views" ON forum_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies (for moderators and admins)
-- These policies allow admins to manage all content
CREATE POLICY "Admins can manage all forum content" ON forum_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Admins can manage all forum posts" ON forum_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Admins can manage all forum likes" ON forum_likes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Admins can manage all forum views" ON forum_views
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'moderator')
        )
    ); 