import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userIds, email, password, testMode = false } = await request.json();

    console.log('📧 Sending account credentials:', { userIds, email, password, testMode });

    // Test mode restrictions removed - allow all users
    // const allowedTestEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu'];
    
    // Get users from database
    let query = supabase
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

        // Use the provided password or default
        const tempPassword = password || "W4t3rk0k3r^";
        
        // Create login URL
        const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/login`;
        
        // Send email using the correct method signature
        const success = await emailService.sendEmail(
          user.email,
          '🔐 Je Top Tier Men Accountgegevens - Platform Live!',
          'account-credentials',
          {
            name: user.full_name || user.display_name || 'Gebruiker',
            email: user.email,
            username: user.display_name || user.email.split('@')[0],
            tempPassword: tempPassword,
            loginUrl: loginUrl,
            packageType: user.package_type || 'Basic Tier',
            platformUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'
          },
          { tracking: true, userId: user.id }
        );

        if (success) {
          results.sent++;
          results.details.push({
            email: user.email,
            status: 'sent',
            tempPassword: tempPassword
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

function generateTempPassword(): string {
  // Generate a secure temporary password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
  
  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
