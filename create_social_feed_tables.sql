-- Create social feed posts table
CREATE TABLE IF NOT EXISTS social_feed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT,
  media_type VARCHAR(10) CHECK (media_type IN ('image', 'video')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_post_of_the_week BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  is_announcement BOOLEAN DEFAULT false,
  cta_button_text VARCHAR(100),
  cta_button_link TEXT,
  reach_count INTEGER DEFAULT 0,
  impressions_count INTEGER DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social feed comments table
CREATE TABLE IF NOT EXISTS social_feed_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES social_feed_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social feed reports table
CREATE TABLE IF NOT EXISTS social_feed_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES social_feed_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES social_feed_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  moderator_id UUID REFERENCES auth.users(id),
  moderator_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social feed likes table
CREATE TABLE IF NOT EXISTS social_feed_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES social_feed_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES social_feed_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id),
  UNIQUE(comment_id, user_id),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Create social feed notifications table
CREATE TABLE IF NOT EXISTS social_feed_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('report', 'spam', 'engagement', 'system')),
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social feed engagement tracking table
CREATE TABLE IF NOT EXISTS social_feed_engagement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES social_feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('view', 'like', 'comment', 'share', 'click')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_feed_posts_author ON social_feed_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_posts_status ON social_feed_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_feed_posts_created ON social_feed_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_social_feed_posts_pinned ON social_feed_posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_social_feed_comments_post ON social_feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_comments_author ON social_feed_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_reports_post ON social_feed_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_reports_status ON social_feed_reports(status);
CREATE INDEX IF NOT EXISTS idx_social_feed_reports_priority ON social_feed_reports(priority);
CREATE INDEX IF NOT EXISTS idx_social_feed_likes_post ON social_feed_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_likes_user ON social_feed_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_notifications_user ON social_feed_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_notifications_read ON social_feed_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_social_feed_engagement_post ON social_feed_engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_engagement_user ON social_feed_engagement(user_id);

-- Enable Row Level Security
ALTER TABLE social_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed_engagement ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Posts: Public read active, author write own, admin all
CREATE POLICY "Posts public read" ON social_feed_posts FOR SELECT USING (status = 'active');
CREATE POLICY "Posts author write" ON social_feed_posts FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Posts admin all" ON social_feed_posts FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Comments: Public read active, author write own, admin all
CREATE POLICY "Comments public read" ON social_feed_comments FOR SELECT USING (status = 'active');
CREATE POLICY "Comments author write" ON social_feed_comments FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Comments admin all" ON social_feed_comments FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Reports: User can create, admin can read/write all
CREATE POLICY "Reports user create" ON social_feed_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reports user read own" ON social_feed_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Reports admin all" ON social_feed_reports FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Likes: User can read/write own, admin can read all
CREATE POLICY "Likes user own" ON social_feed_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Likes admin read" ON social_feed_likes FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Notifications: User can read/write own, admin can read all
CREATE POLICY "Notifications user own" ON social_feed_notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Notifications admin read" ON social_feed_notifications FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Engagement: User can read/write own, admin can read all
CREATE POLICY "Engagement user own" ON social_feed_engagement FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Engagement admin read" ON social_feed_engagement FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Insert sample data
INSERT INTO social_feed_posts (content, author_id, likes_count, comments_count, is_announcement) VALUES
('Welkom bij Top Tier Men! Laten we samen groeien en onze doelen bereiken. 💪', (SELECT id FROM auth.users LIMIT 1), 15, 8, true),
('Net mijn workout afgerond. Discipline is de sleutel tot succes! 🔥', (SELECT id FROM auth.users LIMIT 1), 23, 12, false),
('Tips voor een gezonde levensstijl: consistentie boven perfectie!', (SELECT id FROM auth.users LIMIT 1), 18, 6, false)
ON CONFLICT DO NOTHING;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_social_feed_posts_updated_at BEFORE UPDATE ON social_feed_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_feed_comments_updated_at BEFORE UPDATE ON social_feed_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_feed_reports_updated_at BEFORE UPDATE ON social_feed_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON social_feed_posts TO authenticated;
GRANT ALL ON social_feed_comments TO authenticated;
GRANT ALL ON social_feed_reports TO authenticated;
GRANT ALL ON social_feed_likes TO authenticated;
GRANT ALL ON social_feed_notifications TO authenticated;
GRANT ALL ON social_feed_engagement TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 