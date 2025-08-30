import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('trackingId');

    if (!trackingId) {
      console.error('❌ No tracking ID provided');
      return new NextResponse('Tracking ID required', { status: 400 });
    }

    console.log('📧 Email open tracking:', { trackingId });

    // Update the recipient record to mark as opened
    const { error: updateError } = await supabaseAdmin
      .from('bulk_email_recipients')
      .update({
        status: 'opened',
        opened_at: new Date().toISOString()
      })
      .eq('lead_id', trackingId);

    if (updateError) {
      console.error('❌ Error updating recipient status:', updateError);
      
      // Try alternative approach - update by email if lead_id doesn't match
      const { error: emailUpdateError } = await supabaseAdmin
        .from('bulk_email_recipients')
        .update({
          status: 'opened',
          opened_at: new Date().toISOString()
        })
        .eq('email', trackingId);

      if (emailUpdateError) {
        console.error('❌ Error updating by email:', emailUpdateError);
        return new NextResponse('Failed to update tracking', { status: 500 });
      }
    }

    // Update campaign statistics
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('bulk_email_campaigns')
      .select('id, open_count')
      .eq('id', '3c599791-0268-4980-914f-a599be42139b')
      .single();

    if (!campaignError && campaign) {
      const newOpenCount = (campaign.open_count || 0) + 1;
      
      await supabaseAdmin
        .from('bulk_email_campaigns')
        .update({
          open_count: newOpenCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id);
    }

    console.log('✅ Email open tracked successfully:', { trackingId });

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ Error in email tracking:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
