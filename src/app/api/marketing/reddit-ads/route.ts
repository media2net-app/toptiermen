import { NextRequest, NextResponse } from 'next/server';
import { redditAdsAPI, RedditAdData } from '@/lib/reddit-ads-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorName = searchParams.get('competitor');
    const keywords = searchParams.get('keywords')?.split(',') || [];
    const subreddit = searchParams.get('subreddit');
    const category = searchParams.get('category') || 'technology';
    const country = searchParams.get('country') || 'NL';

    if (!redditAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'Reddit Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: RedditAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await redditAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];
    }

    if (keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await redditAdsAPI.getAdsByKeywords(keywords, country);
      ads = [...ads, ...keywordAds];
    }

    if (subreddit) {
      // Get ads by subreddit
      const subredditAds = await redditAdsAPI.getSubredditAds(subreddit, country);
      ads = [...ads, ...subredditAds];
    }

    // Get trending ads if no specific search
    if (!competitorName && keywords.length === 0 && !subreddit) {
      const trendingAds = await redditAdsAPI.getTrendingAds(category, country);
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
      keywords,
      subreddit,
      category,
      country
    });

  } catch (error) {
    console.error('Reddit Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Reddit Ads data',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorName, keywords, subreddit, category = 'technology', country = 'NL' } = body;

    if (!redditAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'Reddit Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: RedditAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await redditAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];
    }

    if (keywords && keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await redditAdsAPI.getAdsByKeywords(keywords, country);
      ads = [...ads, ...keywordAds];
    }

    if (subreddit) {
      // Get ads by subreddit
      const subredditAds = await redditAdsAPI.getSubredditAds(subreddit, country);
      ads = [...ads, ...subredditAds];
    }

    // Get trending ads if no specific search
    if (!competitorName && (!keywords || keywords.length === 0) && !subreddit) {
      const trendingAds = await redditAdsAPI.getTrendingAds(category, country);
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
      keywords,
      subreddit,
      category,
      country
    });

  } catch (error) {
    console.error('Reddit Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Reddit Ads data',
      data: []
    }, { status: 500 });
  }
} 