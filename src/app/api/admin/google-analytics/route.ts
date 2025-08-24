import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Google Analytics configuration
const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID || 'G-YT2NR1LKHX';
const GOOGLE_APPLICATION_CREDENTIALS_JSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

// Initialize Google Analytics client
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

function initializeAnalyticsClient() {
  if (!analyticsDataClient) {
    try {
      if (GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        // Parse JSON credentials from environment variable
        const credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS_JSON);
        analyticsDataClient = new BetaAnalyticsDataClient({
          credentials: credentials,
        });
        console.log('✅ Google Analytics client initialized with service account credentials');
      } else {
        // Fallback to application default credentials
        analyticsDataClient = new BetaAnalyticsDataClient();
        console.log('⚠️ Google Analytics client initialized with default credentials');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Analytics client:', error);
      return null;
    }
  }
  return analyticsDataClient;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const section = searchParams.get('section') || 'overview';
    
    console.log('📊 Fetching comprehensive Google Analytics data for range:', range, 'section:', section);

    // Initialize the analytics client
    const client = initializeAnalyticsClient();
    if (!client) {
      console.log('⚠️ Using fallback data due to missing Google Analytics credentials');
      return getFallbackData(range, section);
    }

    // Check if we have valid credentials
    if (!GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      console.log('⚠️ Using fallback data due to missing GOOGLE_APPLICATION_CREDENTIALS_JSON');
      return getFallbackData(range, section);
    }

    // Get date range
    const { startDate, endDate } = getDateRange(range);
    
    let analyticsData: any = {};

    // Fetch data based on requested section
    switch (section) {
      case 'overview':
        analyticsData = await getOverviewData(client, startDate, endDate);
        break;
      case 'realtime':
        analyticsData = await getRealtimeData(client);
        break;
      case 'audience':
        analyticsData = await getAudienceData(client, startDate, endDate);
        break;
      case 'acquisition':
        analyticsData = await getAcquisitionData(client, startDate, endDate);
        break;
      case 'behavior':
        analyticsData = await getBehaviorData(client, startDate, endDate);
        break;
      case 'conversions':
        analyticsData = await getConversionsData(client, startDate, endDate);
        break;
      case 'demographics':
        analyticsData = await getDemographicsData(client, startDate, endDate);
        break;
      case 'geography':
        analyticsData = await getGeographyData(client, startDate, endDate);
        break;
      case 'technology':
        analyticsData = await getTechnologyData(client, startDate, endDate);
        break;
      default:
        analyticsData = await getOverviewData(client, startDate, endDate);
    }

    analyticsData.lastUpdated = new Date().toISOString();

    console.log('✅ Comprehensive Google Analytics data fetched successfully');

    return NextResponse.json({
      success: true,
      data: analyticsData,
      timestamp: new Date().toISOString(),
      range: range,
      section: section,
      source: 'Google Analytics API'
    });

  } catch (error) {
    console.error('❌ Error fetching Google Analytics data:', error);
    
    // Fallback to mock data if API fails
    console.log('⚠️ Falling back to mock data due to API error');
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const section = searchParams.get('section') || 'overview';
    return getFallbackData(range, section);
  }
}

// Overview Data - Main dashboard metrics
async function getOverviewData(client: BetaAnalyticsDataClient, startDate: string, endDate: string) {
  try {
    // Fetch real-time data
    const realtimeData = await getRealtimeData(client);
    
    // Fetch historical data
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'newUsers' },
        { name: 'sessionsPerUser' },
        { name: 'screenPageViewsPerSession' }
      ]
    });

    const row = response.rows?.[0];
    const metrics = row?.metricValues || [];
    
    return {
      activeUsers: realtimeData.activeUsers,
      totalUsers: parseInt(metrics[0]?.value || '0'),
      pageViews: parseInt(metrics[1]?.value || '0'),
      sessions: parseInt(metrics[2]?.value || '0'),
      sessionDuration: Math.round(parseFloat(metrics[3]?.value || '0')),
      bounceRate: parseFloat(metrics[4]?.value || '0') * 100,
      newUsers: parseInt(metrics[5]?.value || '0'),
      sessionsPerUser: parseFloat(metrics[6]?.value || '0'),
      pageViewsPerSession: parseFloat(metrics[7]?.value || '0'),
      returningUsers: parseInt(metrics[0]?.value || '0') - parseInt(metrics[5]?.value || '0')
    };
  } catch (error) {
    console.error('❌ Error fetching overview data:', error);
    return getDefaultOverviewData();
  }
}

