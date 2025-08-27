# Forum Moderatie Database Setup

## 🔧 Database Tabellen Aanmaken

Voer het volgende SQL script uit in de Supabase SQL Editor:

```sql
-- Forum Moderatie Database Setup
-- Run this in Supabase SQL Editor

-- 1. FORUM REPORTS TABLE
CREATE TABLE IF NOT EXISTS forum_reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id INTEGER,
  report_type VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  moderator_id UUID REFERENCES auth.users(id),
  moderator_notes TEXT,
  resolution_action VARCHAR(50),
  resolution_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 2. FORUM MODERATION LOGS TABLE
CREATE TABLE IF NOT EXISTS forum_moderation_logs (
  id SERIAL PRIMARY KEY,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(20) NOT NULL,
  target_id INTEGER,
  reason TEXT NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FORUM POST FLAGS TABLE
CREATE TABLE IF NOT EXISTS forum_post_flags (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  flagger_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_type VARCHAR(50) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INSERT SAMPLE DATA
-- Get existing users and posts
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  user3_id UUID;
  post1_id INTEGER;
  post2_id INTEGER;
  post3_id INTEGER;
BEGIN
  -- Get first 3 users
  SELECT id INTO user1_id FROM profiles LIMIT 1;
  SELECT id INTO user2_id FROM profiles OFFSET 1 LIMIT 1;
  SELECT id INTO user3_id FROM profiles OFFSET 2 LIMIT 1;
  
  -- Get first 3 posts
  SELECT id INTO post1_id FROM forum_posts LIMIT 1;
  SELECT id INTO post2_id FROM forum_posts OFFSET 1 LIMIT 1;
  SELECT id INTO post3_id FROM forum_posts OFFSET 2 LIMIT 1;

  -- Insert sample forum reports
  INSERT INTO forum_reports (reporter_id, reported_user_id, post_id, report_type, reason, description, status) VALUES
    (user1_id, user2_id, post1_id, 'spam', 'Spam - Dit lijkt op spam content', 'Deze post bevat ongewenste commerciële content', 'pending'),
    (user2_id, user3_id, post2_id, 'inappropriate', 'Inappropriate Content - Ongepaste taal en inhoud', 'Deze post bevat ongepaste taal', 'investigating'),
    (user3_id, user1_id, post3_id, 'harassment', 'Harassment - Pesterij van andere gebruiker', 'Deze gebruiker pest andere leden', 'resolved');

  -- Insert sample moderation logs
  INSERT INTO forum_moderation_logs (moderator_id, target_user_id, action_type, target_type, reason, duration) VALUES
    (user1_id, user2_id, 'warning', 'user', 'Spam gedrag gedetecteerd', NULL),
    (user1_id, user3_id, 'suspension', 'user', 'Ongepast gedrag in forum', 7);

  -- Insert sample post flags
  INSERT INTO forum_post_flags (post_id, flagger_id, flag_type, reason) VALUES
    (post1_id, user1_id, 'spam', 'Commerciële content zonder toestemming'),
    (post2_id, user2_id, 'inappropriate', 'Ongepaste taal gebruikt');

END $$;

-- 5. VERIFY DATA
SELECT 'Forum Reports' as table_name, COUNT(*) as count FROM forum_reports
UNION ALL
SELECT 'Moderation Logs' as table_name, COUNT(*) as count FROM forum_moderation_logs
UNION ALL
SELECT 'Post Flags' as table_name, COUNT(*) as count FROM forum_post_flags;
```

## 📊 Admin Dashboard Updates

De admin dashboard is bijgewerkt om:

1. **Echte database data** te gebruiken in plaats van dummy data
2. **Betere error handling** en logging
3. **Debug informatie** te tonen
4. **Real-time data** te verversen

## 🔍 API Endpoints

De volgende API endpoints zijn geïmplementeerd:

- `GET /api/admin/forum-reports` - Haalt forum reports op
- `GET /api/admin/forum-moderation-logs` - Haalt moderatie logs op  
- `GET /api/admin/forum-stats` - Haalt statistieken op
- `PATCH /api/admin/forum-reports/[id]` - Update report status

## 🎯 Volgende Stappen

1. **Voer het SQL script uit** in Supabase SQL Editor
2. **Test de admin dashboard** op `/dashboard-admin/forum-moderatie`
3. **Controleer de debug informatie** voor data status
4. **Implementeer real-time features** indien nodig

## ✅ Status

- [x] Database schema gedefinieerd
- [x] Admin dashboard bijgewerkt
- [x] API routes geïmplementeerd
- [x] Error handling toegevoegd
- [ ] SQL script uitgevoerd (handmatig)
- [ ] Data verificatie
- [ ] Live testing
