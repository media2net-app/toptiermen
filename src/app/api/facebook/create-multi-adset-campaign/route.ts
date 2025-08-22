import { NextRequest, NextResponse } from 'next/server';
import { initializeFacebookAdManagerComplete, CreateMultiAdSetCampaignData } from '@/lib/facebook-ad-manager-complete';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      objective,
      status = 'PAUSED',
      start_time,
      stop_time,
      campaign_daily_budget,
      lifetime_budget,
      ad_sets,
      page_id
    } = body;

    // Validate required fields
    if (!name || !objective || !ad_sets || !Array.isArray(ad_sets) || ad_sets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, objective, ad_sets (array)' },
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
    const campaignData: CreateMultiAdSetCampaignData = {
      name,
      objective,
      status,
      start_time,
      stop_time,
      campaign_daily_budget,
      lifetime_budget,
      ad_sets
    };

    console.log('🚀 Creating Facebook campaign with multiple ad sets:', campaignData);

    // Create multi-ad-set campaign
    const result = await facebookManager.createMultiAdSetCampaign(campaignData);

    return NextResponse.json({
      success: true,
      message: 'Campaign with multiple ad sets created successfully',
      data: {
        campaign: {
          id: result.campaign.id,
          name: result.campaign.name,
          status: result.campaign.status,
          objective: result.campaign.objective
        },
        adSets: result.adSets.map(adSet => ({
          id: adSet.id,
          name: adSet.name,
          status: adSet.status
        })),
        ads: result.ads.map(ad => ({
          id: ad.id,
          name: ad.name,
          status: ad.status
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error creating multi-ad-set campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