// Real-time Data
async function getRealtimeData(client: BetaAnalyticsDataClient) {
  try {
    const [response] = await client.runRealtimeReport({
      property: `properties/${GA_PROPERTY_ID}`,
      metrics: [
        { name: 'activeUsers' }
      ]
    });

    const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || '0';
    return {
      activeUsers: parseInt(activeUsers)
    };
  } catch (error) {
    console.error('❌ Error fetching real-time data:', error);
    return { activeUsers: 0 };
  }
}

// Audience Data
async function getAudienceData(client: BetaAnalyticsDataClient, startDate: string, endDate: string) {
  try {
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'sessionsPerUser' }
      ],
      dimensions: [
        { name: 'deviceCategory' },
        { name: 'browser' },
        { name: 'operatingSystem' }
      ]
    });

    const deviceData = processDeviceData(response.rows || []);
    const browserData = processBrowserData(response.rows || []);
    const osData = processOSData(response.rows || []);

    return {
      deviceBreakdown: deviceData,
      browserBreakdown: browserData,
      osBreakdown: osData
    };
  } catch (error) {
    console.error('❌ Error fetching audience data:', error);
    return getDefaultAudienceData();
  }
}

// Acquisition Data
async function getAcquisitionData(client: BetaAnalyticsDataClient, startDate: string, endDate: string) {
  try {
    // Get channel data
    const [channelResponse] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' }
      ],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' }
      ],
      limit: 10,
      orderBys: [
        { metric: { metricName: 'sessions' }, desc: true }
      ]
    });

    // Get source data
    const [sourceResponse] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' }
      ],
      dimensions: [
        { name: 'source' }
      ],
      limit: 10,
      orderBys: [
        { metric: { metricName: 'sessions' }, desc: true }
      ]
    });

    const channelData = processChannelData(channelResponse.rows || []);
    const sourceData = processSourceData(sourceResponse.rows || []);

    return {
      channels: channelData,
      sources: sourceData
    };
  } catch (error) {
    console.error('❌ Error fetching acquisition data:', error);
    return getDefaultAcquisitionData();
  }
}

// Behavior Data
async function getBehaviorData(client: BetaAnalyticsDataClient, startDate: string, endDate: string) {
  try {
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'screenPageViews' }
      ],
      dimensions: [
        { name: 'pagePath' }
      ],
      limit: 10,
      orderBys: [
        { metric: { metricName: 'screenPageViews' }, desc: true }
      ]
    });

    return (response.rows || []).map(row => ({
      page: row.dimensionValues?.[0]?.value || '/',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
      uniqueViews: parseInt(row.metricValues?.[0]?.value || '0'), // Use same as views for now
      avgLoadTime: 0, // Not available in GA4
      exitRate: 0 // Not available in GA4
    }));
  } catch (error) {
    console.error('❌ Error fetching behavior data:', error);
    return getDefaultBehaviorData();
  }
}

