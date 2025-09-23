-- Mind & Focus Database Schema
-- Run this in your Supabase SQL editor

-- 1. User Mind Profiles Table
CREATE TABLE IF NOT EXISTS user_mind_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stress_assessment JSONB,
  lifestyle_info JSONB,
  personal_goals JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_mind_profiles_user_id ON user_mind_profiles(user_id);

-- 2. Mind Sessions Table
CREATE TABLE IF NOT EXISTS mind_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('focus', 'stress', 'recovery', 'performance', 'sleep')),
  duration INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  stress_before INTEGER CHECK (stress_before >= 1 AND stress_before <= 10),
  stress_after INTEGER CHECK (stress_after >= 1 AND stress_after <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mind_sessions_user_id ON mind_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mind_sessions_created_at ON mind_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_mind_sessions_type ON mind_sessions(type);

-- 3. Journal Entries Table
CREATE TABLE IF NOT EXISTS mind_journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  gratitude TEXT[],
  daily_review TEXT,
  tomorrow_priorities TEXT[],
  mood INTEGER CHECK (mood >= 1 AND mood <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mind_journal_user_id ON mind_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mind_journal_date ON mind_journal_entries(date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mind_journal_user_date ON mind_journal_entries(user_id, date);

-- 4. Achievements Table
CREATE TABLE IF NOT EXISTS mind_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_mind_achievements_user_id ON mind_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_mind_achievements_type ON mind_achievements(achievement_type);

-- 5. Daily Routines Table
CREATE TABLE IF NOT EXISTS mind_daily_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_name TEXT NOT NULL,
  sessions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mind_routines_user_id ON mind_daily_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_mind_routines_active ON mind_daily_routines(is_active);

-- 6. Meditation Library Table
CREATE TABLE IF NOT EXISTS mind_meditation_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('focus', 'stress', 'recovery', 'performance', 'sleep')),
  duration INTEGER NOT NULL,
  description TEXT,
  audio_url TEXT,
  instructions TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mind_library_type ON mind_meditation_library(type);
CREATE INDEX IF NOT EXISTS idx_mind_library_premium ON mind_meditation_library(is_premium);

-- 7. Insert sample meditation content
INSERT INTO mind_meditation_library (title, type, duration, description, instructions, is_premium) VALUES
('Ochtend Focus Training', 'focus', 10, 'Start je dag met mentale helderheid en focus', 'Ga comfortabel zitten, sluit je ogen en focus op je ademhaling. Tel elke inademing en uitademing.', false),
('Lunch Stress Release', 'stress', 10, 'Herstel je balans tijdens lunch', 'Adem diep in door je neus, houd vast en adem langzaam uit door je mond.', false),
('Avond Recovery', 'recovery', 15, 'Ontspan en verwerk de dag', 'Ga liggen, sluit je ogen en scan je lichaam van top tot teen voor spanning.', false),
('Sleep Preparation', 'sleep', 15, 'Bereid je voor op een goede nachtrust', 'Progressive muscle relaxation: span en ontspan elke spiergroep.', false),
('Performance Prep', 'performance', 5, 'Bereid je voor op belangrijke momenten', 'Visualiseer je succes en adem kracht in.', false),
('Warrior Focus', 'focus', 15, 'Intensieve focus training voor mannen', 'Sta rechtop, voel je kracht en focus op je doelen.', true),
('Executive Calm', 'stress', 20, 'Geavanceerde stress management', 'Diepe ademhalingstechnieken voor drukke professionals.', true),
('Pre-Workout Zen', 'performance', 5, 'Mentale voorbereiding voor training', 'Visualiseer je training en bereid je mentaal voor.', false),
('Post-Work Recovery', 'recovery', 10, 'Herstel na intensieve training', 'Ontspan je spieren en herstel je energie.', false),
('Decision Clarity', 'focus', 15, 'Heldere besluitvorming', 'Stel je voor dat je de juiste keuze maakt en voel de zekerheid.', true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE user_mind_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_daily_routines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own mind profile" ON user_mind_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mind profile" ON user_mind_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mind profile" ON user_mind_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON mind_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON mind_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON mind_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own journal entries" ON mind_journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON mind_journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON mind_journal_entries FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON mind_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON mind_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON mind_achievements FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own routines" ON mind_daily_routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own routines" ON mind_daily_routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines" ON mind_daily_routines FOR UPDATE USING (auth.uid() = user_id);

-- Meditation library is public read
CREATE POLICY "Anyone can view meditation library" ON mind_meditation_library FOR SELECT USING (true);
