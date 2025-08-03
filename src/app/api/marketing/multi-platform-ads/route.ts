import { NextRequest, NextResponse } from 'next/server';
import { facebookAdLibrary } from '@/lib/facebook-ad-library';
import { googleAdsAPI } from '@/lib/google-ads-api';
import { linkedInAdsAPI } from '@/lib/linkedin-ads-api';
import { tiktokAdsAPI } from '@/lib/tiktok-ads-api';
import { youtubeAdsAPI } from '@/lib/youtube-ads-api';
import { pinterestAdsAPI } from '@/lib/pinterest-ads-api';
import { snapchatAdsAPI } from '@/lib/snapchat-ads-api';
import { twitterAdsAPI } from '@/lib/twitter-ads-api';
import { redditAdsAPI } from '@/lib/reddit-ads-api';
import { competitiveCache } from '@/lib/competitive-cache';

interface MultiPlatformRequest {
  competitorName: string;
  platforms: ('facebook' | 'google' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest' | 'snapchat' | 'twitter' | 'reddit')[];
  country?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  includeAnalysis?: boolean;
}

interface UnifiedAdData {
  id: string;
  platform: 'facebook' | 'google' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest' | 'snapchat' | 'twitter' | 'reddit';
  competitorName: string;
  title: string;
  description: string;
  content: string;
  adType: string;
  status: string;
  url: string;
  imageUrl?: string;
  videoUrl?: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  engagement?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  targeting: any;
  creativeElements: string[];
  callToAction: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  insights: string;
  createdAt: string;
  lastUpdated: string;
}

interface MultiPlatformResponse {
  success: boolean;
  data: {
    facebook: UnifiedAdData[];
    google: UnifiedAdData[];
    linkedin: UnifiedAdData[];
    tiktok: UnifiedAdData[];
    youtube: UnifiedAdData[];
    pinterest: UnifiedAdData[];
    snapchat: UnifiedAdData[];
    twitter: UnifiedAdData[];
    reddit: UnifiedAdData[];
  };
  analysis?: {
    totalAds: number;
    totalSpend: number;
    averageCTR: number;
    averageCPM: number;
    topPerformingPlatform: string;
    platformBreakdown: {
      facebook: number;
      google: number;
      linkedin: number;
      tiktok: number;
      youtube: number;
      pinterest: number;
      snapchat: number;
      twitter: number;
      reddit: number;
    };
    insights: string[];
    recommendations: string[];
  };
  cached: boolean;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: MultiPlatformRequest = await request.json();
    const { competitorName, platforms, country = 'NL', includeAnalysis = true } = body;

    // Check cache first
    const cacheKey = `multi-platform:${competitorName}:${platforms.join(',')}:${country}`;
    const cachedData = competitiveCache.get<MultiPlatformResponse>(cacheKey);
    
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const results = {
      facebook: [] as UnifiedAdData[],
      google: [] as UnifiedAdData[],
      linkedin: [] as UnifiedAdData[],
      tiktok: [] as UnifiedAdData[],
      youtube: [] as UnifiedAdData[],
      pinterest: [] as UnifiedAdData[],
      snapchat: [] as UnifiedAdData[],
      twitter: [] as UnifiedAdData[],
      reddit: [] as UnifiedAdData[]
    };

    // Fetch data from each platform
    const fetchPromises: Promise<void>[] = [];

    if (platforms.includes('facebook') && facebookAdLibrary) {
      fetchPromises.push(
        facebookAdLibrary.searchCompetitorAds(competitorName, country)
          .then(ads => {
            results.facebook = ads.map(ad => transformToUnifiedFormat(ad, 'facebook', competitorName));
          })
          .catch(error => {
            console.error('Facebook API error:', error);
            results.facebook = [];
          })
      );
    }

    if (platforms.includes('google') && googleAdsAPI) {
      fetchPromises.push(
        googleAdsAPI.searchCompetitorAds(competitorName, country)
          .then(ads => {
            results.google = ads.map(ad => transformToUnifiedFormat(ad, 'google', competitorName));
          })
          .catch(error => {
            console.error('Google Ads API error:', error);
            results.google = [];
          })
      );
    }