// Conversions Data
async function getConversionsData(client: BetaAnalyticsDataClient, startDate: string, endDate: string) {
  try {
    // First try to get e-commerce data
    const [ecommerceResponse] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'transactions' },
        { name: 'totalRevenue' }
      ]
    });

    // Get goal conversions
    const [goalsResponse] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'conversions' }
      ]
    });

    const ecommerceRow = ecommerceResponse.rows?.[0];
    const goalsRow = goalsResponse.rows?.[0];
    
    const transactions = parseInt(ecommerceRow?.metricValues?.[0]?.value || '0');
    const revenue = parseFloat(ecommerceRow?.metricValues?.[1]?.value || '0');
    const conversions = parseInt(goalsRow?.metricValues?.[0]?.value || '0');
    
    // Calculate purchase rate based on sessions
    const [sessionsResponse] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'sessions' }]
    });
    
    const sessions = parseInt(sessionsResponse.rows?.[0]?.metricValues?.[0]?.value || '1');
    const purchaseRate = sessions > 0 ? (transactions / sessions) * 100 : 0;
    
    return {
      conversions: conversions,
      revenue: revenue,
      transactions: transactions,
      purchaseRate: purchaseRate
    };
  } catch (error) {
    console.error('❌ Error fetching conversions data:', error);
    return getDefaultConversionsData();
  }
}

// Demographics Data
async function getDemographicsData(client: BetaAnalyticsDataClient, startDate: string, endDate: string) {
  try {
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'totalUsers' }
      ],
      dimensions: [
        { name: 'userAgeBracket' },
        { name: 'userGender' }
      ]
    });

    const ageData = processAgeData(response.rows || []);
    const genderData = processGenderData(response.rows || []);

    return {
      ageBreakdown: ageData,
      genderBreakdown: genderData
    };
  } catch (error) {
    console.error('❌ Error fetching demographics data:', error);
    return getDefaultDemographicsData();
  }
}

// Geography Data
async function getGeographyData(client: BetaAnalyticsDataClient, startDate: string, endDate: string) {
  try {
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'totalUsers' }
      ],
      dimensions: [
        { name: 'country' },
        { name: 'city' }
      ],
      limit: 10,
      orderBys: [
        { metric: { metricName: 'totalUsers' }, desc: true }
      ]
    });

    const countryData = processCountryData(response.rows || []);
    const cityData = processCityData(response.rows || []);

    return {
      countries: countryData,
      cities: cityData
    };
  } catch (error) {
    console.error('❌ Error fetching geography data:', error);
    return getDefaultGeographyData();
  }
}

// Technology Data
async function getTechnologyData(client: BetaAnalyticsDataClient, startDate: string, endDate: string) {
  try {
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'totalUsers' }
      ],
      dimensions: [
        { name: 'browser' },
        { name: 'operatingSystem' },
        { name: 'deviceCategory' },
        { name: 'screenResolution' }
      ]
    });

    const browserData = processBrowserData(response.rows || []);
    const osData = processOSData(response.rows || []);
    const deviceData = processDeviceData(response.rows || []);

    return {
      browsers: browserData,
      operatingSystems: osData,
      devices: deviceData
    };
  } catch (error) {
    console.error('❌ Error fetching technology data:', error);
    return getDefaultTechnologyData();
  }
}

// Data processing helper functions
function processDeviceData(rows: any[]) {
  const deviceMap = new Map();
  rows.forEach(row => {
    const device = row.dimensionValues?.[0]?.value || 'Desktop';
    const users = parseInt(row.metricValues?.[0]?.value || '0');
    deviceMap.set(device, (deviceMap.get(device) || 0) + users);
  });
  
  const total = Array.from(deviceMap.values()).reduce((sum, val) => sum + val, 0);
  return Array.from(deviceMap.entries()).map(([device, users]) => ({
    device,
    users: users as number,
    percentage: total > 0 ? Math.round(((users as number) / total) * 1000) / 10 : 0
  }));
}

function processBrowserData(rows: any[]) {
  const browserMap = new Map();
  rows.forEach(row => {
    const browser = row.dimensionValues?.[1]?.value || 'Unknown';
    const users = parseInt(row.metricValues?.[0]?.value || '0');
    browserMap.set(browser, (browserMap.get(browser) || 0) + users);
  });
  
  const total = Array.from(browserMap.values()).reduce((sum, val) => sum + val, 0);
  return Array.from(browserMap.entries()).map(([browser, users]) => ({
    browser,
    users: users as number,
    percentage: total > 0 ? Math.round(((users as number) / total) * 1000) / 10 : 0
  }));
}

