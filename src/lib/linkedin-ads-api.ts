// LinkedIn Marketing API Integration
// Monitors B2B competitor ads, company pages, and sponsored content

interface LinkedInAdsParams {
  accountId?: string;
  campaignType?: 'SPONSORED_CONTENT' | 'TEXT_AD' | 'MESSAGE_AD' | 'DYNAMIC_AD';
  dateRange?: {
    start: string;
    end: string;
  };
  country?: string;
  language?: string;
  limit?: number;
}

interface LinkedInAdData {
  id: string;
  campaignId: string;
  campaignName: string;
  adType: 'SPONSORED_CONTENT' | 'TEXT_AD' | 'MESSAGE_AD' | 'DYNAMIC_AD';
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT';
  title?: string;
  headline: string;
  description?: string;
  content: string;
  landingPageUrl: string;
  imageUrl?: string;
  videoUrl?: string;
  companyName: string;
  companyId: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  engagement: number;
  shares: number;
  comments: number;
  likes: number;
  targeting: {
    locations: string[];
    industries: string[];
    jobFunctions: string[];
    seniorities: string[];
    companySizes: string[];
  };
  creativeElements: string[];
  callToAction?: string;
  createdAt: string;
  lastUpdated: string;
}

interface LinkedInAdsResponse {
  data: LinkedInAdData[];
  totalCount: number;
  nextPageToken?: string;
}

class LinkedInAdsAPI {
  private accessToken: string;
  private clientId: string;
  private clientSecret: string;
  private baseUrl = 'https://api.linkedin.com/v2';

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
   * Make authenticated request to LinkedIn API
   */
  private async makeRequest(endpoint: string, params: any = {}): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        ...params,
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LinkedIn API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for sponsored content by competitor
   */
  async searchSponsoredContent(
    competitorName: string,
    country: string = 'NL'
  ): Promise<LinkedInAdData[]> {
    try {
      // Search for company first
      const companies = await this.searchCompanies(competitorName);
      const ads: LinkedInAdData[] = [];

      for (const company of companies) {
        const companyAds = await this.getCompanyAds(company.id);
        ads.push(...companyAds);
      }

      return ads;
    } catch (error) {
      console.error(`Error searching LinkedIn ads for ${competitorName}:`, error);
      return [];
    }
  }

  /**
   * Search for companies by name
   */
  async searchCompanies(companyName: string): Promise<any[]> {
    try {
      const response = await this.makeRequest('/organizationAcls', {
        params: {
          q: 'roleAssignee',
          role: 'ADMINISTRATOR',
        },
      });

      // Filter companies by name (this is a simplified approach)
      // In a real implementation, you'd use LinkedIn's company search API
      return response.elements || [];
    } catch (error) {
      console.error('Error searching companies:', error);
      return [];
    }
  }

  /**
   * Get ads for a specific company
   */
  async getCompanyAds(companyId: string): Promise<LinkedInAdData[]> {
    try {
      const response = await this.makeRequest(`/adAccountsV2`, {
        params: {
          search: {
            status: {
              values: ['ACTIVE', 'PAUSED']
            }
          }
        }
      });

      const ads: LinkedInAdData[] = [];
      
      for (const account of response.elements || []) {
        const accountAds = await this.getAccountAds(account.id);
        ads.push(...accountAds);
      }

      return ads;
    } catch (error) {
      console.error('Error getting company ads:', error);
      return [];
    }
  }

  /**
   * Get ads for a specific ad account
   */
  async getAccountAds(accountId: string): Promise<LinkedInAdData[]> {
    try {
      const response = await this.makeRequest(`/adAccounts/${accountId}/creatives`, {
        params: {
          count: 100,
          start: 0,
        }
      });

      return this.transformLinkedInAdsData(response.elements || []);
    } catch (error) {
      console.error('Error getting account ads:', error);
      return [];
    }
  }

  /**
   * Get sponsored content by keywords
   */
  async getSponsoredContentByKeywords(
    keywords: string[],
    country: string = 'NL'
  ): Promise<LinkedInAdData[]> {
    try {
      const ads: LinkedInAdData[] = [];
      
      for (const keyword of keywords) {
        // This would use LinkedIn's content search API
        // For now, we'll return mock data
        const mockAds = this.generateMockLinkedInAds(keyword);
        ads.push(...mockAds);
      }

      return ads;
    } catch (error) {
      console.error('Error getting sponsored content by keywords:', error);
      return [];
    }
  }

