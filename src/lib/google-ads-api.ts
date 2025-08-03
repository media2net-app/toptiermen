// Google Ads API Integration
// Monitors competitor search ads, display campaigns, and shopping ads

interface GoogleAdsParams {
  customerId?: string;
  query?: string;
  campaignType?: 'SEARCH' | 'DISPLAY' | 'SHOPPING' | 'VIDEO';
  dateRange?: {
    start: string;
    end: string;
  };
  country?: string;
  language?: string;
  limit?: number;
}

interface GoogleAdData {
  id: string;
  campaignId: string;
  campaignName: string;
  adGroupId: string;
  adGroupName: string;
  headline: string;
  description1?: string;
  description2?: string;
  finalUrl: string;
  displayUrl: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  adType: 'TEXT_AD' | 'EXPANDED_TEXT_AD' | 'RESPONSIVE_SEARCH_AD' | 'SHOPPING_AD';
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  cpc: number;
  cpm: number;
  qualityScore?: number;
  keywords?: string[];
  targeting?: {
    locations: string[];
    demographics: string[];
    interests: string[];
  };
  createdAt: string;
  lastUpdated: string;
}

interface GoogleAdsResponse {
  data: GoogleAdData[];
  totalCount: number;
  nextPageToken?: string;
}

class GoogleAdsAPI {
  private accessToken: string;
  private developerToken: string;
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private baseUrl = 'https://googleads.googleapis.com/v14';

  constructor(
    accessToken: string,
    developerToken: string,
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ) {
    this.accessToken = accessToken;
    this.developerToken = developerToken;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.refreshToken = refreshToken;
  }

