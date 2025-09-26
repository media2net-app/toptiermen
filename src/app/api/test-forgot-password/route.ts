import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('🧪 TESTING: Password reset for:', email);
    
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
      .select('id, email, full_name, display_name, package_type')
      .eq('email', email)
      .single();
        
    if (profileError || !profile) {
      console.log('❌ User not found in profiles:', profileError);
      return NextResponse.json({
        success: false,
        error: 'Geen account gevonden met dit e-mailadres',
        step: 'profiles_check',
        errorDetails: profileError
      }, { status: 404 });
    }
    
    console.log('✅ Step 1: User found in profiles:', profile.email);

    // Step 2: Check if user exists in auth
    console.log('🔍 Step 2: Checking auth users...');
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing auth users:', listError);
      return NextResponse.json({
        success: false,
        error: 'Fout bij het ophalen van gebruikersgegevens',
        step: 'auth_list',
        errorDetails: listError
      }, { status: 500 });
    }

    let user = authUsers.users.find(u => u.email === email);
    console.log('🔍 Step 2: Found user in auth:', !!user);

    // Step 3: Generate new password
    console.log('🔍 Step 3: Generating new password...');
    const newTempPassword = generateTempPassword();
    console.log('✅ Step 3: Generated password:', newTempPassword);

    // Step 4: Update password in auth
    if (user) {
      console.log('🔍 Step 4: Updating existing user password...');
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newTempPassword }
      );

      if (updateError) {
        console.error('❌ Error updating user password:', updateError);
        return NextResponse.json({
          success: false,
          error: 'Fout bij het resetten van wachtwoord',
          step: 'password_update',
          errorDetails: updateError
        }, { status: 500 });
      }
      
      console.log('✅ Step 4: Password updated successfully');
    } else {
      console.log('🔍 Step 4: Creating new auth user...');
      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: newTempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: profile.full_name || profile.display_name,
          admin_created: true
        }
      });
      
      if (createError) {
        console.error('❌ Error creating auth user:', createError);
        return NextResponse.json({
          success: false,
          error: 'Fout bij het aanmaken van auth account',
          step: 'auth_create',
          errorDetails: createError
        }, { status: 500 });
      }
      
      user = newAuthUser.user;
      console.log('✅ Step 4: Auth user created successfully');
    }

    // Step 5: Test email sending
    console.log('🔍 Step 5: Testing email sending...');
    try {
      const emailService = new EmailService();
      
      const success = await emailService.sendEmail(
        email,
        '🔐 TEST - Je Nieuwe Top Tier Men Wachtwoord',
        'password-reset',
        {
          name: profile.full_name || profile.display_name || 'Gebruiker',
          email: email,
          tempPassword: newTempPassword,
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
        console.log('✅ Step 5: Email sent successfully');
        return NextResponse.json({
          success: true,
          message: 'Test completed successfully',
          steps: {
            profiles_check: '✅ User found in profiles',
            auth_check: user ? '✅ User found in auth' : '✅ User created in auth',
            password_generation: '✅ Password generated',
            password_update: '✅ Password updated',
            email_sending: '✅ Email sent successfully'
          },
          generatedPassword: newTempPassword,
          userEmail: email
        });
      } else {
        console.error('❌ Step 5: Email sending failed');
        return NextResponse.json({
          success: false,
          error: 'E-mail kon niet worden verzonden',
          step: 'email_sending',
          steps: {
            profiles_check: '✅ User found in profiles',
            auth_check: user ? '✅ User found in auth' : '✅ User created in auth',
            password_generation: '✅ Password generated',
            password_update: '✅ Password updated',
            email_sending: '❌ Email sending failed'
          }
        }, { status: 500 });
      }
    } catch (emailError) {
      console.error('❌ Step 5: Email error:', emailError);
      return NextResponse.json({
        success: false,
        error: 'E-mail fout',
        step: 'email_sending',
        errorDetails: emailError,
        steps: {
          profiles_check: '✅ User found in profiles',
          auth_check: user ? '✅ User found in auth' : '✅ User created in auth',
          password_generation: '✅ Password generated',
          password_update: '✅ Password updated',
          email_sending: '❌ Email error occurred'
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Interne server fout',
      errorDetails: error
    }, { status: 500 });
  }
}

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
