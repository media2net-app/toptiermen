import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();
    
    console.log('📧 Sending platform update follow-up email...');
    
    const emailService = new EmailService();
    
    const success = await emailService.sendEmail(
      testEmail || 'chielvanderzee@gmail.com',
      'Update omtrent platform werkzaamheden',
      'platform-update-follow-up',
      {
        name: 'Chiel',
        email: testEmail || 'chielvanderzee@gmail.com',
        platformUrl: 'https://platform.toptiermen.eu',
        supportEmail: 'support@toptiermen.eu'
      },
      {
        tracking: true
      }
    );

    if (success) {
      console.log('✅ Platform update follow-up email sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Platform update follow-up email sent successfully'
      });
    } else {
      console.error('❌ Failed to send platform update follow-up email');
      return NextResponse.json({
        success: false,
        error: 'Failed to send email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error sending platform update follow-up email:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
