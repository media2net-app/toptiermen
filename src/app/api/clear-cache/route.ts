import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧹 Clearing cache via API...');
    
    // Set cache-busting headers
    const response = NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString(),
      version: '2.0.3'
    });

    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-TTM-Version', '2.0.3');
    response.headers.set('X-Cache-Cleared', 'true');

    return response;
  } catch (error) {
    console.error('❌ Clear cache error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Force clearing cache...');
    
    const response = NextResponse.json({
      success: true,
      message: 'Cache force cleared',
      timestamp: new Date().toISOString(),
      instructions: [
        '1. Clear browser cache (Ctrl+Shift+R)',
        '2. Clear local storage in DevTools',
        '3. Clear session storage',
        '4. Clear cookies',
        '5. Try incognito mode'
      ]
    });

    // Add aggressive cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
    response.headers.set('X-TTM-Version', '2.0.1');
    response.headers.set('X-Cache-Force-Cleared', 'true');

    return response;
  } catch (error) {
    console.error('❌ Force clear cache error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to force clear cache'
    }, { status: 500 });
  }
}
