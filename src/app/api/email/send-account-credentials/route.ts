import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Starting account credentials email send...');
    
    const emailService = new EmailService();
    
    // Get user data from database
    console.log('🔍 Fetching user data for lemicky_91@icloud.com...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', 'lemicky_91@icloud.com')
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
      return NextResponse.json({ 
        success: false, 
        error: 'User not found in database' 
      }, { status: 404 });
    }

    console.log('✅ User profile found:', profile);

    // Get the actual password from auth.users table
    console.log('🔍 Fetching auth user data...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch auth data' 
      }, { status: 500 });
    }

    const authUser = authUsers.users.find(u => u.email === 'lemicky_91@icloud.com');
    if (!authUser) {
      console.error('❌ Auth user not found');
      return NextResponse.json({ 
        success: false, 
        error: 'Auth user not found' 
      }, { status: 404 });
    }

    console.log('✅ Auth user found:', authUser.id);

    // For now, we'll use a known password or generate a new one
    // Since we can't retrieve the actual password from Supabase auth, we'll generate a new one
    const tempPassword = 'Lemicky2025!';
    
    // Update the user's password in auth to ensure synchronization
    try {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUser.id,
        { password: tempPassword }
      );
      if (updateError) {
        console.error('❌ Error updating password:', updateError);
      } else {
        console.log('✅ Password updated in auth:', tempPassword);
      }
    } catch (error) {
      console.error('❌ Error updating password:', error);
    }
    
    // Send account credentials email to lemicky_91@icloud.com
    const success = await emailService.sendEmail(
      'lemicky_91@icloud.com',
      'Je Top Tier Men Accountgegevens - Platform',
      'account-credentials',
      {
        name: profile.full_name || profile.display_name || 'lemicky_91',
        email: 'lemicky_91@icloud.com',
        username: profile.display_name || 'lemicky_91',
        tempPassword: tempPassword,
        platformUrl: 'https://platform.toptiermen.eu',
        loginUrl: 'https://platform.toptiermen.eu/login',
        packageType: profile.package_type || 'Premium Tier',
        supportEmail: 'support@toptiermen.eu'
      },
      {
        tracking: true
      }
    );

    if (success) {
      console.log('✅ Account credentials sent successfully to lemicky_91@icloud.com');
      return NextResponse.json({ 
        success: true, 
        message: 'Account credentials sent successfully to lemicky_91@icloud.com',
        recipient: 'lemicky_91@icloud.com'
      });
    } else {
      console.error('❌ Failed to send account credentials to lemicky_91@icloud.com');
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send account credentials' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in send account credentials API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
