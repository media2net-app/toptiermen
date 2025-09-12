import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { templateId } = await request.json();

    console.log('📧 Generating email template preview:', templateId);

    if (!templateId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Template ID is required' 
      }, { status: 400 });
    }

    // Sample data for preview
    const sampleData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      tempPassword: 'TempPass123!',
      loginUrl: 'https://platform.toptiermen.eu/login',
      platformUrl: 'https://platform.toptiermen.eu',
      packageType: 'Premium Tier',
      isTestUser: 'false',
      videoUrl: 'https://example.com/video.mp4',
      resetUrl: 'https://platform.toptiermen.eu/reset-password',
      badgeName: 'Eerste Badge',
      challengeName: 'Dagelijkse Push-ups',
      newsletterTitle: 'Top Tier Men Newsletter - Januari 2025'
    };

    const emailService = new EmailService();
    
    // Generate preview HTML
    let previewHtml = '';
    let subject = '';

    try {
      // Use the EmailService to generate the template
      const template = (emailService as any).getTemplate(templateId, sampleData);
      previewHtml = template.html;
      subject = template.subject;
    } catch (error) {
      console.error('❌ Error generating template:', error);
      
      // Fallback: create a simple preview
      previewHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #8BAE5A; text-align: center; margin-bottom: 30px;">
              📧 Email Template Preview
            </h1>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <strong>Template ID:</strong> ${templateId}<br>
              <strong>Status:</strong> Preview mode<br>
              <strong>Note:</strong> This is a sample preview with placeholder data
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #8BAE5A;">
              <h3 style="color: #8BAE5A; margin-top: 0;">Sample Data Used:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Name:</strong> ${sampleData.name}</li>
                <li><strong>Email:</strong> ${sampleData.email}</li>
                <li><strong>Username:</strong> ${sampleData.username}</li>
                <li><strong>Package:</strong> ${sampleData.packageType}</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                This is a preview of the <strong>${templateId}</strong> email template.
                <br>In production, this email would be sent with real user data.
              </p>
            </div>
          </div>
        </div>
      `;
      subject = `Preview: ${templateId} Template`;
    }

    console.log('✅ Email template preview generated for:', templateId);

    return NextResponse.json({
      success: true,
      html: previewHtml,
      subject: subject,
      templateId: templateId,
      sampleData: sampleData
    });

  } catch (error) {
    console.error('❌ Error in email-template-preview POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
