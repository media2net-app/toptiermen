import { NextRequest, NextResponse } from 'next/server';
import { EmailTrackingService } from '@/lib/email-tracking-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tracking_id = searchParams.get('tid');
    const original_url = searchParams.get('url');
    const link_text = searchParams.get('text');

    if (!tracking_id || !original_url) {
      console.error('❌ Missing tracking ID or URL');
      return new NextResponse('Missing tracking ID or URL', { status: 400 });
    }

    console.log('📧 Tracking email click:', { tracking_id, original_url, link_text });

    // Get user agent and IP
    const user_agent = request.headers.get('user-agent') || undefined;
    const ip_address = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

    // Track the click
    await EmailTrackingService.trackClick(tracking_id, original_url, link_text || undefined, user_agent, ip_address);

    console.log('✅ Email click tracked successfully, redirecting to:', original_url);

    // Redirect to the original URL
    return NextResponse.redirect(original_url);

  } catch (error) {
    console.error('❌ Error tracking email click:', error);
    
    // If tracking fails, still redirect to the original URL
    const original_url = new URL(request.url).searchParams.get('url');
    if (original_url) {
      return NextResponse.redirect(original_url);
    }
    
    return new NextResponse('Error tracking click', { status: 500 });
  }
}
