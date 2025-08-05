import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();
    
    console.log('🔧 Deleting and recreating user:', email);
    
    // Step 1: Delete user from auth.users
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing auth users:', listError);
      return NextResponse.json({
        success: false,
        error: listError.message
      }, { status: 400 });
    }

    const authUser = authUsers.users.find(user => user.email === email);
    
    if (authUser) {
      console.log('🗑️ Deleting user from auth:', authUser.id);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      
      if (deleteError) {
        console.error('❌ Error deleting auth user:', deleteError);
      } else {
        console.log('✅ Auth user deleted');
      }
    } else {
      console.log('ℹ️ User not found in auth.users');
    }

    // Step 2: Delete from public.users if exists
    const { error: deletePublicError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('email', email);

    if (deletePublicError) {
      console.error('❌ Error deleting from public.users:', deletePublicError);
    } else {
      console.log('✅ User deleted from public.users');
    }

    // Step 3: Create new user
    console.log('👤 Creating new user...');
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
        .from('users')
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
        message: 'User deleted and recreated successfully',
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
    console.error('❌ Delete and recreate user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 