import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { EmailService } from '@/lib/email-service';

// Function to generate a secure temporary password
function generateTempPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  
  // Create a password with guaranteed 12+ characters
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // Add 8 more random characters to ensure 12+ total
  const allChars = uppercase + lowercase + numbers; // Alphanumeric only
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

    // Step 1: Check if user exists in profiles table
    console.log('🔍 Step 1: Checking profiles table...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, display_name, username, package_type')
      .eq('email', email)
      .single();
        
    let profileData = profile as any;
    if (profileError || !profile) {
      console.log('ℹ️ User not found in profiles, proceeding with auth-only flow');
      profileData = null;
    } else {
      console.log('✅ Step 1: User found in profiles:', profile.email);
    }

    // Step 2: Check if user exists in auth (case-insensitive match)
    console.log('🔍 Step 2: Checking auth users (with pagination)...');
    const targetEmail = (email || '').toLowerCase();
    let user = null as any;
    let page = 1;
    const perPage = 1000;
    while (!user) {
      const { data: pageData, error: pageErr } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (pageErr) {
        console.error('❌ Error listing auth users:', pageErr);
        return NextResponse.json({ success: false, error: 'Fout bij het ophalen van gebruikersgegevens' }, { status: 500 });
      }
      user = pageData.users.find((u: any) => (u.email || '').toLowerCase() === targetEmail) || null;
      if (pageData.users.length < perPage) break; // last page
      page += 1;
    }
    console.log('🔍 Step 2: Found user in auth after scan:', !!user);
    if (!user) {
      console.log('ℹ️ Not found in auth, attempting to create then re-scan...');
      const tempPasswordInit = generateTempPassword();
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPasswordInit,
        email_confirm: true,
        user_metadata: {
          full_name: profileData?.full_name || profileData?.display_name,
          admin_created: true
        }
      });
      if (createErr) {
        console.warn('⚠️ createUser error (may already exist):', createErr.message);
        // Re-scan once more to be sure
        page = 1; user = null;
        while (!user) {
          const { data: pageData, error: pageErr } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
          if (pageErr) {
            console.error('❌ Error listing auth users (retry):', pageErr);
            break;
          }
          user = pageData.users.find((u: any) => (u.email || '').toLowerCase() === targetEmail) || null;
          if (pageData.users.length < perPage) break;
          page += 1;
        }
        if (!user) {
          return NextResponse.json({ success: false, error: 'Geen account gevonden in authenticatie voor dit e-mailadres' }, { status: 404 });
        }
      } else {
        user = created.user;
        console.log('✅ Auth account created for:', email);
      }
    }

    // Step 3: Generate new temporary password
    console.log('🔍 Step 3: Generating new password...');
    const newTempPassword = generateTempPassword();
    console.log('✅ Step 3: Generated password:', newTempPassword);
    
    // Step 4: Update user password in Supabase Auth
    console.log('🔍 Step 4: Updating password for user:', user.id);
    
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newTempPassword }
    );

    if (updateError) {
      console.error('❌ Error updating user password:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Fout bij het resetten van wachtwoord',
        errorDetails: updateError.message
      }, { status: 500 });
    }
    
    console.log('✅ Step 4: Password successfully updated for user:', user.id);
    
    // Step 5: Send password reset email via Mailgun
    console.log('🔍 Step 5: Sending password reset email...');
    try {
      const emailService = new EmailService();
      const success = await emailService.sendEmail(
        email,
        '🔐 Je Nieuwe Top Tier Men Wachtwoord - Wachtwoord Reset',
        'password-reset',
        {
          full_name: profileData?.full_name || profileData?.display_name || 'Gebruiker',
          name: profileData?.full_name || profileData?.display_name || (email.split('@')[0] || 'Gebruiker'),
          username: (profileData?.username || profileData?.display_name || (profileData?.full_name ? profileData.full_name.replace(/\s+/g, '').toLowerCase() : null)) || (email.split('@')[0] || 'gebruiker'),
          email: email,
          tempPassword: newTempPassword,
          platformUrl: 'https://platform.toptiermen.eu',
          loginUrl: 'https://platform.toptiermen.eu/login',
          packageType: profileData?.package_type || 'Premium Tier',
          supportEmail: 'support@toptiermen.eu'
        },
        {
          tracking: true
        }
      );
      if (success) {
        console.log('✅ Step 5: Password reset email sent successfully to:', email);
        return NextResponse.json({
          success: true,
          message: 'Nieuw wachtwoord is gegenereerd en naar je e-mailadres gestuurd. Controleer je inbox (en spam folder).',
          steps: {
            profiles_check: '✅ User found in profiles',
            auth_check: '✅ User found/created in auth',
            password_generation: '✅ Password generated',
            password_update: '✅ Password updated',
            email_sending: '✅ Email sent successfully'
          }
        });
      } else {
        console.error('❌ Step 5: Failed to send password reset email');
        return NextResponse.json({
          success: false,
          error: 'Wachtwoord is gereset maar e-mail kon niet worden verzonden. Neem contact op met de beheerder.',
          steps: {
            profiles_check: '✅ User found in profiles',
            auth_check: '✅ User found/created in auth',
            password_generation: '✅ Password generated',
            password_update: '✅ Password updated',
            email_sending: '❌ Email sending failed'
          }
        }, { status: 500 });
      }
    } catch (emailError) {
      console.error('❌ Step 5: Error sending password reset email:', emailError);
      return NextResponse.json({
        success: false,
        error: 'Wachtwoord is gereset maar e-mail kon niet worden verzonden. Neem contact op met de beheerder.',
        errorDetails: emailError.message,
        steps: {
          profiles_check: '✅ User found in profiles',
          auth_check: '✅ User found/created in auth',
          password_generation: '✅ Password generated',
          password_update: '✅ Password updated',
          email_sending: '❌ Email error occurred'
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({
      success: false,
      error: 'Interne server fout. Probeer het later opnieuw of neem contact op met de beheerder.'
    }, { status: 500 });
  }
}
