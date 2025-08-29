import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for tracking operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('t');

    if (!trackingId) {
      return new NextResponse('Missing tracking ID', { status: 400 });
    }

    console.log('👁️ Email opened - tracking ID:', trackingId);

    // Get user agent and IP for tracking
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';

    // Parse device info from user agent
    const deviceType = userAgent.includes('Mobile') ? 'mobile' : 'desktop';
    const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                   userAgent.includes('Firefox') ? 'Firefox' : 
                   userAgent.includes('Safari') ? 'Safari' : 'Unknown';
    const os = userAgent.includes('Windows') ? 'Windows' : 
              userAgent.includes('Mac') ? 'macOS' : 
              userAgent.includes('Linux') ? 'Linux' : 
              userAgent.includes('Android') ? 'Android' : 
              userAgent.includes('iOS') ? 'iOS' : 'Unknown';

    // Find the tracking record
    const { data: tracking, error: trackingError } = await supabase
      .from('email_tracking')
      .select('id')
      .eq('tracking_id', trackingId)
      .single();

    if (trackingError || !tracking) {
      console.error('❌ Tracking record not found:', trackingId);
      return returnTrackingPixel();
    }

    // Update the email tracking record
    const { error: updateError } = await supabase
      .from('email_tracking')
      .update({
        status: 'opened',
        opened_at: new Date().toISOString(),
        user_agent: userAgent,
        ip_address: ip,
        updated_at: new Date().toISOString()
      })
      .eq('tracking_id', trackingId);

    // Increment open count using RPC
    const { error: countError } = await supabase
      .rpc('increment_open_count', { tracking_id: tracking.id });

    if (updateError) {
      console.error('❌ Error updating tracking record:', updateError);
    } else {
      console.log('✅ Email open tracked successfully');
    }

    // Insert detailed open record
    const { error: openError } = await supabase
      .from('email_opens')
      .insert({
        tracking_id: tracking.id,
        user_agent: userAgent,
        ip_address: ip,
        device_type: deviceType,
        browser: browser,
        os: os
      });

    if (openError) {
      console.error('❌ Error inserting open record:', openError);
    }

    // Return transparent tracking pixel
    return returnTrackingPixel();

  } catch (error) {
    console.error('❌ Error in email open tracking:', error);
    return returnTrackingPixel();
  }
}

function returnTrackingPixel() {
  // Return 1x1 transparent PNG pixel
  const pixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  return new NextResponse(pixel, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': pixel.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
