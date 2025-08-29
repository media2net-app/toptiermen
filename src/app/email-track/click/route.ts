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
    const targetUrl = searchParams.get('url');

    if (!trackingId || !targetUrl) {
      return NextResponse.redirect('https://platform.toptiermen.eu');
    }

    console.log('🖱️ Email clicked - tracking ID:', trackingId);

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
      return NextResponse.redirect(targetUrl);
    }

    // Update the email tracking record
    const { error: updateError } = await supabase
      .from('email_tracking')
      .update({
        status: 'clicked',
        clicked_at: new Date().toISOString(),
        user_agent: userAgent,
        ip_address: ip,
        updated_at: new Date().toISOString()
      })
      .eq('tracking_id', trackingId);

    // Increment click count using RPC
    const { error: countError } = await supabase
      .rpc('increment_click_count', { tracking_id: tracking.id });

    if (updateError) {
      console.error('❌ Error updating tracking record:', updateError);
    } else {
      console.log('✅ Email click tracked successfully');
    }

    // Insert detailed click record
    const { error: clickError } = await supabase
      .from('email_clicks')
      .insert({
        tracking_id: tracking.id,
        link_url: targetUrl,
        link_text: 'Test Click Tracking',
        user_agent: userAgent,
        ip_address: ip,
        device_type: deviceType,
        browser: browser,
        os: os
      });

    if (clickError) {
      console.error('❌ Error inserting click record:', clickError);
    }

    // Redirect to the target URL
    return NextResponse.redirect(targetUrl);

  } catch (error) {
    console.error('❌ Error in email click tracking:', error);
    // Redirect to target URL anyway
    const targetUrl = new URL(request.url).searchParams.get('url');
    return NextResponse.redirect(targetUrl || 'https://platform.toptiermen.eu');
  }
}
