import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { EmailService } from '@/lib/email-service';

// Function to generate a secure temporary password
function generateTempPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Create a password with guaranteed 12+ characters
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Add 8 more random characters to ensure 12+ total
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 0; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password array
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
  
  const finalPassword = passwordArray.join('');
  
  console.log(`🔑 Generated password: ${finalPassword} (length: ${finalPassword.length})`);
  return finalPassword;
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

    // First, check if user exists in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, display_name, package_type')
      .eq('email', email)
      .single();
        
    if (profileError || !profile) {
      console.log('❌ User not found in profiles');
      return NextResponse.json({
        success: false,
        error: 'Geen account gevonden met dit e-mailadres'
      }, { status: 404 });
    }
    
    console.log('✅ User found in profiles:', profile.email);

    // Now check if user exists in auth
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing auth users:', listError);
      return NextResponse.json({
        success: false,
        error: 'Fout bij het ophalen van gebruikersgegevens'
      }, { status: 500 });
    }

    let user = authUsers.users.find(u => u.email === email);
    
    // If user doesn't exist in auth, create auth account
    if (!user) {
      console.log('🔍 User not found in auth, creating auth account...');
      
      const tempPassword = generateTempPassword();
      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
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
        
        // If user already exists but not visible, try to find them
        if (createError.message.includes('already been registered') || createError.message.includes('email_exists')) {
          console.log('🔄 User exists but not visible, trying to find...');
          
          // Try multiple times to find the user
          for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`🔄 Attempt ${attempt} to find user...`);
            
            const { data: retryAuthUsers, error: retryError } = await supabaseAdmin.auth.admin.listUsers();
            
            if (!retryError && retryAuthUsers) {
              const foundUser = retryAuthUsers.users.find((u: any) => u.email === email);
              if (foundUser) {
                console.log(`✅ Found user on attempt ${attempt}:`, foundUser.id);
                user = foundUser;
                break;
              }
            }
            
            // Wait before retry
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        if (!user) {
          console.error('❌ Could not find or create auth user after all attempts');
          return NextResponse.json({
            success: false,
            error: 'Account bestaat maar er is een technisch probleem. Neem contact op met de beheerder.'
          }, { status: 500 });
        }
      } else {
        user = newAuthUser.user;
        console.log('✅ Auth account created for:', email);
      }
    }

    // Generate new temporary password
    const newTempPassword = generateTempPassword();
    
    // Update user password in Supabase Auth
    console.log(`🔄 Updating password for user ${user.id} with password: ${newTempPassword} (length: ${newTempPassword.length})`);
    
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
    
    console.log(`✅ Password successfully updated for user ${user.id}`);

    // Send account credentials email with new password
    try {
      console.log(`📧 Sending password reset email to: ${email}`);
      
      const emailService = new EmailService();
      const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/login`;
      
      // Log the variables being sent to email template
      const emailVariables = {
        name: profile.full_name || profile.display_name || 'Gebruiker',
        email: email,
        username: profile.display_name || email.split('@')[0],
        tempPassword: newTempPassword,
        loginUrl: loginUrl,
        packageType: profile.package_type || 'Basic Tier',
        isTestUser: 'false',
        platformUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'
      };
      
      console.log('📧 Email variables:', {
        ...emailVariables,
        tempPassword: `[${newTempPassword.length} chars] ${newTempPassword.substring(0, 3)}...`
      });
      
      const emailSuccess = await emailService.sendEmail(
        email,
        '🔐 Je Nieuwe Top Tier Men Wachtwoord - Wachtwoord Reset',
        'password-reset',
        emailVariables,
        { tracking: true, userId: user.id }
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
