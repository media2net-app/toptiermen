import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET(request: NextRequest) {
  try {
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!credentialsJson) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_APPLICATION_CREDENTIALS_JSON not configured'
      }, { status: 400 });
    }

    // Parse credentials
    const credentials = JSON.parse(credentialsJson);

    // Initialize client
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: credentials,
    });

    // List all properties the service account has access to
    const [response] = await analyticsDataClient.listProperties();

    const properties = response.properties || [];

    return NextResponse.json({
      success: true,
      message: 'Available Google Analytics properties:',
      properties: properties.map(property => ({
        name: property.displayName,
        propertyId: property.name?.split('/').pop(), // Extract numeric ID
        propertyName: property.name,
        account: property.account,
        currencyCode: property.currencyCode,
        timeZone: property.timeZone,
        websiteUri: property.websiteUri
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Failed to list GA properties:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to list properties',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
