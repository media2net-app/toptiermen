import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating test_notes table...');

    // First, create test_users table if it doesn't exist
    const { error: testUsersError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS test_users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
          assigned_modules TEXT[] DEFAULT '{}',
          test_start_date DATE,
          test_end_date DATE,
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
          test_user_id TEXT NOT NULL,
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
        CREATE INDEX IF NOT EXISTS idx_test_notes_test_user_id ON test_notes(test_user_id);
        CREATE INDEX IF NOT EXISTS idx_test_notes_type ON test_notes(type);
        CREATE INDEX IF NOT EXISTS idx_test_notes_status ON test_notes(status);
        CREATE INDEX IF NOT EXISTS idx_test_notes_priority ON test_notes(priority);
      `
    });

    if (indexesError) {
      console.error('❌ Error creating indexes:', indexesError);
    }

    // Insert a sample test note to verify the table works
    const { error: sampleNoteError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        INSERT INTO test_notes (test_user_id, type, page_url, description, priority, status)
        VALUES ('test-user-1', 'bug', '/dashboard', 'Sample bug report for testing', 'medium', 'open')
        ON CONFLICT DO NOTHING;
      `
    });

    if (sampleNoteError) {
      console.error('❌ Error inserting sample note:', sampleNoteError);
    }

    console.log('✅ Test notes table created successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Test notes table created successfully'
    });

  } catch (error) {
    console.error('❌ Error in fix-test-notes-table:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 