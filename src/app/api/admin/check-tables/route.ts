import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking database tables...');

    // Check if test_notes table exists
    const { data: tableExists, error: tableError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'test_notes'
        );
      `
    });

    if (tableError) {
      console.error('❌ Error checking table existence:', tableError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to check table existence',
        details: tableError
      }, { status: 500 });
    }

    console.log('📊 Table exists check result:', tableExists);

    // Get table structure if it exists
    let tableStructure = null;
    if (tableExists && tableExists[0]?.exists) {
      const { data: structure, error: structureError } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = 'test_notes'
          ORDER BY ordinal_position;
        `
      });

      if (structureError) {
        console.error('❌ Error getting table structure:', structureError);
      } else {
        tableStructure = structure;
      }
    }

    // Try to create the table if it doesn't exist
    if (!tableExists || !tableExists[0]?.exists) {
      console.log('🔧 Creating test_notes table...');
      
      const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
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

      if (createError) {
        console.error('❌ Error creating table:', createError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create table',
          details: createError
        }, { status: 500 });
      }

      console.log('✅ Table created successfully');
    }

    return NextResponse.json({ 
      success: true, 
      tableExists: tableExists?.[0]?.exists || false,
      tableStructure,
      message: 'Table check completed'
    });

  } catch (error) {
    console.error('❌ Error in check-tables:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
} 