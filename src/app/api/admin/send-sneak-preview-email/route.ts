import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Sending sneak preview email...');
    
    const body = await request.json();
    const { 
      email,
      name = 'Top Tier Man',
      videoUrl = 'https://platform.toptiermen.eu/sneakpreview'
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    console.log('📧 Sneak preview email request:', { email, name, videoUrl });

    // Create email service instance
    const emailService = new EmailService();

    // Send email using new email service
    const result = await emailService.sendEmail(
      email,
      '🎬 EXCLUSIEVE VIDEO - Eerste kijk in het Top Tier Men Platform',
      'sneak_preview',
      {
        name: name,
        videoUrl: videoUrl
      },
      {
        tracking: true
      }
    );

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
