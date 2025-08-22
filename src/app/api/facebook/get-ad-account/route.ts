import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

export async function GET(request: NextRequest) {
  try {
    if (!FACEBOOK_ACCESS_TOKEN) {
      throw new Error('Facebook access token not configured');
    }

    // Fetch ad account info from Facebook
    const adAccountResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,account_status,currency,timezone_name,account_id`
    );

    if (!adAccountResponse.ok) {
      const errorData = await adAccountResponse.json();
      throw new Error(`Failed to fetch ad account: ${JSON.stringify(errorData)}`);
    }

    const adAccountData = await adAccountResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        id: adAccountData.id,
        name: adAccountData.name || 'Top Tier Men Ad Account',
        account_status: adAccountData.account_status || 1,
        currency: adAccountData.currency || 'EUR',
        timezone_name: adAccountData.timezone_name || 'Europe/Amsterdam',
        account_id: adAccountData.account_id || FACEBOOK_AD_ACCOUNT_ID
      }
    });
  } catch (error) {
    console.error('Error fetching ad account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ad account' },
      { status: 500 }
    );
  }
}
