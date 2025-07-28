// Snapchat Ads API Integration
// Monitors competitor Snapchat ads, AR filters, and story campaigns

interface SnapchatAdsParams {
  adAccountId?: string;
  campaignType?: 'STORY' | 'AR_FILTER' | 'COLLECTION' | 'VIDEO';
  dateRange?: {
    start: string;
    end: string;
  };
  country?: string;
  language?: string;
  limit?: number;
}

interface SnapchatAdData {
  id: string;
  campaignId: string;
  campaignName: string;
  adType: 'STORY' | 'AR_FILTER' | 'COLLECTION' | 'VIDEO';
  status: 'ACTIVE' | 'PAUSED' | 'REMOVED';
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  arFilterUrl?: string;
  landingPageUrl: string;
  advertiserName: string;
  advertiserId: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  views: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    swipes: number;
  };
  targeting: {
    locations: string[];
    demographics: string[];
    interests: string[];
    keywords: string[];
    ageGroups: string[];
  };
  creativeElements: string[];
  callToAction: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  insights: string;
  createdAt: string;
  lastUpdated: string;
}

interface SnapchatAdsResponse {
  data: SnapchatAdData[];
  totalCount: number;
  nextPageToken?: string;
}

class SnapchatAdsAPI {
  private accessToken: string;
  private clientId: string;
  private clientSecret: string;
  private baseUrl = 'https://adsapi.snapchat.com/v1';

