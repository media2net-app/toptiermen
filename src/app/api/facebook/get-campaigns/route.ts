import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

// Manual data override based on Facebook Ads Manager (Live Data - Updated 8/27/2025)
// Conversion data updated with actual leads from database
// CTR values are in decimal format (0.0667 = 6.67%)
// Using real Facebook campaign IDs to match ad sets and ads
const CURRENT_MANUAL_DATA = {
  "120232433872750324": {
    "name": "TTM - Zakelijk Prelaunch Campagne - LEADS V2",
    "clicks": 32,
    "spend": 6.70,
    "impressions": 358,
    "reach": 358,
    "ctr": 0.0893854748603352,
    "cpc": 0.209375,
    "frequency": 1.0,
    "status": "ACTIVE",
    "leads": 1,
    "conversions": 1,
    "budget": 2500,
    "budgetRemaining": 2493.30
  },
  "120232394482520324": {
    "name": "TTM - Algemene Prelaunch Campagne - LEADS",
    "clicks": 0,
    "spend": 0,
    "impressions": 0,
    "reach": 0,
    "ctr": 0,
    "cpc": 0,
    "frequency": 0,
    "status": "PAUSED",
    "leads": 0,
    "conversions": 0,
    "budget": 5000,
    "budgetRemaining": 5000
  },
  "120232394479720324": {
    "name": "TTM - Jongeren Prelaunch Campagne - LEADS",
    "clicks": 0,
    "spend": 0,
    "impressions": 0,
    "reach": 0,
    "ctr": 0,
    "cpc": 0,
    "frequency": 0,
    "status": "PAUSED",
    "leads": 0,
    "conversions": 0,
    "budget": 5000,
    "budgetRemaining": 5000
  },
  "120232394477760324": {
    "name": "TTM - Vaders Prelaunch Campagne - LEADS",
    "clicks": 0,
    "spend": 0,
    "impressions": 0,
    "reach": 0,
    "ctr": 0,
    "cpc": 0,
    "frequency": 0,
    "status": "PAUSED",
    "leads": 0,
    "conversions": 0,
    "budget": 5000,
    "budgetRemaining": 5000
  },
  "120232394476410324": {
    "name": "TTM - Zakelijk Prelaunch Campagne - LEADS",
    "clicks": 0,
    "spend": 0,
    "impressions": 0,
    "reach": 0,
    "ctr": 0,
    "cpc": 0,
    "frequency": 0,
    "status": "PAUSED",
    "leads": 0,
    "conversions": 0,
    "budget": 5000,
    "budgetRemaining": 5000
  },
  "120232271577190324": {
    "name": "TTM - Zakelijk Prelaunch Campagne - LEADS",
    "clicks": 0,
    "spend": 0,
    "impressions": 0,
    "reach": 0,
    "ctr": 0,
    "cpc": 0,
    "frequency": 0,
    "status": "PAUSED",
    "leads": 0,
    "conversions": 0,
    "budget": 500,
    "budgetRemaining": 500
  },
  "120232181493720324": {
    "name": "TTM - Zakelijk Prelaunch Campagne",
    "clicks": 1235,
    "spend": 107.88,
    "impressions": 14968,
    "reach": 12456,
    "ctr": 0.082503339,
    "cpc": 0.087352226,
    "frequency": 1.201285,
    "status": "PAUSED",
    "leads": 2,
    "conversions": 2,
    "budget": 1500,
    "budgetRemaining": 1392.12
  },
  "120232181491490324": {
    "name": "TTM - Vaders Prelaunch Campagne",
    "clicks": 473,
    "spend": 25.15,
    "impressions": 4189,
    "reach": 3671,
    "ctr": 0.11291477679637145,
    "cpc": 0.053171247357293866,
    "frequency": 1.141106,
    "status": "PAUSED",
    "leads": 0,
    "conversions": 0,
    "budget": 25,
    "budgetRemaining": 0
  },
  "120232181487970324": {
    "name": "TTM - Jongeren Prelaunch Campagne",
    "clicks": 679,
    "spend": 44.44,
    "impressions": 6867,
    "reach": 5867,
    "ctr": 0.098878695,
    "cpc": 0.065449190,
    "frequency": 1.170445,
    "status": "PAUSED",
    "leads": 3,
    "conversions": 3,
    "budget": 25,
    "budgetRemaining": 0
  },
  "120232181480080324": {
    "name": "TTM - Algemene Prelaunch Campagne",
    "clicks": 499,
    "spend": 36.76,
    "impressions": 5123,
    "reach": 4233,
    "ctr": 0.09740386492289674,
    "cpc": 0.07366733466933867,
    "frequency": 1.210253,
    "status": "PAUSED",
    "leads": 0,
    "conversions": 0,
    "budget": 25,
    "budgetRemaining": 0
  }
};

export async function GET() {
  try {
    console.log('📊 Fetching Facebook campaigns with manual data...');
    
    // Use manual data instead of live API calls
    console.log('🔧 Using manual data override...');
    
    // Create campaign objects from manual data
    const transformedCampaigns = Object.entries(CURRENT_MANUAL_DATA).map(([campaignId, data]) => {
      return {
        id: campaignId, // Use real Facebook campaign ID
        name: data.name,
        status: data.status,
        objective: data.name.includes('LEADS') ? 'leads' : 'traffic',
        impressions: data.impressions,
        clicks: data.clicks,
        spent: data.spend,
        reach: data.reach,
        ctr: data.ctr,
        cpc: data.cpc,
        leads: data.leads,
        conversions: data.conversions,
        budget: data.budget,
        dailyBudget: 25,
        startDate: '2025-08-22',
        endDate: '2025-12-31',
        adsCount: 0,
        videoId: '',
        videoName: '',
        createdAt: '2025-08-22T00:00:00Z',
        lastUpdated: '2025-08-27T00:00:00Z'
      };
    });

    console.log(`✅ Found ${transformedCampaigns.length} TTM campaigns using manual data`);

    return NextResponse.json({
      success: true,
      data: transformedCampaigns
    });

  } catch (error) {
    console.error('❌ Error fetching Facebook campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
