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

    // Check if user exists in auth first
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return NextResponse.json({
        success: false,
        error: 'Fout bij het ophalen van gebruikersgegevens'
      }, { status: 500 });
    }

    let user = authUsers.users.find(u => u.email === email);
    
    // If not found in auth, check profiles table and create auth account if needed
    if (!user) {
      console.log('🔍 User not found in auth, checking profiles table...');
      
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
        
      if (profileError || !profile) {
        console.log('❌ User not found in profiles either');
        return NextResponse.json({
          success: false,
          error: 'Geen account gevonden met dit e-mailadres'
        }, { status: 404 });
      }
      
      console.log('✅ User found in profiles, creating auth account...');
      
      // Try to create auth account for this user
      const tempPassword = generateTempPassword();
      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: profile.full_name,
          admin_created: true
        }
      });
      
      if (createError) {
        console.error('❌ Error creating auth account:', createError);
        
        // If user already exists but is not visible in listUsers, try to send email anyway
        if (createError.message.includes('already been registered') || createError.message.includes('email_exists')) {
          console.log('🔄 User exists but not visible, proceeding with email...');
          
          // Send email with new password (since user exists but auth account creation failed)
          try {
            const emailService = new EmailService();
            const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/login`;
            const newTempPassword = generateTempPassword();
            
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
              return NextResponse.json({
                success: true,
                message: 'Nieuw wachtwoord is gegenereerd en per e-mail verzonden'
              });
            }
          } catch (emailError) {
            console.error('❌ Error sending help email:', emailError);
          }
        }
        
        return NextResponse.json({
          success: false,
          error: 'Account bestaat maar er is een technisch probleem. Neem contact op met de beheerder.'
        }, { status: 500 });
      }
      
      user = newAuthUser.user;
      console.log('✅ Auth account created for:', email);
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
      
      // Check if SMTP configuration is available
      if (!process.env.SMTP_PASSWORD) {
        console.error('❌ SMTP_PASSWORD environment variable is not set on live server');
        return NextResponse.json({
          success: false,
          error: 'E-mail service is momenteel niet beschikbaar. Neem contact op met de beheerder.'
        }, { status: 503 });
      }
      
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
          error: 'Fout bij het versturen van e-mail. Probeer het later opnieuw.'
        }, { status: 500 });
      }
    } catch (emailError) {
      console.error('❌ Error sending password reset email:', emailError);
      return NextResponse.json({
        success: false,
        error: 'E-mail service is momenteel niet beschikbaar. Neem contact op met de beheerder.'
      }, { status: 503 });
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
