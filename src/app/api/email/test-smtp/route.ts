import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing SMTP configuration...');

    // Test SMTP connection
    const connectionTest = await emailService.testSmtpConnection();
    
    if (!connectionTest) {
      return NextResponse.json(
        { error: 'SMTP connection test failed' },
        { status: 500 }
      );
    }

    // Get current SMTP configuration
    const smtpConfig = emailService.getSmtpConfig();

    // Test sending a simple email
    const testEmailResult = await emailService.sendEmail({
      to: 'test@example.com',
      template: 'welcome',
      variables: {
        name: 'Test User',
        dashboardUrl: 'https://platform.toptiermen.eu/dashboard'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'SMTP configuration test completed',
      smtpConfig: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        username: smtpConfig.username,
        fromEmail: smtpConfig.fromEmail,
        fromName: smtpConfig.fromName
      },
      connectionTest: connectionTest,
      emailTest: testEmailResult
    });

  } catch (error) {
    console.error('❌ Error testing SMTP configuration:', error);
    return NextResponse.json(
      { error: 'Failed to test SMTP configuration' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return current SMTP configuration (without sensitive data)
    const smtpConfig = emailService.getSmtpConfig();
    
    return NextResponse.json({
      success: true,
      smtpConfig: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        username: smtpConfig.username,
        fromEmail: smtpConfig.fromEmail,
        fromName: smtpConfig.fromName
      }
    });

  } catch (error) {
    console.error('❌ Error getting SMTP configuration:', error);
    return NextResponse.json(
      { error: 'Failed to get SMTP configuration' },
      { status: 500 }
    );
  }
}