    if (platforms.includes('linkedin') && linkedInAdsAPI) {
      fetchPromises.push(
        linkedInAdsAPI.searchSponsoredContent(competitorName, country)
          .then(ads => {
            results.linkedin = ads.map(ad => transformToUnifiedFormat(ad, 'linkedin', competitorName));
          })
          .catch(error => {
            console.error('LinkedIn API error:', error);
            results.linkedin = [];
          })
      );
    }

    if (platforms.includes('tiktok') && tiktokAdsAPI) {
      fetchPromises.push(
        tiktokAdsAPI.searchCompetitorAds(competitorName, country)
          .then(ads => {
            results.tiktok = ads.map(ad => transformToUnifiedFormat(ad, 'tiktok', competitorName));
          })
          .catch(error => {
            console.error('TikTok API error:', error);
            results.tiktok = [];
          })
      );
    }

    if (platforms.includes('youtube') && youtubeAdsAPI) {
      fetchPromises.push(
        youtubeAdsAPI.searchCompetitorAds(competitorName, country)
          .then(ads => {
            results.youtube = ads.map(ad => transformToUnifiedFormat(ad, 'youtube', competitorName));
          })
          .catch(error => {
            console.error('YouTube API error:', error);
            results.youtube = [];
          })
      );
    }

    if (platforms.includes('pinterest') && pinterestAdsAPI) {
      fetchPromises.push(
        pinterestAdsAPI.searchCompetitorAds(competitorName, country)
          .then(ads => {
            results.pinterest = ads.map(ad => transformToUnifiedFormat(ad, 'pinterest', competitorName));
          })
          .catch(error => {
            console.error('Pinterest API error:', error);
            results.pinterest = [];
          })
      );
    }

    // Wait for all API calls to complete
    await Promise.all(fetchPromises);

    // Generate analysis if requested
    let analysis = undefined;
    if (includeAnalysis) {
      analysis = generateMultiPlatformAnalysis(results);
    }

    const response: MultiPlatformResponse = {
      success: true,
      data: results,
      analysis,
      cached: false,
      timestamp: new Date().toISOString()
    };

    // Cache the results for 30 minutes
    competitiveCache.set(cacheKey, response, 30 * 60 * 1000);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Multi-platform ads API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch multi-platform ads',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorName = searchParams.get('competitor');
    const platforms = searchParams.get('platforms')?.split(',') as any[] || ['facebook'];
    const country = searchParams.get('country') || 'NL';
    const includeAnalysis = searchParams.get('analysis') === 'true';

    if (!competitorName) {
      return NextResponse.json(
        { success: false, error: 'Competitor name is required' },
        { status: 400 }
      );
    }

    // Use POST logic with GET parameters
    const body: MultiPlatformRequest = {
      competitorName,
      platforms,
      country,
      includeAnalysis
    };

