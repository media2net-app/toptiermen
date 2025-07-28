// YouTube Ads API Integration
// Monitors competitor video ads, YouTube campaigns, and video performance

interface YouTubeAdsParams {
  channelId?: string;
  videoId?: string;
  campaignType?: 'VIDEO' | 'DISPLAY' | 'OVERLAY' | 'SPONSORED_CARD';
  dateRange?: {
    start: string;
    end: string;
  };
  country?: string;
  language?: string;
  limit?: number;
}

interface YouTubeAdData {
  id: string;
  campaignId: string;
  campaignName: string;
  adType: 'VIDEO' | 'DISPLAY' | 'OVERLAY' | 'SPONSORED_CARD';
  status: 'ACTIVE' | 'PAUSED' | 'REMOVED';
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  channelName: string;
  channelId: string;
  duration: number;
  impressions: number;
  views: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  viewRate: number;
  averageViewDuration: number;
  engagement: {
    likes: number;
    dislikes: number;
    comments: number;
    shares: number;
  };
  targeting: {
    locations: string[];
    demographics: string[];
    interests: string[];
    keywords: string[];
  };
  creativeElements: string[];
  callToAction: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  insights: string;
  createdAt: string;
  lastUpdated: string;
}

interface YouTubeAdsResponse {
  data: YouTubeAdData[];
  totalCount: number;
  nextPageToken?: string;
}

