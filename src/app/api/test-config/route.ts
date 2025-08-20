import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
    const mollieLiveKey = process.env.MOLLIE_LIVE_KEY;
    const mollieTestKey = process.env.MOLLIE_TEST_KEY;

    const config = {
      supabase: {
        url: supabaseUrl ? 'Configured' : 'NOT CONFIGURED',
        anonKey: supabaseAnonKey ? 'Configured' : 'NOT CONFIGURED',
        urlValue: supabaseUrl || 'null',
        anonKeyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'null'
      },
      facebook: {
        appId: facebookAppId ? 'Configured' : 'NOT CONFIGURED',
        appSecret: facebookAppSecret ? 'Configured' : 'NOT CONFIGURED',
        appIdValue: facebookAppId || 'null',
        appSecretValue: facebookAppSecret ? `${facebookAppSecret.substring(0, 10)}...` : 'null'
      },
      mollie: {
        liveKey: mollieLiveKey ? 'Configured' : 'NOT CONFIGURED',
        testKey: mollieTestKey ? 'Configured' : 'NOT CONFIGURED',
        liveKeyValue: mollieLiveKey ? `${mollieLiveKey.substring(0, 10)}...` : 'null',
        testKeyValue: mollieTestKey ? `${mollieTestKey.substring(0, 10)}...` : 'null'
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    // Check if Supabase is properly configured
    const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
      supabaseUrl !== 'https://placeholder.supabase.co' && 
      supabaseAnonKey !== 'placeholder-key';

    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables are not properly configured',
        config
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'All environment variables are properly configured',
      config
    });

  } catch (error) {
    console.error('Config test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
