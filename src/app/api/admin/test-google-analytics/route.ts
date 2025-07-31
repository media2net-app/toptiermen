import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;

    if (!gaId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Google Analytics ID not configured',
          message: 'Please add NEXT_PUBLIC_GA_ID to your environment variables'
        },
        { status: 400 }
      );
    }

    // Validate GA ID format
    const gaIdPattern = /^G-[A-Z0-9]{10}$/;
    if (!gaIdPattern.test(gaId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid Google Analytics ID format',
          message: 'GA ID should be in format G-XXXXXXXXXX'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Google Analytics configuration is valid',
      gaId: gaId,
      config: {
        trackingId: gaId,
        measurementProtocol: 'GA4',
        enhancedEcommerce: true,
        customEvents: [
          'sign_up',
          'login', 
          'purchase',
          'lesson_complete',
          'mission_complete',
          'challenge_join',
          'book_read',
          'search',
          'error'
        ]
      }
    });

  } catch (error: any) {
    console.error('Google Analytics test failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Google Analytics test failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;

    return NextResponse.json({
      success: true,
      configured: !!gaId,
      gaId: gaId || 'Not configured',
      instructions: {
        setup: 'Add NEXT_PUBLIC_GA_ID to your environment variables',
        format: 'G-XXXXXXXXXX',
        source: 'Google Analytics → Admin → Data Streams → Web Stream → Measurement ID'
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check Google Analytics configuration',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 