import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  if (!FACEBOOK_ACCESS_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'Missing Facebook access token' },
      { status: 500 }
    );
  }

  try {
    const { campaignId, status } = await request.json();

    if (!campaignId || !status) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID and status are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating campaign ${campaignId} status to: ${status}`);

    // Facebook API expects 'PAUSED' or 'ACTIVE'
    const facebookStatus = status === 'paused' ? 'PAUSED' : 'ACTIVE';

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${campaignId}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: facebookStatus
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook API error response:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    console.log(`✅ Successfully updated campaign ${campaignId} status to ${status}`);

    return NextResponse.json({
      success: true,
      message: `Campaign status updated to ${status}`,
      data: result
    });

  } catch (error) {
    console.error('❌ Error updating campaign status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign status' },
      { status: 500 }
    );
  }
}
