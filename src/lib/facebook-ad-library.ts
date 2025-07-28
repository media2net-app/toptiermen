// Facebook Ad Library API Integration
// https://developers.facebook.com/docs/marketing-api/reference/ad-library-api/

interface FacebookAdLibraryParams {
  search_terms?: string;
  ad_type?: 'ALL' | 'POLITICAL_AND_ISSUE_ADS' | 'POLITICAL_ADS' | 'ISSUE_ADS';
  ad_reached_countries?: string[];
  ad_active_status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
  page_ids?: string[];
  ad_delivery_date_min?: string;
  ad_delivery_date_max?: string;
  fields?: string[];
  limit?: number;
}

interface FacebookAdData {
  id: string;
  ad_creation_time: string;
  ad_creative_body: string;
  ad_creative_link_caption?: string;
  ad_creative_link_description?: string;
  ad_creative_link_title?: string;
  ad_delivery_start_time: string;
  ad_delivery_stop_time?: string;
  ad_snapshot_url: string;
  currency: string;
  disclaimer: string;
  page_id: string;
  page_name: string;
  publisher_platforms: string[];
  platform_distribution: string;
  spend: {
    lower_bound: string;
    upper_bound: string;
    currency: string;
  };
  impressions: {
    lower_bound: string;
    upper_bound: string;
    social_impressions: string;
  };
  demographic_distribution?: Array<{
    age: string;
    gender: string;
    percentage: number;
  }>;
  geographic_distribution?: Array<{
    country: string;
    percentage: number;
  }>;
  targeting?: {
    age_min?: number;
    age_max?: number;
    genders?: string[];
    geo_locations?: Array<{
      country: string;
      regions?: string[];
      cities?: string[];
    }>;
    interests?: string[];
    behaviors?: string[];
  };
}

