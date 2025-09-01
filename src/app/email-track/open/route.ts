import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 === EMAIL TRACKING PIXEL CALLED ===');
    console.log('🔍 Request URL:', request.url);
    
    // Get tracking ID from query parameter
    const url = new URL(request.url);
    const trackingId = url.searchParams.get('trackingId');
    
    console.log('🔍 Tracking ID:', trackingId);

    if (!trackingId) {
      console.error('❌ No tracking ID found');
      return new NextResponse('Tracking ID required', { status: 400 });
    }

    console.log('👁️ Processing email open for tracking ID:', trackingId);

    // Find the tracking record in bulk_email_recipients table
    console.log('🔍 Searching for recipient record...');
    
    const { data: bulkTracking, error: bulkError } = await supabaseAdmin
      .from('bulk_email_recipients')
      .select('id, email, status, opened_at, campaign_id')
      .eq('id', trackingId)
      .single();

    console.log('🔍 Database query result:', { bulkTracking, bulkError });

    if (bulkError) {
      console.error('❌ Database query error:', bulkError);
      return returnTrackingPixel();
    }

    if (!bulkTracking) {
      console.error('❌ No recipient record found for ID:', trackingId);
      return returnTrackingPixel();
    }

    console.log('✅ Found recipient record:', bulkTracking);

    // Only update if not already opened
    if (bulkTracking.status === 'opened') {
      console.log('ℹ️ Recipient already marked as opened, skipping update');
      return returnTrackingPixel();
    }

    // Update recipient status to opened
    console.log('🔄 Updating recipient status to opened...');
    
    const { error: updateError } = await supabaseAdmin
      .from('bulk_email_recipients')
      .update({
        status: 'opened',
        opened_at: new Date().toISOString()
      })
      .eq('id', trackingId);

    if (updateError) {
      console.error('❌ Error updating recipient:', updateError);
      return returnTrackingPixel();
    }

    console.log('✅ Recipient status updated successfully');

    // Update campaign statistics
    if (bulkTracking.campaign_id) {
      console.log('🔄 Updating campaign statistics...');
      
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
          
          console.log(`✅ Campaign open count updated to ${newOpenCount}`);
        }
      } catch (error) {
        console.error('❌ Error updating campaign stats:', error);
      }
    }

    console.log('✅ Email tracking completed successfully');
    return returnTrackingPixel();

  } catch (error) {
    console.error('❌ Unexpected error in email tracking:', error);
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
