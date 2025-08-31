import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getTestUserWelcomeEmailTemplate } from '@/lib/test-user-email-template';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Sending test user welcome email...');
    
    const body = await request.json();
    const { 
      email = 'info@media2net.nl',
      name = 'Test User',
      testUserId = 'test-user-001',
      password = 'TestPassword123!' // Add password parameter
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    console.log('📧 Test user email request:', { email, name, testUserId, password });

    // Generate URLs
    const platformUrl = 'https://platform.toptiermen.eu/dashboard';
    const loginUrl = 'https://platform.toptiermen.eu/login';
    const feedbackUrl = `https://platform.toptiermen.eu/feedback?user=${testUserId}`;

    // Prepare email data
    const emailData = {
      name: name,
      email: email,
      testUserId: testUserId,
      feedbackUrl: feedbackUrl,
      platformUrl: platformUrl,
      loginUrl: loginUrl,
      password: password // Include password in email data
    };

    // Get email template
    const emailTemplate = getTestUserWelcomeEmailTemplate(emailData);

    // Send email using email service with custom template
    const result = await emailService.sendEmail({
      to: email,
      template: 'custom', // Use custom template
      variables: {
        name: name,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      }
    });

    if (result) {
      console.log('✅ Test user email sent successfully');
      
      // Log email sending in database
      try {
        await supabaseAdmin
          .from('email_logs')
          .insert({
            recipient_email: email,
            recipient_name: name,
            subject: emailTemplate.subject,
            template_type: 'test_user_welcome',
            status: 'sent',
            sent_at: new Date().toISOString(),
            metadata: {
              testUserId: testUserId,
              emailType: 'welcome',
              platformUrl: platformUrl,
              feedbackUrl: feedbackUrl
            }
          });
      } catch (dbError) {
        console.warn('⚠️ Could not log email to database:', dbError);
        // Continue even if logging fails
      }

      return NextResponse.json({
        success: true,
        message: 'Test user welcome email sent successfully',
        to: email,
        template: 'test_user_welcome',
        testUserId: testUserId
      });
    } else {
      console.log('❌ Test user email failed');
      return NextResponse.json(
        { error: 'Failed to send test user email' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error sending test user email:', error);
    return NextResponse.json(
      { error: 'Failed to send test user email' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return test user email configuration
    return NextResponse.json({
      success: true,
      message: 'Test user email API is available',
      endpoints: {
        welcome: 'POST /api/test-users/send-welcome-email'
      },
      templates: {
        welcome: 'Test user welcome email with platform access and login credentials'
      },
      example: {
        method: 'POST',
        body: {
          email: 'info@media2net.nl',
          name: 'Test User',
          testUserId: 'test-user-001',
          password: 'TestPassword123!'
        }
      }
    });
  } catch (error) {
    console.error('❌ Error in test user email API:', error);
    return NextResponse.json(
      { error: 'Failed to get test user email API info' },
      { status: 500 }
    );
  }
}
