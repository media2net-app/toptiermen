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
    const { adsetId, status } = await request.json();

    if (!adsetId || !status) {
      return NextResponse.json(
        { success: false, error: 'Ad Set ID and status are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating ad set ${adsetId} status to: ${status}`);

    // Facebook API expects 'PAUSED' or 'ACTIVE'
    const facebookStatus = status === 'paused' ? 'PAUSED' : 'ACTIVE';

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${adsetId}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
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

    console.log(`✅ Successfully updated ad set ${adsetId} status to ${status}`);

    return NextResponse.json({
      success: true,
      message: `Ad Set status updated to ${status}`,
      data: result
    });

  } catch (error) {
    console.error('❌ Error updating ad set status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ad set status' },
      { status: 500 }
    );
  }
}
