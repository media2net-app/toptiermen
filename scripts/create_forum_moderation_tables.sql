-- Forum Moderatie Database Setup
-- Created for Top Tier Men platform

-- 1. FORUM REPORTS TABLE
CREATE TABLE IF NOT EXISTS forum_reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id INTEGER, -- Reference to forum post (if applicable)
  comment_id INTEGER, -- Reference to forum comment (if applicable)
  report_type VARCHAR(50) NOT NULL, -- 'spam', 'inappropriate', 'harassment', 'other'
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  moderator_id UUID REFERENCES auth.users(id), -- Admin who reviewed the report
  moderator_notes TEXT,
  resolution_action VARCHAR(50), -- 'warning', 'suspension', 'ban', 'no_action'
  resolution_duration INTEGER, -- Days of suspension/ban (if applicable)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 2. FORUM MODERATION LOGS TABLE
CREATE TABLE IF NOT EXISTS forum_moderation_logs (
  id SERIAL PRIMARY KEY,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'warning', 'suspension', 'ban', 'post_removal', 'comment_removal'
  target_type VARCHAR(20) NOT NULL, -- 'user', 'post', 'comment'
  target_id INTEGER, -- ID of the target post/comment
  reason TEXT NOT NULL,
  duration INTEGER, -- Days of action (for suspensions/bans)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER MODERATION STATUS TABLE
CREATE TABLE IF NOT EXISTS user_moderation_status (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'warned', 'suspended', 'banned'
  warning_count INTEGER DEFAULT 0,
  suspension_count INTEGER DEFAULT 0,
  ban_count INTEGER DEFAULT 0,
  current_action VARCHAR(20), -- 'none', 'suspension', 'ban'
  action_start_date TIMESTAMP WITH TIME ZONE,
  action_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FORUM CONTENT FLAGS TABLE
CREATE TABLE IF NOT EXISTS forum_content_flags (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(20) NOT NULL, -- 'post', 'comment'
  content_id INTEGER NOT NULL,
  flagged_by_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_type VARCHAR(50) NOT NULL, -- 'inappropriate', 'spam', 'offensive', 'other'
  flag_reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
  reviewed_by_id UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 5. MODERATION RULES TABLE
CREATE TABLE IF NOT EXISTS moderation_rules (
  id SERIAL PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL,
  rule_description TEXT NOT NULL,
  violation_type VARCHAR(50) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'warning', 'suspension', 'ban'
  action_duration INTEGER DEFAULT 0, -- Days (0 for permanent ban)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. FORUM POSTS TABLE (if not exists)
CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'published', -- 'published', 'draft', 'moderated', 'deleted'
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. FORUM COMMENTS TABLE (if not exists)
CREATE TABLE IF NOT EXISTS forum_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES forum_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'published', -- 'published', 'moderated', 'deleted'
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INSERT INITIAL MODERATION RULES
INSERT INTO moderation_rules (rule_name, rule_description, violation_type, action_type, action_duration) VALUES
('Spam Prevention', 'No repetitive or irrelevant content', 'spam', 'warning', 0),
('Harassment Policy', 'No personal attacks or harassment', 'harassment', 'suspension', 7),
('Inappropriate Content', 'No offensive or inappropriate content', 'inappropriate', 'warning', 0),
('Hate Speech', 'No hate speech or discrimination', 'hate_speech', 'ban', 30),
('Multiple Violations', 'Repeated violations of community rules', 'multiple_violations', 'ban', 0);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_forum_reports_status ON forum_reports(status);
CREATE INDEX IF NOT EXISTS idx_forum_reports_reporter ON forum_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_forum_reports_reported ON forum_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reports_created_at ON forum_reports(created_at);

CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderator ON forum_moderation_logs(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target_user ON forum_moderation_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_action_type ON forum_moderation_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON forum_moderation_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_user_moderation_status_user ON user_moderation_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_moderation_status_status ON user_moderation_status(status);

CREATE INDEX IF NOT EXISTS idx_content_flags_content ON forum_content_flags(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_flags_status ON forum_content_flags(status);
CREATE INDEX IF NOT EXISTS idx_content_flags_created_at ON forum_content_flags(created_at);

-- RLS POLICIES
ALTER TABLE forum_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_moderation_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

-- Forum Reports Policies
CREATE POLICY "Users can create reports" ON forum_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON forum_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON forum_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Moderation Logs Policies
CREATE POLICY "Admins can manage moderation logs" ON forum_moderation_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User Moderation Status Policies
CREATE POLICY "Users can view their own moderation status" ON user_moderation_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user moderation status" ON user_moderation_status
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Content Flags Policies
CREATE POLICY "Users can create content flags" ON forum_content_flags
  FOR INSERT WITH CHECK (auth.uid() = flagged_by_id);

CREATE POLICY "Users can view their own flags" ON forum_content_flags
  FOR SELECT USING (auth.uid() = flagged_by_id);

CREATE POLICY "Admins can manage content flags" ON forum_content_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Moderation Rules Policies
CREATE POLICY "Everyone can view moderation rules" ON moderation_rules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage moderation rules" ON moderation_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Forum Posts Policies
CREATE POLICY "Users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can view published posts" ON forum_posts
  FOR SELECT USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all posts" ON forum_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Forum Comments Policies
CREATE POLICY "Users can create comments" ON forum_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can view published comments" ON forum_comments
  FOR SELECT USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON forum_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all comments" ON forum_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- TRIGGERS FOR AUTOMATIC UPDATES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_forum_reports_updated_at 
  BEFORE UPDATE ON forum_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_moderation_status_updated_at 
  BEFORE UPDATE ON user_moderation_status 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moderation_rules_updated_at 
  BEFORE UPDATE ON moderation_rules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at 
  BEFORE UPDATE ON forum_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at 
  BEFORE UPDATE ON forum_comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 