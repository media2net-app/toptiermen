import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET(request: NextRequest) {
  try {
    const gaPropertyId = process.env.GA_PROPERTY_ID;
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!gaPropertyId) {
      return NextResponse.json({
        success: false,
        error: 'GA_PROPERTY_ID not configured',
        message: 'Please add GA_PROPERTY_ID to your environment variables'
      }, { status: 400 });
    }

    if (!credentialsJson) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_APPLICATION_CREDENTIALS_JSON not configured',
        message: 'Please add GOOGLE_APPLICATION_CREDENTIALS_JSON to your environment variables'
      }, { status: 400 });
    }

    // Parse credentials
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON credentials',
        message: 'GOOGLE_APPLICATION_CREDENTIALS_JSON contains invalid JSON'
      }, { status: 400 });
    }

    // Initialize client
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: credentials,
    });

    // Test API call - get basic metrics for last 7 days
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${gaPropertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'totalUsers',
        },
        {
          name: 'sessions',
        },
        {
          name: 'screenPageViews',
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Google Analytics credentials are working!',
      data: {
        propertyId: gaPropertyId,
        serviceAccountEmail: credentials.client_email,
        testResults: {
          totalUsers: response.rows?.[0]?.metricValues?.[0]?.value || '0',
          sessions: response.rows?.[0]?.metricValues?.[1]?.value || '0',
          pageViews: response.rows?.[0]?.metricValues?.[2]?.value || '0',
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Google Analytics credentials test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Google Analytics test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
