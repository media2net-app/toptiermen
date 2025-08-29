import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json();

    if (!campaignId) {
      return NextResponse.json({
        success: false,
        error: 'Campaign ID is required'
      }, { status: 400 });
    }

    console.log(`🔄 Resetting failed recipients for campaign: ${campaignId}`);

    // Reset failed recipients back to pending
    const { data, error } = await supabaseAdmin
      .from('bulk_email_recipients')
      .update({
        status: 'pending',
        sent_at: null,
        bounce_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('campaign_id', campaignId)
      .eq('status', 'failed')
      .select('id, email, status');

    if (error) {
      console.error('❌ Error resetting failed recipients:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to reset recipients',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ Reset ${data?.length || 0} failed recipients to pending`);

    return NextResponse.json({
      success: true,
      message: `Reset ${data?.length || 0} failed recipients to pending`,
      resetCount: data?.length || 0
    });

  } catch (error) {
    console.error('❌ Error in reset failed recipients API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
