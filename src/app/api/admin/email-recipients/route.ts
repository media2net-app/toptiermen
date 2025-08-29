import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    console.log(`📧 Fetching detailed recipients for campaign: ${campaignId}`);

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError) {
      console.error('❌ Error fetching campaign:', campaignError);
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Fetch detailed tracking data with opens and clicks
    const { data: trackingData, error: trackingError } = await supabaseAdmin
      .from('email_tracking')
      .select(`
        *,
        email_opens:email_opens(
          id,
          opened_at,
          user_agent,
          ip_address,
          device_type,
          browser,
          os
        ),
        email_clicks:email_clicks(
          id,
          clicked_at,
          link_url,
          link_text,
          user_agent,
          ip_address,
          device_type,
          browser,
          os
        )
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (trackingError) {
      console.error('❌ Error fetching tracking data:', trackingError);
      return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 });
    }

    // Process the data to include comprehensive recipient information
    const recipients = trackingData?.map(track => {
      const latestOpen = track.email_opens?.length > 0 
        ? track.email_opens.sort((a: any, b: any) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime())[0]
        : null;
      
      const latestClick = track.email_clicks?.length > 0 
        ? track.email_clicks.sort((a: any, b: any) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime())[0]
        : null;

      // Determine overall status
      let overallStatus = 'verzonden';
      if (track.status === 'failed' || track.status === 'bounced') {
        overallStatus = 'gefaald';
      } else if (track.status === 'clicked' || track.email_clicks?.length > 0) {
        overallStatus = 'geklikt';
      } else if (track.status === 'opened' || track.email_opens?.length > 0) {
        overallStatus = 'geopend';
      } else if (track.status === 'delivered') {
        overallStatus = 'bezorgd';
      } else if (track.status === 'sent') {
        overallStatus = 'verzonden';
      } else if (track.status === 'pending') {
        overallStatus = 'in behandeling';
      }

      return {
        id: track.id,
        email: track.recipient_email,
        name: track.recipient_name || 'Onbekend',
        status: overallStatus,
        sentAt: track.sent_at,
        deliveredAt: track.delivered_at,
        openedAt: track.opened_at,
        clickedAt: track.clicked_at,
        openCount: track.open_count || 0,
        clickCount: track.click_count || 0,
        trackingId: track.tracking_id,
        userAgent: track.user_agent,
        ipAddress: track.ip_address,
        // Latest activity details
        lastOpenDetails: latestOpen ? {
          openedAt: latestOpen.opened_at,
          userAgent: latestOpen.user_agent,
          ipAddress: latestOpen.ip_address,
          deviceType: latestOpen.device_type,
          browser: latestOpen.browser,
          os: latestOpen.os
        } : null,
        lastClickDetails: latestClick ? {
          clickedAt: latestClick.clicked_at,
          linkUrl: latestClick.link_url,
          linkText: latestClick.link_text,
          userAgent: latestClick.user_agent,
          ipAddress: latestClick.ip_address,
          deviceType: latestClick.device_type,
          browser: latestClick.browser,
          os: latestClick.os
        } : null,
        // All opens and clicks for detailed view
        allOpens: track.email_opens || [],
        allClicks: track.email_clicks || []
      };
    }) || [];

    console.log(`✅ Successfully fetched ${recipients.length} recipients for campaign ${campaign.name}`);

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        sentAt: campaign.sent_at,
        totalRecipients: campaign.total_recipients,
        sentCount: campaign.sent_count,
        openCount: campaign.open_count,
        clickCount: campaign.click_count
      },
      recipients
    });

  } catch (error) {
    console.error('❌ Error in email recipients API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
