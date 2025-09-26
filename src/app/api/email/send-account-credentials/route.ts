import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Starting account credentials email send...');
    
    const emailService = new EmailService();
    
    // Send account credentials email to lemicky_91@icloud.com
    const success = await emailService.sendEmail(
      'lemicky_91@icloud.com',
      'Je Top Tier Men Accountgegevens - Platform',
      'account-credentials',
      {
        name: 'lemicky_91',
        email: 'lemicky_91@icloud.com',
        username: 'lemicky_91',
        tempPassword: 'TempPassword123!',
        platformUrl: 'https://platform.toptiermen.eu',
        loginUrl: 'https://platform.toptiermen.eu/login',
        packageType: 'Premium Tier',
        supportEmail: 'support@toptiermen.eu'
      },
      {
        tracking: true
      }
    );

    if (success) {
      console.log('✅ Account credentials sent successfully to lemicky_91@icloud.com');
      return NextResponse.json({ 
        success: true, 
        message: 'Account credentials sent successfully to lemicky_91@icloud.com',
        recipient: 'lemicky_91@icloud.com'
      });
    } else {
      console.error('❌ Failed to send account credentials to lemicky_91@icloud.com');
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send account credentials' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in send account credentials API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
