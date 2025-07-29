import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { email, password } = await request.json();

    console.log('🔐 Testing login for:', email);

    // Test login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Login error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }

    if (!data.user) {
      return NextResponse.json({
        success: false,
        error: 'No user returned from login'
      });
    }

    console.log('✅ Login successful for:', data.user.email);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'unknown'
      },
      session: {
        accessToken: data.session?.access_token ? 'Present' : 'Missing',
        refreshToken: data.session?.refresh_token ? 'Present' : 'Missing'
      }
    });

  } catch (error) {
    console.error('❌ Test login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    });
  }
} 