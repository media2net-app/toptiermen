import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('trackingId');

    if (!trackingId) {
      return NextResponse.json({ error: 'Missing tracking ID' }, { status: 400 });
    }

    console.log('🔍 Debugging tracking ID:', trackingId);

    // Check email_tracking table
    const { data: tracking, error: trackingError } = await supabaseAdmin
      .from('email_tracking')
      .select('*')
      .eq('tracking_id', trackingId)
      .single();

    if (trackingError) {
      console.error('❌ Tracking record error:', trackingError);
      return NextResponse.json({ 
        error: 'Tracking record not found',
        trackingError: trackingError.message 
      }, { status: 404 });
    }

    // Check email_opens table
    const { data: opens, error: opensError } = await supabaseAdmin
      .from('email_opens')
      .select('*')
      .eq('tracking_id', tracking.id);

    // Check email_campaigns table
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('email_campaigns')
      .select('*')
      .eq('id', tracking.campaign_id)
      .single();

    return NextResponse.json({
      success: true,
      tracking,
      opens: opens || [],
      campaign,
      trackingError: trackingError ? String(trackingError) : null,
      opensError: opensError ? String(opensError) : null,
      campaignError: campaignError ? String(campaignError) : null
    });

  } catch (error) {
    console.error('❌ Error in debug endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
