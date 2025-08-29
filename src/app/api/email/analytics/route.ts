import { NextRequest, NextResponse } from 'next/server';
import { EmailTrackingService } from '@/lib/email-tracking-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaign_id = searchParams.get('campaign_id');
    const days = parseInt(searchParams.get('days') || '30');

    console.log('📊 Fetching email analytics:', { campaign_id, days });

    // Get analytics data
    const analytics = await EmailTrackingService.getEmailAnalytics();
    const dailyAnalytics = await EmailTrackingService.getDailyAnalytics(campaign_id || undefined, days);

    // Calculate overall stats
    const overallStats = {
      total_campaigns: analytics.length,
      total_sent: analytics.reduce((sum, campaign) => sum + campaign.sent_count, 0),
      total_opened: analytics.reduce((sum, campaign) => sum + campaign.open_count, 0),
      total_clicked: analytics.reduce((sum, campaign) => sum + campaign.click_count, 0),
      total_bounced: analytics.reduce((sum, campaign) => sum + campaign.bounce_count, 0),
      total_unsubscribed: analytics.reduce((sum, campaign) => sum + campaign.unsubscribe_count, 0),
      avg_open_rate: analytics.length > 0 ? 
        analytics.reduce((sum, campaign) => sum + campaign.open_rate, 0) / analytics.length : 0,
      avg_click_rate: analytics.length > 0 ? 
        analytics.reduce((sum, campaign) => sum + campaign.click_rate, 0) / analytics.length : 0
    };

    console.log('✅ Email analytics fetched successfully');

    return NextResponse.json({
      success: true,
      analytics: analytics,
      daily_analytics: dailyAnalytics,
      overall_stats: overallStats
    });

  } catch (error) {
    console.error('❌ Error fetching email analytics:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
