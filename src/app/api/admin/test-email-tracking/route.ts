import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    
    if (!campaignId) {
      return NextResponse.json({
        success: false,
        error: 'campaignId is required'
      }, { status: 400 });
    }

    console.log('📊 Fetching test email tracking for campaign:', campaignId);

    // Get test email tracking data from database
    const { data: testEmails, error } = await supabaseAdmin
      .from('test_email_tracking')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching test email tracking:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch test email tracking'
      }, { status: 500 });
    }

    // Transform data for frontend
    const transformedData = (testEmails || []).map(email => ({
      id: email.id,
      email: email.email,
      name: email.name,
      trackingId: email.tracking_id,
      template: email.template,
      sentAt: new Date(email.sent_at).toLocaleString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      opened: !!email.opened_at,
      openedAt: email.opened_at ? new Date(email.opened_at).toLocaleString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) : null,
      userAgent: email.user_agent || 'Unknown',
      ipAddress: email.ip_address || 'Unknown'
    }));

    console.log(`✅ Found ${transformedData.length} test emails for campaign ${campaignId}`);

    return NextResponse.json({
      success: true,
      testEmails: transformedData
    });

  } catch (error) {
    console.error('❌ Error in test email tracking API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
