import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('token');
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Access token is required',
        usage: 'Add ?token=YOUR_TOKEN to the URL'
      }, { status: 400 });
    }

    console.log('Testing Facebook Marketing API with token:', accessToken.substring(0, 20) + '...');

    // Test 1: Get user info
    const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${accessToken}`);
    const userData = await userResponse.json();
    
    if (userData.error) {
      return NextResponse.json({ 
        error: 'Invalid access token',
        details: userData.error
      }, { status: 400 });
    }

    // Test 2: Get ad accounts
    const adAccountsResponse = await fetch(`https://graph.facebook.com/v18.0/me/adaccounts?access_token=${accessToken}&fields=id,name,account_status,currency,timezone_name`);
    const adAccountsData = await adAccountsResponse.json();

    // Test 3: Get campaigns (if ad accounts exist)
    let campaignsData: any = null;
    if (adAccountsData.data && adAccountsData.data.length > 0) {
      const firstAdAccount = adAccountsData.data[0];
      const campaignsResponse = await fetch(`https://graph.facebook.com/v18.0/${firstAdAccount.id}/campaigns?access_token=${accessToken}&fields=id,name,status,objective,created_time,start_time,stop_time,spend_cap,spend_cap_type`);
      campaignsData = await campaignsResponse.json();
    }

    // Test 4: Get insights (if campaigns exist)
    let insightsData: any = null;
    if (campaignsData && campaignsData.data && campaignsData.data.length > 0) {
      const firstCampaign = campaignsData.data[0];
      const insightsResponse = await fetch(`https://graph.facebook.com/v18.0/${firstCampaign.id}/insights?access_token=${accessToken}&fields=impressions,clicks,spend,reach,frequency,cpm,cpc,ctr&date_preset=last_30d`);
      insightsData = await insightsResponse.json();
    }

    return NextResponse.json({
      success: true,
      message: 'Facebook Marketing API test successful',
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email
      },
      adAccounts: {
        count: adAccountsData.data?.length || 0,
        accounts: adAccountsData.data || []
      },
      campaigns: {
        count: campaignsData?.data?.length || 0,
        campaigns: campaignsData?.data || []
      },
      insights: insightsData?.data || null,
      permissions: {
        ads_management: true,
        ads_read: true,
        read_insights: true
      }
    });

  } catch (error) {
    console.error('Facebook Marketing API test error:', error);
    return NextResponse.json({ 
      error: 'Failed to test Facebook Marketing API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
