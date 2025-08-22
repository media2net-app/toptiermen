import { NextRequest, NextResponse } from 'next/server';
import { initializeFacebookAdManagerComplete, CreateCampaignData } from '@/lib/facebook-ad-manager-complete';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      objective,
      status = 'PAUSED', // Default to PAUSED for safety
      start_time,
      stop_time,
      daily_budget,
      lifetime_budget,
      targeting,
      ad_creative,
      video_url,
      video_name,
      page_id
    } = body;

    // Validate required fields
    if (!name || !objective || !targeting || !ad_creative) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, objective, targeting, ad_creative' },
        { status: 400 }
      );
    }

    // Get environment variables
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        { success: false, error: 'Facebook configuration missing' },
        { status: 500 }
      );
    }

    // Initialize Facebook Ad Manager
    const facebookManager = initializeFacebookAdManagerComplete(accessToken, adAccountId);

    // Test connection
    const isConnected = await facebookManager.testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Facebook API connection failed' },
        { status: 500 }
      );
    }

    // Prepare campaign data
    const campaignData: CreateCampaignData = {
      name,
      objective,
      status,
      start_time,
      stop_time,
      daily_budget,
      lifetime_budget,
      targeting,
      ad_creative,
      video_url,
      video_name,
      page_id
    };

    console.log('🚀 Creating Facebook campaign with data:', campaignData);

    // Create complete campaign
    const result = await facebookManager.createCompleteCampaign(campaignData);

    return NextResponse.json({
      success: true,
      message: 'Campaign created successfully',
      data: {
        campaign: {
          id: result.campaign.id,
          name: result.campaign.name,
          status: result.campaign.status,
          objective: result.campaign.objective
        },
        adSet: {
          id: result.adSet.id,
          name: result.adSet.name,
          status: result.adSet.status
        },
        ad: {
          id: result.ad.id,
          name: result.ad.name,
          status: result.ad.status
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating Facebook campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        { success: false, error: 'Facebook configuration missing' },
        { status: 500 }
      );
    }

    const facebookManager = initializeFacebookAdManagerComplete(accessToken, adAccountId);
    
    // Test connection
    const isConnected = await facebookManager.testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Facebook API connection failed' },
        { status: 500 }
      );
    }

    // Get ad account info
    const adAccount = await facebookManager.getAdAccount();
    
    // Get existing campaigns
    const campaigns = await facebookManager.getCampaigns(50);

    return NextResponse.json({
      success: true,
      data: {
        adAccount,
        campaigns: campaigns.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          daily_budget: campaign.daily_budget,
          created_time: campaign.created_time
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching Facebook data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
