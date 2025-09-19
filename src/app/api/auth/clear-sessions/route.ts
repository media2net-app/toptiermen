import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('🔄 API: Clearing all sessions for user:', email);

    // Get user ID from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (profileError || !profile) {
      console.error('❌ API: Profile not found for email:', email, profileError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user to clear all sessions (they can re-register)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(profile.id);
    
    if (deleteError) {
      console.error('❌ API: Error deleting user:', deleteError);
      return NextResponse.json(
        { error: 'Failed to clear sessions' },
        { status: 500 }
      );
    }

    console.log('✅ API: All sessions cleared for user:', email);

    return NextResponse.json({
      success: true,
      message: 'All sessions cleared successfully'
    });

  } catch (error) {
    console.error('❌ API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
