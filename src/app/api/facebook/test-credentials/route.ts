import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

export async function GET() {
  try {
    console.log('🧪 Testing Facebook credentials...');
    console.log('🔧 Access Token:', FACEBOOK_ACCESS_TOKEN ? 'PRESENT' : 'MISSING');
    console.log('🔧 Ad Account ID:', FACEBOOK_AD_ACCOUNT_ID);

    if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
      return NextResponse.json({
        success: false,
        error: 'Missing Facebook credentials',
        details: {
          accessToken: FACEBOOK_ACCESS_TOKEN ? 'Present' : 'Missing',
          adAccountId: FACEBOOK_AD_ACCOUNT_ID ? 'Present' : 'Missing'
        }
      }, { status: 500 });
    }

    // Test 1: Verify access token by getting user info
    console.log('🧪 Testing access token...');
    const userResponse = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${FACEBOOK_ACCESS_TOKEN}`);
    const userData = await userResponse.json();

    if (userData.error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid access token',
        details: userData.error
      }, { status: 400 });
    }

    // Test 2: Verify ad account access
    console.log('🧪 Testing ad account access...');
    const adAccountResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,account_status,currency,timezone_name`
    );
    const adAccountData = await adAccountResponse.json();

    if (adAccountData.error) {
      return NextResponse.json({
        success: false,
        error: 'Cannot access ad account',
        details: adAccountData.error
      }, { status: 400 });
    }

    // Test 3: Get campaigns count
    console.log('🧪 Testing campaigns access...');
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name&limit=5`
    );
    const campaignsData = await campaignsResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        adAccount: adAccountData,
        campaignsCount: campaignsData.data?.length || 0,
        campaigns: campaignsData.data || [],
        credentials: {
          accessToken: 'Valid',
          adAccountId: FACEBOOK_AD_ACCOUNT_ID
        }
      }
    });

  } catch (error) {
    console.error('❌ Error testing Facebook credentials:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test credentials',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
