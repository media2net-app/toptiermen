import { NextRequest, NextResponse } from 'next/server';
import { youtubeAdsAPI, YouTubeAdData } from '@/lib/youtube-ads-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorName = searchParams.get('competitor');
    const channelId = searchParams.get('channelId');
    const keywords = searchParams.get('keywords')?.split(',') || [];
    const category = searchParams.get('category') || '22';
    const country = searchParams.get('country') || 'NL';

    if (!youtubeAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'YouTube Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: YouTubeAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await youtubeAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];
    }

    if (channelId) {
      // Get ads by specific channel ID
      const channelAds = await youtubeAdsAPI.getChannelAds(channelId, country);
      ads = [...ads, ...channelAds];
    }

    if (keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await youtubeAdsAPI.getAdsByKeywords(keywords, country);
      ads = [...ads, ...keywordAds];
    }

    // Get trending ads if no specific search
    if (!competitorName && !channelId && keywords.length === 0) {
      const trendingAds = await youtubeAdsAPI.getTrendingAds(category, country);
      ads = [...ads, ...trendingAds];
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
      channelId,
      keywords,
      category,
      country
    });

  } catch (error) {
    console.error('YouTube Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch YouTube Ads data',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorName, channelId, keywords, category = '22', country = 'NL' } = body;

    if (!youtubeAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'YouTube Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: YouTubeAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await youtubeAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];
    }

    if (channelId) {
      // Get ads by specific channel ID
      const channelAds = await youtubeAdsAPI.getChannelAds(channelId, country);
      ads = [...ads, ...channelAds];
    }

    if (keywords && keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await youtubeAdsAPI.getAdsByKeywords(keywords, country);
      ads = [...ads, ...keywordAds];
    }

    // Get trending ads if no specific search
    if (!competitorName && !channelId && (!keywords || keywords.length === 0)) {
      const trendingAds = await youtubeAdsAPI.getTrendingAds(category, country);
      ads = [...ads, ...trendingAds];
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
      channelId,
      keywords,
      category,
      country
    });

  } catch (error) {
    console.error('YouTube Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch YouTube Ads data',
      data: []
    }, { status: 500 });
  }
} 