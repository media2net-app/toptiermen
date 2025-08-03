import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key exists:', !!supabaseAnonKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        url: supabaseUrl,
        keyExists: !!supabaseAnonKey
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connection
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({
        success: false,
        error: 'Session error',
        details: sessionError.message
      });
    }

    // Test database connection
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: dbError.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      session: session ? 'exists' : 'none',
      database: 'connected',
      usersCount: users?.length || 0
    });

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 