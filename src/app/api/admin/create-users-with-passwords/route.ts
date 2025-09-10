import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userIds, testMode = false } = await request.json();

    console.log('🔐 Creating users with passwords:', { userIds, testMode });

    // If test mode, only process Chiel and Rick
    const allowedTestEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu'];
    
    // Get users from database
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, display_name, package_type, created_at');

    if (userIds && userIds.length > 0) {
      query = query.in('id', userIds);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json({ 
        error: 'Failed to fetch users',
        details: usersError.message 
      }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        error: 'No users found' 
      }, { status: 404 });
    }

    // Filter for test mode
    const targetUsers = testMode 
      ? users.filter(user => allowedTestEmails.includes(user.email))
      : users;

    if (targetUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No eligible users found for test mode' 
      }, { status: 404 });
    }

    console.log(`🔐 Processing ${targetUsers.length} users`);

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      emailsSent: 0,
      details: [] as any[]
    };

    // Process each user
    for (const user of targetUsers) {
      try {
        console.log(`🔐 Processing user: ${user.email}`);

        // Generate secure password
        const password = generateSecurePassword();
        
        // Check if user already exists in auth
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.error('❌ Error listing users:', listError);
          results.failed++;
          results.details.push({
            email: user.email,
            status: 'error',
            error: 'Failed to list users'
          });
          continue;
        }

        const existingUser = existingUsers.users.find(u => u.email === user.email);
        
        if (existingUser) {
          // Update existing user's password
          console.log(`🔄 Updating password for existing user: ${user.email}`);
          
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password }
          );

          if (updateError) {
            console.error(`❌ Failed to update password for ${user.email}:`, updateError);
            results.failed++;
            results.details.push({
              email: user.email,
              status: 'error',
              error: 'Failed to update password'
            });
            continue;
          }

          results.updated++;
          console.log(`✅ Password updated for: ${user.email}`);
        } else {
          // Create new user
          console.log(`🆕 Creating new user: ${user.email}`);
          
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
              full_name: user.full_name || user.display_name,
              package_type: user.package_type
            }
          });

          if (createError) {
            console.error(`❌ Failed to create user ${user.email}:`, createError);
            results.failed++;
            results.details.push({
              email: user.email,
              status: 'error',
              error: 'Failed to create user'
            });
            continue;
          }

          results.created++;
          console.log(`✅ User created: ${user.email}`);
        }

        // Send account credentials email
        const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/login`;
        
        const emailSuccess = await emailService.sendEmail(
          user.email,
          '🔐 Je Top Tier Men Accountgegevens - Platform Live!',
          'account-credentials',
          {
            name: user.full_name || user.display_name || 'Gebruiker',
            email: user.email,
            username: user.display_name || user.email.split('@')[0],
            tempPassword: password,
            loginUrl: loginUrl,
            packageType: user.package_type || 'Basic Tier',
            platformUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'
          },
          { tracking: true }
        );

        if (emailSuccess) {
          results.emailsSent++;
          console.log(`📧 Account credentials sent to: ${user.email}`);
        } else {
          console.error(`❌ Failed to send email to: ${user.email}`);
        }

        results.details.push({
          email: user.email,
          status: existingUser ? 'updated' : 'created',
          password: password,
          emailSent: emailSuccess
        });

      } catch (error) {
        results.failed++;
        results.details.push({
          email: user.email,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`❌ Error processing user ${user.email}:`, error);
      }
    }

    console.log(`📊 Results: ${results.created} created, ${results.updated} updated, ${results.failed} failed, ${results.emailsSent} emails sent`);

    return NextResponse.json({
      success: true,
      message: `Processed ${targetUsers.length} users: ${results.created} created, ${results.updated} updated, ${results.emailsSent} emails sent`,
      results,
      testMode
    });

  } catch (error) {
    console.error('❌ Error in create-users-with-passwords:', error);
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
