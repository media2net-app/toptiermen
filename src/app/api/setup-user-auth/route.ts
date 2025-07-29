import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();
    
    console.log('🔧 Setting up Supabase Auth for:', email);
    
    // First, check if user already exists in auth by trying to sign in
    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-password-to-check-existence'
    });
    
    if (checkError && checkError.message.includes('Invalid login credentials')) {
      // User doesn't exist, we can proceed
      console.log('✅ User does not exist in auth, proceeding with creation');
    } else if (checkError && checkError.message.includes('Email not confirmed')) {
      // User exists but email not confirmed
      console.log('⚠️ User exists but email not confirmed:', email);
      return NextResponse.json({
        success: false,
        error: 'User exists but email not confirmed'
      }, { status: 400 });
    } else if (!checkError) {
      // User exists and can sign in
      console.log('⚠️ User already exists in auth:', email);
      return NextResponse.json({
        success: false,
        error: 'User already exists in Supabase Auth'
      }, { status: 400 });
    }

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
      
      // Update the existing user record with the auth user ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ id: authData.user.id })
        .eq('email', email);

      if (updateError) {
        console.error('❌ Error updating user record:', updateError);
        return NextResponse.json({
          success: false,
          error: 'Auth user created but failed to update profile'
        }, { status: 400 });
      }

      console.log('✅ User profile updated with auth ID');
      
      return NextResponse.json({
        success: true,
        message: 'User setup complete',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: fullName
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create auth user'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Setup user auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 