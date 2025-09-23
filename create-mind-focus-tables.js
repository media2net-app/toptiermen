require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMindFocusTables() {
  console.log('🧠 Creating Mind & Focus database tables...');

  try {
    // 1. User Mind Profiles Table
    console.log('Creating user_mind_profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (profilesError) {
      console.error('Error creating user_mind_profiles:', profilesError);
    } else {
      console.log('✅ user_mind_profiles table created');
    }

    // 2. Mind Sessions Table
    console.log('Creating mind_sessions table...');
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (sessionsError) {
      console.error('Error creating mind_sessions:', sessionsError);
    } else {
      console.log('✅ mind_sessions table created');
    }

    // 3. Journal Entries Table
    console.log('Creating mind_journal_entries table...');
    const { error: journalError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (journalError) {
      console.error('Error creating mind_journal_entries:', journalError);
    } else {
      console.log('✅ mind_journal_entries table created');
    }

    // 4. Achievements Table
    console.log('Creating mind_achievements table...');
    const { error: achievementsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (achievementsError) {
      console.error('Error creating mind_achievements:', achievementsError);
    } else {
      console.log('✅ mind_achievements table created');
    }

    // 5. Daily Routines Table
    console.log('Creating mind_daily_routines table...');
    const { error: routinesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (routinesError) {
      console.error('Error creating mind_daily_routines:', routinesError);
    } else {
      console.log('✅ mind_daily_routines table created');
    }

    // 6. Meditation Library Table
    console.log('Creating mind_meditation_library table...');
    const { error: libraryError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (libraryError) {
      console.error('Error creating mind_meditation_library:', libraryError);
    } else {
      console.log('✅ mind_meditation_library table created');
    }

    // 7. Insert sample meditation content
    console.log('Inserting sample meditation content...');
    const { error: sampleError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (sampleError) {
      console.error('Error inserting sample content:', sampleError);
    } else {
      console.log('✅ Sample meditation content inserted');
    }

    console.log('🎉 All Mind & Focus tables created successfully!');
    console.log('\n📊 Tables created:');
    console.log('- user_mind_profiles');
    console.log('- mind_sessions');
    console.log('- mind_journal_entries');
    console.log('- mind_achievements');
    console.log('- mind_daily_routines');
    console.log('- mind_meditation_library');

  } catch (error) {
    console.error('❌ Error creating Mind & Focus tables:', error);
  }
}

createMindFocusTables();
