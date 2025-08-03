const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUsersTables() {
  console.log('🚀 Creating test users tables...');

  try {
    // Create test_users table
    const { error: testUsersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS test_users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
          assigned_modules TEXT[] DEFAULT '{}',
          test_start_date DATE NOT NULL,
          test_end_date DATE NOT NULL,
          bugs_reported INTEGER DEFAULT 0,
          improvements_suggested INTEGER DEFAULT 0,
          total_notes INTEGER DEFAULT 0,
          last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (testUsersError) {
      console.error('❌ Error creating test_users table:', testUsersError);
      return;
    }

    // Create test_notes table
    const { error: testNotesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS test_notes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          test_user_id UUID REFERENCES test_users(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('bug', 'improvement', 'general')),
          page_url TEXT NOT NULL,
          element_selector TEXT,
          description TEXT NOT NULL,
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
          status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
          screenshot_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (testNotesError) {
      console.error('❌ Error creating test_notes table:', testNotesError);
      return;
    }

    // Create indexes
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_test_users_user_id ON test_users(user_id);
        CREATE INDEX IF NOT EXISTS idx_test_users_status ON test_users(status);
        CREATE INDEX IF NOT EXISTS idx_test_notes_test_user_id ON test_notes(test_user_id);
        CREATE INDEX IF NOT EXISTS idx_test_notes_type ON test_notes(type);
        CREATE INDEX IF NOT EXISTS idx_test_notes_status ON test_notes(status);
        CREATE INDEX IF NOT EXISTS idx_test_notes_priority ON test_notes(priority);
      `
    });

    if (indexesError) {
      console.error('❌ Error creating indexes:', indexesError);
      return;
    }

    // Insert sample test users
    const { error: sampleDataError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO test_users (name, email, status, assigned_modules, test_start_date, test_end_date, bugs_reported, improvements_suggested, total_notes) VALUES
        ('Jan Jansen', 'jan.jansen@test.com', 'active', ARRAY['Academy', 'Trainingscentrum', 'Social Feed'], '2024-08-22', '2024-08-29', 3, 2, 5),
        ('Piet Peters', 'piet.peters@test.com', 'active', ARRAY['Boekenkamer', 'Badges & Rangen'], '2024-08-22', '2024-08-29', 1, 4, 5),
        ('Klaas Klaassen', 'klaas.klaassen@test.com', 'inactive', ARRAY['Voedingsplannen', 'Evenementenbeheer'], '2024-08-22', '2024-08-29', 0, 0, 0)
        ON CONFLICT (email) DO NOTHING;
      `
    });

    if (sampleDataError) {
      console.error('❌ Error inserting sample data:', sampleDataError);
      return;
    }

    // Insert sample test notes
    const { error: sampleNotesError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO test_notes (test_user_id, type, page_url, element_selector, description, priority, status) 
        SELECT 
          tu.id,
          'bug',
          '/dashboard/academy',
          '.lesson-card',
          'Video player laadt niet correct op mobiele apparaten',
          'high',
          'open'
        FROM test_users tu 
        WHERE tu.email = 'jan.jansen@test.com'
        LIMIT 1
        ON CONFLICT DO NOTHING;
      `
    });

    if (sampleNotesError) {
      console.error('❌ Error inserting sample notes:', sampleNotesError);
      return;
    }

    console.log('✅ Test users tables created successfully!');
    console.log('📊 Tables created:');
    console.log('   - test_users');
    console.log('   - test_notes');
    console.log('📝 Sample data inserted');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestUsersTables(); 