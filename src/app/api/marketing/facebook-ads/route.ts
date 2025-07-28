import { NextRequest, NextResponse } from 'next/server';
import { facebookAdLibrary } from '@/lib/facebook-ad-library';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorName = searchParams.get('competitor');
    const country = searchParams.get('country') || 'NL';
    const days = parseInt(searchParams.get('days') || '30');
    const pageIds = searchParams.get('pageIds')?.split(',');

    if (!facebookAdLibrary) {
      return NextResponse.json(
        { error: 'Facebook Ad Library API not configured' },
        { status: 500 }
      );
    }

    let ads = [];

    if (competitorName) {
      // Search for ads by competitor name
      ads = await facebookAdLibrary.searchCompetitorAds(competitorName, country);
    } else if (pageIds && pageIds.length > 0) {
      // Get ads from specific page IDs
      ads = await facebookAdLibrary.getAdsByPageIds(pageIds);
    } else {
      // Get recent ads
      ads = await facebookAdLibrary.getRecentAds(days);
    }

    // Transform Facebook ads to our format
    const transformedAds = ads.map(ad => 
      facebookAdLibrary!.transformToCompetitorAd(ad, 'facebook')
    );

    return NextResponse.json({
      success: true,
      data: transformedAds,
      count: transformedAds.length,
      source: 'Facebook Ad Library'
    });

  } catch (error) {
    console.error('Error fetching Facebook ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Facebook ads data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorName, country = 'NL', pageIds } = body;

    if (!facebookAdLibrary) {
      return NextResponse.json(
        { error: 'Facebook Ad Library API not configured' },
        { status: 500 }
      );
    }

    let ads = [];

    if (pageIds && pageIds.length > 0) {
      // Get ads from specific page IDs
      ads = await facebookAdLibrary.getAdsByPageIds(pageIds);
    } else if (competitorName) {
      // Search for ads by competitor name
      ads = await facebookAdLibrary.searchCompetitorAds(competitorName, country);
    } else {
      return NextResponse.json(
        { error: 'Either competitorName or pageIds is required' },
        { status: 400 }
      );
    }

    // Transform Facebook ads to our format
    const transformedAds = ads.map(ad => 
      facebookAdLibrary!.transformToCompetitorAd(ad, 'facebook')
    );

    return NextResponse.json({
      success: true,
      data: transformedAds,
      count: transformedAds.length,
      source: 'Facebook Ad Library'
    });

  } catch (error) {
    console.error('Error fetching Facebook ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Facebook ads data' },
      { status: 500 }
    );
  }
} 