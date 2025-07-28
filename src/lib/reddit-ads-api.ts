// Reddit Ads API Integration
// Monitors competitor Reddit ads, subreddit campaigns, and community engagement

interface RedditAdsParams {
  adAccountId?: string;
  campaignType?: 'DISPLAY' | 'PROMOTED_POST' | 'SPONSORED_LINK';
  dateRange?: {
    start: string;
    end: string;
  };
  country?: string;
  language?: string;
  limit?: number;
}

interface RedditAdData {
  id: string;
  campaignId: string;
  campaignName: string;
  adType: 'DISPLAY' | 'PROMOTED_POST' | 'SPONSORED_LINK';
  status: 'ACTIVE' | 'PAUSED' | 'REMOVED';
  title: string;
  description: string;
  postTitle: string;
  postContent: string;
  subreddit: string;
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
    upvotes: number;
    downvotes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  targeting: {
    subreddits: string[];
    demographics: string[];
    interests: string[];
    keywords: string[];
    locations: string[];
  };
  creativeElements: string[];
  callToAction: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  insights: string;
  createdAt: string;
  lastUpdated: string;
}

interface RedditAdsResponse {
  data: RedditAdData[];
  totalCount: number;
  nextPageToken?: string;
}

class RedditAdsAPI {
  private accessToken: string;
  private clientId: string;
  private clientSecret: string;
  private baseUrl = 'https://oauth.reddit.com';

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
   * Make authenticated request to Reddit API
   */
  private async makeRequest(endpoint: string, params: any = {}): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const searchParams = new URLSearchParams(params);

      const response = await fetch(`${url}?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': 'CompetitiveAnalysis/1.0',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Reddit API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for competitor Reddit ads
   */
  async searchCompetitorAds(
    competitorName: string,
    country: string = 'NL'
  ): Promise<RedditAdData[]> {
    try {
      // This would use Reddit's ad search API
      // For now, return mock data
      return this.generateMockRedditAds(competitorName);
    } catch (error) {
      console.error(`Error searching Reddit ads for ${competitorName}:`, error);
      return [];
    }
  }

  /**
   * Get ads by specific keywords
   */
  async getAdsByKeywords(
    keywords: string[],
    country: string = 'NL'
  ): Promise<RedditAdData[]> {
    try {
      // This would use Reddit's keyword search API
      return this.generateMockRedditAds(keywords.join(' '));
    } catch (error) {
      console.error('Error getting Reddit ads by keywords:', error);
      return [];
    }
  }

  /**
   * Get ads by subreddit
   */
  async getSubredditAds(
    subreddit: string,
    country: string = 'NL'
  ): Promise<RedditAdData[]> {
    try {
      // This would use Reddit's subreddit search API
      return this.generateMockRedditAds(`r/${subreddit}`);
    } catch (error) {
      console.error(`Error getting subreddit ads for r/${subreddit}:`, error);
      return [];
    }
  }

  /**
   * Get trending subreddit ads
   */
  async getTrendingAds(
    category: string = 'technology',
    country: string = 'NL'
  ): Promise<RedditAdData[]> {
    try {
      // This would use Reddit's trending subreddits API
      return this.generateMockRedditAds('Trending');
    } catch (error) {
      console.error('Error getting trending Reddit ads:', error);
      return [];
    }
  }

  /**
   * Get post performance insights
   */
  async getPostInsights(postId: string): Promise<any> {
    try {
      // This would use Reddit's post insights API
      return {
        postId,
        impressions: Math.floor(Math.random() * 60000) + 6000,
        clicks: Math.floor(Math.random() * 1800) + 180,
        engagement: Math.random() * 0.08 + 0.02,
        reach: Math.floor(Math.random() * 150000) + 15000,
        frequency: Math.random() * 2 + 1,
        ctr: Math.random() * 4 + 1,
        cpc: Math.random() * 2 + 0.5,
        cpm: Math.random() * 16 + 8
      };
    } catch (error) {
      console.error(`Error getting post insights for ${postId}:`, error);
      return {};
    }
  }

  /**
   * Generate mock Reddit ads for demonstration
   */
  private generateMockRedditAds(competitorName: string): RedditAdData[] {
    const mockSubreddits = [
      'r/technology',
      'r/business',
      'r/entrepreneur',
      'r/marketing',
      'r/startups'
    ];

    const mockPostTitles = [
      `${competitorName} - The Future of Business is Here`,
      `How ${competitorName} Transformed Our Company`,
      `${competitorName} Review - Honest Thoughts`,
      `AMA: ${competitorName} CEO Answers Your Questions`,
      `${competitorName} vs Competitors - Detailed Comparison`
    ];

    const mockPostContent = [
      `We've been using ${competitorName} for 6 months now and the results are incredible. Our efficiency increased by 40% and costs went down significantly.`,
      `Just wanted to share our experience with ${competitorName}. The platform is intuitive and the customer support is top-notch.`,
      `After trying multiple solutions, ${competitorName} stood out for its comprehensive features and competitive pricing.`,
      `The team at ${competitorName} really knows their stuff. They helped us implement their solution in record time.`,
      `Comparing ${competitorName} to other options in the market - here's what we found...`
    ];