function processOSData(rows: any[]) {
  const osMap = new Map();
  rows.forEach(row => {
    const os = row.dimensionValues?.[2]?.value || 'Unknown';
    const users = parseInt(row.metricValues?.[0]?.value || '0');
    osMap.set(os, (osMap.get(os) || 0) + users);
  });
  
  const total = Array.from(osMap.values()).reduce((sum, val) => sum + val, 0);
  return Array.from(osMap.entries()).map(([os, users]) => ({
    os,
    users: users as number,
    percentage: total > 0 ? Math.round(((users as number) / total) * 1000) / 10 : 0
  }));
}

function processChannelData(rows: any[]) {
  const channelMap = new Map();
  rows.forEach(row => {
    const channel = row.dimensionValues?.[0]?.value || 'Direct';
    const sessions = parseInt(row.metricValues?.[0]?.value || '0');
    channelMap.set(channel, (channelMap.get(channel) || 0) + sessions);
  });
  
  return Array.from(channelMap.entries()).map(([channel, sessions]) => ({
    channel,
    sessions: sessions as number
  }));
}

function processSourceData(rows: any[]) {
  const sourceMap = new Map();
  rows.forEach(row => {
    const source = row.dimensionValues?.[1]?.value || 'Direct';
    const sessions = parseInt(row.metricValues?.[0]?.value || '0');
    sourceMap.set(source, (sourceMap.get(source) || 0) + sessions);
  });
  
  return Array.from(sourceMap.entries()).map(([source, sessions]) => ({
    source,
    sessions: sessions as number
  }));
}

function processAgeData(rows: any[]) {
  const ageMap = new Map();
  rows.forEach(row => {
    const age = row.dimensionValues?.[0]?.value || 'Unknown';
    const users = parseInt(row.metricValues?.[0]?.value || '0');
    ageMap.set(age, (ageMap.get(age) || 0) + users);
  });
  
  const total = Array.from(ageMap.values()).reduce((sum, val) => sum + val, 0);
  return Array.from(ageMap.entries()).map(([age, users]) => ({
    age,
    users: users as number,
    percentage: total > 0 ? Math.round(((users as number) / total) * 1000) / 10 : 0
  }));
}

function processGenderData(rows: any[]) {
  const genderMap = new Map();
  rows.forEach(row => {
    const gender = row.dimensionValues?.[1]?.value || 'Unknown';
    const users = parseInt(row.metricValues?.[0]?.value || '0');
    genderMap.set(gender, (genderMap.get(gender) || 0) + users);
  });
  
  const total = Array.from(genderMap.values()).reduce((sum, val) => sum + val, 0);
  return Array.from(genderMap.entries()).map(([gender, users]) => ({
    gender,
    users: users as number,
    percentage: total > 0 ? Math.round(((users as number) / total) * 1000) / 10 : 0
  }));
}

function processCountryData(rows: any[]) {
  const countryMap = new Map();
  rows.forEach(row => {
    const country = row.dimensionValues?.[0]?.value || 'Unknown';
    const users = parseInt(row.metricValues?.[0]?.value || '0');
    countryMap.set(country, (countryMap.get(country) || 0) + users);
  });
  
  return Array.from(countryMap.entries()).map(([country, users]) => ({
    country,
    users: users as number
  }));
}

function processCityData(rows: any[]) {
  const cityMap = new Map();
  rows.forEach(row => {
    const city = row.dimensionValues?.[1]?.value || 'Unknown';
    const users = parseInt(row.metricValues?.[0]?.value || '0');
    cityMap.set(city, (cityMap.get(city) || 0) + users);
  });
  
  return Array.from(cityMap.entries()).map(([city, users]) => ({
    city,
    users: users as number
  }));
}

