import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('🔧 Force password reset for:', email);
    
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

    // 2. Generate a new password
    const newPassword = 'NewPassword123!';
    
    // 3. Try to update password directly using the profile ID
    try {
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        profile.id, // Use profile ID directly
        { password: newPassword }
      );

      if (updateError) {
        console.error('❌ Error updating password:', updateError);
        
        // If user doesn't exist in auth, create them
        if (updateError.message.includes('User not found')) {
          console.log('🔍 User not found in auth, creating...');
          
          const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            id: profile.id, // Use profile ID
            email: email,
            password: newPassword,
            email_confirm: true,
            user_metadata: {
              full_name: profile.full_name || profile.display_name,
              admin_created: true
            }
          });
          
          if (createError) {
            console.error('❌ Error creating auth account:', createError);
            return NextResponse.json({
              success: false,
              error: 'Error creating auth account: ' + createError.message
            }, { status: 500 });
          }
          
          console.log('✅ Auth account created for:', email);
        } else {
          return NextResponse.json({
            success: false,
            error: 'Error updating password: ' + updateError.message
          }, { status: 500 });
        }
      } else {
        console.log('✅ Password updated successfully');
      }
    } catch (error) {
      console.error('❌ Error in password update:', error);
      return NextResponse.json({
        success: false,
        error: 'Error in password update: ' + error.message
      }, { status: 500 });
    }

    // 4. Send email with new password
    try {
      const emailService = new EmailService();
      const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/login`;
      
      const emailSuccess = await emailService.sendEmail(
        email,
        '🔐 Je Nieuwe Top Tier Men Wachtwoord - Wachtwoord Reset',
        'password-reset',
        {
          name: profile.full_name || profile.display_name || 'Gebruiker',
          email: email,
          username: profile.display_name || email.split('@')[0],
          tempPassword: newPassword,
          loginUrl: loginUrl,
          packageType: profile.package_type || 'Basic Tier',
          isTestUser: 'false',
          platformUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'
        },
        { tracking: true }
      );

      if (emailSuccess) {
        console.log('✅ Password reset email sent to:', email);
      } else {
        console.error('❌ Failed to send password reset email');
        return NextResponse.json({
          success: false,
          error: 'Password updated but email failed to send'
        }, { status: 500 });
      }
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);
      return NextResponse.json({
        success: false,
        error: 'Password updated but email failed to send'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Password reset successful. New password: ${newPassword}`,
      user: {
        id: profile.id,
        email: email,
        password: newPassword
      }
    });

  } catch (error) {
    console.error('❌ Force password reset error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
