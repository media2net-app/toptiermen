import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function POST() {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    
    const email = 'chiel@media2net.nl';
    const password = 'W4t3rk0k3r^';
    const fullName = 'Chiel van der Zee';
    
    console.log('🔧 Setting up Chiel as admin:', email);
    
    // First, check if Chiel already exists in auth
    const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ Error checking existing users:', checkError);
      return NextResponse.json({
        success: false,
        error: checkError.message
      }, { status: 400 });
    }

    // Find Chiel in the user list
    const chielAuthUser = existingUser.users.find(u => u.email === email);
    
    if (chielAuthUser) {
      console.log('✅ Chiel already exists in auth, updating password and role');
      
      // Update password
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        chielAuthUser.id,
        { password: password }
      );

      if (passwordError) {
        console.error('❌ Error updating password:', passwordError);
        return NextResponse.json({
          success: false,
          error: passwordError.message
        }, { status: 400 });
      }

      // Update role in users table
      const { error: roleError } = await supabase
        .from('users')
        .update({ role: 'ADMIN' })
        .eq('email', email);

      if (roleError) {
        console.error('❌ Error updating role:', roleError);
        return NextResponse.json({
          success: false,
          error: 'Password updated but failed to update role'
        }, { status: 400 });
      }

      console.log('✅ Chiel updated successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Chiel updated successfully',
        user: {
          id: chielAuthUser.id,
          email: chielAuthUser.email,
          full_name: fullName,
          role: 'ADMIN'
        }
      });
    } else {
      console.log('🔧 Creating new auth user for Chiel');
      
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
        console.log('✅ Auth user created for Chiel');
        
        // Update the existing user record with the auth user ID and admin role
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            id: authData.user.id,
            role: 'ADMIN'
          })
          .eq('email', email);

        if (updateError) {
          console.error('❌ Error updating user record:', updateError);
          return NextResponse.json({
            success: false,
            error: 'Auth user created but failed to update profile'
          }, { status: 400 });
        }

        console.log('✅ Chiel profile updated with auth ID and admin role');
        
        return NextResponse.json({
          success: true,
          message: 'Chiel setup complete',
          user: {
            id: authData.user.id,
            email: authData.user.email,
            full_name: fullName,
            role: 'ADMIN'
          }
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to setup Chiel'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Setup Chiel admin error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 