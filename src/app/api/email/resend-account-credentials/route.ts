import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();
    
    if (!email || !password || !username) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email, password, and username are required' 
      }, { status: 400 });
    }

    const emailService = new EmailService();
    
    // Send account credentials email
    const success = await emailService.sendEmail(
      email,
      'Je Top Tier Men Accountgegevens - Platform',
      'account-credentials',
      {
        username: username,
        password: password,
        loginUrl: 'https://platform.toptiermen.eu/login',
        supportEmail: 'support@toptiermen.eu'
      },
      {
        tracking: true
      }
    );

    if (success) {
      console.log(`✅ Account credentials sent successfully to ${email}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Account credentials sent successfully',
        recipient: email
      });
    } else {
      console.error(`❌ Failed to send account credentials to ${email}`);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send account credentials' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in resend account credentials API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
