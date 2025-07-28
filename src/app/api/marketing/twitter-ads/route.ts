import { NextRequest, NextResponse } from 'next/server';
import { twitterAdsAPI, TwitterAdData } from '@/lib/twitter-ads-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorName = searchParams.get('competitor');
    const keywords = searchParams.get('keywords')?.split(',') || [];
    const hashtag = searchParams.get('hashtag');
    const category = searchParams.get('category') || 'business';
    const country = searchParams.get('country') || 'NL';

    if (!twitterAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'Twitter Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: TwitterAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await twitterAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];
    }

    if (keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await twitterAdsAPI.getAdsByKeywords(keywords, country);
      ads = [...ads, ...keywordAds];
    }

    if (hashtag) {
      // Get hashtag campaigns
      const hashtagAds = await twitterAdsAPI.getHashtagCampaigns(hashtag, country);
      ads = [...ads, ...hashtagAds];
    }

    // Get trending ads if no specific search
    if (!competitorName && keywords.length === 0 && !hashtag) {
      const trendingAds = await twitterAdsAPI.getTrendingAds(category, country);
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
      hashtag,
      category,
      country
    });

  } catch (error) {
    console.error('Twitter Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Twitter Ads data',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorName, keywords, hashtag, category = 'business', country = 'NL' } = body;

    if (!twitterAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'Twitter Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: TwitterAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await twitterAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];
    }

    if (keywords && keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await twitterAdsAPI.getAdsByKeywords(keywords, country);
      ads = [...ads, ...keywordAds];
    }

    if (hashtag) {
      // Get hashtag campaigns
      const hashtagAds = await twitterAdsAPI.getHashtagCampaigns(hashtag, country);
      ads = [...ads, ...hashtagAds];
    }

    // Get trending ads if no specific search
    if (!competitorName && (!keywords || keywords.length === 0) && !hashtag) {
      const trendingAds = await twitterAdsAPI.getTrendingAds(category, country);
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
      hashtag,
      category,
      country
    });

  } catch (error) {
    console.error('Twitter Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Twitter Ads data',
      data: []
    }, { status: 500 });
  }
} 