import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { emailService } from '@/lib/email-service';

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

// Using supabaseAdmin from import

export async function POST(request: NextRequest) {
  try {
    const { userIds, email, password, tempPassword, testMode = false } = await request.json();

    console.log('📧 Sending account credentials:', { userIds, email, password, tempPassword, testMode });

    // Test mode restrictions removed - allow all users
    // const allowedTestEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu'];
    
    // Get users from database
    let query = supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, display_name, package_type, created_at');

    if (email) {
      // If specific email is provided, filter by that email
      query = query.eq('email', email);
    } else if (userIds && userIds.length > 0) {
      // Otherwise, filter by user IDs
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

    // Use all users (test mode filtering removed)
    const targetUsers = users;

    if (targetUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No users found' 
      }, { status: 404 });
    }

    console.log(`📧 Sending credentials to ${targetUsers.length} users`);

    const results = {
      sent: 0,
      failed: 0,
      details: [] as any[]
    };

    // Send emails to each user
    for (const user of targetUsers) {
      try {
        console.log(`📧 Sending credentials to: ${user.email}`);

        // Determine the final password to use
        let finalPassword;
        
        // If password or tempPassword is provided, use that
        if (password || tempPassword) {
          finalPassword = password || tempPassword;
          console.log(`📧 Using provided password for ${user.email}: ${finalPassword}`);
        } else {
          // For existing users, generate a new password and always synchronize it
          // This ensures the email password matches the database password
          finalPassword = generateTempPassword();
          console.log(`📧 Generated new password for ${user.email}: ${finalPassword}`);
        }
        
        // ALWAYS update the user's password in auth to ensure synchronization
        try {
          // Get user from auth to get their ID
          const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
          if (!authError && authUsers) {
            const authUser = authUsers.users.find(u => u.email === user.email);
            if (authUser) {
              // Update password in auth
              const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                authUser.id,
                { password: finalPassword }
              );
              if (updateError) {
                console.error(`❌ Error updating password for ${user.email}:`, updateError);
              } else {
                console.log(`✅ Password synchronized for ${user.email}: ${finalPassword}`);
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error updating password for ${user.email}:`, error);
        }
        
        // Create login URL
        const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/login`;
        
        // Send email using the correct method signature
        const success = await emailService.sendEmail(
          user.email,
          '🔥 Welkom bij The Brotherhood - Je Account is Klaar!',
          'account-credentials',
          {
            name: user.full_name || user.display_name || 'Gebruiker',
            email: user.email,
            username: user.display_name || user.email.split('@')[0],
            tempPassword: finalPassword,
            loginUrl: loginUrl,
            packageType: user.package_type || 'Basic Tier',
            platformUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'
          },
          { tracking: true }
        );

        if (success) {
          results.sent++;
          results.details.push({
            email: user.email,
            status: 'sent',
            tempPassword: finalPassword
          });
          console.log(`✅ Credentials sent to: ${user.email}`);
        } else {
          results.failed++;
          results.details.push({
            email: user.email,
            status: 'failed',
            error: 'Email service failed'
          });
          console.error(`❌ Failed to send credentials to: ${user.email}`);
        }

      } catch (error) {
        results.failed++;
        results.details.push({
          email: user.email,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`❌ Error sending credentials to ${user.email}:`, error);
      }
    }

    console.log(`📊 Results: ${results.sent} sent, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Account credentials sent to ${results.sent} users`,
      results,
      testMode
    });

  } catch (error) {
    console.error('❌ Error in send-account-credentials:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
