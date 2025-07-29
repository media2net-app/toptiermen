import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('🧪 Testing Supabase auth for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Auth error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    if (data.user) {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile error:', profileError);
      }

      console.log('✅ Auth successful for:', data.user.email);
      
      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: profile?.full_name,
          role: profile?.role || 'USER'
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'No user data returned'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Test auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 