-- Brotherhood Database Schema
-- Created: 2024-12-19

-- Brotherhood Groups Table
CREATE TABLE IF NOT EXISTS brotherhood_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  max_members INTEGER DEFAULT 50,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'))
);

-- Brotherhood Group Members
CREATE TABLE IF NOT EXISTS brotherhood_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES brotherhood_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  UNIQUE(group_id, user_id)
);

-- Brotherhood Events
CREATE TABLE IF NOT EXISTS brotherhood_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES brotherhood_groups(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) DEFAULT 'meetup' CHECK (event_type IN ('meetup', 'workshop', 'call', 'social')),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  location VARCHAR(255),
  is_online BOOLEAN DEFAULT false,
  max_attendees INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'))
);

-- Brotherhood Event Attendees
CREATE TABLE IF NOT EXISTS brotherhood_event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES brotherhood_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Brotherhood Group Posts/Feed
CREATE TABLE IF NOT EXISTS brotherhood_group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES brotherhood_groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type VARCHAR(20) DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'link', 'poll')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived'))
);

-- Brotherhood Group Activity Log
CREATE TABLE IF NOT EXISTS brotherhood_group_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES brotherhood_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('joined', 'left', 'post_created', 'event_created', 'event_attended')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brotherhood_groups_created_by ON brotherhood_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_brotherhood_groups_status ON brotherhood_groups(status);
CREATE INDEX IF NOT EXISTS idx_brotherhood_group_members_group_id ON brotherhood_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_brotherhood_group_members_user_id ON brotherhood_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_brotherhood_events_group_id ON brotherhood_events(group_id);
CREATE INDEX IF NOT EXISTS idx_brotherhood_events_date ON brotherhood_events(event_date);
CREATE INDEX IF NOT EXISTS idx_brotherhood_event_attendees_event_id ON brotherhood_event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_brotherhood_group_posts_group_id ON brotherhood_group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_brotherhood_group_activity_group_id ON brotherhood_group_activity(group_id);

-- RLS Policies
ALTER TABLE brotherhood_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE brotherhood_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brotherhood_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE brotherhood_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE brotherhood_group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brotherhood_group_activity ENABLE ROW LEVEL SECURITY;

-- Groups: Users can view active groups, create groups, update their own groups
CREATE POLICY "Users can view active groups" ON brotherhood_groups FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create groups" ON brotherhood_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own groups" ON brotherhood_groups FOR UPDATE USING (auth.uid() = created_by);

-- Group Members: Users can view members of groups they're in, join/leave groups
CREATE POLICY "Users can view group members" ON brotherhood_group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM brotherhood_group_members bgm WHERE bgm.group_id = brotherhood_group_members.group_id AND bgm.user_id = auth.uid())
);
CREATE POLICY "Users can join groups" ON brotherhood_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON brotherhood_group_members FOR DELETE USING (auth.uid() = user_id);

-- Events: Users can view events of groups they're in, create events in groups they're members of
CREATE POLICY "Users can view group events" ON brotherhood_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM brotherhood_group_members bgm WHERE bgm.group_id = brotherhood_events.group_id AND bgm.user_id = auth.uid())
);
CREATE POLICY "Users can create events in their groups" ON brotherhood_events FOR INSERT WITH CHECK (
  auth.uid() = created_by AND 
  EXISTS (SELECT 1 FROM brotherhood_group_members bgm WHERE bgm.group_id = brotherhood_events.group_id AND bgm.user_id = auth.uid())
);

-- Event Attendees: Users can register for events, view attendees of events they're registered for
CREATE POLICY "Users can view event attendees" ON brotherhood_event_attendees FOR SELECT USING (
  EXISTS (SELECT 1 FROM brotherhood_event_attendees bea WHERE bea.event_id = brotherhood_event_attendees.event_id AND bea.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM brotherhood_events be JOIN brotherhood_group_members bgm ON be.group_id = bgm.group_id WHERE be.id = brotherhood_event_attendees.event_id AND bgm.user_id = auth.uid())
);
CREATE POLICY "Users can register for events" ON brotherhood_event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Group Posts: Users can view posts in groups they're in, create posts in groups they're members of
CREATE POLICY "Users can view group posts" ON brotherhood_group_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM brotherhood_group_members bgm WHERE bgm.group_id = brotherhood_group_posts.group_id AND bgm.user_id = auth.uid())
);
CREATE POLICY "Users can create posts in their groups" ON brotherhood_group_posts FOR INSERT WITH CHECK (
  auth.uid() = author_id AND 
  EXISTS (SELECT 1 FROM brotherhood_group_members bgm WHERE bgm.group_id = brotherhood_group_posts.group_id AND bgm.user_id = auth.uid())
);

-- Group Activity: Users can view activity of groups they're in
CREATE POLICY "Users can view group activity" ON brotherhood_group_activity FOR SELECT USING (
  EXISTS (SELECT 1 FROM brotherhood_group_members bgm WHERE bgm.group_id = brotherhood_group_activity.group_id AND bgm.user_id = auth.uid())
);
