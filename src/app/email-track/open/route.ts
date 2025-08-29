import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Request URL:', request.url);
    
    // Try multiple ways to get the tracking ID
    const url = new URL(request.url);
    let trackingId = url.searchParams.get('t');
    
    // If not found, try to extract from URL path
    if (!trackingId) {
      const pathParts = request.url.split('?');
      if (pathParts.length > 1) {
        const queryString = pathParts[1];
        const params = new URLSearchParams(queryString);
        trackingId = params.get('t');
      }
    }
    
    console.log('🔍 Search params:', Object.fromEntries(url.searchParams.entries()));
    console.log('🔍 Tracking ID from param t:', trackingId);

    if (!trackingId) {
      console.error('❌ No tracking ID found in request');
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

    // Find the tracking record in both tables
    console.log('🔍 Looking for tracking record with ID:', trackingId);
    
    // First try bulk_email_recipients table
    let { data: bulkTracking, error: bulkError } = await supabaseAdmin
      .from('bulk_email_recipients')
      .select('id, email, status, opened_at, campaign_id')
      .eq('id', trackingId)
      .single();

    console.log('🔍 Bulk tracking query result:', { bulkTracking, bulkError });

    if (bulkTracking) {
      console.log('✅ Found bulk tracking record:', bulkTracking);
      
      // Update bulk email recipient record
      const { error: updateError } = await supabaseAdmin
        .from('bulk_email_recipients')
        .update({
          status: 'opened',
          opened_at: new Date().toISOString()
        })
        .eq('id', trackingId);

      if (updateError) {
        console.error('❌ Error updating bulk tracking record:', updateError);
      } else {
        console.log('✅ Bulk email open tracked successfully');
        
        // Update campaign statistics
        try {
          const { data: campaign } = await supabaseAdmin
            .from('bulk_email_campaigns')
            .select('id, sent_count, open_count')
            .eq('id', bulkTracking.campaign_id)
            .single();
          
          if (campaign) {
            const newOpenCount = (campaign.open_count || 0) + 1;
            await supabaseAdmin
              .from('bulk_email_campaigns')
              .update({
                open_count: newOpenCount,
                updated_at: new Date().toISOString()
              })
              .eq('id', campaign.id);
            
            console.log(`✅ Updated campaign open count to ${newOpenCount}`);
          }
        } catch (error) {
          console.error('❌ Error updating campaign stats:', error);
        }
      }
      
      return returnTrackingPixel();
    }

    // If not found in bulk, try email_tracking table
    const { data: tracking, error: trackingError } = await supabaseAdmin
      .from('email_tracking')
      .select('id, tracking_id, status')
      .eq('tracking_id', trackingId)
      .single();

    console.log('🔍 Email tracking query result:', { tracking, trackingError });

    if (trackingError) {
      console.error('❌ Tracking record error:', trackingError);
      console.error('❌ Tracking ID searched:', trackingId);
      return returnTrackingPixel();
    }

    if (!tracking) {
      console.error('❌ Tracking record not found for ID:', trackingId);
      return returnTrackingPixel();
    }

    console.log('✅ Found email tracking record:', tracking);

    // Update email tracking record directly
    console.log('🔄 Updating email tracking record directly...');
    
    // First get current open_count
    const { data: currentTracking } = await supabaseAdmin
      .from('email_tracking')
      .select('open_count')
      .eq('tracking_id', trackingId)
      .single();
    
    const newOpenCount = (currentTracking?.open_count || 0) + 1;
    
    const { error: updateError } = await supabaseAdmin
      .from('email_tracking')
      .update({
        status: 'opened',
        opened_at: new Date().toISOString(),
        open_count: newOpenCount,
        updated_at: new Date().toISOString()
      })
      .eq('tracking_id', trackingId);

    console.log('🔄 Update result:', { updateError });

    if (updateError) {
      console.error('❌ Error updating tracking record:', updateError);
    } else {
      console.log('✅ Email open tracked successfully');
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
