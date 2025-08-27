import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

// Manual data override based on Facebook Ads Manager (Live Data - Updated 8/27/2025)
// CTR values are in decimal format (0.0667 = 6.67%)
// Using real Facebook campaign IDs to match ad sets and ads
const CURRENT_MANUAL_DATA = {
  "120232433872750324": {
    "name": "TTM - Zakelijk Prelaunch Campagne - LEADS V2",
    "clicks": 0,
    "spend": 0,
    "impressions": 0,
    "reach": 0,
    "ctr": 0,
    "cpc": 0,
    "frequency": 0,
    "status": "ACTIVE",
    "leads": 0,
    "conversions": 0,
    "budget": 2500,
    "budgetRemaining": 1540
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
    "budget": 1500,
    "budgetRemaining": 1500
  },
  "120232181491490324": {
    "name": "TTM - Vaders Prelaunch Campagne",
    "clicks": 0,
    "spend": 0,
    "impressions": 0,
    "reach": 0,
    "ctr": 0,
    "cpc": 0,
    "frequency": 0,
    "status": "ACTIVE",
    "leads": 0,
    "conversions": 0,
    "budget": 25,
    "budgetRemaining": 0
  },
  "120232181487970324": {
    "name": "TTM - Jongeren Prelaunch Campagne",
    "clicks": 0,
    "spend": 0,
    "impressions": 0,
    "reach": 0,
    "ctr": 0,
    "cpc": 0,
    "frequency": 0,
    "status": "ACTIVE",
    "leads": 0,
    "conversions": 0,
    "budget": 25,
    "budgetRemaining": 0
  },
  "120232181480080324": {
    "name": "TTM - Algemene Prelaunch Campagne",
    "clicks": 0,
    "spend": 0,
    "impressions": 0,
    "reach": 0,
    "ctr": 0,
    "cpc": 0,
    "frequency": 0,
    "status": "ACTIVE",
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
        budget: 25,
        dailyBudget: 25,
        startDate: '2025-08-22',
        endDate: '2025-12-31',
        adsCount: 0,
        videoId: '',
        videoName: '',
        createdAt: '2025-08-22T00:00:00Z',
        lastUpdated: '2025-08-25T00:00:00Z'
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