  /**
   * Refresh access token if expired
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      if (data.access_token) {
        this.accessToken = data.access_token;
      }
    } catch (error) {
      console.error('Error refreshing Google Ads access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Make authenticated request to Google Ads API
   */
  private async makeRequest(endpoint: string, params: any = {}): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'developer-token': this.developerToken,
          'Content-Type': 'application/json',
        },
        ...params,
      });

      if (response.status === 401) {
        await this.refreshAccessToken();
        return this.makeRequest(endpoint, params);
      }

      if (!response.ok) {
        throw new Error(`Google Ads API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Google Ads API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for ads by competitor keywords
   */
  async searchCompetitorAds(
    competitorName: string,
    country: string = 'NL',
    campaignType: string = 'SEARCH'
  ): Promise<GoogleAdData[]> {
    try {
      const query = `
        SELECT 
          ad_group_ad.ad.id,
          ad_group_ad.ad_group.id,
          ad_group_ad.ad_group.name,
          campaign.id,
          campaign.name,
          ad_group_ad.ad.text_ad.headline,
          ad_group_ad.ad.text_ad.description1,
          ad_group_ad.ad.text_ad.description2,
          ad_group_ad.ad.final_urls,
          ad_group_ad.ad.display_url,
          ad_group_ad.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm,
          ad_group_ad.ad.type
        FROM ad_group_ad
        WHERE 
          campaign.advertising_channel_type = '${campaignType}'
          AND campaign.status = 'ENABLED'
          AND ad_group_ad.status = 'ENABLED'
          AND (
            ad_group_ad.ad.text_ad.headline LIKE '%${competitorName}%'
            OR ad_group_ad.ad.text_ad.description1 LIKE '%${competitorName}%'
            OR ad_group_ad.ad.text_ad.description2 LIKE '%${competitorName}%'
          )
        ORDER BY metrics.impressions DESC
        LIMIT 100
      `;

      const response = await this.makeRequest('/customers/search', {
        body: JSON.stringify({ query }),
      });

      return this.transformGoogleAdsData(response.results || []);
    } catch (error) {
      console.error(`Error searching Google Ads for ${competitorName}:`, error);
      return [];
    }
  }

  /**
   * Get ads by specific keywords
   */
  async getAdsByKeywords(
    keywords: string[],
    country: string = 'NL'
  ): Promise<GoogleAdData[]> {
    try {
      const keywordQuery = keywords.map(k => `'${k}'`).join(',');
      const query = `
        SELECT 
          ad_group_ad.ad.id,
          ad_group_ad.ad_group.id,
          ad_group_ad.ad_group.name,
          campaign.id,
          campaign.name,
          ad_group_ad.ad.text_ad.headline,
          ad_group_ad.ad.text_ad.description1,
          ad_group_ad.ad.text_ad.description2,
          ad_group_ad.ad.final_urls,
          ad_group_ad.ad.display_url,
          ad_group_ad.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm,
          ad_group_ad.ad.type
        FROM ad_group_ad
        WHERE 
          campaign.advertising_channel_type = 'SEARCH'
          AND campaign.status = 'ENABLED'
          AND ad_group_ad.status = 'ENABLED'
          AND ad_group_criterion.keyword.text IN (${keywordQuery})
        ORDER BY metrics.impressions DESC
        LIMIT 100
      `;

      const response = await this.makeRequest('/customers/search', {
        body: JSON.stringify({ query }),
      });

      return this.transformGoogleAdsData(response.results || []);
    } catch (error) {
      console.error('Error getting Google Ads by keywords:', error);
      return [];
    }
  }

  /**
   * Get shopping ads for e-commerce competitors
   */
  async getShoppingAds(
    competitorName: string,
    country: string = 'NL'
  ): Promise<GoogleAdData[]> {
    try {
      const query = `
        SELECT 
          ad_group_ad.ad.id,
          ad_group_ad.ad_group.id,
          ad_group_ad.ad_group.name,
          campaign.id,
          campaign.name,
          ad_group_ad.ad.shopping_product_ad.product_name,
          ad_group_ad.ad.shopping_product_ad.description1,
          ad_group_ad.ad.shopping_product_ad.description2,
          ad_group_ad.ad.final_urls,
          ad_group_ad.ad.display_url,
          ad_group_ad.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm,
          ad_group_ad.ad.type
        FROM ad_group_ad
        WHERE 
          campaign.advertising_channel_type = 'SHOPPING'
          AND campaign.status = 'ENABLED'
          AND ad_group_ad.status = 'ENABLED'
          AND (
            ad_group_ad.ad.shopping_product_ad.product_name LIKE '%${competitorName}%'
            OR ad_group_ad.ad.shopping_product_ad.description1 LIKE '%${competitorName}%'
          )
        ORDER BY metrics.impressions DESC
        LIMIT 100
      `;

      const response = await this.makeRequest('/customers/search', {
        body: JSON.stringify({ query }),
      });

      return this.transformGoogleAdsData(response.results || []);
    } catch (error) {
      console.error(`Error getting shopping ads for ${competitorName}:`, error);
      return [];
    }
  }

  /**
   * Get display ads
   */
  async getDisplayAds(
    competitorName: string,
    country: string = 'NL'
  ): Promise<GoogleAdData[]> {
    try {
      const query = `
        SELECT 
          ad_group_ad.ad.id,
          ad_group_ad.ad_group.id,
          ad_group_ad.ad_group.name,
          campaign.id,
          campaign.name,
          ad_group_ad.ad.responsive_display_ad.headlines,
          ad_group_ad.ad.responsive_display_ad.descriptions,
          ad_group_ad.ad.final_urls,
          ad_group_ad.ad.display_url,
          ad_group_ad.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm,
          ad_group_ad.ad.type
        FROM ad_group_ad
        WHERE 
          campaign.advertising_channel_type = 'DISPLAY'
          AND campaign.status = 'ENABLED'
          AND ad_group_ad.status = 'ENABLED'
          AND (
            ad_group_ad.ad.responsive_display_ad.headlines LIKE '%${competitorName}%'
            OR ad_group_ad.ad.responsive_display_ad.descriptions LIKE '%${competitorName}%'
          )
        ORDER BY metrics.impressions DESC
        LIMIT 100
      `;

      const response = await this.makeRequest('/customers/search', {
        body: JSON.stringify({ query }),
      });

      return this.transformGoogleAdsData(response.results || []);
    } catch (error) {
      console.error(`Error getting display ads for ${competitorName}:`, error);
      return [];
    }
  }

  /**
   * Transform Google Ads API response to our format
   */
  private transformGoogleAdsData(results: any[]): GoogleAdData[] {
    return results.map(result => ({
      id: result.adGroupAd?.ad?.id || '',
      campaignId: result.campaign?.id || '',
      campaignName: result.campaign?.name || '',
      adGroupId: result.adGroupAd?.adGroup?.id || '',
      adGroupName: result.adGroupAd?.adGroup?.name || '',
      headline: result.adGroupAd?.ad?.textAd?.headline || 
               result.adGroupAd?.ad?.shoppingProductAd?.productName || 
               result.adGroupAd?.ad?.responsiveDisplayAd?.headlines?.[0] || '',
      description1: result.adGroupAd?.ad?.textAd?.description1 || 
                   result.adGroupAd?.ad?.shoppingProductAd?.description1 || 
                   result.adGroupAd?.ad?.responsiveDisplayAd?.descriptions?.[0] || '',
      description2: result.adGroupAd?.ad?.textAd?.description2 || 
                   result.adGroupAd?.ad?.shoppingProductAd?.description2 || 
                   result.adGroupAd?.ad?.responsiveDisplayAd?.descriptions?.[1] || '',
      finalUrl: result.adGroupAd?.ad?.finalUrls?.[0] || '',
      displayUrl: result.adGroupAd?.ad?.displayUrl || '',
      status: result.adGroupAd?.status || 'ENABLED',
      adType: result.adGroupAd?.ad?.type || 'TEXT_AD',
      impressions: parseInt(result.metrics?.impressions || '0'),
      clicks: parseInt(result.metrics?.clicks || '0'),
      cost: parseInt(result.metrics?.costMicros || '0') / 1000000,
      ctr: parseFloat(result.metrics?.ctr || '0'),
      cpc: parseFloat(result.metrics?.averageCpc || '0') / 1000000,
      cpm: parseFloat(result.metrics?.averageCpm || '0') / 1000000,
      qualityScore: parseInt(result.metrics?.qualityScore || '0'),
      keywords: [],
      targeting: {
        locations: [],
        demographics: [],
        interests: []
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }));
  }

  /**
   * Get keyword insights for competitor analysis
   */
  async getKeywordInsights(
    keywords: string[],
    country: string = 'NL'
  ): Promise<any[]> {
    try {
      const insights: any[] = [];
      
      for (const keyword of keywords) {
        const query = `
          SELECT 
            keyword_view.text,
            keyword_view.search_volume,
            keyword_view.competition,
            keyword_view.low_top_of_page_bid_micros,
            keyword_view.high_top_of_page_bid_micros
          FROM keyword_view
          WHERE keyword_view.text = '${keyword}'
        `;

        const response = await this.makeRequest('/customers/search', {
          body: JSON.stringify({ query }),
        });

        if (response.results?.[0]) {
          const result = response.results[0];
          insights.push({
            keyword: result.keywordView?.text || keyword,
            searchVolume: parseInt(result.keywordView?.searchVolume || '0'),
            competition: result.keywordView?.competition || 'UNKNOWN',
            lowTopOfPageBid: parseInt(result.keywordView?.lowTopOfPageBidMicros || '0') / 1000000,
            highTopOfPageBid: parseInt(result.keywordView?.highTopOfPageBidMicros || '0') / 1000000,
          });
        }
      }

      return insights;
    } catch (error) {
      console.error('Error getting keyword insights:', error);
      return [];
    }
  }
}

// Export singleton instance (if credentials are available)
export const googleAdsAPI = process.env.GOOGLE_ADS_ACCESS_TOKEN && 
                           process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
                           process.env.GOOGLE_ADS_CLIENT_ID &&
                           process.env.GOOGLE_ADS_CLIENT_SECRET &&
                           process.env.GOOGLE_ADS_REFRESH_TOKEN
  ? new GoogleAdsAPI(
      process.env.GOOGLE_ADS_ACCESS_TOKEN,
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      process.env.GOOGLE_ADS_CLIENT_ID,
      process.env.GOOGLE_ADS_CLIENT_SECRET,
      process.env.GOOGLE_ADS_REFRESH_TOKEN
    )
  : null;

export type { GoogleAdsParams, GoogleAdData, GoogleAdsResponse }; 