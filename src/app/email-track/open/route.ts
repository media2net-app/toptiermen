import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Helper function to determine campaign info from tracking ID
function getCampaignInfoFromTrackingId(trackingId: string) {
  // For test emails, we can determine campaign based on timestamp or other factors
  // For now, we'll use a simple heuristic based on when the tracking ID was created
  const timestamp = trackingId.split('_')[1];
  const date = new Date(parseInt(timestamp));
  
  // Campaign 2 was created around September 6, 2025
  // Any test emails after that date are likely Campaign 2
  if (date >= new Date('2025-09-06')) {
    return {
      id: '84bceade-eec6-4349-958f-6b04be0d3003',
      name: 'Campagne 2 - Sneak Preview'
    };
  } else {
    return {
      id: 'campaign-1-id',
      name: 'Campagne 1 - Welcome'
    };
  }
}

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
      return returnTrackingPixel();
    }

    // Extract email from tracking ID if it's a test email
    let recipientEmail = 'unknown';
    
    if (trackingId.startsWith('bulk_')) {
      // Handle bulk email tracking
      console.log('📧 Bulk email tracking detected');
      
      try {
        const { data, error } = await supabaseAdmin
          .from('bulk_email_tracking')
          .update({
            opened_at: new Date().toISOString(),
            status: 'opened',
            user_agent: request.headers.get('user-agent'),
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'localhost',
            updated_at: new Date().toISOString()
          })
          .eq('tracking_id', trackingId)
          .select();
          
        if (error) {
          console.error('❌ Error updating bulk email tracking:', error);
        } else if (data && data.length > 0) {
          console.log('✅ Bulk email marked as opened:', data[0].email);
        } else {
          console.warn('⚠️ No bulk email found with tracking ID:', trackingId);
        }
      } catch (dbError) {
        console.error('❌ Database error updating bulk email tracking:', dbError);
      }
      
      return returnTrackingPixel();
    } else if (trackingId.startsWith('test_')) {
      // Extract email from tracking ID format: test_timestamp_email_random
      const parts = trackingId.split('_');
      if (parts.length >= 4) {
        // Reconstruct email from parts (e.g., rick_at_toptiermen_dot_eu -> rick@toptiermen.eu)
        const emailPart = parts.slice(2, -1).join('_'); // Get everything between timestamp and random
        recipientEmail = emailPart.replace('_at_', '@').replace('_dot_', '.');
      }
      
      // Extract campaign info from the tracking ID or context
      const campaignInfo = getCampaignInfoFromTrackingId(trackingId);
      
      console.log('📧 === TEST EMAIL OPENED ===');
      console.log('📧 Recipient Email:', recipientEmail);
      console.log('📧 Tracking ID:', trackingId);
      console.log('📧 Campaign ID:', campaignInfo.id, '(' + campaignInfo.name + ')');
      console.log('📧 Timestamp:', new Date().toISOString());
      console.log('📧 User Agent:', request.headers.get('user-agent'));
      console.log('📧 IP Address:', request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'localhost');
      
      // Update test email tracking in database
      try {
        const { data, error } = await supabaseAdmin
          .from('test_email_tracking')
          .update({
            opened_at: new Date().toISOString(),
            user_agent: request.headers.get('user-agent'),
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'localhost',
            updated_at: new Date().toISOString()
          })
          .eq('tracking_id', trackingId)
          .select();
        
        if (error) {
          console.error('❌ Failed to update test email tracking:', error);
        } else if (data && data.length > 0) {
          console.log('✅ Test email tracking updated in database:', data[0]);
        } else {
          console.log('⚠️ No test email tracking record found for tracking ID:', trackingId);
        }
      } catch (dbError) {
        console.error('❌ Database error updating test email tracking:', dbError);
      }
      
      console.log('📧 === END TEST EMAIL TRACKING ===');
      
      return returnTrackingPixel();
    }

    console.log('👁️ Processing email open for tracking ID:', trackingId);
    console.log('📧 Recipient email detected:', recipientEmail);

    // Try to find existing recipient record by email (fallback method)
    const { data: bulkTracking, error: bulkError } = await supabaseAdmin
      .from('bulk_email_recipients')
      .select('id, email, status, opened_at, campaign_id')
      .eq('email', recipientEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('🔍 Database query result:', { bulkTracking, bulkError });

    if (bulkError) {
      console.error('❌ Database query error:', bulkError);
      // Still log the tracking event
      console.log('📧 === EMAIL OPENED (NO DB) ===');
      console.log('📧 Email:', recipientEmail);
      console.log('📧 Tracking ID:', trackingId);
      console.log('📧 Timestamp:', new Date().toISOString());
      console.log('📧 === END EMAIL TRACKING ===');
      return returnTrackingPixel();
    }

    if (!bulkTracking) {
      console.log('ℹ️ No recipient record found, logging tracking event');
      console.log('📧 === EMAIL OPENED (NO DB RECORD) ===');
      console.log('📧 Email:', recipientEmail);
      console.log('📧 Tracking ID:', trackingId);
      console.log('📧 Timestamp:', new Date().toISOString());
      console.log('📧 === END EMAIL TRACKING ===');
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
      .eq('id', bulkTracking.id);

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
