import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📧 Sending platform update email:', body);

    const { 
      recipient = 'chielvanderzee@gmail.com',
      preview = false
    } = body;

    const emailService = new EmailService();
    
    // Use the new platform_update template
    const template = emailService.getTemplate('platform_update', {
      name: 'Chiel' // Default name for the test
    });

    // If preview mode, return the HTML without sending
    if (preview) {
      console.log('📧 Preview mode - returning HTML without sending');
      return NextResponse.json({
        success: true,
        message: 'Platform update email preview generated successfully!',
        html: template.html,
        subject: template.subject
      });
    }

    // Send the email
    const success = await emailService.sendEmail(
      recipient,
      template.subject,
      'platform_update',
      {
        name: 'Chiel'
      }
    );

    if (success) {
      console.log('✅ Platform update email sent successfully to:', recipient);
      return NextResponse.json({
        success: true,
        message: 'Platform update email sent successfully!',
        recipient: recipient,
        subject: template.subject
      });
    } else {
      console.error('❌ Failed to send platform update email');
      return NextResponse.json({
        success: false,
        error: 'Failed to send platform update email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in send platform update API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
