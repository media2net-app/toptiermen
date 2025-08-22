import { NextRequest, NextResponse } from 'next/server';
import { initializeFacebookAdManagerComplete } from '@/lib/facebook-ad-manager-complete';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'interests' or 'behaviors'

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    if (!type || !['interests', 'behaviors'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type parameter must be "interests" or "behaviors"' },
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

    let results;
    if (type === 'interests') {
      results = await facebookManager.searchInterests(query);
    } else {
      results = await facebookManager.searchBehaviors(query);
    }

    return NextResponse.json({
      success: true,
      data: {
        type,
        query,
        results: results.map(item => ({
          id: item.id,
          name: item.name,
          audience_size: item.audience_size,
          path: item.path
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error searching Facebook targeting:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
