import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, testMode = false } = await request.json();

    console.log('🔐 Admin password reset requested for:', { email, testMode });

    // Test mode restriction removed - allow all users to receive password reset
    // const allowedTestEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu'];
    
    // if (testMode && !allowedTestEmails.includes(email)) {
    //   return NextResponse.json({ 
    //     error: 'Test mode: Only allowed emails are chiel@media2net.nl and rick@toptiermen.eu' 
    //   }, { status: 403 });
    // }

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, display_name')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError);
      return NextResponse.json({ 
        error: 'User not found in system' 
      }, { status: 404 });
    }

    // Check if user exists in auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing auth users:', authError);
      return NextResponse.json({ 
        error: 'Failed to check user authentication status' 
      }, { status: 500 });
    }

    const authUser = authUsers.users.find(u => u.email === email);
    
    if (!authUser) {
      console.log('⚠️ User exists in profiles but not in auth, creating auth account...');
      
      // Generate a temporary password
      const tempPassword = generateSecurePassword();
      
      // Create auth account
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: profile.full_name || profile.display_name,
          admin_created: true
        }
      });

      if (createError) {
        console.error('❌ Failed to create auth account:', createError);
        return NextResponse.json({ 
          error: 'Failed to create authentication account' 
        }, { status: 500 });
      }

      console.log('✅ Auth account created for:', email);
    }

    // Send password reset email using Supabase's built-in functionality
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/reset-password`
      }
    });

    if (error) {
      console.error('❌ Error generating password reset link:', error);
      return NextResponse.json({ 
        error: 'Failed to generate password reset link',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ Password reset link generated for:', email);

    return NextResponse.json({
      success: true,
      message: `Password reset link sent to ${email}`,
      email: email,
      resetLink: data.properties?.action_link || 'Link generated successfully',
      testMode
    });

  } catch (error) {
    console.error('❌ Error in admin password reset:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateSecurePassword(): string {
  // Generate a secure password with mixed characters
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