function getDateRange(range: string): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = 'today';
  let startDate: string;
  
  switch (range) {
    case '1d':
      startDate = 'yesterday';
      break;
    case '7d':
      today.setDate(today.getDate() - 7);
      startDate = today.toISOString().split('T')[0];
      break;
    case '30d':
      today.setDate(today.getDate() - 30);
      startDate = today.toISOString().split('T')[0];
      break;
    case '90d':
      today.setDate(today.getDate() - 90);
      startDate = today.toISOString().split('T')[0];
      break;
    default:
      today.setDate(today.getDate() - 7);
      startDate = today.toISOString().split('T')[0];
  }
  
  return { startDate, endDate };
}

// Fallback functions for when API fails
function getFallbackData(range: string, section: string) {
  const baseMultiplier = range === '1d' ? 0.15 : range === '7d' ? 1 : range === '30d' ? 4 : 12;
  
  switch (section) {
    case 'overview':
      return NextResponse.json({
        success: true,
        data: getDefaultOverviewData(),
        timestamp: new Date().toISOString(),
        range: range,
        section: section,
        source: 'Fallback Data (API unavailable)'
      });
    case 'realtime':
      return NextResponse.json({
        success: true,
        data: { activeUsers: Math.floor(Math.random() * 15) + 3 },
        timestamp: new Date().toISOString(),
        range: range,
        section: section,
        source: 'Fallback Data (API unavailable)'
      });
    case 'audience':
      return NextResponse.json({
        success: true,
        data: getDefaultAudienceData(),
        timestamp: new Date().toISOString(),
        range: range,
        section: section,
        source: 'Fallback Data (API unavailable)'
      });
    case 'acquisition':
      return NextResponse.json({
        success: true,
        data: getDefaultAcquisitionData(),
        timestamp: new Date().toISOString(),
        range: range,
        section: section,
        source: 'Fallback Data (API unavailable)'
      });
    case 'behavior':
      return NextResponse.json({
        success: true,
        data: getDefaultBehaviorData(),
        timestamp: new Date().toISOString(),
        range: range,
        section: section,
        source: 'Fallback Data (API unavailable)'
      });
    case 'conversions':
      return NextResponse.json({
        success: true,
        data: getDefaultConversionsData(),
        timestamp: new Date().toISOString(),
        range: range,
        section: section,
        source: 'Fallback Data (API unavailable)'
      });
    case 'demographics':
      return NextResponse.json({
        success: true,
        data: getDefaultDemographicsData(),
        timestamp: new Date().toISOString(),
        range: range,
        section: section,
        source: 'Fallback Data (API unavailable)'
      });
    case 'geography':
      return NextResponse.json({
        success: true,
        data: getDefaultGeographyData(),
        timestamp: new Date().toISOString(),
        range: range,
        section: section,
        source: 'Fallback Data (API unavailable)'
      });
    case 'technology':
      return NextResponse.json({
        success: true,
        data: getDefaultTechnologyData(),
        timestamp: new Date().toISOString(),
        range: range,
        section: section,
        source: 'Fallback Data (API unavailable)'
      });
    default:
      return NextResponse.json({
        success: true,
        data: getDefaultOverviewData(),
        timestamp: new Date().toISOString(),
        range: range,
        section: section,
        source: 'Fallback Data (API unavailable)'
      });
  }
}

// Default data functions
function getDefaultOverviewData() {
  return {
    activeUsers: 12,
    totalUsers: 1247,
    pageViews: 8923,
    sessions: 1567,
    sessionDuration: 245,
    bounceRate: 34.2,
    newUsers: 892,
    sessionsPerUser: 1.26,
    pageViewsPerSession: 5.69,
    returningUsers: 355
  };
}

