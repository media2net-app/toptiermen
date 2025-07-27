import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching database tables count...');

    // Query to get all tables in the public schema
    const { data: tables, error } = await supabaseAdmin
      .rpc('get_database_tables');

    if (error) {
      console.error('Error fetching database tables:', error);
      
      // Fallback: try to get tables using a different approach
      const { data: tableList, error: tableError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .neq('table_name', 'schema_migrations')
        .neq('table_name', 'ar_internal_metadata');

      if (tableError) {
        console.error('Error with fallback query:', tableError);
        return NextResponse.json({ 
          error: 'Failed to fetch database tables',
          details: error 
        }, { status: 500 });
      }

      const tableCount = tableList?.length || 0;
      console.log(`✅ Found ${tableCount} database tables`);

      return NextResponse.json({ 
        success: true, 
        tableCount,
        tables: tableList?.map(t => t.table_name) || []
      });
    }

    const tableCount = tables?.length || 0;
    console.log(`✅ Found ${tableCount} database tables`);

    return NextResponse.json({ 
      success: true, 
      tableCount,
      tables: tables || []
    });

  } catch (error) {
    console.error('Error fetching database tables:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch database tables' 
    }, { status: 500 });
  }
} 