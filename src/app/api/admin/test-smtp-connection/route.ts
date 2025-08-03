import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { smtp, fromEmail, fromName } = await request.json();

    // Validate required fields
    if (!smtp.host || !smtp.username || !smtp.password) {
      return NextResponse.json(
        { success: false, message: 'SMTP host, username en password zijn verplicht' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure, // true for 465, false for other ports
      auth: {
        user: smtp.username,
        pass: smtp.password,
      },
    });

    // Verify connection configuration
    await transporter.verify();

    // Send test email
    const testEmail = {
      from: `"${fromName}" <${fromEmail}>`,
      to: smtp.username, // Send to the SMTP username (usually the same as from email)
      subject: 'SMTP Test - Top Tier Men Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #B6C948;">🎉 SMTP Test Succesvol!</h2>
          <p>De SMTP-configuratie van het Top Tier Men platform werkt correct.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Configuratie Details:</h3>
            <ul>
              <li><strong>Host:</strong> ${smtp.host}</li>
              <li><strong>Port:</strong> ${smtp.port}</li>
              <li><strong>Secure:</strong> ${smtp.secure ? 'Ja' : 'Nee'}</li>
              <li><strong>Username:</strong> ${smtp.username}</li>
            </ul>
          </div>
          <p>Je kunt nu e-mails verzenden vanaf het platform voor de pre-launch campagne!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Deze e-mail is automatisch gegenereerd door het Top Tier Men platform.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(testEmail);

    return NextResponse.json({
      success: true,
      message: 'SMTP verbinding succesvol getest en test e-mail verzonden'
    });

  } catch (error) {
    console.error('❌ SMTP test error:', error);
    
    let errorMessage = 'Onbekende fout bij SMTP test';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Ongeldige gebruikersnaam of wachtwoord';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Kan geen verbinding maken met SMTP server. Controleer host en port.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'SMTP host niet gevonden. Controleer de hostnaam.';
      } else if (error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Timeout bij verbinden met SMTP server.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}