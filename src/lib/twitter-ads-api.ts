// Twitter Ads API Integration
// Monitors competitor Twitter ads, tweets, and hashtag campaigns

interface TwitterAdsParams {
  adAccountId?: string;
  campaignType?: 'PROMOTED_TWEET' | 'PROMOTED_ACCOUNT' | 'PROMOTED_TREND';
  dateRange?: {
    start: string;
    end: string;
  };
  country?: string;
  language?: string;
  limit?: number;
}

interface TwitterAdData {
  id: string;
  campaignId: string;
  campaignName: string;
  adType: 'PROMOTED_TWEET' | 'PROMOTED_ACCOUNT' | 'PROMOTED_TREND';
  status: 'ACTIVE' | 'PAUSED' | 'REMOVED';
  title: string;
  description: string;
  tweetText: string;
  imageUrl?: string;
  videoUrl?: string;
  landingPageUrl: string;
  advertiserName: string;
  advertiserId: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
    quotes: number;
    follows: number;
  };
  hashtags: string[];
  mentions: string[];
  targeting: {
    locations: string[];
    demographics: string[];
    interests: string[];
    keywords: string[];
    followers: string[];
  };
  creativeElements: string[];
  callToAction: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  insights: string;
  createdAt: string;
  lastUpdated: string;
}

interface TwitterAdsResponse {
  data: TwitterAdData[];
  totalCount: number;
  nextPageToken?: string;
}

class TwitterAdsAPI {
  private bearerToken: string;
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.twitter.com/2';

  constructor(
    bearerToken: string,
    apiKey: string,
    apiSecret: string
  ) {
    this.bearerToken = bearerToken;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  /**
   * Make authenticated request to Twitter API
   */
  private async makeRequest(endpoint: string, params: any = {}): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const searchParams = new URLSearchParams(params);

      const response = await fetch(`${url}?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Twitter API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for competitor Twitter ads
   */
  async searchCompetitorAds(
    competitorName: string,
    country: string = 'NL'
  ): Promise<TwitterAdData[]> {
    try {
      // This would use Twitter's ad search API
      // For now, return mock data
      return this.generateMockTwitterAds(competitorName);
    } catch (error) {
      console.error(`Error searching Twitter ads for ${competitorName}:`, error);
      return [];
    }
  }

  /**
   * Get ads by specific keywords
   */
  async getAdsByKeywords(
    keywords: string[],
    country: string = 'NL'
  ): Promise<TwitterAdData[]> {
    try {
      // This would use Twitter's keyword search API
      return this.generateMockTwitterAds(keywords.join(' '));
    } catch (error) {
      console.error('Error getting Twitter ads by keywords:', error);
      return [];
    }
  }

  /**
   * Get hashtag campaigns
   */
  async getHashtagCampaigns(
    hashtag: string,
    country: string = 'NL'
  ): Promise<TwitterAdData[]> {
    try {
      // This would use Twitter's hashtag search API
      return this.generateMockTwitterAds(`#${hashtag}`);
    } catch (error) {
      console.error('Error getting hashtag campaigns:', error);
      return [];
    }
  }

  /**
   * Get trending topics and ads
   */
  async getTrendingAds(
    category: string = 'business',
    country: string = 'NL'
  ): Promise<TwitterAdData[]> {
    try {
      // This would use Twitter's trending topics API
      return this.generateMockTwitterAds('Trending');
    } catch (error) {
      console.error('Error getting trending Twitter ads:', error);
      return [];
    }
  }

  /**
   * Get tweet performance insights
   */
  async getTweetInsights(tweetId: string): Promise<any> {
    try {
      // This would use Twitter's tweet insights API
      return {
        tweetId,
        impressions: Math.floor(Math.random() * 100000) + 10000,
        clicks: Math.floor(Math.random() * 3000) + 300,
        engagement: Math.random() * 0.12 + 0.03,
        reach: Math.floor(Math.random() * 200000) + 20000,
        frequency: Math.random() * 2.5 + 1,
        ctr: Math.random() * 6 + 1.5,
        cpc: Math.random() * 2.5 + 0.8,
        cpm: Math.random() * 18 + 8
      };
    } catch (error) {
      console.error(`Error getting tweet insights for ${tweetId}:`, error);
      return {};
    }
  }

