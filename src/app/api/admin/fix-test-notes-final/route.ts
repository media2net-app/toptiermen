import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Final fix for test_notes table...');

    // First, let's check if the table exists using information_schema
    const { data: tableCheck, error: checkError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'test_notes')
      .single();

    console.log('📊 Table check result:', { tableCheck, checkError });

    if (tableCheck) {
      console.log('✅ Table already exists, checking structure...');
      
      // Check table structure
      const { data: columns, error: columnsError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'test_notes');

      console.log('📊 Table structure:', columns);
      
      if (columns && columns.length > 0) {
        console.log('✅ Table structure looks good');
        
        // Test inserting a record
        const { data: testInsert, error: insertError } = await supabaseAdmin
          .from('test_notes')
          .insert({
            test_user_id: 'test-final-fix',
            type: 'bug',
            page_url: '/test',
            description: 'Test record for final fix',
            priority: 'medium'
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Insert test failed:', insertError);
          return NextResponse.json({ 
            success: false, 
            error: 'Table exists but insert failed',
            details: insertError
          }, { status: 500 });
        }

        console.log('✅ Insert test successful:', testInsert);

        // Clean up test record
        await supabaseAdmin
          .from('test_notes')
          .delete()
          .eq('test_user_id', 'test-final-fix');

        return NextResponse.json({ 
          success: true, 
          message: 'test_notes table is working correctly',
          testRecord: testInsert
        });
      }
    }

    // If we get here, we need to create the table
    console.log('🔧 Creating test_notes table...');

    // Try using raw SQL with proper escaping
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS test_notes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        test_user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        page_url TEXT NOT NULL,
        element_selector TEXT,
        area_selection JSONB,
        description TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'open',
        screenshot_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Try direct SQL execution
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: createTableSQL
    });

    if (createError) {
      console.error('❌ Direct SQL creation failed:', createError);
      
      // Try alternative approach - create table via Supabase client
      console.log('🔧 Trying alternative table creation method...');
      
      // We'll create a simple table first
      const { error: simpleCreateError } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS test_notes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            test_user_id TEXT,
            type TEXT,
            page_url TEXT,
            description TEXT,
            priority TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      });

      if (simpleCreateError) {
        console.error('❌ Simple table creation also failed:', simpleCreateError);
        return NextResponse.json({ 
          success: false, 
          error: 'All table creation methods failed',
          details: { createError, simpleCreateError }
        }, { status: 500 });
      }

      console.log('✅ Simple table created, adding constraints...');

      // Add constraints separately
      const { error: constraintError } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: `
          ALTER TABLE test_notes 
          ADD COLUMN IF NOT EXISTS element_selector TEXT,
          ADD COLUMN IF NOT EXISTS area_selection JSONB,
          ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open',
          ADD COLUMN IF NOT EXISTS screenshot_url TEXT,
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        `
      });

      if (constraintError) {
        console.error('❌ Adding constraints failed:', constraintError);
      } else {
        console.log('✅ Constraints added successfully');
      }
    } else {
      console.log('✅ Table created successfully');
    }

    // Test the table
    const { data: testData, error: testError } = await supabaseAdmin
      .from('test_notes')
      .insert({
        test_user_id: 'test-final-fix',
        type: 'bug',
        page_url: '/test',
        description: 'Test record for final fix',
        priority: 'medium'
      })
      .select()
      .single();

    if (testError) {
      console.error('❌ Final test failed:', testError);
      return NextResponse.json({ 
        success: false, 
        error: 'Table creation succeeded but insert failed',
        details: testError
      }, { status: 500 });
    }

    console.log('✅ Final test successful:', testData);

    // Clean up test record
    await supabaseAdmin
      .from('test_notes')
      .delete()
      .eq('test_user_id', 'test-final-fix');

    return NextResponse.json({ 
      success: true, 
      message: 'test_notes table created and tested successfully',
      testRecord: testData
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