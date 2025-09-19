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

    // Get user by email
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError) {
      console.error('❌ API: Error getting user:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.user) {
      console.log('⚠️ API: User not found for email:', email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Sign out all sessions for this user
    const { error: signOutError } = await supabase.auth.admin.signOut(user.user.id);
    
    if (signOutError) {
      console.error('❌ API: Error signing out user sessions:', signOutError);
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