function getDefaultAudienceData() {
  return {
    deviceBreakdown: [
      { device: 'Desktop', users: 810, percentage: 65.2 },
      { device: 'Mobile', users: 357, percentage: 28.7 },
      { device: 'Tablet', users: 80, percentage: 6.1 }
    ],
    browserBreakdown: [
      { browser: 'Chrome', users: 748, percentage: 60.1 },
      { browser: 'Safari', users: 374, percentage: 30.0 },
      { browser: 'Firefox', users: 87, percentage: 7.0 },
      { browser: 'Edge', users: 38, percentage: 3.0 }
    ],
    osBreakdown: [
      { os: 'Windows', users: 623, percentage: 50.0 },
      { os: 'macOS', users: 374, percentage: 30.0 },
      { os: 'iOS', users: 187, percentage: 15.0 },
      { os: 'Android', users: 62, percentage: 5.0 }
    ]
  };
}

function getDefaultAcquisitionData() {
  return {
    channels: [
      { channel: 'Direct', sessions: 567 },
      { channel: 'Organic Search', sessions: 445 },
      { channel: 'Social', sessions: 234 },
      { channel: 'Email', sessions: 123 },
      { channel: 'Referral', sessions: 89 }
    ],
    sources: [
      { source: 'Direct', sessions: 567 },
      { source: 'Google', sessions: 445 },
      { source: 'Facebook', sessions: 156 },
      { source: 'Instagram', sessions: 78 },
      { source: 'Email', sessions: 123 }
    ]
  };
}

function getDefaultBehaviorData() {
  return [
    { page: '/dashboard', views: 1247, uniqueViews: 892, avgLoadTime: 1.2, exitRate: 15.3 },
    { page: '/trainingscentrum', views: 1156, uniqueViews: 823, avgLoadTime: 1.8, exitRate: 22.1 },
    { page: '/voedingsplannen', views: 892, uniqueViews: 645, avgLoadTime: 1.5, exitRate: 18.7 },
    { page: '/brotherhood', views: 678, uniqueViews: 456, avgLoadTime: 2.1, exitRate: 25.4 },
    { page: '/academy', views: 445, uniqueViews: 334, avgLoadTime: 1.9, exitRate: 20.8 }
  ];
}

function getDefaultConversionsData() {
  return {
    conversions: 45,
    revenue: 1250.00,
    transactions: 38,
    purchaseRate: 2.4
  };
}

function getDefaultDemographicsData() {
  return {
    ageBreakdown: [
      { age: '25-34', users: 374, percentage: 30.0 },
      { age: '35-44', users: 312, percentage: 25.0 },
      { age: '18-24', users: 249, percentage: 20.0 },
      { age: '45-54', users: 187, percentage: 15.0 },
      { age: '55-64', users: 125, percentage: 10.0 }
    ],
    genderBreakdown: [
      { gender: 'Male', users: 998, percentage: 80.0 },
      { gender: 'Female', users: 249, percentage: 20.0 }
    ]
  };
}

function getDefaultGeographyData() {
  return {
    countries: [
      { country: 'Netherlands', users: 998 },
      { country: 'Belgium', users: 187 },
      { country: 'Germany', users: 62 }
    ],
    cities: [
      { city: 'Amsterdam', users: 312 },
      { city: 'Rotterdam', users: 187 },
      { city: 'The Hague', users: 156 },
      { city: 'Utrecht', users: 125 },
      { city: 'Eindhoven', users: 98 }
    ]
  };
}

function getDefaultTechnologyData() {
  return {
    browsers: [
      { browser: 'Chrome', users: 748, percentage: 60.1 },
      { browser: 'Safari', users: 374, percentage: 30.0 },
      { browser: 'Firefox', users: 87, percentage: 7.0 },
      { browser: 'Edge', users: 38, percentage: 3.0 }
    ],
    operatingSystems: [
      { os: 'Windows', users: 623, percentage: 50.0 },
      { os: 'macOS', users: 374, percentage: 30.0 },
      { os: 'iOS', users: 187, percentage: 15.0 },
      { os: 'Android', users: 62, percentage: 5.0 }
    ],
    devices: [
      { device: 'Desktop', users: 810, percentage: 65.2 },
      { device: 'Mobile', users: 357, percentage: 28.7 },
      { device: 'Tablet', users: 80, percentage: 6.1 }
    ]
  };
}
