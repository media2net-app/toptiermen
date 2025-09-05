import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { getSneakPreviewEmailTemplate } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Sending sneak preview email...');
    
    const body = await request.json();
    const { 
      email,
      name = 'Top Tier Man',
      videoUrl = 'https://platform.toptiermen.eu/preview'
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    console.log('📧 Sneak preview email request:', { email, name, videoUrl });

    // Get email template
    const emailTemplate = getSneakPreviewEmailTemplate(name, videoUrl);

    // Send email using email service with custom template
    const result = await emailService.sendEmail({
      to: email,
      template: 'sneak_preview', // Use the new template
      variables: {
        name: name,
        videoUrl: videoUrl
      }
    }, {
      campaign_id: 'sneak-preview-campaign',
      template_type: 'sneak_preview'
    });

    if (result) {
      console.log('✅ Sneak preview email sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Sneak preview email sent successfully',
        data: {
          email,
          name,
          videoUrl,
          template: 'sneak_preview'
        }
      });
    } else {
      console.error('❌ Failed to send sneak preview email');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send email' 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Sneak preview email error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
