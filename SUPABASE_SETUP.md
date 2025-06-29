# Supabase Setup voor Top Tier Men

## 1. Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com)
2. Maak een nieuw project aan
3. Noteer je project URL en anon key

## 2. Environment Variables

Maak een `.env.local` bestand aan in de root van het project met:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 3. Database Schema

Voer het volgende SQL uit in de Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  rank TEXT DEFAULT 'Beginner',
  points INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Missions table
CREATE TABLE missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  completion_criteria JSONB NOT NULL
);

-- User missions table
CREATE TABLE user_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  proof JSONB,
  UNIQUE(user_id, mission_id)
);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "All users can view missions" ON missions
  FOR SELECT USING (true);

CREATE POLICY "Users can view own user_missions" ON user_missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_missions" ON user_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_missions" ON user_missions
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 4. Test Data

Voeg wat test missies toe:

```sql
INSERT INTO missions (title, description, points, category, difficulty, completion_criteria) VALUES
('Eerste Workout', 'Doe je eerste workout van het programma', 10, 'fitness', 'beginner', '{"type": "workout", "duration": 30}'),
('Dagelijkse Meditatie', 'Mediteer 10 minuten per dag', 5, 'mind', 'beginner', '{"type": "meditation", "duration": 600}'),
('Lees 30 Minuten', 'Lees 30 minuten uit een boek', 5, 'knowledge', 'beginner', '{"type": "reading", "duration": 1800}'),
('Push-up Challenge', 'Doe 50 push-ups', 15, 'fitness', 'intermediate', '{"type": "exercise", "count": 50}'),
('Cold Shower', 'Neem een koude douche', 10, 'discipline', 'beginner', '{"type": "cold_exposure", "duration": 60}');
```

## 5. Authentication Settings

1. Ga naar Authentication > Settings in je Supabase dashboard
2. Zet "Enable email confirmations" uit voor development
3. Voeg je domain toe aan "Site URL" en "Redirect URLs"

## 6. Testen

1. Start de development server: `npm run dev`
2. Ga naar `/register` en maak een test account aan
3. Test inloggen op `/login`
4. Controleer of de gebruiker correct wordt aangemaakt in de database

## 7. Troubleshooting

- Controleer of alle environment variables correct zijn ingesteld
- Kijk in de browser console voor errors
- Controleer de Supabase logs in het dashboard
- Zorg dat RLS policies correct zijn ingesteld 