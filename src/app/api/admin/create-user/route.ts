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
    const body = await request.json();
    const { email, full_name, username, rank, status, package_type, password } = body;

    // Validate required fields
    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'E-mail en volledige naam zijn verplicht' },
        { status: 400 }
      );
    }

    // Generate temporary password if not provided
    const finalPassword = password || generateTempPassword();
    
    if (finalPassword.length < 6) {
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 6 karakters bevatten' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: finalPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        username: username || null
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Fout bij het aanmaken van gebruiker' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Gebruiker kon niet worden aangemaakt' },
        { status: 500 }
      );
    }

    // Map package_type to subscription_tier for consistency
    let subscriptionTier = 'basic';
    if (package_type === 'Premium Tier') {
      subscriptionTier = 'premium';
    } else if (package_type === 'Lifetime Tier') {
      subscriptionTier = 'lifetime';
    }

    // Create profile record
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: full_name,
        display_name: username || full_name,
        package_type: package_type || 'Basic Tier',
        subscription_tier: subscriptionTier // Add subscription_tier for onboarding consistency
      });

    if (profileError) {
      console.error('Error creating profile record:', profileError);
      return NextResponse.json(
        { error: 'Fout bij het aanmaken van gebruikersprofiel: ' + profileError.message },
        { status: 400 }
      );
    }

            // Create onboarding status record
        const { error: onboardingError } = await supabaseAdmin
          .from('onboarding_status')
          .insert({
        user_id: authData.user.id,
        onboarding_completed: false,
        current_step: 0
      });

    if (onboardingError) {
      console.error('Error creating onboarding status:', onboardingError);
      // Don't fail completely, user was created in auth
    }

    // Send account credentials email
    try {
      console.log(`📧 Sending account credentials to: ${email}`);
      
      const emailService = new EmailService();
      const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/login`;
      
      const emailSuccess = await emailService.sendEmail(
        email,
        '🔐 Je Top Tier Men Accountgegevens - Welkom!',
        'account-credentials',
        {
          name: full_name,
          email: email,
          username: username || email.split('@')[0],
          tempPassword: finalPassword,
          loginUrl: loginUrl,
          packageType: package_type || 'Basic Tier', // Use selected package or default
          isTestUser: 'false',
          platformUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'
        },
        { tracking: true }
      );

      if (emailSuccess) {
        console.log(`✅ Account credentials sent to: ${email}`);
      } else {
        console.error(`❌ Failed to send email to: ${email}`);
      }
    } catch (emailError) {
      console.error('❌ Error sending account credentials email:', emailError);
      // Don't fail the user creation if email fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: email,
        full_name: full_name,
        username: username,
        rank: rank || 'Rookie',
        status: status || 'active'
      },
      tempPassword: finalPassword, // Include temp password in response for admin reference
      message: `Gebruiker ${full_name} succesvol aangemaakt en accountgegevens verzonden!`
    });

  } catch (error) {
    console.error('Error in create-user API:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het aanmaken van de gebruiker' },
      { status: 500 }
    );
  }
} 