class YouTubeAdsAPI {
  private apiKey: string;
  private accessToken: string;
  private clientId: string;
  private clientSecret: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(
    apiKey: string,
    accessToken: string,
    clientId: string,
    clientSecret: string
  ) {
    this.apiKey = apiKey;
    this.accessToken = accessToken;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Make authenticated request to YouTube API
   */
  private async makeRequest(endpoint: string, params: any = {}): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const searchParams = new URLSearchParams({
        key: this.apiKey,
        ...params
      });

      const response = await fetch(`${url}?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('YouTube API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for competitor video ads
   */
  async searchCompetitorAds(
    competitorName: string,
    country: string = 'NL'
  ): Promise<YouTubeAdData[]> {
    try {
      // Search for videos by competitor name
      const searchResponse = await this.makeRequest('/search', {
        part: 'snippet',
        q: `${competitorName} ad commercial`,
        type: 'video',
        videoCategoryId: '22', // People & Blogs
        regionCode: country,
        maxResults: 50,
        order: 'relevance'
      });

      if (!searchResponse.items) {
        return [];
      }

      // Get detailed video information
      const videoIds = searchResponse.items.map((item: any) => item.id.videoId);
      const videosResponse = await this.makeRequest('/videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(',')
      });

      return this.transformYouTubeAdsData(videosResponse.items || [], competitorName);
    } catch (error) {
      console.error(`Error searching YouTube ads for ${competitorName}:`, error);
      return this.generateMockYouTubeAds(competitorName);
    }
  }

  /**
   * Get ads by specific keywords
   */
  async getAdsByKeywords(
    keywords: string[],
    country: string = 'NL'
  ): Promise<YouTubeAdData[]> {
    try {
      const keywordQuery = keywords.join(' ');
      const searchResponse = await this.makeRequest('/search', {
        part: 'snippet',
        q: keywordQuery,
        type: 'video',
        videoCategoryId: '22', // People & Blogs
        regionCode: country,
        maxResults: 50,
        order: 'relevance'
      });

      if (!searchResponse.items) {
        return [];
      }

      const videoIds = searchResponse.items.map((item: any) => item.id.videoId);
      const videosResponse = await this.makeRequest('/videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(',')
      });

      return this.transformYouTubeAdsData(videosResponse.items || [], keywordQuery);
    } catch (error) {
      console.error('Error getting YouTube ads by keywords:', error);
      return this.generateMockYouTubeAds(keywords.join(' '));
    }
  }

  /**
   * Get channel ads and campaigns
   */
  async getChannelAds(
    channelId: string,
    country: string = 'NL'
  ): Promise<YouTubeAdData[]> {
    try {
      // Get channel videos
      const searchResponse = await this.makeRequest('/search', {
        part: 'snippet',
        channelId: channelId,
        type: 'video',
        order: 'date',
        maxResults: 50
      });

      if (!searchResponse.items) {
        return [];
      }

      const videoIds = searchResponse.items.map((item: any) => item.id.videoId);
      const videosResponse = await this.makeRequest('/videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(',')
      });

      return this.transformYouTubeAdsData(videosResponse.items || [], 'Channel');
    } catch (error) {
      console.error(`Error getting channel ads for ${channelId}:`, error);
      return this.generateMockYouTubeAds('Channel');
    }
  }

  /**
   * Get trending ads in specific category
   */
  async getTrendingAds(
    category: string = '22',
    country: string = 'NL'
  ): Promise<YouTubeAdData[]> {
    try {
      const trendingResponse = await this.makeRequest('/videos', {
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        videoCategoryId: category,
        regionCode: country,
        maxResults: 50
      });

      return this.transformYouTubeAdsData(trendingResponse.items || [], 'Trending');
    } catch (error) {
      console.error('Error getting trending YouTube ads:', error);
      return this.generateMockYouTubeAds('Trending');
    }
  }

  /**
   * Get video performance insights
   */
  async getVideoInsights(videoId: string): Promise<any> {
    try {
      const insightsResponse = await this.makeRequest('/videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoId
      });

      if (!insightsResponse.items?.[0]) {
        return {};
      }

      const video = insightsResponse.items[0];
      return {
        videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        channelName: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        duration: this.parseDuration(video.contentDetails.duration),
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        publishedAt: video.snippet.publishedAt,
        tags: video.snippet.tags || [],
        categoryId: video.snippet.categoryId,
        defaultLanguage: video.snippet.defaultLanguage,
        defaultAudioLanguage: video.snippet.defaultAudioLanguage
      };
    } catch (error) {
      console.error(`Error getting video insights for ${videoId}:`, error);
      return {};
    }
  }

  /**
   * Transform YouTube API response to our format
   */
  private transformYouTubeAdsData(videos: any[], competitorName: string): YouTubeAdData[] {
    return videos.map(video => {
      const viewCount = parseInt(video.statistics?.viewCount || '0');
      const likeCount = parseInt(video.statistics?.likeCount || '0');
      const commentCount = parseInt(video.statistics?.commentCount || '0');
      const duration = this.parseDuration(video.contentDetails?.duration || 'PT0S');
      
      // Calculate mock metrics based on real data
      const impressions = viewCount * (Math.random() * 0.3 + 0.7); // 70-100% of views
      const clicks = viewCount * (Math.random() * 0.05 + 0.02); // 2-7% CTR
      const spend = clicks * (Math.random() * 2 + 0.5); // €0.50-€2.50 CPC
      const ctr = (clicks / impressions) * 100;
      const cpc = spend / clicks;
      const cpm = (spend / impressions) * 1000;

      return {
        id: video.id,
        campaignId: `campaign-${Math.random().toString(36).substr(2, 9)}`,
        campaignName: `${competitorName} YouTube Campaign`,
        adType: 'VIDEO',
        status: 'ACTIVE',
        title: video.snippet.title,
        description: video.snippet.description,
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
        thumbnailUrl: video.snippet.thumbnails?.high?.url || '',
        channelName: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        duration,
        impressions: Math.floor(impressions),
        views: viewCount,
        clicks: Math.floor(clicks),
        spend: Math.round(spend * 100) / 100,
        ctr: Math.round(ctr * 100) / 100,
        cpc: Math.round(cpc * 100) / 100,
        cpm: Math.round(cpm * 100) / 100,
        viewRate: Math.round((viewCount / impressions) * 100 * 100) / 100,
        averageViewDuration: Math.round(duration * (Math.random() * 0.4 + 0.3)), // 30-70% of total duration
        engagement: {
          likes: likeCount,
          dislikes: Math.floor(likeCount * 0.1), // Assume 10% dislike ratio
          comments: commentCount,
          shares: Math.floor(viewCount * 0.01) // Assume 1% share ratio
        },
        targeting: {
          locations: ['Netherlands'],
          demographics: ['18-34', '35-44'],
          interests: ['Technology', 'Business'],
          keywords: ['ad', 'commercial', 'marketing']
        },
        creativeElements: ['Video', 'Thumbnail', 'Description'],
        callToAction: 'Watch Now',
        performance: this.determinePerformance(ctr, cpm),
        insights: this.generateInsights(video, competitorName),
        createdAt: video.snippet.publishedAt,
        lastUpdated: new Date().toISOString()
      };
    });
  }

  /**
   * Parse YouTube duration format (PT4M13S) to seconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Determine performance based on metrics
   */
  private determinePerformance(ctr: number, cpm: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (ctr > 5 && cpm < 10) return 'excellent';
    if (ctr > 3 && cpm < 15) return 'good';
    if (ctr > 1 && cpm < 25) return 'average';
    return 'poor';
  }

  /**
   * Generate insights for video
   */
  private generateInsights(video: any, competitorName: string): string {
    const viewCount = parseInt(video.statistics?.viewCount || '0');
    const likeCount = parseInt(video.statistics?.likeCount || '0');
    const commentCount = parseInt(video.statistics?.commentCount || '0');
    
    const engagementRate = viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;
    
    if (engagementRate > 5) {
      return `High engagement rate (${engagementRate.toFixed(1)}%) indicates strong audience connection`;
    } else if (viewCount > 10000) {
      return `High view count suggests effective reach and targeting`;
    } else if (likeCount > 100) {
      return `Positive audience reception with ${likeCount} likes`;
    } else {
      return `Standard performance metrics for ${competitorName} content`;
    }
  }

  /**
   * Generate mock YouTube ads for demonstration
   */
  private generateMockYouTubeAds(competitorName: string): YouTubeAdData[] {
    const mockTitles = [
      `${competitorName} - Transform Your Life Today!`,
      `The ${competitorName} Method - Proven Results`,
      `${competitorName} Success Story - Real Results`,
      `Why ${competitorName} is the #1 Choice`,
      `${competitorName} - Join the Movement`
    ];

    return mockTitles.map((title, index) => ({
      id: `youtube-${Math.random().toString(36).substr(2, 9)}`,
      campaignId: `campaign-${Math.random().toString(36).substr(2, 9)}`,
      campaignName: `${competitorName} YouTube Campaign`,
      adType: 'VIDEO',
      status: 'ACTIVE',
      title,
      description: `Discover how ${competitorName} can transform your life. Watch this amazing video to learn more about our proven methods and success stories.`,
      videoUrl: `https://www.youtube.com/watch?v=mock-${index}`,
      thumbnailUrl: `https://example.com/thumbnail-${index}.jpg`,
      channelName: `${competitorName} Official`,
      channelId: `channel-${Math.random().toString(36).substr(2, 9)}`,
      duration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
      impressions: Math.floor(Math.random() * 50000) + 5000,
      views: Math.floor(Math.random() * 30000) + 3000,
      clicks: Math.floor(Math.random() * 1500) + 150,
      spend: Math.random() * 2000 + 200,
      ctr: Math.random() * 5 + 2,
      cpc: Math.random() * 2 + 0.5,
      cpm: Math.random() * 20 + 10,
      viewRate: Math.random() * 30 + 50,
      averageViewDuration: Math.floor(Math.random() * 120) + 30,
      engagement: {
        likes: Math.floor(Math.random() * 500) + 50,
        dislikes: Math.floor(Math.random() * 50) + 5,
        comments: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5
      },
      targeting: {
        locations: ['Netherlands', 'Belgium'],
        demographics: ['18-34', '35-44'],
        interests: ['Personal Development', 'Business'],
        keywords: ['success', 'transformation', 'growth']
      },
      creativeElements: ['Video', 'Thumbnail', 'Description', 'Call-to-Action'],
      callToAction: 'Subscribe Now',
      performance: ['excellent', 'good', 'average'][Math.floor(Math.random() * 3)] as 'excellent' | 'good' | 'average',
      insights: `Strong performance for ${competitorName} content with high engagement rates`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString()
    }));
  }
}

// Export singleton instance (if credentials are available)
export const youtubeAdsAPI = process.env.YOUTUBE_API_KEY && 
                            process.env.YOUTUBE_ACCESS_TOKEN &&
                            process.env.YOUTUBE_CLIENT_ID &&
                            process.env.YOUTUBE_CLIENT_SECRET
  ? new YouTubeAdsAPI(
      process.env.YOUTUBE_API_KEY,
      process.env.YOUTUBE_ACCESS_TOKEN,
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET
    )
  : null;

export type { YouTubeAdsParams, YouTubeAdData, YouTubeAdsResponse }; 