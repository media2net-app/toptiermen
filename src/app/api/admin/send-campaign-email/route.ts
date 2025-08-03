import { NextRequest, NextResponse } from 'next/server';
import emailService from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { recipients, template, subject, content, customVariables } = await request.json();

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Recipients array is required' },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { success: false, message: 'Subject is required' },
        { status: 400 }
      );
    }

    // Initialize email service
    await emailService.initialize();

    if (!emailService.isConfigured()) {
      return NextResponse.json(
        { success: false, message: 'SMTP not configured. Please configure SMTP settings first.' },
        { status: 500 }
      );
    }

    const results = [];
    const errors = [];

    // Send emails to all recipients
    for (const recipient of recipients) {
      try {
        let emailContent = content || '';

        // Replace variables in content
        if (customVariables) {
          Object.entries(customVariables).forEach(([key, value]) => {
            emailContent = emailContent.replace(new RegExp(`\\[${key}\\]`, 'g'), value as string);
          });
        }

        // Replace common variables
        emailContent = emailContent
          .replace(/\[Naam\]/g, recipient.name || recipient.email)
          .replace(/\[EMAIL\]/g, recipient.email);

        await emailService.sendCustomEmail(recipient.email, subject, emailContent);

        results.push({
          email: recipient.email,
          status: 'sent',
          messageId: `sent-${Date.now()}-${Math.random()}`
        });

        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error sending email to ${recipient.email}:`, error);
        errors.push({
          email: recipient.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.length;
    const failureCount = errors.length;
    const totalCount = recipients.length;

    console.log(`📧 Campaign email sent: ${successCount}/${totalCount} successful, ${failureCount} failed`);

    return NextResponse.json({
      success: true,
      message: `Campaign email sent to ${successCount}/${totalCount} recipients`,
      results: {
        successful: results,
        failed: errors,
        summary: {
          total: totalCount,
          successful: successCount,
          failed: failureCount
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in campaign email API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to get campaign templates
export async function GET() {
  try {
    await emailService.initialize();

    if (!emailService.isConfigured()) {
      return NextResponse.json(
        { success: false, message: 'SMTP not configured' },
        { status: 500 }
      );
    }

    // Return available templates and variables
    return NextResponse.json({
      success: true,
      templates: {
        welcome: {
          name: 'Welkomstmail',
          description: 'E-mail voor nieuwe gebruikers',
          variables: ['[Naam]', '[EMAIL]']
        },
        passwordReset: {
          name: 'Wachtwoord Reset',
          description: 'E-mail voor wachtwoord reset',
          variables: ['[Naam]', '[RESET_LINK]', '[EMAIL]']
        },
        weeklyReminder: {
          name: 'Wekelijkse Herinnering',
          description: 'Wekelijkse update e-mail',
          variables: ['[Naam]', '[EMAIL]']
        },
        custom: {
          name: 'Custom E-mail',
          description: 'Aangepaste e-mail met eigen inhoud',
          variables: ['[Naam]', '[EMAIL]', '[CUSTOM_VARIABLES]']
        }
      },
      commonVariables: [
        '[Naam] - Gebruikersnaam',
        '[EMAIL] - E-mailadres',
        '[LOGIN_LINK] - Link naar login pagina',
        '[DASHBOARD_LINK] - Link naar dashboard',
        '[UNSUBSCRIBE_LINK] - Link om uit te schrijven'
      ]
    });

  } catch (error) {
    console.error('❌ Error getting campaign templates:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}