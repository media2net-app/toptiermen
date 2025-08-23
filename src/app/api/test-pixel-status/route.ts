import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testEvent = searchParams.get('test') === 'true';

    const pixelId = '1333919368069015';
    
    // Check if we can access Facebook's test endpoint
    const testUrl = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    
    let pixelStatus = 'unknown';
    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      pixelStatus = response.ok ? 'active' : 'inactive';
    } catch (error) {
      pixelStatus = 'error';
    }

    const pixelInfo: any = {
      pixelId,
      status: pixelStatus,
      testUrl,
      events: [
        'PageView',
        'ViewContent', 
        'InitiateCheckout',
        'CompleteRegistration',
        'Lead'
      ],
      recommendations: [
        'Ensure Facebook Pixel is loaded on all pages',
        'Test events in Facebook Events Manager',
        'Verify UTM parameters are being passed correctly',
        'Check for ad blockers that might interfere',
        'Ensure proper event tracking on form submissions'
      ]
    };

    if (testEvent) {
      // Simulate a test event
      console.log('🧪 Simulating Facebook Pixel test event...');
      pixelInfo.testEvent = {
        event: 'CompleteRegistration',
        timestamp: new Date().toISOString(),
        pixelId,
        status: 'simulated'
      };
    }

    return NextResponse.json({
      success: true,
      data: pixelInfo,
      message: 'Facebook Pixel status checked successfully'
    });

  } catch (error) {
    console.error('❌ Error checking Facebook Pixel status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check Facebook Pixel status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
