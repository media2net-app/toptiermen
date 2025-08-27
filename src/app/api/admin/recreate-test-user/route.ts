import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();
    
    console.log('🔧 Recreating test user:', email);
    
    // First, delete existing user if exists
    const { error: deleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('email', email);

    if (deleteError) {
      console.error('❌ Error deleting existing user:', deleteError);
    }

    // Create new user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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
      
      // Create user profile with test role
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            full_name: fullName,
            role: 'test'
          }
        ])
        .select();

      if (profileError) {
        console.error('❌ Error creating profile:', profileError);
        return NextResponse.json({
          success: false,
          error: 'Auth user created but failed to create profile'
        }, { status: 400 });
      }

      console.log('✅ User profile created with test role');
      
      return NextResponse.json({
        success: true,
        message: 'Test user recreated successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: fullName,
          password: password,
          role: 'test'
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create auth user'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Recreate test user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 