  /**
   * Get company page insights
   */
  async getCompanyPageInsights(companyId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/organizationAcls/${companyId}/organizationalEntityShareStatistics`);
      
      return {
        followers: response.totalShareStatistics?.followerCount || 0,
        impressions: response.totalShareStatistics?.impressionCount || 0,
        clicks: response.totalShareStatistics?.clickCount || 0,
        engagement: response.totalShareStatistics?.engagement || 0,
        shares: response.totalShareStatistics?.shareCount || 0,
      };
    } catch (error) {
      console.error('Error getting company page insights:', error);
      return {};
    }
  }

  /**
   * Get lead generation insights
   */
  async getLeadGenerationInsights(
    competitorName: string,
    country: string = 'NL'
  ): Promise<any[]> {
    try {
      // This would analyze lead generation campaigns
      // For now, return mock data
      return [
        {
          campaignName: `${competitorName} Lead Gen Campaign`,
          leads: Math.floor(Math.random() * 100) + 10,
          costPerLead: Math.random() * 50 + 10,
          conversionRate: Math.random() * 0.1 + 0.05,
          targetAudience: 'B2B Decision Makers',
          industry: 'Technology',
        }
      ];
    } catch (error) {
      console.error('Error getting lead generation insights:', error);
      return [];
    }
  }

  /**
   * Transform LinkedIn API response to our format
   */
  private transformLinkedInAdsData(results: any[]): LinkedInAdData[] {
    return results.map(result => ({
      id: result.id || '',
      campaignId: result.campaignId || '',
      campaignName: result.campaignName || '',
      adType: result.type || 'SPONSORED_CONTENT',
      status: result.status || 'ACTIVE',
      title: result.title || '',
      headline: result.headline || result.title || '',
      description: result.description || '',
      content: result.content || result.description || '',
      landingPageUrl: result.landingPageUrl || '',
      imageUrl: result.imageUrl || '',
      videoUrl: result.videoUrl || '',
      companyName: result.companyName || '',
      companyId: result.companyId || '',
      impressions: parseInt(result.impressions || '0'),
      clicks: parseInt(result.clicks || '0'),
      spend: parseFloat(result.spend || '0'),
      ctr: parseFloat(result.ctr || '0'),
      cpc: parseFloat(result.cpc || '0'),
      cpm: parseFloat(result.cpm || '0'),
      engagement: parseInt(result.engagement || '0'),
      shares: parseInt(result.shares || '0'),
      comments: parseInt(result.comments || '0'),
      likes: parseInt(result.likes || '0'),
      targeting: {
        locations: result.targeting?.locations || [],
        industries: result.targeting?.industries || [],
        jobFunctions: result.targeting?.jobFunctions || [],
        seniorities: result.targeting?.seniorities || [],
        companySizes: result.targeting?.companySizes || [],
      },
      creativeElements: result.creativeElements || [],
      callToAction: result.callToAction || '',
      createdAt: result.createdAt || new Date().toISOString(),
      lastUpdated: result.lastUpdated || new Date().toISOString(),
    }));
  }

  /**
   * Generate mock LinkedIn ads for demonstration
   */
  private generateMockLinkedInAds(keyword: string): LinkedInAdData[] {
    const mockCompanies = [
      'TechCorp Solutions',
      'InnovatePro Systems',
      'Digital Dynamics',
      'FutureTech Labs',
      'Smart Solutions Inc'
    ];

    return [
      {
        id: `linkedin-${Math.random().toString(36).substr(2, 9)}`,
        campaignId: `campaign-${Math.random().toString(36).substr(2, 9)}`,
        campaignName: `${keyword} B2B Campaign`,
        adType: 'SPONSORED_CONTENT',
        status: 'ACTIVE',
        headline: `Transform Your Business with ${keyword}`,
        description: `Discover how ${keyword} can revolutionize your business operations and drive growth.`,
        content: `Are you looking to optimize your business processes? Our ${keyword} solution has helped 500+ companies increase efficiency by 40%. Learn how we can help your organization achieve similar results.`,
        landingPageUrl: `https://example.com/${keyword.toLowerCase()}`,
        companyName: mockCompanies[Math.floor(Math.random() * mockCompanies.length)],
        companyId: `company-${Math.random().toString(36).substr(2, 9)}`,
        impressions: Math.floor(Math.random() * 50000) + 1000,
        clicks: Math.floor(Math.random() * 1000) + 50,
        spend: Math.random() * 5000 + 500,
        ctr: Math.random() * 0.05 + 0.01,
        cpc: Math.random() * 10 + 2,
        cpm: Math.random() * 50 + 20,
        engagement: Math.floor(Math.random() * 200) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
        comments: Math.floor(Math.random() * 30) + 2,
        likes: Math.floor(Math.random() * 100) + 10,
        targeting: {
          locations: ['Netherlands', 'Belgium', 'Germany'],
          industries: ['Technology', 'Finance', 'Healthcare'],
          jobFunctions: ['Engineering', 'Management', 'Sales'],
          seniorities: ['Senior', 'Director', 'C-Level'],
          companySizes: ['51-200', '201-1000', '1000+'],
        },
        creativeElements: ['Professional imagery', 'Case studies', 'Testimonials'],
        callToAction: 'Learn More',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
      }
    ];
  }
}

// Export singleton instance (if credentials are available)
export const linkedInAdsAPI = process.env.LINKEDIN_ACCESS_TOKEN && 
                             process.env.LINKEDIN_CLIENT_ID &&
                             process.env.LINKEDIN_CLIENT_SECRET
  ? new LinkedInAdsAPI(
      process.env.LINKEDIN_ACCESS_TOKEN,
      process.env.LINKEDIN_CLIENT_ID,
      process.env.LINKEDIN_CLIENT_SECRET
    )
  : null;

export type { LinkedInAdsParams, LinkedInAdData, LinkedInAdsResponse }; 