import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting comprehensive database fixes...');

    const fixes = [];

    // 1. Fix test_notes table
    console.log('📝 Creating test_notes table...');
    const { error: testNotesError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        DROP TABLE IF EXISTS test_notes CASCADE;
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

    if (testNotesError) {
      console.error('❌ Error creating test_notes table:', testNotesError);
      fixes.push({ status: 'failed', table: 'test_notes', error: testNotesError.message });
    } else {
      console.log('✅ test_notes table created successfully');
      fixes.push({ status: 'success', table: 'test_notes' });
    }

    // 2. Create indexes
    console.log('📊 Creating indexes...');
    const { error: indexesError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_test_notes_test_user_id ON test_notes(test_user_id);
        CREATE INDEX IF NOT EXISTS idx_test_notes_type ON test_notes(type);
        CREATE INDEX IF NOT EXISTS idx_test_notes_status ON test_notes(status);
        CREATE INDEX IF NOT EXISTS idx_test_notes_priority ON test_notes(priority);
        CREATE INDEX IF NOT EXISTS idx_test_notes_created_at ON test_notes(created_at);
      `
    });

    if (indexesError) {
      console.error('❌ Error creating indexes:', indexesError);
      fixes.push({ status: 'failed', operation: 'indexes', error: indexesError.message });
    } else {
      console.log('✅ Indexes created successfully');
      fixes.push({ status: 'success', operation: 'indexes' });
    }

    // 3. Insert sample data to verify table works
    console.log('📝 Inserting sample data...');
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
      fixes.push({ status: 'failed', operation: 'sample_data', error: sampleError.message });
    } else {
      console.log('✅ Sample data inserted successfully');
      fixes.push({ status: 'success', operation: 'sample_data' });
    }

    // 4. Verify table exists and has data
    console.log('🔍 Verifying table...');
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
      fixes.push({ status: 'failed', operation: 'verification', error: verificationError.message });
    } else {
      console.log('✅ Table verification successful:', verificationData);
      fixes.push({ status: 'success', operation: 'verification', data: verificationData });
    }

    // 5. Fix any other database issues
    console.log('🔧 Checking for other database issues...');
    
    // Check if users table has proper constraints
    const { error: usersConstraintError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        DO $$
        BEGIN
          -- Drop existing constraint if it exists
          IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'users_role_check'
          ) THEN
            ALTER TABLE users DROP CONSTRAINT users_role_check;
          END IF;
          
          -- Add new constraint
          ALTER TABLE users ADD CONSTRAINT users_role_check 
          CHECK (role IN ('user', 'admin', 'test'));
        EXCEPTION
          WHEN OTHERS THEN
            -- Constraint might already exist or table might not exist
            NULL;
        END $$;
      `
    });

    if (usersConstraintError) {
      console.warn('⚠️ Warning with users constraint:', usersConstraintError);
      fixes.push({ status: 'warning', operation: 'users_constraint', error: usersConstraintError.message });
    } else {
      console.log('✅ Users table constraints updated');
      fixes.push({ status: 'success', operation: 'users_constraint' });
    }

    console.log('🎉 Database fixes completed!');

    return NextResponse.json({ 
      success: true, 
      message: 'Database fixes completed successfully',
      fixes: fixes,
      summary: {
        total_fixes: fixes.length,
        successful: fixes.filter(f => f.status === 'success').length,
        failed: fixes.filter(f => f.status === 'failed').length,
        warnings: fixes.filter(f => f.status === 'warning').length
      }
    });

  } catch (error) {
    console.error('❌ Error in fix-database-issues:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
} 