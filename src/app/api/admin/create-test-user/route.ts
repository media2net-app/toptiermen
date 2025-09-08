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
      
      // Create user profile using admin client
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            full_name: fullName,
            role: 'USER' // Set role to 'USER' for test users
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

      // Also add to test_profiles table
      const { error: testUserError } = await supabase
        .from('test_users')
        .insert([
          {
            user_id: authData.user.id,
            name: fullName,
            email: authData.user.email,
            status: 'active',
            assigned_modules: ['Dashboard', 'Academy', 'Trainingscentrum'],
            test_start_date: new Date().toISOString().split('T')[0],
            test_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ])
        .select();

      if (testUserError) {
        console.error('❌ Error creating test user record:', testUserError);
        // Don't fail completely, user was created
      }

      console.log('✅ User profile and test user record created');
      
      return NextResponse.json({
        success: true,
        message: 'Test user created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: fullName,
          password: password, // Only for testing!
          role: 'USER'
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