interface FacebookAdLibraryResponse {
  data: FacebookAdData[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

class FacebookAdLibraryAPI {
  private accessToken: string;
  private baseUrl = 'https://graph.facebook.com/v18.0/ads_archive';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Fetch ads from Facebook Ad Library
   */
  async fetchAds(params: FacebookAdLibraryParams = {}): Promise<FacebookAdLibraryResponse> {
    const defaultParams = {
      ad_type: 'ALL',
      ad_active_status: 'ACTIVE',
      fields: [
        'id',
        'ad_creation_time',
        'ad_creative_body',
        'ad_creative_link_caption',
        'ad_creative_link_description',
        'ad_creative_link_title',
        'ad_delivery_start_time',
        'ad_delivery_stop_time',
        'ad_snapshot_url',
        'currency',
        'disclaimer',
        'page_id',
        'page_name',
        'publisher_platforms',
        'platform_distribution',
        'spend',
        'impressions',
        'demographic_distribution',
        'geographic_distribution'
      ],
      limit: 100
    };

    const allParams = {
      access_token: this.accessToken,
      ad_type: defaultParams.ad_type,
      ad_active_status: defaultParams.ad_active_status,
      fields: (params.fields || defaultParams.fields).join(','),
      limit: defaultParams.limit,
      ...params
    };

    const queryParams = new URLSearchParams();
    Object.entries(allParams).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    try {
      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Facebook Ad Library data:', error);
      throw error;
    }
  }

  /**
   * Search for ads by competitor name or keywords
   */
  async searchCompetitorAds(competitorName: string, country: string = 'NL'): Promise<FacebookAdData[]> {
    try {
      const response = await this.fetchAds({
        search_terms: competitorName,
        ad_reached_countries: [country],
        ad_active_status: 'ACTIVE'
      });

      return response.data;
    } catch (error) {
      console.error(`Error searching ads for ${competitorName}:`, error);
      return [];
    }
  }

  /**
   * Search for Instagram ads specifically
   */
  async searchInstagramAds(competitorName: string, country: string = 'NL'): Promise<FacebookAdData[]> {
    try {
      const response = await this.fetchAds({
        search_terms: competitorName,
        ad_reached_countries: [country],
        ad_active_status: 'ACTIVE'
      });

      // Filter for Instagram ads
      return response.data.filter(ad => 
        ad.publisher_platforms.includes('instagram') ||
        ad.platform_distribution.includes('instagram')
      );
    } catch (error) {
      console.error(`Error searching Instagram ads for ${competitorName}:`, error);
      return [];
    }
  }

  /**
   * Get ads from specific page IDs (competitor pages)
   */
  async getAdsByPageIds(pageIds: string[]): Promise<FacebookAdData[]> {
    try {
      const response = await this.fetchAds({
        page_ids: pageIds,
        ad_active_status: 'ACTIVE'
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching ads by page IDs:', error);
      return [];
    }
  }

  /**
   * Get recent ads from the last X days
   */
  async getRecentAds(days: number = 30): Promise<FacebookAdData[]> {
    const dateMin = new Date();
    dateMin.setDate(dateMin.getDate() - days);
    
    try {
      const response = await this.fetchAds({
        ad_delivery_date_min: dateMin.toISOString().split('T')[0],
        ad_active_status: 'ACTIVE'
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching recent ads:', error);
      return [];
    }
  }

  /**
   * Transform Facebook ad data to our competitor ad format
   */
  transformToCompetitorAd(facebookAd: FacebookAdData, competitorId: string): any {
    return {
      competitorId,
      title: facebookAd.ad_creative_link_title || 'Facebook Ad',
      platform: 'Facebook',
      type: this.determineAdType(facebookAd),
      content: facebookAd.ad_creative_body || '',
      imageUrl: facebookAd.ad_snapshot_url,
      performance: this.calculatePerformance(facebookAd),
      estimatedReach: parseInt(facebookAd.impressions?.upper_bound || '0'),
      estimatedEngagement: this.calculateEngagement(facebookAd),
      estimatedSpend: parseInt(facebookAd.spend?.upper_bound || '0'),
      targetAudience: this.extractTargetAudience(facebookAd),
      messaging: facebookAd.ad_creative_body || '',
      creativeElements: this.extractCreativeElements(facebookAd),
      callToAction: facebookAd.ad_creative_link_caption || '',
      strengths: this.analyzeStrengths(facebookAd),
      weaknesses: this.analyzeWeaknesses(facebookAd),
      insights: this.generateInsights(facebookAd),
      dateObserved: facebookAd.ad_delivery_start_time.split('T')[0],
      facebookData: facebookAd // Keep original data for reference
    };
  }

  private determineAdType(ad: FacebookAdData): 'image' | 'video' | 'carousel' | 'story' | 'text' {
    // Logic to determine ad type based on Facebook data
    if (ad.ad_creative_link_caption && ad.ad_creative_link_caption.includes('video')) {
      return 'video';
    }
    if (ad.publisher_platforms.includes('instagram')) {
      return 'story';
    }
    return 'image';
  }

  private calculatePerformance(ad: FacebookAdData): 'excellent' | 'good' | 'average' | 'poor' {
    const spend = parseInt(ad.spend?.upper_bound || '0');
    const impressions = parseInt(ad.impressions?.upper_bound || '0');
    
    if (impressions === 0) return 'poor';
    
    const cpm = (spend / impressions) * 1000;
    
    if (cpm < 5) return 'excellent';
    if (cpm < 10) return 'good';
    if (cpm < 20) return 'average';
    return 'poor';
  }

  private calculateEngagement(ad: FacebookAdData): number {
    // Estimate engagement based on impressions and spend
    const impressions = parseInt(ad.impressions?.upper_bound || '0');
    return Math.floor(impressions * 0.02); // 2% estimated engagement rate
  }

  private extractTargetAudience(ad: FacebookAdData): string {
    const targeting = ad.targeting;
    if (!targeting) return 'Unknown';
    
    const parts = [];
    if (targeting.age_min && targeting.age_max) {
      parts.push(`${targeting.age_min}-${targeting.age_max} jaar`);
    }
    if (targeting.genders) {
      parts.push(targeting.genders.join(', '));
    }
    if (targeting.geo_locations) {
      parts.push(targeting.geo_locations.map(loc => loc.country).join(', '));
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Broad audience';
  }

  private extractCreativeElements(ad: FacebookAdData): string[] {
    const elements = [];
    
    if (ad.ad_creative_body) elements.push('Text content');
    if (ad.ad_creative_link_title) elements.push('Link title');
    if (ad.ad_creative_link_description) elements.push('Link description');
    if (ad.ad_snapshot_url) elements.push('Visual content');
    
    return elements;
  }

  private analyzeStrengths(ad: FacebookAdData): string[] {
    const strengths = [];
    
    if (ad.ad_creative_body && ad.ad_creative_body.length > 50) {
      strengths.push('Detaillierte content');
    }
    if (ad.ad_creative_link_title) {
      strengths.push('Duidelijke call-to-action');
    }
    if (ad.spend && parseInt(ad.spend.upper_bound) > 100) {
      strengths.push('Significante ad spend');
    }
    
    return strengths;
  }

  private analyzeWeaknesses(ad: FacebookAdData): string[] {
    const weaknesses = [];
    
    if (!ad.ad_creative_body || ad.ad_creative_body.length < 20) {
      weaknesses.push('Korte content');
    }
    if (!ad.ad_creative_link_title) {
      weaknesses.push('Geen duidelijke CTA');
    }
    if (ad.spend && parseInt(ad.spend.upper_bound) < 50) {
      weaknesses.push('Lage ad spend');
    }
    
    return weaknesses;
  }

  private generateInsights(ad: FacebookAdData): string {
    const insights = [];
    
    if (ad.spend) {
      insights.push(`Spend range: €${ad.spend.lower_bound} - €${ad.spend.upper_bound}`);
    }
    if (ad.impressions) {
      insights.push(`Impressions: ${ad.impressions.lower_bound} - ${ad.impressions.upper_bound}`);
    }
    if (ad.demographic_distribution) {
      insights.push('Demographic targeting detected');
    }
    
    return insights.join('. ');
  }
}

// Environment variables for Facebook API
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

// Export singleton instance
export const facebookAdLibrary = FACEBOOK_ACCESS_TOKEN 
  ? new FacebookAdLibraryAPI(FACEBOOK_ACCESS_TOKEN)
  : null;

export type { FacebookAdData, FacebookAdLibraryParams }; 