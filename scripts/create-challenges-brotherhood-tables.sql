-- =====================================================
-- CHALLENGES & BROTHERHOOD DATABASE SETUP
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CHALLENGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
    progress INTEGER DEFAULT 0,
    total_days INTEGER NOT NULL,
    current_day INTEGER DEFAULT 0,
    icon VARCHAR(10),
    badge VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    shared BOOLEAN DEFAULT false,
    accountability_partner VARCHAR(100),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    streak INTEGER DEFAULT 0,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CHALLENGE CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS challenge_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(10),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. BROTHERHOOD GROUPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS brotherhood_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    member_count INTEGER DEFAULT 0,
    max_members INTEGER DEFAULT 50,
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. BROTHERHOOD GROUP MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS brotherhood_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES brotherhood_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(group_id, user_id)
);

-- =====================================================
-- 5. BROTHERHOOD EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS brotherhood_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(20),
    location VARCHAR(255),
    description TEXT,
    host VARCHAR(255),
    host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    max_attendees INTEGER DEFAULT 20,
    current_attendees INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    group_id UUID REFERENCES brotherhood_groups(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    agenda TEXT[],
    doelgroep TEXT,
    leerdoelen TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. BROTHERHOOD EVENT ATTENDEES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS brotherhood_event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES brotherhood_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- =====================================================
-- 7. BROTHERHOOD GROUP FEED TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS brotherhood_group_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES brotherhood_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'post' CHECK (type IN ('post', 'achievement', 'question', 'share')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. INSERT SAMPLE DATA
-- =====================================================

-- Insert challenge categories
INSERT INTO challenge_categories (name, description, icon, color) VALUES
('Fysieke Uitdagingen', 'Challenges gericht op fysieke gezondheid en fitness', '💪', '#8BAE5A'),
('Mentale Uitdagingen', 'Challenges voor mentale gezondheid en focus', '🧘‍♂️', '#4A90E2'),
('Financiële Uitdagingen', 'Challenges voor financiële discipline en groei', '💰', '#F5A623'),
('Productiviteit', 'Challenges voor betere gewoontes en productiviteit', '⚡', '#7B68EE'),
('Sociale Uitdagingen', 'Challenges voor sociale vaardigheden en netwerken', '🤝', '#FF6B6B')
ON CONFLICT (name) DO NOTHING;

-- Insert sample brotherhood groups
INSERT INTO brotherhood_groups (name, description, category, member_count, max_members, is_public, created_by) VALUES
('Crypto & DeFi Pioniers', 'Voor mannen die de toekomst van financiën willen vormgeven', 'Financiën', 8, 25, true, (SELECT id FROM auth.users LIMIT 1)),
('Vaders & Leiders', 'Een plek voor vaders om te groeien als leiders', 'Leiderschap', 3, 20, true, (SELECT id FROM auth.users LIMIT 1)),
('Fitness Warriors', 'Voor mannen die hun fysieke grenzen willen verleggen', 'Fitness', 12, 30, true, (SELECT id FROM auth.users LIMIT 1)),
('Ondernemers Hub', 'Voor mannen die hun eigen bedrijf willen starten of uitbreiden', 'Ondernemerschap', 15, 25, true, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample brotherhood events
INSERT INTO brotherhood_events (title, type, date, time, location, description, host, max_attendees, current_attendees, status, group_id, is_public, agenda, doelgroep, leerdoelen) VALUES
('Online Workshop: Onderhandelen als een Pro', 'Online Workshop', '2024-02-15', '19:00-21:00', 'Online via Zoom', 'Leer de kunst van effectief onderhandelen in zowel zakelijke als persoonlijke situaties.', 'Rick Cuijpers', 12, 4, 'upcoming', (SELECT id FROM brotherhood_groups WHERE name = 'Ondernemers Hub' LIMIT 1), true, 
 ARRAY['Introductie & welkom', 'Theorie: Onderhandelingsprincipes', 'Praktijk: Rollenspellen', 'Q&A', 'Afronding & netwerk'],
 'Iedereen die zijn onderhandelingsvaardigheden wil verbeteren, zowel zakelijk als privé.',
 ARRAY['De 3 gouden regels van onderhandelen', 'Hoe je zelfverzekerd een deal sluit', 'Veelgemaakte fouten voorkomen', 'Praktische tips direct toepassen']),

('Fysieke Meetup: Amsterdam Brotherhood', 'Fysieke Meetup', '2024-03-01', '10:00-16:00', 'Amsterdam Centrum', 'Een dag vol netwerken, workshops en team building activiteiten.', 'Mark van der Berg', 20, 8, 'upcoming', (SELECT id FROM brotherhood_groups WHERE name = 'Fitness Warriors' LIMIT 1), true,
 ARRAY['Welkom & kennismaking', 'Team building activiteiten', 'Workshop: Leiderschap in actie', 'Netwerk lunch', 'Afronding & plannen'],
 'Alle Brotherhood leden die willen netwerken en groeien.',
 ARRAY['Netwerkvaardigheden verbeteren', 'Leiderschap in praktijk brengen', 'Sterke connecties opbouwen'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at);

CREATE INDEX IF NOT EXISTS idx_brotherhood_groups_category ON brotherhood_groups(category);
CREATE INDEX IF NOT EXISTS idx_brotherhood_groups_is_public ON brotherhood_groups(is_public);
CREATE INDEX IF NOT EXISTS idx_brotherhood_groups_created_at ON brotherhood_groups(created_at);

CREATE INDEX IF NOT EXISTS idx_brotherhood_group_members_group_id ON brotherhood_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_brotherhood_group_members_user_id ON brotherhood_group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_brotherhood_events_date ON brotherhood_events(date);
CREATE INDEX IF NOT EXISTS idx_brotherhood_events_status ON brotherhood_events(status);
CREATE INDEX IF NOT EXISTS idx_brotherhood_events_group_id ON brotherhood_events(group_id);

CREATE INDEX IF NOT EXISTS idx_brotherhood_event_attendees_event_id ON brotherhood_event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_brotherhood_event_attendees_user_id ON brotherhood_event_attendees(user_id);

CREATE INDEX IF NOT EXISTS idx_brotherhood_group_feed_group_id ON brotherhood_group_feed(group_id);
CREATE INDEX IF NOT EXISTS idx_brotherhood_group_feed_created_at ON brotherhood_group_feed(created_at);

-- =====================================================
-- 10. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brotherhood_groups_updated_at BEFORE UPDATE ON brotherhood_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brotherhood_events_updated_at BEFORE UPDATE ON brotherhood_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brotherhood_group_feed_updated_at BEFORE UPDATE ON brotherhood_group_feed FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
