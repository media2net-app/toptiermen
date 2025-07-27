-- =====================================================
-- ANNOUNCEMENTS DATABASE SETUP
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ANNOUNCEMENT CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS announcement_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#8BAE5A',
    icon VARCHAR(50),
    announcement_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES announcement_categories(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    publish_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ANNOUNCEMENT VIEWS TABLE (for tracking views)
-- =====================================================
CREATE TABLE IF NOT EXISTS announcement_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(announcement_id, user_id)
);

-- =====================================================
-- 4. INSERT INITIAL DATA
-- =====================================================

-- Insert announcement categories
INSERT INTO announcement_categories (name, description, color, icon) VALUES
('Algemeen', 'Algemene aankondigingen voor alle leden', '#8BAE5A', '📢'),
('Evenementen', 'Aankondigingen over aankomende evenementen', '#FFD700', '🎉'),
('Training', 'Updates over trainingen en workouts', '#f0a14f', '💪'),
('Brotherhood', 'Brotherhood-specifieke updates', '#FF6B6B', '🤝'),
('Academy', 'Nieuwe lessen en academy updates', '#4ECDC4', '📚'),
('Financiën', 'Financiële updates en tips', '#9B59B6', '💰'),
('Mindset', 'Mindset en motivatie updates', '#1ABC9C', '🧠')
ON CONFLICT (name) DO NOTHING;

-- Insert sample announcements
INSERT INTO announcements (title, content, category_id, author_id, status, priority, is_pinned, is_featured, view_count) VALUES
('Welkom bij de Brotherhood!', 'Welkom bij onze community! We zijn verheugd om je te verwelkomen in onze Brotherhood. Hier vind je alles wat je nodig hebt om te groeien op alle gebieden van je leven.', 
 (SELECT id FROM announcement_categories WHERE name = 'Algemeen' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'published', 'high', TRUE, TRUE, 45),

('Nieuw Academy Module: Financiële Vrijheid', 'We hebben een gloednieuwe module toegevoegd aan de Academy: "Financiële Vrijheid". Leer hoe je passief inkomen kunt opbouwen en financiële onafhankelijkheid kunt bereiken.',
 (SELECT id FROM announcement_categories WHERE name = 'Academy' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'published', 'normal', FALSE, TRUE, 23),

('Brotherhood Meetup - 15 December', 'Join us voor onze maandelijkse Brotherhood meetup! Deze keer focussen we op het delen van successen en het stellen van nieuwe doelen voor 2024.',
 (SELECT id FROM announcement_categories WHERE name = 'Evenementen' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'published', 'high', FALSE, FALSE, 18),

('Nieuwe Workout Schema Beschikbaar', 'Een nieuw 12-weken transformatie schema is nu beschikbaar in het Trainingscentrum. Perfect voor iedereen die zijn fysieke doelen wil bereiken.',
 (SELECT id FROM announcement_categories WHERE name = 'Training' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'published', 'normal', FALSE, FALSE, 12),

('Mindset Challenge: 30 Dagen Discipline', 'Start vandaag nog met onze 30-dagen discipline challenge! Elke dag een nieuwe uitdaging om je mentale weerbaarheid te versterken.',
 (SELECT id FROM announcement_categories WHERE name = 'Mindset' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'published', 'normal', FALSE, TRUE, 31)
ON CONFLICT (title) DO NOTHING;

-- =====================================================
-- 5. UPDATE ANNOUNCEMENT COUNTS
-- =====================================================

-- Update announcement counts in categories
UPDATE announcement_categories
SET announcement_count = (
    SELECT COUNT(*)
    FROM announcements
    WHERE announcements.category_id = announcement_categories.id
    AND announcements.status = 'published'
);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE announcement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;

-- Announcement categories: Everyone can read, only admins can write
CREATE POLICY "announcement_categories_read_policy" ON announcement_categories
    FOR SELECT USING (true);

CREATE POLICY "announcement_categories_write_policy" ON announcement_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Announcements: Everyone can read published, authors can edit their own, admins can do everything
CREATE POLICY "announcements_read_policy" ON announcements
    FOR SELECT USING (
        status = 'published' OR
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "announcements_insert_policy" ON announcements
    FOR INSERT WITH CHECK (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "announcements_update_policy" ON announcements
    FOR UPDATE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "announcements_delete_policy" ON announcements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Announcement views: Users can read their own views, admins can read all
CREATE POLICY "announcement_views_read_policy" ON announcement_views
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "announcement_views_insert_policy" ON announcement_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_category_id ON announcements(category_id);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_publish_at ON announcements(publish_at);
CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned ON announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_is_featured ON announcements(is_featured);

-- Announcement views indexes
CREATE INDEX IF NOT EXISTS idx_announcement_views_announcement_id ON announcement_views(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_views_user_id ON announcement_views(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_views_viewed_at ON announcement_views(viewed_at);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_announcement_categories_name ON announcement_categories(name);

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
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
CREATE TRIGGER update_announcement_categories_updated_at
    BEFORE UPDATE ON announcement_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update announcement count in categories
CREATE OR REPLACE FUNCTION update_announcement_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE announcement_categories
        SET announcement_count = announcement_count + 1
        WHERE id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE announcement_categories
        SET announcement_count = announcement_count - 1
        WHERE id = OLD.category_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.category_id != OLD.category_id THEN
            UPDATE announcement_categories
            SET announcement_count = announcement_count - 1
            WHERE id = OLD.category_id;
            UPDATE announcement_categories
            SET announcement_count = announcement_count + 1
            WHERE id = NEW.category_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for announcement count
CREATE TRIGGER update_announcement_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_announcement_count();

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 'announcement_categories' as table_name, COUNT(*) as row_count FROM announcement_categories
UNION ALL
SELECT 'announcements' as table_name, COUNT(*) as row_count FROM announcements
UNION ALL
SELECT 'announcement_views' as table_name, COUNT(*) as row_count FROM announcement_views;

-- Check if RLS policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('announcement_categories', 'announcements', 'announcement_views');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Announcements database setup voltooid!';
    RAISE NOTICE '📢 % announcement categorieën aangemaakt', (SELECT COUNT(*) FROM announcement_categories);
    RAISE NOTICE '📢 % aankondigingen toegevoegd', (SELECT COUNT(*) FROM announcements);
    RAISE NOTICE '👁️ % views geregistreerd', (SELECT COUNT(*) FROM announcement_views);
    RAISE NOTICE '🔒 RLS policies geactiveerd voor beveiliging';
    RAISE NOTICE '⚡ Performance indexes aangemaakt';
END $$; 