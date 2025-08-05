import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating test tables...');

    // Create test_users table
    const { error: testUsersError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
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
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create test_users table' 
      }, { status: 500 });
    }

    // Create test_notes table
    const { error: testNotesError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS test_notes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          test_user_id UUID REFERENCES test_users(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('bug', 'improvement', 'general')),
          page_url TEXT NOT NULL,
          element_selector TEXT,
          area_selection JSONB,
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
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create test_notes table' 
      }, { status: 500 });
    }

    // Create indexes
    const { error: indexesError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
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
      // Don't fail completely, tables were created
    }

    // Insert sample test users if table is empty
    const { data: existingUsers } = await supabaseAdmin
      .from('test_users')
      .select('id')
      .limit(1);

    if (!existingUsers || existingUsers.length === 0) {
      const { error: sampleDataError } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: `
          INSERT INTO test_users (name, email, status, assigned_modules, test_start_date, test_end_date, bugs_reported, improvements_suggested, total_notes) VALUES
          ('Jan Jansen', 'jan.jansen@test.com', 'active', ARRAY['Academy', 'Trainingscentrum', 'Social Feed'], '2024-08-22', '2024-08-29', 3, 2, 5),
          ('Piet Peters', 'piet.peters@test.com', 'active', ARRAY['Boekenkamer', 'Badges & Rangen'], '2024-08-22', '2024-08-29', 1, 4, 5),
          ('Klaas Klaassen', 'klaas.klaassen@test.com', 'inactive', ARRAY['Voedingsplannen', 'Evenementenbeheer'], '2024-08-22', '2024-08-29', 0, 0, 0)
          ON CONFLICT (email) DO NOTHING;
        `
      });

      if (sampleDataError) {
        console.error('❌ Error inserting sample data:', sampleDataError);
        // Don't fail completely, tables were created
      }
    }

    console.log('✅ Test tables created successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Test tables created successfully',
      tables: ['test_users', 'test_notes']
    });

  } catch (error) {
    console.error('❌ Error in create-test-tables:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 