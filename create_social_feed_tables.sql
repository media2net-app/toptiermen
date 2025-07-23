-- Create social feed tables
-- This script creates the necessary tables for social feed functionality

-- Social Feed Posts table
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    post_type VARCHAR(50) DEFAULT 'text' CHECK (post_type IN ('text', 'checkin', 'achievement', 'question', 'motivation')),
    location VARCHAR(255),
    image_url TEXT,
    video_url TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Feed Likes table
CREATE TABLE IF NOT EXISTS social_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    like_type VARCHAR(20) DEFAULT 'boks' CHECK (like_type IN ('boks', 'fire', 'respect', 'love')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Social Feed Comments table
CREATE TABLE IF NOT EXISTS social_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES social_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Feed Follows table (for following other users)
CREATE TABLE IF NOT EXISTS social_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_post_type ON social_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_social_likes_post_id ON social_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_user_id ON social_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user_id ON social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_follower_id ON social_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_following_id ON social_follows(following_id);

-- Enable Row Level Security
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_posts
CREATE POLICY "Users can view public posts" ON social_posts
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own posts" ON social_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts" ON social_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON social_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON social_posts
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social_likes
CREATE POLICY "Users can view likes" ON social_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create likes" ON social_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON social_likes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social_comments
CREATE POLICY "Users can view comments" ON social_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON social_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON social_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON social_comments
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social_follows
CREATE POLICY "Users can view follows" ON social_follows
    FOR SELECT USING (true);

CREATE POLICY "Users can create follows" ON social_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON social_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- Insert some sample data
INSERT INTO social_posts (user_id, content, post_type, tags) VALUES
    ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '✅ Check-in: Meditatie en koude douche zijn binnen. Voelt goed om de dag zo te starten. Nu focussen op deep work. Wat is jullie #1 doel voor vandaag?', 'checkin', ARRAY['meditatie', 'koude-douche', 'deep-work']),
    ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', '🔥 Net mijn PR gehaald op deadlift! 140kg voor 3 reps. Discipline betaalt zich uit. #progress #strength', 'achievement', ARRAY['deadlift', 'pr', 'strength']),
    ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '💪 Vraag voor de Brotherhood: Wat is jullie favoriete manier om te herstellen na een zware training? Ik ben benieuwd naar jullie routines!', 'question', ARRAY['recovery', 'training', 'routine']),
    ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', '📚 Net "Atomic Habits" uitgelezen. Game changer voor mijn productiviteit. Aanrader voor iedereen die zijn gewoontes wil verbeteren!', 'text', ARRAY['atomic-habits', 'productiviteit', 'gewoontes']),
    ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '🎯 Mijn doel voor deze week: 5 dagen consistent mediteren en 3x trainen. Wie doet er mee? #accountability', 'motivation', ARRAY['meditatie', 'training', 'accountability']);

-- Insert some sample likes
INSERT INTO social_likes (post_id, user_id, like_type) VALUES
    ((SELECT id FROM social_posts WHERE content LIKE '%Check-in%' LIMIT 1), '061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'boks'),
    ((SELECT id FROM social_posts WHERE content LIKE '%PR gehaald%' LIMIT 1), '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'fire'),
    ((SELECT id FROM social_posts WHERE content LIKE '%Atomic Habits%' LIMIT 1), '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'respect');

-- Insert some sample comments
INSERT INTO social_comments (post_id, user_id, content) VALUES
    ((SELECT id FROM social_posts WHERE content LIKE '%Check-in%' LIMIT 1), '061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Goed bezig! Ik ga vandaag ook mediteren. 💪'),
    ((SELECT id FROM social_posts WHERE content LIKE '%PR gehaald%' LIMIT 1), '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Sterk! 140kg is indrukwekkend. 🔥'),
    ((SELECT id FROM social_posts WHERE content LIKE '%Atomic Habits%' LIMIT 1), '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Eens! Dat boek heeft mijn leven veranderd.');

-- Insert some sample follows
INSERT INTO social_follows (follower_id, following_id) VALUES
    ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'),
    ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '061e43d5-c89a-42bb-8a4c-04be2ce99a7e');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_comments_updated_at BEFORE UPDATE ON social_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 