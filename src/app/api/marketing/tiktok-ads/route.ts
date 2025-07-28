import { NextRequest, NextResponse } from 'next/server';
import { tiktokAdsAPI, TikTokAdData } from '@/lib/tiktok-ads-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorName = searchParams.get('competitor');
    const keywords = searchParams.get('keywords')?.split(',') || [];
    const campaignType = searchParams.get('type') || 'VIDEO';
    const country = searchParams.get('country') || 'NL';

    if (!tiktokAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'TikTok Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: TikTokAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await tiktokAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];

      // Get trending content
      const trendingContent = await tiktokAdsAPI.getTrendingContent(
        [competitorName],
        country
      );
      // Note: getTrendingContent returns trends, not ads, so we don't add to ads array
    }

    if (keywords.length > 0) {
      // Search for ads by keywords (using competitor search with keywords)
      const keywordAds = await tiktokAdsAPI.searchCompetitorAds(
        keywords.join(' '),
        country
      );
      ads = [...ads, ...keywordAds];
    }

    // Remove duplicates based on ad ID
    const uniqueAds = ads.filter((ad, index, self) => 
      index === self.findIndex(a => a.id === ad.id)
    );

    return NextResponse.json({
      success: true,
      data: uniqueAds,
      totalCount: uniqueAds.length,
      competitor: competitorName,
      keywords,
      campaignType,
      country
    });

  } catch (error) {
    console.error('TikTok Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch TikTok Ads data',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorName, keywords, campaignType = 'VIDEO', country = 'NL' } = body;

    if (!tiktokAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'TikTok Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: TikTokAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await tiktokAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];

      // Get trending content
      const trendingContent = await tiktokAdsAPI.getTrendingContent(
        [competitorName],
        country
      );
      // Note: getTrendingContent returns trends, not ads, so we don't add to ads array
    }

    if (keywords && keywords.length > 0) {
      // Search for ads by keywords (using competitor search with keywords)
      const keywordAds = await tiktokAdsAPI.searchCompetitorAds(
        keywords.join(' '),
        country
      );
      ads = [...ads, ...keywordAds];
    }

    // Remove duplicates based on ad ID
    const uniqueAds = ads.filter((ad, index, self) => 
      index === self.findIndex(a => a.id === ad.id)
    );

    return NextResponse.json({
      success: true,
      data: uniqueAds,
      totalCount: uniqueAds.length,
      competitor: competitorName,
      keywords,
      campaignType,
      country
    });

  } catch (error) {
    console.error('TikTok Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch TikTok Ads data',
      data: []
    }, { status: 500 });
  }
} 