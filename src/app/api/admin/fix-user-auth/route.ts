import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('🔧 Fixing user auth for:', email);
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // 1. Check if user exists in profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, display_name, package_type')
      .eq('email', email)
      .single();
        
    if (profileError || !profile) {
      console.log('❌ User not found in profiles');
      return NextResponse.json({
        success: false,
        error: 'User not found in profiles'
      }, { status: 404 });
    }
    
    console.log('✅ User found in profiles:', profile.email);

    // 2. Try to find user in auth with multiple attempts
    let user = null;
    
    try {
      // Try multiple times to find the user
      for (let attempt = 1; attempt <= 5; attempt++) {
        console.log(`🔄 Attempt ${attempt} to find user in auth...`);
        
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.error('❌ Error listing auth users:', listError);
          if (attempt === 5) {
            return NextResponse.json({
              success: false,
              error: 'Error listing auth users'
            }, { status: 500 });
          }
          continue;
        }

        user = authUsers.users.find(u => u.email === email);
        
        if (user) {
          console.log(`✅ User found on attempt ${attempt}:`, user.id);
          break;
        }
        
        // Wait before retry
        if (attempt < 5) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      console.error('❌ Error finding user:', error);
      return NextResponse.json({
        success: false,
        error: 'Error finding user: ' + error.message
      }, { status: 500 });
    }
    
    if (!user) {
      console.log('🔍 User not found in auth, but profile exists. This is a sync issue.');
      console.log('🔄 Creating a new auth account with the profile ID...');
      
      // Create auth account using the profile ID
      const tempPassword = 'NewPassword123!';
      
      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        id: profile.id, // Use the profile ID to ensure sync
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: profile.full_name || profile.display_name,
          admin_created: true
        }
      });
      
      if (createError) {
        console.error('❌ Error creating auth account:', createError);
        
        // If user already exists but not visible, this is a sync issue
        if (createError.message.includes('already been registered') || createError.message.includes('email_exists')) {
          console.log('🔄 User exists but has sync issues. Trying to find with profile ID...');
          
          // Try to find user by profile ID
          const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          
          if (!listError && authUsers) {
            const foundUser = authUsers.users.find((u: any) => u.id === profile.id);
            if (foundUser) {
              console.log('✅ Found user by profile ID:', foundUser.id);
              user = foundUser;
            }
          }
        }
        
        if (!user) {
          return NextResponse.json({
            success: false,
            error: 'User exists but has sync issues. Please contact administrator.'
          }, { status: 500 });
        }
      } else {
        user = newAuthUser.user;
        console.log('✅ Auth account created with profile ID:', email);
      }
    } else {
      console.log('✅ Auth user found:', user.id);
    }

    // 3. Update password to a known value
    const newPassword = 'NewPassword123!';
    
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Error updating password: ' + updateError.message
      }, { status: 500 });
    }
    
    console.log('✅ Password updated successfully');

    return NextResponse.json({
      success: true,
      message: `User auth fixed successfully. New password: ${newPassword}`,
      user: {
        id: user.id,
        email: user.email,
        password: newPassword
      }
    });

  } catch (error) {
    console.error('❌ Fix user auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
