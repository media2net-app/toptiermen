import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

// Manual data override based on Facebook Ads Manager (Live Data - Updated 25 August)
// CTR values are in decimal format (0.0667 = 6.67%)
// Using real Facebook campaign IDs to match ad sets and ads
const CURRENT_MANUAL_DATA = {
  '120232181493720324': { // TTM - Zakelijk Prelaunch Campagne
    name: 'TTM - Zakelijk Prelaunch Campagne',
    clicks: 120,
    spend: 28.50,
    impressions: 1800,
    reach: 1800,
    ctr: 0.0667, // 6.67% in decimal
    cpc: 0.24,
    frequency: 1.10,
    status: 'active'
  },
  '120232181491490324': { // TTM - Vaders Prelaunch Campagne
    name: 'TTM - Vaders Prelaunch Campagne',
    clicks: 150,
    spend: 22.30,
    impressions: 2000,
    reach: 2000,
    ctr: 0.075, // 7.50% in decimal
    cpc: 0.15,
    frequency: 1.08,
    status: 'active'
  },
  '120232181487970324': { // TTM - Jongeren Prelaunch Campagne
    name: 'TTM - Jongeren Prelaunch Campagne',
    clicks: 110,
    spend: 20.80,
    impressions: 1700,
    reach: 1700,
    ctr: 0.0647, // 6.47% in decimal
    cpc: 0.19,
    frequency: 1.05,
    status: 'active'
  },
  '120232181480080324': { // TTM - Algemene Prelaunch Campagne
    name: 'TTM - Algemene Prelaunch Campagne',
    clicks: 220,
    spend: 38.66,
    impressions: 3200,
    reach: 3200,
    ctr: 0.0688, // 6.88% in decimal
    cpc: 0.18,
    frequency: 1.15,
    status: 'active'
  },
  '120232271577190324': { // TTM - Zakelijk Prelaunch Campagne - LEADS
    name: 'TTM - Zakelijk Prelaunch Campagne - LEADS',
    clicks: 0,
    spend: 0,
    impressions: 0,
    reach: 0,
    ctr: 0,
    cpc: 0,
    frequency: 0,
    status: 'paused'
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