    const requestWithBody = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(body)
    });
    const nextRequest = requestWithBody as any;
    nextRequest.nextUrl = request.nextUrl;
    nextRequest.cookies = request.cookies;
    nextRequest.geo = request.geo;
    nextRequest.ip = request.ip;

    return POST(nextRequest);

  } catch (error) {
    console.error('Multi-platform ads GET API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch multi-platform ads',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Transform platform-specific ad data to unified format
 */
function transformToUnifiedFormat(
  ad: any, 
  platform: 'facebook' | 'google' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest' | 'snapchat' | 'twitter' | 'reddit',
  competitorName: string
): UnifiedAdData {
  const baseAd = {
    id: ad.id || '',
    platform,
    competitorName,
    title: ad.title || ad.headline || '',
    description: ad.description || ad.description1 || '',
    content: ad.content || ad.description || ad.description1 || '',
    adType: ad.adType || ad.type || 'unknown',
    status: ad.status || 'active',
    url: ad.finalUrl || ad.landingPageUrl || ad.url || '',
    imageUrl: ad.imageUrl || '',
    videoUrl: ad.videoUrl || '',
    impressions: ad.impressions || ad.estimatedReach || 0,
    clicks: ad.clicks || ad.estimatedEngagement || 0,
    spend: ad.spend || ad.estimatedSpend || ad.cost || 0,
    ctr: ad.ctr || 0,
    cpc: ad.cpc || 0,
    cpm: ad.cpm || 0,
    engagement: ad.engagement || ad.estimatedEngagement || 0,
    likes: ad.likes || 0,
    shares: ad.shares || 0,
    comments: ad.comments || 0,
    targeting: ad.targeting || {},
    creativeElements: ad.creativeElements || [],
    callToAction: ad.callToAction || '',
    performance: determinePerformance(ad),
    insights: ad.insights || generateInsights(ad, platform),
    createdAt: ad.createdAt || new Date().toISOString(),
    lastUpdated: ad.lastUpdated || new Date().toISOString()
  };

  return baseAd;
}

/**
 * Determine ad performance based on metrics
 */
function determinePerformance(ad: any): 'excellent' | 'good' | 'average' | 'poor' {
  const ctr = ad.ctr || 0;
  const engagement = ad.engagement || 0;
  const impressions = ad.impressions || 0;

  if (ctr > 0.05 || engagement > impressions * 0.1) return 'excellent';
  if (ctr > 0.03 || engagement > impressions * 0.05) return 'good';
  if (ctr > 0.01 || engagement > impressions * 0.02) return 'average';
  return 'poor';
}

/**
 * Generate insights based on ad data and platform
 */
function generateInsights(ad: any, platform: string): string {
  const insights: string[] = [];

  if (ad.ctr > 0.05) {
    insights.push(`Hoge CTR van ${(ad.ctr * 100).toFixed(1)}% wijst op sterke targeting`);
  }

  if (ad.engagement > ad.impressions * 0.1) {
    insights.push(`Uitstekende engagement rate van ${((ad.engagement / ad.impressions) * 100).toFixed(1)}%`);
  }

  if (platform === 'facebook' && ad.creativeElements?.includes('video')) {
    insights.push('Video content presteert goed op Facebook');
  }

  if (platform === 'linkedin' && ad.targeting?.industries?.length > 0) {
    insights.push(`Effectieve B2B targeting op ${ad.targeting.industries.join(', ')} industrieën`);
  }

  if (platform === 'tiktok' && ad.trendScore > 70) {
    insights.push('Hoge trend score wijst op virale potentie');
  }

  return insights.join('. ') || 'Geen specifieke insights beschikbaar';
}

/**
 * Generate comprehensive multi-platform analysis
 */
function generateMultiPlatformAnalysis(data: any): any {
  const allAds = [
    ...data.facebook,
    ...data.google,
    ...data.linkedin,
    ...data.tiktok
  ];

  const totalAds = allAds.length;
  const totalSpend = allAds.reduce((sum, ad) => sum + ad.spend, 0);
  const averageCTR = allAds.reduce((sum, ad) => sum + ad.ctr, 0) / totalAds;
  const averageCPM = allAds.reduce((sum, ad) => sum + ad.cpm, 0) / totalAds;

  const platformBreakdown = {
    facebook: data.facebook.length,
    google: data.google.length,
    linkedin: data.linkedin.length,
    tiktok: data.tiktok.length
  };

  const topPerformingPlatform = Object.entries(platformBreakdown)
    .sort(([,a], [,b]) => b - a)[0][0];

  const insights = [
    `Totaal ${totalAds} ads gevonden over ${Object.keys(platformBreakdown).filter(k => platformBreakdown[k as keyof typeof platformBreakdown] > 0).length} platforms`,
    `Gemiddelde CTR van ${(averageCTR * 100).toFixed(1)}%`,
    `${topPerformingPlatform} heeft de meeste actieve campagnes`,
    `Totaal geschatte spend: €${totalSpend.toLocaleString()}`
  ];

  const recommendations = [
    'Monitor regelmatig voor nieuwe campagnes',
    'Analyseer top-performing ads voor inspiratie',
    'Vergelijk targeting strategieën tussen platforms',
    'Identificeer trends in ad creatives'
  ];

  return {
    totalAds,
    totalSpend,
    averageCTR,
    averageCPM,
    topPerformingPlatform,
    platformBreakdown,
    insights,
    recommendations
  };
} 