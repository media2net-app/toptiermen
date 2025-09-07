import { NextRequest, NextResponse } from 'next/server';
import { EnormailProvider } from '@/lib/email-providers';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, fromEmail, fromName, toEmail } = await request.json();

    if (!apiKey || !fromEmail || !fromName || !toEmail) {
      return NextResponse.json(
        { success: false, error: 'API key, from email, from name, and to email are required' },
        { status: 400 }
      );
    }

    // Create Enormail provider instance
    const enormailProvider = new EnormailProvider(apiKey, fromEmail, fromName);

    // Send test email
    const result = await enormailProvider.sendEmail({
      to: toEmail,
      subject: 'Test Email van Top Tier Men Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8BAE5A;">🎉 Enormail Connectie Succesvol!</h2>
          <p>Hallo,</p>
          <p>Deze test email bevestigt dat de Enormail integratie correct werkt op het Top Tier Men platform.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Email Details:</h3>
            <ul>
              <li><strong>Van:</strong> ${fromName} (${fromEmail})</li>
              <li><strong>Naar:</strong> ${toEmail}</li>
              <li><strong>Onderwerp:</strong> Test Email van Top Tier Men Platform</li>
              <li><strong>Verzonden op:</strong> ${new Date().toLocaleString('nl-NL')}</li>
            </ul>
          </div>
          <p>De Enormail API is nu klaar voor gebruik in email campagnes!</p>
          <p>Met vriendelijke groet,<br>Top Tier Men Team</p>
        </div>
      `,
      from: fromEmail
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email successfully sent!',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Send test email error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send test email endpoint - use POST with apiKey, fromEmail, fromName, and toEmail'
  });
}
