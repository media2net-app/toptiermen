-- =====================================================
-- EVENTS MANAGEMENT DATABASE SETUP
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. EVENT CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS event_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#8BAE5A',
    icon VARCHAR(50),
    event_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES event_categories(id) ON DELETE SET NULL,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. EVENT PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled', 'waitlist')),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(event_id, user_id)
);

-- =====================================================
-- 4. EVENT COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS event_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES event_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. INSERT INITIAL DATA
-- =====================================================

-- Insert event categories
INSERT INTO event_categories (name, description, color, icon) VALUES
('Brotherhood Meetups', 'Regelmatige meetups voor Brotherhood leden', '#FF6B6B', '🤝'),
('Training Events', 'Fysieke trainingen en workouts', '#f0a14f', '💪'),
('Mindset Workshops', 'Workshops over mindset en persoonlijke ontwikkeling', '#1ABC9C', '🧠'),
('Business Networking', 'Networking events voor ondernemers', '#9B59B6', '💼'),
('Social Events', 'Informele sociale bijeenkomsten', '#3498DB', '🎉'),
('Educational Sessions', 'Leerzame sessies en presentaties', '#4ECDC4', '📚')
ON CONFLICT (name) DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, category_id, organizer_id, location, start_date, end_date, max_participants, current_participants, status, is_featured, registration_deadline, cover_image_url) VALUES
('Brotherhood Meetup - Amsterdam', 'Maandelijkse Brotherhood meetup in Amsterdam. We delen successen, stellen nieuwe doelen en bouwen aan onze community.',
 (SELECT id FROM event_categories WHERE name = 'Brotherhood Meetups' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'Amsterdam, Nederland', '2024-02-15 19:00:00+01', '2024-02-15 22:00:00+01', 50, 12, 'upcoming', TRUE, '2024-02-14 18:00:00+01', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop'),

('Outdoor Training Challenge', 'Intensieve outdoor training sessie in het bos. We gaan de grenzen verleggen en samen sterker worden.',
 (SELECT id FROM event_categories WHERE name = 'Training Events' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'Amsterdamse Bos, Nederland', '2024-02-20 08:00:00+01', '2024-02-20 11:00:00+01', 30, 8, 'upcoming', FALSE, '2024-02-19 20:00:00+01', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop'),

('Mindset Masterclass: Discipline', 'Een diepgaande workshop over het ontwikkelen van discipline en doorzettingsvermogen in alle aspecten van je leven.',
 (SELECT id FROM event_categories WHERE name = 'Mindset Workshops' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'Online (Zoom)', '2024-02-25 20:00:00+01', '2024-02-25 22:00:00+01', 100, 45, 'upcoming', TRUE, '2024-02-24 20:00:00+01', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop'),

('Business Networking Lunch', 'Networking lunch voor ondernemers en professionals. Uitwisselen van ervaringen en het opbouwen van waardevolle connecties.',
 (SELECT id FROM event_categories WHERE name = 'Business Networking' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'Rotterdam, Nederland', '2024-03-01 12:00:00+01', '2024-03-01 15:00:00+01', 25, 18, 'upcoming', FALSE, '2024-02-29 12:00:00+01', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop'),

('Brotherhood BBQ & Social', 'Informele BBQ en sociale bijeenkomst voor alle Brotherhood leden. Goed eten, gezelligheid en het versterken van onze banden.',
 (SELECT id FROM event_categories WHERE name = 'Social Events' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'Utrecht, Nederland', '2024-03-10 16:00:00+01', '2024-03-10 22:00:00+01', 40, 22, 'upcoming', TRUE, '2024-03-09 16:00:00+01', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop')
ON CONFLICT (title) DO NOTHING;

-- Insert sample participants
INSERT INTO event_participants (event_id, user_id, status, registration_date) VALUES
((SELECT id FROM events WHERE title LIKE '%Amsterdam%' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'confirmed', '2024-01-15 10:00:00+01'),

((SELECT id FROM events WHERE title LIKE '%Amsterdam%' LIMIT 1),
 (SELECT id FROM users LIMIT 1 OFFSET 1), 'registered', '2024-01-16 14:30:00+01'),

((SELECT id FROM events WHERE title LIKE '%Outdoor%' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'confirmed', '2024-01-17 09:15:00+01'),

((SELECT id FROM events WHERE title LIKE '%Mindset%' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'registered', '2024-01-18 16:45:00+01'),

((SELECT id FROM events WHERE title LIKE '%BBQ%' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'confirmed', '2024-01-19 11:20:00+01')
ON CONFLICT (event_id, user_id) DO NOTHING;

-- Insert sample comments
INSERT INTO event_comments (event_id, user_id, content) VALUES
((SELECT id FROM events WHERE title LIKE '%Amsterdam%' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'Ziet er geweldig uit! Ik ben er bij!'),

((SELECT id FROM events WHERE title LIKE '%Outdoor%' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'Perfect, ik heb zin in een uitdaging!'),

((SELECT id FROM events WHERE title LIKE '%Mindset%' LIMIT 1),
 (SELECT id FROM users LIMIT 1), 'Discipline is precies waar ik aan wil werken. Aangemeld!')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. UPDATE EVENT COUNTS
-- =====================================================

-- Update event counts in categories
UPDATE event_categories
SET event_count = (
    SELECT COUNT(*)
    FROM events
    WHERE events.category_id = event_categories.id
    AND events.status IN ('upcoming', 'ongoing')
);

-- Update current participants count
UPDATE events
SET current_participants = (
    SELECT COUNT(*)
    FROM event_participants
    WHERE event_participants.event_id = events.id
    AND event_participants.status IN ('registered', 'confirmed', 'attended')
);

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Event categories: Everyone can read, only admins can write
CREATE POLICY "event_categories_read_policy" ON event_categories
    FOR SELECT USING (true);

CREATE POLICY "event_categories_write_policy" ON event_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Events: Everyone can read public events, organizers can edit their own, admins can do everything
CREATE POLICY "events_read_policy" ON events
    FOR SELECT USING (
        is_public = true OR
        auth.uid() = organizer_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "events_insert_policy" ON events
    FOR INSERT WITH CHECK (
        auth.uid() = organizer_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "events_update_policy" ON events
    FOR UPDATE USING (
        auth.uid() = organizer_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "events_delete_policy" ON events
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Event participants: Users can read their own participation, admins can read all
CREATE POLICY "event_participants_read_policy" ON event_participants
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "event_participants_insert_policy" ON event_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_participants_update_policy" ON event_participants
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Event comments: Everyone can read, users can write their own, admins can moderate
CREATE POLICY "event_comments_read_policy" ON event_comments
    FOR SELECT USING (true);

CREATE POLICY "event_comments_insert_policy" ON event_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_comments_update_policy" ON event_comments
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "event_comments_delete_policy" ON event_comments
    FOR DELETE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON events(is_public);

-- Event participants indexes
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status);

-- Event comments indexes
CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_user_id ON event_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_parent_id ON event_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_created_at ON event_comments(created_at);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_event_categories_name ON event_categories(name);

-- =====================================================
-- 9. TRIGGERS FOR AUTOMATIC UPDATES
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
CREATE TRIGGER update_event_categories_updated_at
    BEFORE UPDATE ON event_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_comments_updated_at
    BEFORE UPDATE ON event_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update event count in categories
CREATE OR REPLACE FUNCTION update_event_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE event_categories
        SET event_count = event_count + 1
        WHERE id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE event_categories
        SET event_count = event_count - 1
        WHERE id = OLD.category_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.category_id != OLD.category_id THEN
            UPDATE event_categories
            SET event_count = event_count - 1
            WHERE id = OLD.category_id;
            UPDATE event_categories
            SET event_count = event_count + 1
            WHERE id = NEW.category_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for event count
CREATE TRIGGER update_event_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON events
    FOR EACH ROW EXECUTE FUNCTION update_event_count();

-- Function to update current participants count
CREATE OR REPLACE FUNCTION update_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events
        SET current_participants = current_participants + 1
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events
        SET current_participants = current_participants - 1
        WHERE id = OLD.event_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes that affect count
        IF OLD.status NOT IN ('registered', 'confirmed', 'attended') AND NEW.status IN ('registered', 'confirmed', 'attended') THEN
            UPDATE events
            SET current_participants = current_participants + 1
            WHERE id = NEW.event_id;
        ELSIF OLD.status IN ('registered', 'confirmed', 'attended') AND NEW.status NOT IN ('registered', 'confirmed', 'attended') THEN
            UPDATE events
            SET current_participants = current_participants - 1
            WHERE id = NEW.event_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for participants count
CREATE TRIGGER update_participants_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON event_participants
    FOR EACH ROW EXECUTE FUNCTION update_participants_count();

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 'event_categories' as table_name, COUNT(*) as row_count FROM event_categories
UNION ALL
SELECT 'events' as table_name, COUNT(*) as row_count FROM events
UNION ALL
SELECT 'event_participants' as table_name, COUNT(*) as row_count FROM event_participants
UNION ALL
SELECT 'event_comments' as table_name, COUNT(*) as row_count FROM event_comments;

-- Check if RLS policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('event_categories', 'events', 'event_participants', 'event_comments');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Events management database setup voltooid!';
    RAISE NOTICE '🎉 % event categorieën aangemaakt', (SELECT COUNT(*) FROM event_categories);
    RAISE NOTICE '📅 % events aangemaakt', (SELECT COUNT(*) FROM events);
    RAISE NOTICE '👥 % deelnemers geregistreerd', (SELECT COUNT(*) FROM event_participants);
    RAISE NOTICE '💬 % comments geplaatst', (SELECT COUNT(*) FROM event_comments);
    RAISE NOTICE '🔒 RLS policies geactiveerd voor beveiliging';
    RAISE NOTICE '⚡ Performance indexes aangemaakt';
END $$; 