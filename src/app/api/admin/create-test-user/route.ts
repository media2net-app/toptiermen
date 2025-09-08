import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();
    
    console.log('🔧 Creating test user:', email);
    
    // Initialize Supabase client
    const supabase = supabaseAdmin;
    
    // Create new user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return NextResponse.json({
        success: false,
        error: authError.message
      }, { status: 400 });
    }

    if (authData.user) {
      console.log('✅ Auth user created:', authData.user.email);
      
      // Create user profile using admin client (bypass RLS with service role)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            full_name: fullName,
            role: 'user'
          }
        ])
        .select();

      if (profileError) {
        console.error('❌ Error creating profile:', profileError);
        console.error('Profile error details:', JSON.stringify(profileError, null, 2));
        return NextResponse.json({
          success: false,
          error: 'Auth user created but failed to create profile',
          details: profileError.message
        }, { status: 400 });
      }

      console.log('✅ Profile created successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Test user created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: fullName,
          password: password, // Only for testing!
          role: 'test'
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create auth user'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Create test user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 