import { NextRequest, NextResponse } from 'next/server';
import { snapchatAdsAPI, SnapchatAdData } from '@/lib/snapchat-ads-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorName = searchParams.get('competitor');
    const keywords = searchParams.get('keywords')?.split(',') || [];
    const category = searchParams.get('category') || 'fashion';
    const country = searchParams.get('country') || 'NL';

    if (!snapchatAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'Snapchat Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: SnapchatAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await snapchatAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];
    }

    if (keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await snapchatAdsAPI.getAdsByKeywords(keywords, country);
      ads = [...ads, ...keywordAds];
    }

    // Get AR filter campaigns if no specific search
    if (!competitorName && keywords.length === 0) {
      const arFilterAds = await snapchatAdsAPI.getARFilterCampaigns(category, country);
      ads = [...ads, ...arFilterAds];
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
      category,
      country
    });

  } catch (error) {
    console.error('Snapchat Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Snapchat Ads data',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorName, keywords, category = 'fashion', country = 'NL' } = body;

    if (!snapchatAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'Snapchat Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: SnapchatAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await snapchatAdsAPI.searchCompetitorAds(
        competitorName,
        country
      );
      ads = [...ads, ...competitorAds];
    }

    if (keywords && keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await snapchatAdsAPI.getAdsByKeywords(keywords, country);
      ads = [...ads, ...keywordAds];
    }

    // Get AR filter campaigns if no specific search
    if (!competitorName && (!keywords || keywords.length === 0)) {
      const arFilterAds = await snapchatAdsAPI.getARFilterCampaigns(category, country);
      ads = [...ads, ...arFilterAds];
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
      category,
      country
    });

  } catch (error) {
    console.error('Snapchat Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Snapchat Ads data',
      data: []
    }, { status: 500 });
  }
} 