  /**
   * Generate mock Twitter ads for demonstration
   */
  private generateMockTwitterAds(competitorName: string): TwitterAdData[] {
    const mockTweets = [
      `🚀 ${competitorName} is revolutionizing the industry! Check out our latest breakthrough #innovation #${competitorName.toLowerCase()}`,
      `🔥 Don't miss out on ${competitorName}'s exclusive offer! Limited time only #deals #${competitorName.toLowerCase()}`,
      `💡 Discover how ${competitorName} can transform your business. Real results, real success #business #${competitorName.toLowerCase()}`,
      `🎯 ${competitorName} - The smart choice for professionals. Join thousands of satisfied customers #success #${competitorName.toLowerCase()}`,
      `⚡ ${competitorName} is trending! See what everyone is talking about #trending #${competitorName.toLowerCase()}`
    ];

    const mockHashtags = [
      ['innovation', 'business', 'success'],
      ['deals', 'offer', 'limited'],
      ['business', 'transformation', 'results'],
      ['success', 'professionals', 'customers'],
      ['trending', 'viral', 'popular']
    ];

    return mockTweets.map((tweet, index) => {
      const impressions = Math.floor(Math.random() * 80000) + 8000;
      const clicks = Math.floor(Math.random() * 2000) + 200;
      const spend = Math.random() * 2500 + 250;
      const ctr = (clicks / impressions) * 100;
      const cpc = spend / clicks;
      const cpm = (spend / impressions) * 1000;

      return {
        id: `twitter-${Math.random().toString(36).substr(2, 9)}`,
        campaignId: `campaign-${Math.random().toString(36).substr(2, 9)}`,
        campaignName: `${competitorName} Twitter Campaign`,
        adType: ['PROMOTED_TWEET', 'PROMOTED_ACCOUNT'][Math.floor(Math.random() * 2)] as 'PROMOTED_TWEET' | 'PROMOTED_ACCOUNT',
        status: 'ACTIVE',
        title: `${competitorName} Twitter Ad`,
        description: `Promoted tweet from ${competitorName}`,
        tweetText: tweet,
        imageUrl: Math.random() > 0.5 ? `https://example.com/twitter-${index}.jpg` : undefined,
        videoUrl: Math.random() > 0.7 ? `https://example.com/video-${index}.mp4` : undefined,
        landingPageUrl: `https://example.com/${competitorName.toLowerCase()}`,
        advertiserName: `${competitorName} Official`,
        advertiserId: `advertiser-${Math.random().toString(36).substr(2, 9)}`,
        impressions,
        clicks,
        spend: Math.round(spend * 100) / 100,
        ctr: Math.round(ctr * 100) / 100,
        cpc: Math.round(cpc * 100) / 100,
        cpm: Math.round(cpm * 100) / 100,
        engagement: {
          likes: Math.floor(Math.random() * 500) + 50,
          retweets: Math.floor(Math.random() * 200) + 20,
          replies: Math.floor(Math.random() * 100) + 10,
          quotes: Math.floor(Math.random() * 80) + 8,
          follows: Math.floor(Math.random() * 150) + 15
        },
        hashtags: mockHashtags[index % mockHashtags.length],
        mentions: [`@${competitorName.toLowerCase()}`],
        targeting: {
          locations: ['Netherlands', 'Belgium'],
          demographics: ['18-34', '25-44', '35-54'],
          interests: ['Business', 'Technology', 'Marketing'],
          keywords: ['innovation', 'success', 'business'],
          followers: ['@business', '@tech', '@marketing']
        },
        creativeElements: ['Tweet', 'Image', 'Hashtags'],
        callToAction: 'Learn More',
        performance: this.determinePerformance(ctr, cpm),
        insights: `Strong engagement for ${competitorName} with high retweet rate`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      };
    });
  }

  /**
   * Determine performance based on metrics
   */
  private determinePerformance(ctr: number, cpm: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (ctr > 3.5 && cpm < 16) return 'excellent';
    if (ctr > 2.5 && cpm < 22) return 'good';
    if (ctr > 1.5 && cpm < 28) return 'average';
    return 'poor';
  }
}

// Export singleton instance (if credentials are available)
export const twitterAdsAPI = process.env.TWITTER_BEARER_TOKEN && 
                             process.env.TWITTER_API_KEY &&
                             process.env.TWITTER_API_SECRET
  ? new TwitterAdsAPI(
      process.env.TWITTER_BEARER_TOKEN,
      process.env.TWITTER_API_KEY,
      process.env.TWITTER_API_SECRET
    )
  : null;

export type { TwitterAdsParams, TwitterAdData, TwitterAdsResponse }; 