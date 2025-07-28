import { NextRequest, NextResponse } from 'next/server';
import { pinterestAdsAPI, PinterestAdData } from '@/lib/pinterest-ads-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorName = searchParams.get('competitor');
    const boardId = searchParams.get('boardId');
    const keywords = searchParams.get('keywords')?.split(',') || [];
    const category = searchParams.get('category') || 'fashion';
    const country = searchParams.get('country') || 'NL';

    if (!pinterestAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'Pinterest Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: PinterestAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await pinterestAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];
    }

    if (boardId) {
      // Get ads by specific board ID
      const boardAds = await pinterestAdsAPI.getBoardAds(boardId, country);
      ads = [...ads, ...boardAds];
    }

    if (keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await pinterestAdsAPI.getAdsByKeywords(keywords, country);
      ads = [...ads, ...keywordAds];
    }

    // Get trending pins if no specific search
    if (!competitorName && !boardId && keywords.length === 0) {
      const trendingAds = await pinterestAdsAPI.getTrendingPins(category, country);
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
      boardId,
      keywords,
      category,
      country
    });

  } catch (error) {
    console.error('Pinterest Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Pinterest Ads data',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorName, boardId, keywords, category = 'fashion', country = 'NL' } = body;

    if (!pinterestAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'Pinterest Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: PinterestAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await pinterestAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];
    }

    if (boardId) {
      // Get ads by specific board ID
      const boardAds = await pinterestAdsAPI.getBoardAds(boardId, country);
      ads = [...ads, ...boardAds];
    }

    if (keywords && keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await pinterestAdsAPI.getAdsByKeywords(keywords, country);
      ads = [...ads, ...keywordAds];
    }

    // Get trending pins if no specific search
    if (!competitorName && !boardId && (!keywords || keywords.length === 0)) {
      const trendingAds = await pinterestAdsAPI.getTrendingPins(category, country);
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
      boardId,
      keywords,
      category,
      country
    });

  } catch (error) {
    console.error('Pinterest Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Pinterest Ads data',
      data: []
    }, { status: 500 });
  }
} 