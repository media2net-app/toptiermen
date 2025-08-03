import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseUrlOld = process.env.SUPABASE_URL;
    const supabaseAnonKeyOld = process.env.SUPABASE_ANON_KEY;
    
    console.log('🔍 Environment variables test:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Not set');
    console.log('SUPABASE_URL:', supabaseUrlOld ? 'Set' : 'Not set');
    console.log('SUPABASE_ANON_KEY:', supabaseAnonKeyOld ? 'Set' : 'Not set');

    return NextResponse.json({
      success: true,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'Configured' : 'Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Configured' : 'Missing',
        SUPABASE_URL: supabaseUrlOld ? 'Configured' : 'Missing',
        SUPABASE_ANON_KEY: supabaseAnonKeyOld ? 'Configured' : 'Missing'
      },
      values: {
        supabaseUrl: supabaseUrl,
        supabaseKeyStart: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : null,
        supabaseUrlOld: supabaseUrlOld,
        supabaseKeyOldStart: supabaseAnonKeyOld ? supabaseAnonKeyOld.substring(0, 20) + '...' : null
      }
    });

  } catch (error: any) {
    console.error('❌ Environment test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 