import { NextRequest, NextResponse } from 'next/server';

// Helper functie om datums te berekenen op basis van period
function getDateFromPeriod(period: string): string {
  const today = new Date();
  let daysAgo = 7; // default 7d
  
  switch (period) {
    case '7d':
      daysAgo = 7;
      break;
    case '30d':
      daysAgo = 30;
      break;
    case '90d':
      daysAgo = 90;
      break;
  }
  
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - daysAgo);
  
  return fromDate.toISOString().split('T')[0];
}

// Vercel Analytics API endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const type = searchParams.get('type') || 'analytics'; // 'analytics' or 'speed-insights'

    console.log('📊 Fetching Vercel data:', { type, period });

    // Get Vercel credentials from environment
    const vercelToken = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;

    if (!vercelToken || !projectId) {
      console.warn('⚠️ Vercel credentials not configured');
      return NextResponse.json({
        success: false,
        error: 'Vercel credentials not configured',
        message: 'Please set VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables'
      }, { status: 200 }); // Changed from 400 to 200 so frontend can handle gracefully
    }

    let data;
    
    if (type === 'speed-insights') {
      data = await fetchSpeedInsights(vercelToken, projectId, period);
    } else {
      data = await fetchAnalytics(vercelToken, projectId, period);
    }

    return NextResponse.json({
      success: true,
      data,
      type,
      period,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching Vercel data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Vercel data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Mock data functies voor development/testing
function getMockAnalyticsData() {
  return {
    visitors: 58,
    pageViews: 239,
    bounceRate: 79,
    topPages: [
      { path: '/prelaunch', visitors: 50 },
      { path: '/login', visitors: 7 },
      { path: '/', visitors: 6 },
      { path: '/dashboard', visitors: 6 },
      { path: '/dashboard-admin', visitors: 6 }
    ],
    topReferrers: [
      { referrer: 'l.facebook.com', visitors: 20 },
      { referrer: 'm.facebook.com', visitors: 11 },
      { referrer: 'instagram.com', visitors: 5 },
      { referrer: 'facebook.com', visitors: 1 }
    ],
    countries: [
      { country: 'Netherlands', percentage: 84 },
      { country: 'Spain', percentage: 7 },
      { country: 'Romania', percentage: 5 },
      { country: 'Belgium', percentage: 3 }
    ],
    devices: [
      { device: 'Mobile', percentage: 90 },
      { device: 'Desktop', percentage: 5 },
      { device: 'Tablet', percentage: 5 }
    ],
    browsers: [
      { browser: 'Chrome', percentage: 45 },
      { browser: 'Safari', percentage: 35 },
      { browser: 'Firefox', percentage: 15 },
      { browser: 'Edge', percentage: 5 }
    ],
    operatingSystems: [
      { os: 'Android', percentage: 62 },
      { os: 'iOS', percentage: 33 },
      { os: 'Mac', percentage: 3 },
      { os: 'Windows', percentage: 2 }
    ],
    trendData: [
      { date: '2025-08-26', visitors: 2 },
      { date: '2025-08-27', visitors: 1 },
      { date: '2025-08-28', visitors: 3 },
      { date: '2025-08-29', visitors: 2 },
      { date: '2025-08-30', visitors: 1 },
      { date: '2025-09-01', visitors: 35 },
      { date: '2025-09-02', visitors: 14 }
    ]
  };
}

function getMockSpeedInsightsData() {
  return {
    realExperienceScore: 90,
    coreWebVitals: {
      firstContentfulPaint: 0.45,
      largestContentfulPaint: 1.66,
      interactionToNextPaint: 72,
      cumulativeLayoutShift: 0.22,
      firstInputDelay: 12,
      timeToFirstByte: 0.07
    },
    performanceByRoute: [
      { route: '/dashboard', cls: 0.18, status: 'needs-improvement' },
      { route: '/dashboard/academy', cls: 0.22, status: 'needs-improvement' },
      { route: '/login', cls: 0, status: 'good' },
      { route: '/dashboard-admin/bug-meldingen', cls: 0.07, status: 'good' }
    ],
    performanceByCountry: [
      { country: 'Spain', cls: 0.22, status: 'needs-improvement', occurrences: 19 }
    ],
    performanceByDevice: [
      { device: 'Mobile', cls: 0.22, status: 'needs-improvement', percentage: 90 },
      { device: 'Desktop', cls: 0.05, status: 'good', percentage: 10 }
    ],
    trendData: [
      { date: '2025-08-27', cls: 0.15 },
      { date: '2025-08-28', cls: 0.12 },
      { date: '2025-08-29', cls: 0.18 },
      { date: '2025-08-30', cls: 0.20 },
      { date: '2025-09-01', cls: 0.25 },
      { date: '2025-09-02', cls: 0.08 }
    ]
  };
}

async function fetchAnalytics(token: string, projectId: string, period: string) {
  // Vercel Web Analytics heeft geen directe API - gebruik mock data voor nu
  console.log('⚠️ Vercel Web Analytics API not directly accessible, returning mock data');
  return getMockAnalyticsData();
}

async function fetchSpeedInsights(token: string, projectId: string, period: string) {
  // Vercel Speed Insights heeft geen directe API - gebruik mock data voor nu
  console.log('⚠️ Vercel Speed Insights API not directly accessible, returning mock data');
  return getMockSpeedInsightsData();
}


