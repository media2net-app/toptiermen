import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        healthy: false,
        error: 'No token provided'
      }, { status: 401 });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({
        healthy: false,
        error: 'Invalid or expired token'
      }, { status: 401 });
    }

    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({
        healthy: false,
        error: 'User profile not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      healthy: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile.role
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Session health check error:', error);
    return NextResponse.json({
      healthy: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
