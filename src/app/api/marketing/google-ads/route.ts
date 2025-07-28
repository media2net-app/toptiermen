import { NextRequest, NextResponse } from 'next/server';
import { googleAdsAPI, GoogleAdData } from '@/lib/google-ads-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorName = searchParams.get('competitor');
    const keywords = searchParams.get('keywords')?.split(',') || [];
    const campaignType = searchParams.get('type') || 'SEARCH';
    const country = searchParams.get('country') || 'NL';

    if (!googleAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'Google Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: GoogleAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await googleAdsAPI.searchCompetitorAds(
        competitorName,
        country,
        campaignType
      );
      ads = [...ads, ...competitorAds];

      // Get shopping ads if available
      if (campaignType === 'SHOPPING' || campaignType === 'ALL') {
        const shoppingAds = await googleAdsAPI.getShoppingAds(competitorName, country);
        ads = [...ads, ...shoppingAds];
      }

      // Get display ads if available
      if (campaignType === 'DISPLAY' || campaignType === 'ALL') {
        const displayAds = await googleAdsAPI.getDisplayAds(competitorName, country);
        ads = [...ads, ...displayAds];
      }
    }

    if (keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await googleAdsAPI.getAdsByKeywords(keywords, country);
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
    console.error('Google Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Google Ads data',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorName, keywords, campaignType = 'SEARCH', country = 'NL' } = body;

    if (!googleAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'Google Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: GoogleAdData[] = [];

    if (competitorName) {
      // Search for competitor ads
      const competitorAds = await googleAdsAPI.searchCompetitorAds(
        competitorName,
        country,
        campaignType
      );
      ads = [...ads, ...competitorAds];

      // Get shopping ads if available
      if (campaignType === 'SHOPPING' || campaignType === 'ALL') {
        const shoppingAds = await googleAdsAPI.getShoppingAds(competitorName, country);
        ads = [...ads, ...shoppingAds];
      }

      // Get display ads if available
      if (campaignType === 'DISPLAY' || campaignType === 'ALL') {
        const displayAds = await googleAdsAPI.getDisplayAds(competitorName, country);
        ads = [...ads, ...displayAds];
      }
    }

    if (keywords && keywords.length > 0) {
      // Get ads by keywords
      const keywordAds = await googleAdsAPI.getAdsByKeywords(keywords, country);
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
    console.error('Google Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Google Ads data',
      data: []
    }, { status: 500 });
  }
} 