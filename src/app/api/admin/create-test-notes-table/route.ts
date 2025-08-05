import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating test_notes table with direct SQL...');

    // Drop table if exists and recreate
    const { error: dropError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        DROP TABLE IF EXISTS test_notes CASCADE;
      `
    });

    if (dropError) {
      console.error('❌ Error dropping table:', dropError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to drop existing table',
        details: dropError
      }, { status: 500 });
    }

    // Create the table
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE test_notes (
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

    if (createError) {
      console.error('❌ Error creating table:', createError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create table',
        details: createError
      }, { status: 500 });
    }

    console.log('✅ Table created successfully');

    // Create indexes
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_test_notes_test_user_id ON test_notes(test_user_id);
        CREATE INDEX IF NOT EXISTS idx_test_notes_type ON test_notes(type);
        CREATE INDEX IF NOT EXISTS idx_test_notes_status ON test_notes(status);
        CREATE INDEX IF NOT EXISTS idx_test_notes_priority ON test_notes(priority);
        CREATE INDEX IF NOT EXISTS idx_test_notes_created_at ON test_notes(created_at);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create indexes',
        details: indexError
      }, { status: 500 });
    }

    console.log('✅ Indexes created successfully');

    // Insert sample data to verify table works
    const { error: sampleError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        INSERT INTO test_notes (test_user_id, type, page_url, description, priority, status)
        VALUES 
          ('test-user-1', 'bug', '/dashboard', 'Sample bug report for testing', 'medium', 'open'),
          ('test-user-2', 'improvement', '/academy', 'Sample improvement suggestion', 'high', 'open'),
          ('test-user-3', 'general', '/brotherhood', 'Sample general feedback', 'low', 'resolved')
        ON CONFLICT DO NOTHING;
      `
    });

    if (sampleError) {
      console.error('❌ Error inserting sample data:', sampleError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to insert sample data',
        details: sampleError
      }, { status: 500 });
    }

    console.log('✅ Sample data inserted successfully');

    // Verify table exists and has data
    const { data: verificationData, error: verificationError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        SELECT 
          COUNT(*) as total_notes,
          COUNT(CASE WHEN status = 'open' THEN 1 END) as open_notes,
          COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_notes
        FROM test_notes;
      `
    });

    if (verificationError) {
      console.error('❌ Error verifying table:', verificationError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to verify table',
        details: verificationError
      }, { status: 500 });
    }

    console.log('✅ Table verification successful:', verificationData);

    return NextResponse.json({ 
      success: true, 
      message: 'test_notes table created successfully',
      verification: verificationData
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
} 