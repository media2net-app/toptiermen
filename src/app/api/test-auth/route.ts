import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check if environment variables are configured
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables not configured',
        config: {
          supabaseUrl: supabaseUrl ? 'Configured' : 'NOT CONFIGURED',
          supabaseAnonKey: supabaseAnonKey ? 'Configured' : 'NOT CONFIGURED'
        }
      }, { status: 500 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test basic connection
    const { data: healthData, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (healthError) {
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: healthError.message,
        config: {
          supabaseUrl: supabaseUrl ? 'Configured' : 'NOT CONFIGURED',
          supabaseAnonKey: supabaseAnonKey ? 'Configured' : 'NOT CONFIGURED'
        }
      }, { status: 500 });
    }

    // Test authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    return NextResponse.json({
      success: true,
      message: 'Supabase authentication test successful',
      config: {
        supabaseUrl: 'Configured',
        supabaseAnonKey: 'Configured',
        environment: process.env.NODE_ENV
      },
      connection: {
        health: 'OK',
        session: session ? 'Active' : 'No session',
        error: sessionError?.message || null
      }
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 