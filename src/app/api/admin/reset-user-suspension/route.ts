import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Get user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch users'
      }, { status: 500 });
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Reset user metadata to remove suspension
    const cleanMetadata = {
      email: user.email,
      email_verified: true,
      full_name: user.user_metadata?.full_name || 'User',
      phone_verified: false,
      role: user.user_metadata?.role || 'user',
      sub: user.id
    };

    // Update user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: cleanMetadata,
      app_metadata: {
        provider: 'email',
        providers: ['email'],
        role: user.user_metadata?.role || 'user'
      }
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `User suspension reset for ${email}`,
      user: {
        id: user.id,
        email: user.email,
        metadata: cleanMetadata
      }
    });

  } catch (error) {
    console.error('Reset suspension error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