  constructor(
    accessToken: string,
    clientId: string,
    clientSecret: string
  ) {
    this.accessToken = accessToken;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Make authenticated request to Snapchat API
   */
  private async makeRequest(endpoint: string, params: any = {}): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const searchParams = new URLSearchParams(params);

      const response = await fetch(`${url}?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Snapchat API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Snapchat API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for competitor Snapchat ads
   */
  async searchCompetitorAds(
    competitorName: string,
    country: string = 'NL'
  ): Promise<SnapchatAdData[]> {
    try {
      // This would use Snapchat's ad search API
      // For now, return mock data
      return this.generateMockSnapchatAds(competitorName);
    } catch (error) {
      console.error(`Error searching Snapchat ads for ${competitorName}:`, error);
      return [];
    }
  }

  /**
   * Get ads by specific keywords
   */
  async getAdsByKeywords(
    keywords: string[],
    country: string = 'NL'
  ): Promise<SnapchatAdData[]> {
    try {
      // This would use Snapchat's keyword search API
      return this.generateMockSnapchatAds(keywords.join(' '));
    } catch (error) {
      console.error('Error getting Snapchat ads by keywords:', error);
      return [];
    }
  }

  /**
   * Get AR filter campaigns
   */
  async getARFilterCampaigns(
    category: string = 'fashion',
    country: string = 'NL'
  ): Promise<SnapchatAdData[]> {
    try {
      // This would use Snapchat's AR filter API
      return this.generateMockSnapchatAds('AR Filter');
    } catch (error) {
      console.error('Error getting AR filter campaigns:', error);
      return [];
    }
  }

  /**
   * Get story performance insights
   */
  async getStoryInsights(storyId: string): Promise<any> {
    try {
      // This would use Snapchat's story insights API
      return {
        storyId,
        impressions: Math.floor(Math.random() * 50000) + 5000,
        views: Math.floor(Math.random() * 30000) + 3000,
        swipes: Math.floor(Math.random() * 2000) + 200,
        engagement: Math.random() * 0.15 + 0.05,
        reach: Math.floor(Math.random() * 100000) + 10000,
        frequency: Math.random() * 2 + 1,
        ctr: Math.random() * 8 + 2,
        cpc: Math.random() * 3 + 0.5,
        cpm: Math.random() * 20 + 10
      };
    } catch (error) {
      console.error(`Error getting story insights for ${storyId}:`, error);
      return {};
    }
  }

  /**
   * Generate mock Snapchat ads for demonstration
   */
  private generateMockSnapchatAds(competitorName: string): SnapchatAdData[] {
    const mockTitles = [
      `${competitorName} - Swipe Up for More!`,
      `Try ${competitorName} AR Filter Now`,
      `${competitorName} Story - Don't Miss Out`,
      `Discover ${competitorName} on Snapchat`,
      `${competitorName} - Snap & Share`
    ];

    const mockImages = [
      'https://example.com/snapchat-1.jpg',
      'https://example.com/snapchat-2.jpg',
      'https://example.com/snapchat-3.jpg',
      'https://example.com/snapchat-4.jpg',
      'https://example.com/snapchat-5.jpg'
    ];

    return mockTitles.map((title, index) => {
      const impressions = Math.floor(Math.random() * 40000) + 4000;
      const clicks = Math.floor(Math.random() * 1200) + 120;
      const views = Math.floor(Math.random() * 25000) + 2500;
      const swipes = Math.floor(Math.random() * 800) + 80;
      const spend = Math.random() * 1800 + 180;
      const ctr = (clicks / impressions) * 100;
      const cpc = spend / clicks;
      const cpm = (spend / impressions) * 1000;

      return {
        id: `snapchat-${Math.random().toString(36).substr(2, 9)}`,
        campaignId: `campaign-${Math.random().toString(36).substr(2, 9)}`,
        campaignName: `${competitorName} Snapchat Campaign`,
        adType: ['STORY', 'AR_FILTER', 'VIDEO'][Math.floor(Math.random() * 3)] as 'STORY' | 'AR_FILTER' | 'VIDEO',
        status: 'ACTIVE',
        title,
        description: `Check out ${competitorName} on Snapchat! Swipe up to learn more and try our exclusive AR filter.`,
        imageUrl: mockImages[index % mockImages.length],
        videoUrl: Math.random() > 0.6 ? `https://example.com/video-${index}.mp4` : undefined,
        arFilterUrl: Math.random() > 0.7 ? `https://example.com/ar-filter-${index}` : undefined,
        landingPageUrl: `https://example.com/${competitorName.toLowerCase()}`,
        advertiserName: `${competitorName} Official`,
        advertiserId: `advertiser-${Math.random().toString(36).substr(2, 9)}`,
        impressions,
        clicks,
        spend: Math.round(spend * 100) / 100,
        ctr: Math.round(ctr * 100) / 100,
        cpc: Math.round(cpc * 100) / 100,
        cpm: Math.round(cpm * 100) / 100,
        views,
        engagement: {
          likes: Math.floor(Math.random() * 300) + 30,
          comments: Math.floor(Math.random() * 80) + 8,
          shares: Math.floor(Math.random() * 50) + 5,
          saves: Math.floor(Math.random() * 150) + 15,
          swipes
        },
        targeting: {
          locations: ['Netherlands', 'Belgium'],
          demographics: ['13-17', '18-24', '25-34'],
          interests: ['Fashion', 'Lifestyle', 'Entertainment'],
          keywords: ['trending', 'viral', 'fun'],
          ageGroups: ['13-17', '18-24']
        },
        creativeElements: ['Story', 'AR Filter', 'Call-to-Action'],
        callToAction: 'Swipe Up',
        performance: this.determinePerformance(ctr, cpm),
        insights: `Strong engagement for ${competitorName} with high swipe rate`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      };
    });
  }

  /**
   * Determine performance based on metrics
   */
  private determinePerformance(ctr: number, cpm: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (ctr > 4 && cpm < 15) return 'excellent';
    if (ctr > 2.5 && cpm < 22) return 'good';
    if (ctr > 1.5 && cpm < 30) return 'average';
    return 'poor';
  }
}

// Export singleton instance (if credentials are available)
export const snapchatAdsAPI = process.env.SNAPCHAT_ACCESS_TOKEN && 
                              process.env.SNAPCHAT_CLIENT_ID &&
                              process.env.SNAPCHAT_CLIENT_SECRET
  ? new SnapchatAdsAPI(
      process.env.SNAPCHAT_ACCESS_TOKEN,
      process.env.SNAPCHAT_CLIENT_ID,
      process.env.SNAPCHAT_CLIENT_SECRET
    )
  : null;

export type { SnapchatAdsParams, SnapchatAdData, SnapchatAdsResponse }; 