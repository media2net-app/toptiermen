import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Logout API called');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No valid authorization token provided'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log('❌ User not authenticated for logout');
      return NextResponse.json({
        success: false,
        error: 'User not authenticated'
      }, { status: 401 });
    }

    console.log('✅ User authenticated for logout:', user.email);

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('❌ Error signing out user:', signOutError);
      return NextResponse.json({
        success: false,
        error: 'Failed to sign out user'
      }, { status: 500 });
    }

    console.log('✅ User signed out successfully:', user.email);
    
    return NextResponse.json({
      success: true,
      message: 'User signed out successfully'
    });

  } catch (error) {
    console.error('❌ Logout API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
