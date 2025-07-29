import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function GET() {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    console.log('🔍 Checking available tables...');

    const { data: tables, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `
    });

    if (error) {
      console.log('❌ Error checking tables:', error);
      return NextResponse.json({ error: 'Failed to check tables', details: error }, { status: 500 });
    }

    console.log('✅ Available tables:', tables);

    return NextResponse.json({
      success: true,
      tables: tables
    });

  } catch (error) {
    console.log('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
} 