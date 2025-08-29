import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { getMarketingEmailTemplate } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Sending marketing email...');
    
    const body = await request.json();
    const { 
      to, 
      name = 'Gebruiker',
      subject = 'Belangrijke update van Top Tier Men',
      content = 'We hebben een belangrijke update voor je.',
      ctaText = 'Bekijk nu',
      ctaUrl = 'https://platform.toptiermen.eu/dashboard'
    } = body;
    
    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }
    
    console.log('📧 Marketing email request:', { to, name, subject });
    
    // Generate marketing email template
    const template = getMarketingEmailTemplate(name, subject, content, ctaText, ctaUrl);
    
    // Send marketing email
    const result = await emailService.sendEmail({
      to: to,
      template: 'marketing',
      variables: {
        name: name,
        subject: subject,
        content: content,
        ctaText: ctaText,
        ctaUrl: ctaUrl
      }
    }, {
      campaign_id: 'marketing-funnel-1',
      template_type: 'marketing'
    });
    
    if (result) {
      console.log('✅ Marketing email sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Marketing email sent successfully',
        to: to,
        subject: subject,
        template: 'marketing'
      });
    } else {
      console.log('❌ Marketing email failed');
      return NextResponse.json(
        { error: 'Failed to send marketing email' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error sending marketing email:', error);
    return NextResponse.json(
      { error: 'Failed to send marketing email' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Marketing email service is ready',
      endpoint: '/api/email/send-marketing',
      method: 'POST',
      body: {
        to: 'recipient@example.com',
        name: 'Recipient Name',
        subject: 'Email Subject',
        content: 'Email content here...',
        ctaText: 'Call to Action',
        ctaUrl: 'https://example.com'
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting marketing email configuration:', error);
    return NextResponse.json(
      { error: 'Failed to get marketing email configuration' },
      { status: 500 }
    );
  }
}
