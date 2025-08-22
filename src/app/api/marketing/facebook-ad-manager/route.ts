import { NextRequest, NextResponse } from 'next/server';
import { getFacebookAdManager } from '@/lib/facebook-ad-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';
    const dateRange = searchParams.get('dateRange') || '30d';
    const campaignId = searchParams.get('campaignId');
    const adSetId = searchParams.get('adSetId');
    const accessToken = searchParams.get('accessToken');

    const facebookAdManager = getFacebookAdManager();
    if (!facebookAdManager) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Facebook Ad Manager not configured. Please set up environment variables.',
          data: null 
        },
        { status: 500 }
      );
    }

    // Calculate date range
    const endDate = new Date().toISOString().split('T')[0];
    let startDate: string;
    
    switch (dateRange) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    const dateRangeObj = { start: startDate, end: endDate };

    switch (action) {
      case 'get-ad-accounts':
        if (!accessToken) {
          return NextResponse.json(
            { success: false, error: 'Access token is required' },
            { status: 400 }
          );
        }
        
        try {
          // Use server-side token exchange for better security
          const response = await fetch(
            `https://graph.facebook.com/v18.0/me/adaccounts?access_token=${accessToken}&fields=id,name,account_status,currency,timezone_name`
          );
          
          if (!response.ok) {
            throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          return NextResponse.json({
            success: true,
            adAccounts: data.data || []
          });
        } catch (error) {
          console.error('Error fetching ad accounts:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to fetch ad accounts' },
            { status: 500 }
          );
        }

      case 'test-connection':
        const isConnected = await facebookAdManager.testConnection();
        return NextResponse.json({
          success: true,
          connected: isConnected,
          message: isConnected ? 'Facebook Ad Manager connected successfully' : 'Facebook Ad Manager connection failed'
        });

      case 'account':
        const account = await facebookAdManager.getAdAccount();
        return NextResponse.json({
          success: true,
          data: account
        });

      case 'campaigns':
        const campaigns = await facebookAdManager.getCampaignsWithInsights(dateRangeObj);
        return NextResponse.json({
          success: true,
          data: campaigns,
          dateRange: dateRangeObj
        });

      case 'campaign-details':
        if (!campaignId) {
          return NextResponse.json(
            { success: false, error: 'Campaign ID is required' },
            { status: 400 }
          );
        }
        
        const campaign = await facebookAdManager.getCampaigns();
        const selectedCampaign = campaign.find(c => c.id === campaignId);
        const adSets = await facebookAdManager.getAdSets(campaignId);
        
        return NextResponse.json({
          success: true,
          data: {
            campaign: selectedCampaign,
            adSets,
            dateRange: dateRangeObj
          }
        });

      case 'adset-details':
        if (!adSetId) {
          return NextResponse.json(
            { success: false, error: 'Ad Set ID is required' },
            { status: 400 }
          );
        }
        
        const ads = await facebookAdManager.getAds(adSetId);
        return NextResponse.json({
          success: true,
          data: ads,
          dateRange: dateRangeObj
        });

      case 'dashboard':
      default:
        // Check if we have user credentials
        if (accessToken) {
          try {
            // Get ad accounts first to get the ad account ID
            const adAccountsResponse = await fetch(
              `https://graph.facebook.com/v18.0/me/adaccounts?access_token=${accessToken}&fields=id,name,account_status,currency,timezone_name`
            );
            
            if (!adAccountsResponse.ok) {
              throw new Error(`Facebook API error: ${adAccountsResponse.status} ${adAccountsResponse.statusText}`);
            }
            
            const adAccountsData = await adAccountsResponse.json();
            const adAccounts = adAccountsData.data || [];
            
            if (adAccounts.length === 0) {
              return NextResponse.json({
                success: false,
                error: 'No ad accounts found for this user'
              }, { status: 404 });
            }
            
            // Use the first ad account
            const adAccountId = adAccounts[0].id;
            const userFacebookManager = createFacebookAdManager(accessToken, adAccountId);
            const dashboardData = await userFacebookManager.getDashboardData(dateRangeObj);
            return NextResponse.json(dashboardData);
          } catch (error) {
            console.error('Error using user credentials:', error);
            // Fallback to singleton instance
            if (facebookAdManager) {
              const dashboardData = await facebookAdManager.getDashboardData(dateRangeObj);
              return NextResponse.json(dashboardData);
            }
            throw error;
          }
        } else {
          // Use singleton instance
          if (!facebookAdManager) {
            return NextResponse.json({
              success: false,
              error: 'No Facebook credentials available'
            }, { status: 500 });
          }
          const dashboardData = await facebookAdManager.getDashboardData(dateRangeObj);
          return NextResponse.json(dashboardData);
        }
    }

  } catch (error) {
    console.error('Facebook Ad Manager API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Facebook Ad Manager data',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!facebookAdManager) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Facebook Ad Manager not configured',
          data: null 
        },
        { status: 500 }
      );
    }

    switch (action) {
      case 'create-campaign':
        const newCampaign = await facebookAdManager.createCampaign(data);
        return NextResponse.json({
          success: true,
          data: newCampaign
        });

      case 'update-campaign':
        const { campaignId, updates } = data;
        const updatedCampaign = await facebookAdManager.updateCampaign(campaignId, updates);
        return NextResponse.json({
          success: true,
          data: updatedCampaign
        });

      case 'toggle-campaign-status':
        const { campaignId: toggleCampaignId, status } = data;
        const toggledCampaign = await facebookAdManager.toggleCampaignStatus(toggleCampaignId, status);
        return NextResponse.json({
          success: true,
          data: toggledCampaign
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Facebook Ad Manager POST error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform Facebook Ad Manager action',
        data: null 
      },
      { status: 500 }
    );
  }
}
