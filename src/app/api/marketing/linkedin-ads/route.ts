import { NextRequest, NextResponse } from 'next/server';
import { linkedInAdsAPI, LinkedInAdData } from '@/lib/linkedin-ads-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorName = searchParams.get('competitor');
    const companyId = searchParams.get('companyId');
    const campaignType = searchParams.get('type') || 'SPONSORED_CONTENT';
    const country = searchParams.get('country') || 'NL';

    if (!linkedInAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'LinkedIn Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: LinkedInAdData[] = [];

    if (competitorName) {
      // Search for competitor sponsored content
      const sponsoredContent = await linkedInAdsAPI.searchSponsoredContent(
        competitorName,
        country
      );
      ads = [...ads, ...sponsoredContent];

      // Get company page ads (first search for company ID)
      const companies = await linkedInAdsAPI.searchCompanies(competitorName);
      if (companies.length > 0) {
        const companyAds = await linkedInAdsAPI.getCompanyAds(companies[0].id);
        ads = [...ads, ...companyAds];
      }
    }

    if (companyId) {
      // Get ads by specific company ID
      const companyAds = await linkedInAdsAPI.getCompanyAds(companyId);
      ads = [...ads, ...companyAds];
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
      companyId,
      campaignType,
      country
    });

  } catch (error) {
    console.error('LinkedIn Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch LinkedIn Ads data',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorName, companyId, campaignType = 'SPONSORED_CONTENT', country = 'NL' } = body;

    if (!linkedInAdsAPI) {
      return NextResponse.json({
        success: false,
        error: 'LinkedIn Ads API not configured. Please set up environment variables.',
        data: []
      });
    }

    let ads: LinkedInAdData[] = [];

    if (competitorName) {
      // Search for competitor sponsored content
      const sponsoredContent = await linkedInAdsAPI.searchSponsoredContent(
        competitorName,
        country
      );
      ads = [...ads, ...sponsoredContent];

      // Get company page ads (first search for company ID)
      const companies = await linkedInAdsAPI.searchCompanies(competitorName);
      if (companies.length > 0) {
        const companyAds = await linkedInAdsAPI.getCompanyAds(companies[0].id);
        ads = [...ads, ...companyAds];
      }
    }

    if (companyId) {
      // Get ads by specific company ID
      const companyAds = await linkedInAdsAPI.getCompanyAds(companyId);
      ads = [...ads, ...companyAds];
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
      companyId,
      campaignType,
      country
    });

  } catch (error) {
    console.error('LinkedIn Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch LinkedIn Ads data',
      data: []
    }, { status: 500 });
  }
} 