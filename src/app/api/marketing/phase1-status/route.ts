import { NextRequest, NextResponse } from 'next/server';
import { facebookAdLibrary } from '@/lib/facebook-ad-library';
import { googleAdsAPI } from '@/lib/google-ads-api';
import { linkedInAdsAPI } from '@/lib/linkedin-ads-api';
import { tiktokAdsAPI } from '@/lib/tiktok-ads-api';

interface PlatformStatus {
  platform: string;
  status: 'active' | 'inactive' | 'error';
  features: {
    name: string;
    status: 'active' | 'inactive';
    description: string;
  }[];
  lastChecked: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const platforms: PlatformStatus[] = [
      {
        platform: 'Google Ads',
        status: googleAdsAPI ? 'active' : 'inactive',
        features: [
          {
            name: 'Search Ads Monitoring',
            status: googleAdsAPI ? 'active' : 'inactive',
            description: 'Monitor competitor search ads and keywords'
          },
          {
            name: 'Display Ads Tracking',
            status: googleAdsAPI ? 'active' : 'inactive',
            description: 'Track display campaign performance'
          },
          {
            name: 'Shopping Ads Analysis',
            status: googleAdsAPI ? 'active' : 'inactive',
            description: 'Analyze e-commerce competitor ads'
          },
          {
            name: 'Keyword Research Tools',
            status: googleAdsAPI ? 'active' : 'inactive',
            description: 'Get keyword insights and bid strategies'
          }
        ],
        lastChecked: new Date().toISOString(),
        error: googleAdsAPI ? undefined : 'Google Ads API not configured'
      },
      {
        platform: 'LinkedIn Ads',
        status: linkedInAdsAPI ? 'active' : 'inactive',
        features: [
          {
            name: 'Sponsored Content',
            status: linkedInAdsAPI ? 'active' : 'inactive',
            description: 'Monitor B2B sponsored content'
          },
          {
            name: 'Company Page Monitoring',
            status: linkedInAdsAPI ? 'active' : 'inactive',
            description: 'Track company page ads and insights'
          },
          {
            name: 'B2B Targeting Analysis',
            status: linkedInAdsAPI ? 'active' : 'inactive',
            description: 'Analyze B2B audience targeting'
          },
          {
            name: 'Lead Generation Insights',
            status: linkedInAdsAPI ? 'active' : 'inactive',
            description: 'Monitor lead generation campaigns'
          }
        ],
        lastChecked: new Date().toISOString(),
        error: linkedInAdsAPI ? undefined : 'LinkedIn Ads API not configured'
      },
      {
        platform: 'TikTok Ads',
        status: tiktokAdsAPI ? 'active' : 'inactive',
        features: [
          {
            name: 'Video Content Analysis',
            status: tiktokAdsAPI ? 'active' : 'inactive',
            description: 'Analyze video ad performance'
          },
          {
            name: 'Trend Detection',
            status: tiktokAdsAPI ? 'active' : 'inactive',
            description: 'Detect trending content and hashtags'
          },
          {
            name: 'Influencer Campaign Tracking',
            status: tiktokAdsAPI ? 'active' : 'inactive',
            description: 'Monitor influencer campaign performance'
          },
          {
            name: 'Creative Performance Metrics',
            status: tiktokAdsAPI ? 'active' : 'inactive',
            description: 'Track creative element performance'
          }
        ],
        lastChecked: new Date().toISOString(),
        error: tiktokAdsAPI ? undefined : 'TikTok Ads API not configured'
      },
      {
        platform: 'Facebook Ads',
        status: facebookAdLibrary ? 'active' : 'inactive',
        features: [
          {
            name: 'Ad Library Integration',
            status: facebookAdLibrary ? 'active' : 'inactive',
            description: 'Access Facebook Ad Library data'
          },
          {
            name: 'Instagram Ads Filtering',
            status: facebookAdLibrary ? 'active' : 'inactive',
            description: 'Filter and analyze Instagram ads'
          },
          {
            name: 'Social Media Monitoring',
            status: facebookAdLibrary ? 'active' : 'inactive',
            description: 'Monitor social media ad campaigns'
          },
          {
            name: 'Audience Insights',
            status: facebookAdLibrary ? 'active' : 'inactive',
            description: 'Get audience targeting insights'
          }
        ],
        lastChecked: new Date().toISOString(),
        error: facebookAdLibrary ? undefined : 'Facebook Ad Library not configured'
      }
    ];

    const activePlatforms = platforms.filter(p => p.status === 'active').length;
    const totalPlatforms = platforms.length;
    const phase1Status = activePlatforms === totalPlatforms ? 'complete' : 'partial';

    return NextResponse.json({
      success: true,
      phase1Status,
      summary: {
        totalPlatforms,
        activePlatforms,
        inactivePlatforms: totalPlatforms - activePlatforms,
        completionPercentage: Math.round((activePlatforms / totalPlatforms) * 100)
      },
      platforms,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Phase 1 status check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check Phase 1 status',
      phase1Status: 'error',
      platforms: [],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 