    return mockPostTitles.map((title, index) => {
      const impressions = Math.floor(Math.random() * 60000) + 6000;
      const clicks = Math.floor(Math.random() * 1800) + 180;
      const spend = Math.random() * 2000 + 200;
      const ctr = (clicks / impressions) * 100;
      const cpc = spend / clicks;
      const cpm = (spend / impressions) * 1000;

      return {
        id: `reddit-${Math.random().toString(36).substr(2, 9)}`,
        campaignId: `campaign-${Math.random().toString(36).substr(2, 9)}`,
        campaignName: `${competitorName} Reddit Campaign`,
        adType: ['PROMOTED_POST', 'SPONSORED_LINK'][Math.floor(Math.random() * 2)] as 'PROMOTED_POST' | 'SPONSORED_LINK',
        status: 'ACTIVE',
        title: `${competitorName} Reddit Ad`,
        description: `Promoted post about ${competitorName}`,
        postTitle: title,
        postContent: mockPostContent[index % mockPostContent.length],
        subreddit: mockSubreddits[index % mockSubreddits.length],
        imageUrl: Math.random() > 0.6 ? `https://example.com/reddit-${index}.jpg` : undefined,
        videoUrl: Math.random() > 0.8 ? `https://example.com/video-${index}.mp4` : undefined,
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
          upvotes: Math.floor(Math.random() * 400) + 40,
          downvotes: Math.floor(Math.random() * 50) + 5,
          comments: Math.floor(Math.random() * 120) + 12,
          shares: Math.floor(Math.random() * 60) + 6,
          saves: Math.floor(Math.random() * 100) + 10
        },
        targeting: {
          subreddits: [mockSubreddits[index % mockSubreddits.length]],
          demographics: ['18-34', '25-44', '35-54'],
          interests: ['Technology', 'Business', 'Entrepreneurship'],
          keywords: ['business', 'technology', 'efficiency'],
          locations: ['Netherlands', 'Belgium']
        },
        creativeElements: ['Post Title', 'Content', 'Image'],
        callToAction: 'Learn More',
        performance: this.determinePerformance(ctr, cpm),
        insights: `Strong community engagement for ${competitorName} in ${mockSubreddits[index % mockSubreddits.length]}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      };
    });
  }

  /**
   * Determine performance based on metrics
   */
  private determinePerformance(ctr: number, cpm: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (ctr > 3 && cpm < 14) return 'excellent';
    if (ctr > 2 && cpm < 20) return 'good';
    if (ctr > 1.2 && cpm < 26) return 'average';
    return 'poor';
  }
}

// Export singleton instance (if credentials are available)
export const redditAdsAPI = process.env.REDDIT_ACCESS_TOKEN && 
                            process.env.REDDIT_CLIENT_ID &&
                            process.env.REDDIT_CLIENT_SECRET
  ? new RedditAdsAPI(
      process.env.REDDIT_ACCESS_TOKEN,
      process.env.REDDIT_CLIENT_ID,
      process.env.REDDIT_CLIENT_SECRET
    )
  : null;

export type { RedditAdsParams, RedditAdData, RedditAdsResponse }; 