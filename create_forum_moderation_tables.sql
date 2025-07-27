-- =====================================================
-- FORUM MODERATION DATABASE SETUP
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. FORUM REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS forum_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    moderator_notes TEXT,
    resolution VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 2. FORUM MODERATION LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS forum_moderation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
    target_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. FORUM POST FLAGS TABLE (for additional flagging)
-- =====================================================
CREATE TABLE IF NOT EXISTS forum_post_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flag_type VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, flag_type)
);

-- =====================================================
-- 4. INSERT INITIAL DATA
-- =====================================================

-- Insert sample forum reports
INSERT INTO forum_reports (post_id, reporter_id, reason, description, status, moderator_notes, resolution) VALUES
((SELECT id FROM forum_posts LIMIT 1 OFFSET 0),
 (SELECT id FROM users LIMIT 1), 'Spam', 'Dit lijkt op spam content', 'pending', NULL, NULL),

((SELECT id FROM forum_posts LIMIT 1 OFFSET 1),
 (SELECT id FROM users LIMIT 1), 'Inappropriate Content', 'Ongepaste taal en inhoud', 'investigating', 'Onderzoek gestart', NULL),

((SELECT id FROM forum_posts LIMIT 1 OFFSET 2),
 (SELECT id FROM users LIMIT 1), 'Harassment', 'Pesterij van andere gebruiker', 'resolved', 'Post verwijderd en gebruiker gewaarschuwd', 'Post verwijderd'),

((SELECT id FROM forum_posts LIMIT 1 OFFSET 3),
 (SELECT id FROM users LIMIT 1), 'Misinformation', 'Onjuiste informatie verspreid', 'dismissed', 'Geen schending gevonden', 'Geen actie nodig')
ON CONFLICT DO NOTHING;

-- Insert sample moderation logs
INSERT INTO forum_moderation_logs (moderator_id, action, target_type, target_id, details) VALUES
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'post_deleted', 'post', 
 (SELECT id FROM forum_posts LIMIT 1 OFFSET 0), '{"reason": "Spam content", "user_warned": true}'),

((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'user_warned', 'user',
 (SELECT id FROM users LIMIT 1), '{"warning_type": "harassment", "duration": "7d"}'),

((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'post_approved', 'post',
 (SELECT id FROM forum_posts LIMIT 1 OFFSET 1), '{"reason": "False report"}')
ON CONFLICT DO NOTHING;

-- Insert sample post flags
INSERT INTO forum_post_flags (post_id, user_id, flag_type, reason) VALUES
((SELECT id FROM forum_posts LIMIT 1 OFFSET 0),
 (SELECT id FROM users LIMIT 1), 'spam', 'Reclame content'),

((SELECT id FROM forum_posts LIMIT 1 OFFSET 1),
 (SELECT id FROM users LIMIT 1), 'inappropriate', 'Ongepaste taal'),

((SELECT id FROM forum_posts LIMIT 1 OFFSET 2),
 (SELECT id FROM users LIMIT 1), 'misinformation', 'Onjuiste feiten')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE forum_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_flags ENABLE ROW LEVEL SECURITY;

-- Forum reports: Users can read their own reports, admins can read all
CREATE POLICY "forum_reports_read_policy" ON forum_reports
    FOR SELECT USING (
        auth.uid() = reporter_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "forum_reports_insert_policy" ON forum_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "forum_reports_update_policy" ON forum_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Moderation logs: Only admins can access
CREATE POLICY "forum_moderation_logs_read_policy" ON forum_moderation_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "forum_moderation_logs_insert_policy" ON forum_moderation_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Post flags: Users can read their own flags, admins can read all
CREATE POLICY "forum_post_flags_read_policy" ON forum_post_flags
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "forum_post_flags_insert_policy" ON forum_post_flags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Forum reports indexes
CREATE INDEX IF NOT EXISTS idx_forum_reports_post_id ON forum_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_reports_reporter_id ON forum_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_forum_reports_status ON forum_reports(status);
CREATE INDEX IF NOT EXISTS idx_forum_reports_created_at ON forum_reports(created_at);

-- Moderation logs indexes
CREATE INDEX IF NOT EXISTS idx_forum_moderation_logs_moderator_id ON forum_moderation_logs(moderator_id);
CREATE INDEX IF NOT EXISTS idx_forum_moderation_logs_action ON forum_moderation_logs(action);
CREATE INDEX IF NOT EXISTS idx_forum_moderation_logs_target_type ON forum_moderation_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_forum_moderation_logs_created_at ON forum_moderation_logs(created_at);

-- Post flags indexes
CREATE INDEX IF NOT EXISTS idx_forum_post_flags_post_id ON forum_post_flags(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_flags_user_id ON forum_post_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_flags_flag_type ON forum_post_flags(flag_type);

-- =====================================================
-- 7. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_forum_reports_updated_at
    BEFORE UPDATE ON forum_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log moderation actions
CREATE OR REPLACE FUNCTION log_moderation_action()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
        INSERT INTO forum_moderation_logs (moderator_id, action, target_type, target_id, details)
        VALUES (
            NEW.moderator_id,
            CASE 
                WHEN NEW.status = 'resolved' THEN 'report_resolved'
                WHEN NEW.status = 'dismissed' THEN 'report_dismissed'
                ELSE 'report_updated'
            END,
            'post',
            NEW.post_id,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'resolution', NEW.resolution
            )
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for moderation logging
CREATE TRIGGER forum_reports_moderation_log_trigger
    AFTER UPDATE ON forum_reports
    FOR EACH ROW EXECUTE FUNCTION log_moderation_action();

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 'forum_reports' as table_name, COUNT(*) as row_count FROM forum_reports
UNION ALL
SELECT 'forum_moderation_logs' as table_name, COUNT(*) as row_count FROM forum_moderation_logs
UNION ALL
SELECT 'forum_post_flags' as table_name, COUNT(*) as row_count FROM forum_post_flags;

-- Check if RLS policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('forum_reports', 'forum_moderation_logs', 'forum_post_flags');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Forum moderation database setup voltooid!';
    RAISE NOTICE '🚨 % forum reports aangemaakt', (SELECT COUNT(*) FROM forum_reports);
    RAISE NOTICE '📝 % moderation logs aangemaakt', (SELECT COUNT(*) FROM forum_moderation_logs);
    RAISE NOTICE '🚩 % post flags aangemaakt', (SELECT COUNT(*) FROM forum_post_flags);
    RAISE NOTICE '🔒 RLS policies geactiveerd voor beveiliging';
    RAISE NOTICE '⚡ Performance indexes aangemaakt';
END $$; 