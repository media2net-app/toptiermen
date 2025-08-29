import { NextRequest, NextResponse } from 'next/server';
import { EmailTrackingService } from '@/lib/email-tracking-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const campaignId = params.campaignId;
    
    console.log('📊 Fetching campaign tracking:', { campaignId });

    // Get detailed tracking for specific campaign
    const tracking = await EmailTrackingService.getCampaignTracking(campaignId);

    console.log('✅ Campaign tracking fetched successfully');

    return NextResponse.json({
      success: true,
      tracking: tracking
    });

  } catch (error) {
    console.error('❌ Error fetching campaign tracking:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
