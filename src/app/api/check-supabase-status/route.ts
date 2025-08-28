import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking Supabase status...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing environment variables',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Test 1: Basic connectivity
    const basicResponse = await fetch(supabaseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (basicResponse.status === 520) {
      return NextResponse.json({
        status: 'unhealthy',
        message: 'Supabase server error 520 - Cloudflare/Supabase issue',
        error: 'server_error',
        timestamp: new Date().toISOString()
      });
    }

    // Test 2: Auth endpoint
    const authEndpoint = `${supabaseUrl}/auth/v1/token?grant_type=password`;
    const authResponse = await fetch(authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    });

    const authResponseText = await authResponse.text();
    
    if (authResponseText.includes('<!DOCTYPE')) {
      return NextResponse.json({
        status: 'unhealthy',
        message: 'Auth endpoint returning HTML instead of JSON',
        error: 'auth_endpoint_error',
        timestamp: new Date().toISOString()
      });
    }

    // Test 3: Database endpoint
    const dbEndpoint = `${supabaseUrl}/rest/v1/profiles?select=count&limit=1`;
    const dbResponse = await fetch(dbEndpoint, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    if (dbResponse.status === 200) {
      return NextResponse.json({
        status: 'healthy',
        message: 'Supabase is working correctly',
        timestamp: new Date().toISOString(),
        tests: {
          basic_connectivity: 'passed',
          auth_endpoint: 'passed',
          database_endpoint: 'passed'
        }
      });
    } else {
      return NextResponse.json({
        status: 'degraded',
        message: 'Supabase partially working - database issues',
        error: 'database_error',
        timestamp: new Date().toISOString(),
        tests: {
          basic_connectivity: 'passed',
          auth_endpoint: 'passed',
          database_endpoint: 'failed'
        }
      });
    }

  } catch (error) {
    console.error('❌ Supabase status check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check Supabase status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
