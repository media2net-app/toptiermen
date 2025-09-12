import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { EmailService } from '@/lib/email-service';

// Function to generate a secure temporary password
function generateTempPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest with random characters
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('🔧 Password reset requested for:', email);
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'E-mailadres is verplicht'
      }, { status: 400 });
    }

    // Check if user exists
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return NextResponse.json({
        success: false,
        error: 'Fout bij het ophalen van gebruikersgegevens'
      }, { status: 500 });
    }

    const user = authUsers.users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Geen account gevonden met dit e-mailadres'
      }, { status: 404 });
    }

    // Get user profile for full name
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, display_name, package_type')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
      return NextResponse.json({
        success: false,
        error: 'Fout bij het ophalen van gebruikersprofiel'
      }, { status: 500 });
    }

    // Generate new temporary password
    const newTempPassword = generateTempPassword();
    
    // Update user password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newTempPassword }
    );

    if (updateError) {
      console.error('❌ Error updating user password:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Fout bij het resetten van wachtwoord'
      }, { status: 500 });
    }

    // Send account credentials email with new password
    try {
      console.log(`📧 Sending password reset email to: ${email}`);
      
      const emailService = new EmailService();
      const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/login`;
      
      const emailSuccess = await emailService.sendEmail(
        email,
        '🔐 Je Nieuwe Top Tier Men Wachtwoord - Wachtwoord Reset',
        'password-reset',
        {
          name: profile?.full_name || profile?.display_name || 'Gebruiker',
          email: email,
          username: profile?.display_name || email.split('@')[0],
          tempPassword: newTempPassword,
          loginUrl: loginUrl,
          packageType: profile?.package_type || 'Basic Tier',
          isTestUser: 'false',
          platformUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'
        },
        { tracking: true }
      );

      if (emailSuccess) {
        console.log(`✅ Password reset email sent to: ${email}`);
      } else {
        console.error(`❌ Failed to send password reset email to: ${email}`);
        return NextResponse.json({
          success: false,
          error: 'Fout bij het versturen van e-mail'
        }, { status: 500 });
      }
    } catch (emailError) {
      console.error('❌ Error sending password reset email:', emailError);
      return NextResponse.json({
        success: false,
        error: 'Fout bij het versturen van e-mail'
      }, { status: 500 });
    }

    console.log('✅ Password reset completed successfully for:', email);
    
    return NextResponse.json({
      success: true,
      message: 'Nieuw wachtwoord is gegenereerd en per e-mail verzonden'
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json({
      success: false,
      error: 'Interne server fout'
    }, { status: 500 });
  }
}
