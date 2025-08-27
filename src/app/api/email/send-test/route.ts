import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Sending test email...');
    
    const body = await request.json();
    const { to, name = 'Test User' } = body;
    
    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }
    
    console.log('📧 Test email request:', { to, name });
    
    // Send test email
    const result = await emailService.sendEmail({
      to: to,
      template: 'test',
      variables: {
        name: name
      }
    });
    
    if (result) {
      console.log('✅ Test email sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        to: to,
        template: 'test'
      });
    } else {
      console.log('❌ Test email failed');
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return current email configuration (without sensitive data)
    const smtpConfig = emailService.getSmtpConfig();
    
    return NextResponse.json({
      success: true,
      message: 'Email service is ready for testing',
      smtpConfig: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        username: smtpConfig.username,
        fromEmail: smtpConfig.fromEmail,
        fromName: smtpConfig.fromName
      },
      testEndpoint: '/api/email/send-test',
      testMethod: 'POST',
      testBody: {
        to: 'your-email@example.com',
        name: 'Your Name'
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting email configuration:', error);
    return NextResponse.json(
      { error: 'Failed to get email configuration' },
      { status: 500 }
    );
  }
}
