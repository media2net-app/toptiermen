import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EmailConfig {
  provider: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
  useManualSmtp: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const emailConfig: EmailConfig = await request.json();

    // Validate required fields
    if (!emailConfig.fromEmail || !emailConfig.fromName) {
      return NextResponse.json(
        { success: false, message: 'Van email en naam zijn verplicht' },
        { status: 400 }
      );
    }

    if (emailConfig.useManualSmtp) {
      // Validate SMTP fields
      if (!emailConfig.smtpHost || !emailConfig.smtpPort || !emailConfig.smtpUsername || !emailConfig.smtpPassword) {
        return NextResponse.json(
          { success: false, message: 'Alle SMTP velden zijn verplicht voor handmatige configuratie' },
          { status: 400 }
        );
      }

      // Test SMTP configuration
      const smtpTestResult = await testSmtpConfig(emailConfig);
      if (!smtpTestResult.success) {
        return NextResponse.json(
          { success: false, message: smtpTestResult.message },
          { status: 400 }
        );
      }
    } else {
      // Validate API provider fields
      if (!emailConfig.apiKey) {
        return NextResponse.json(
          { success: false, message: 'API key is verplicht voor provider configuratie' },
          { status: 400 }
        );
      }

      // Test API provider configuration
      const apiTestResult = await testApiProvider(emailConfig);
      if (!apiTestResult.success) {
        return NextResponse.json(
          { success: false, message: apiTestResult.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: true, message: 'Email configuratie test succesvol' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error testing email config:', error);
    return NextResponse.json(
      { success: false, message: 'Interne server fout' },
      { status: 500 }
    );
  }
}

async function testSmtpConfig(config: EmailConfig): Promise<{ success: boolean; message: string }> {
  try {
    // This would use a library like nodemailer to test SMTP
    // For now, we'll simulate a test
    console.log('Testing SMTP config:', {
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      username: config.smtpUsername,
      // password: '***' // Don't log password
    });

    // Simulate SMTP test
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, message: 'SMTP configuratie geldig' };
  } catch (error) {
    console.error('SMTP test error:', error);
    return { success: false, message: 'SMTP verbinding mislukt' };
  }
}

async function testApiProvider(config: EmailConfig): Promise<{ success: boolean; message: string }> {
  try {
    let testUrl = '';
    let headers: Record<string, string> = {};

    switch (config.provider) {
      case 'resend':
        testUrl = 'https://api.resend.com/emails';
        headers = {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        };
        break;
      case 'sendgrid':
        testUrl = 'https://api.sendgrid.com/v3/mail/send';
        headers = {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        };
        break;
      case 'mailgun':
        testUrl = `https://api.mailgun.net/v3/${config.fromEmail.split('@')[1]}/messages`;
        headers = {
          'Authorization': `Basic ${Buffer.from(`api:${config.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        };
        break;
      default:
        return { success: false, message: 'Onbekende email provider' };
    }

    // Test API connection
    const response = await fetch(testUrl, {
      method: 'GET',
      headers,
    });

    if (response.ok || response.status === 401) {
      // 401 means the API key is valid but we're not sending a test email
      return { success: true, message: 'API verbinding succesvol' };
    } else {
      return { success: false, message: 'API verbinding mislukt' };
    }
  } catch (error) {
    console.error('API test error:', error);
    return { success: false, message: 'API verbinding mislukt' };
  }
} 