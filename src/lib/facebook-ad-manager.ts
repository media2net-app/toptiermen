// Facebook Ad Manager API Integration
// Voor Rick's Facebook Ad Account integratie

interface FacebookCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  objective: string;
  special_ad_categories: string[];
  created_time: string;
  updated_time: string;
  start_time: string;
  stop_time?: string;
  daily_budget?: number;
  lifetime_budget?: number;
  budget_remaining?: number;
  spend_cap?: number;
  insights?: {
    impressions: number;
    clicks: number;
    spend: number;
    reach: number;
    frequency: number;
    ctr: number;
    cpc: number;
    cpm: number;
    actions?: Array<{
      action_type: string;
      value: string;
    }>;
  };
}

interface FacebookAdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  daily_budget?: number;
  lifetime_budget?: number;
  budget_remaining?: number;
  billing_event: string;
  optimization_goal: string;
  targeting: {
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
    custom_audiences?: string[];
    lookalike_audiences?: string[];
  };
  created_time: string;
  updated_time: string;
  start_time: string;
  end_time?: string;
  insights?: {
    impressions: number;
    clicks: number;
    spend: number;
    reach: number;
    frequency: number;
    ctr: number;
    cpc: number;
    cpm: number;
    actions?: Array<{
      action_type: string;
      value: string;
    }>;
  };
}

interface FacebookAd {
  id: string;
  name: string;
  adset_id: string;
  campaign_id: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | 'PENDING_REVIEW' | 'DISAPPROVED';
  creative: {
    id: string;
    title?: string;
    body?: string;
    image_url?: string;
    video_id?: string;
    link_url?: string;
    call_to_action_type?: string;
  };
  created_time: string;
  updated_time: string;
  insights?: {
    impressions: number;
    clicks: number;
    spend: number;
    reach: number;
    frequency: number;
    ctr: number;
    cpc: number;
    cpm: number;
    actions?: Array<{
      action_type: string;
      value: string;
    }>;
  };
}

interface FacebookAdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
  business: {
    id: string;
    name: string;
  };
  insights?: {
    impressions: number;
    clicks: number;
    spend: number;
    reach: number;
    frequency: number;
    ctr: number;
    cpc: number;
    cpm: number;
  };
}

class FacebookAdManagerAPI {
  private accessToken: string;
  private adAccountId: string;
  private appSecret?: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(accessToken: string, adAccountId: string, appSecret?: string) {
    this.accessToken = accessToken;
    this.adAccountId = adAccountId;
    this.appSecret = appSecret;
  }

  /**
   * Genereer een server-side access token met App Secret
   */
  private async getServerSideToken(): Promise<string> {
    if (!this.appSecret) {
      return this.accessToken; // Fallback naar user access token
    }

    try {
      // Exchange user access token voor server-side token
      const response = await fetch(
        `${this.baseUrl}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&client_secret=${this.appSecret}&fb_exchange_token=${this.accessToken}`
      );

      if (!response.ok) {
        console.warn('Failed to exchange token, using original access token');
        return this.accessToken;
      }

      const data = await response.json();
      return data.access_token || this.accessToken;
    } catch (error) {
      console.warn('Token exchange failed, using original access token:', error);
      return this.accessToken;
    }
  }

  /**
   * Test de API connectie
   */
  async testConnection(): Promise<boolean> {
    try {
      const serverToken = await this.getServerSideToken();
      const response = await fetch(
        `${this.baseUrl}/${this.adAccountId}?fields=id,name,account_status&access_token=${serverToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.account_status === 1; // 1 = Active account
    } catch (error) {
      console.error('Facebook Ad Manager connection test failed:', error);
      return false;
    }
  }

  /**
   * Haal ad account informatie op
   */
  async getAdAccount(): Promise<FacebookAdAccount> {
    const serverToken = await this.getServerSideToken();
    const response = await fetch(
      `${this.baseUrl}/${this.adAccountId}?fields=id,name,account_status,currency,timezone_name,business{id,name}&access_token=${serverToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Haal alle campagnes op
   */
  async getCampaigns(limit: number = 100): Promise<FacebookCampaign[]> {
    const serverToken = await this.getServerSideToken();
    const response = await fetch(
      `${this.baseUrl}/${this.adAccountId}/campaigns?fields=id,name,status,objective,special_ad_categories,created_time,updated_time,start_time,stop_time,daily_budget,lifetime_budget,budget_remaining,spend_cap&limit=${limit}&access_token=${serverToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Haal campagnes op met insights
   */
  async getCampaignsWithInsights(
    dateRange: { start: string; end: string },
    limit: number = 100
  ): Promise<FacebookCampaign[]> {
    const campaigns = await this.getCampaigns(limit);
    const campaignsWithInsights: FacebookCampaign[] = [];

    for (const campaign of campaigns) {
      try {
        const insights = await this.getCampaignInsights(campaign.id, dateRange);
        campaignsWithInsights.push({
          ...campaign,
          insights
        });
      } catch (error) {
        console.error(`Error fetching insights for campaign ${campaign.id}:`, error);
        campaignsWithInsights.push(campaign);
      }
    }

    return campaignsWithInsights;
  }

  /**
   * Haal campaign insights op
   */
  async getCampaignInsights(
    campaignId: string,
    dateRange: { start: string; end: string }
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/${campaignId}/insights?fields=impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions&time_range={"since":"${dateRange.start}","until":"${dateRange.end}"}&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data?.[0] || {};
  }

  /**
   * Haal ad sets op voor een campagne
   */
  async getAdSets(campaignId: string, limit: number = 100): Promise<FacebookAdSet[]> {
    const response = await fetch(
      `${this.baseUrl}/${campaignId}/adsets?fields=id,name,status,daily_budget,lifetime_budget,budget_remaining,billing_event,optimization_goal,targeting,created_time,updated_time,start_time,end_time&limit=${limit}&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Haal ads op voor een ad set
   */
  async getAds(adSetId: string, limit: number = 100): Promise<FacebookAd[]> {
    const response = await fetch(
      `${this.baseUrl}/${adSetId}/ads?fields=id,name,status,creative{id,title,body,image_url,video_id,link_url,call_to_action_type},created_time,updated_time&limit=${limit}&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Haal ad insights op
   */
  async getAdInsights(
    adId: string,
    dateRange: { start: string; end: string }
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/${adId}/insights?fields=impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions&time_range={"since":"${dateRange.start}","until":"${dateRange.end}"}&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data?.[0] || {};
  }

  /**
   * Haal account insights op
   */
  async getAccountInsights(dateRange: { start: string; end: string }): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/${this.adAccountId}/insights?fields=impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions&time_range={"since":"${dateRange.start}","until":"${dateRange.end}"}&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data?.[0] || {};
  }

  /**
   * Maak een nieuwe campagne aan
   */
  async createCampaign(campaignData: {
    name: string;
    objective: string;
    status: string;
    special_ad_categories?: string[];
    daily_budget?: number;
    lifetime_budget?: number;
  }): Promise<FacebookCampaign> {
    const response = await fetch(
      `${this.baseUrl}/${this.adAccountId}/campaigns?access_token=${this.accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      }
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update een campagne
   */
  async updateCampaign(
    campaignId: string,
    updates: Partial<FacebookCampaign>
  ): Promise<FacebookCampaign> {
    const response = await fetch(
      `${this.baseUrl}/${campaignId}?access_token=${this.accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Pause/Resume een campagne
   */
  async toggleCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED'): Promise<FacebookCampaign> {
    return this.updateCampaign(campaignId, { status });
  }

  /**
   * Haal alle data op voor het marketing dashboard
   */
  async getDashboardData(dateRange: { start: string; end: string }) {
    try {
      // Test connection first
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Facebook Ad Manager connection failed');
      }

      // Get account info
      const account = await this.getAdAccount();
      
      // Get campaigns with insights
      const campaigns = await this.getCampaignsWithInsights(dateRange);
      
      // Get account insights
      const accountInsights = await this.getAccountInsights(dateRange);

      // Calculate totals
      const totalImpressions = campaigns.reduce((sum, campaign) => 
        sum + (campaign.insights?.impressions || 0), 0
      );
      const totalClicks = campaigns.reduce((sum, campaign) => 
        sum + (campaign.insights?.clicks || 0), 0
      );
      const totalSpent = campaigns.reduce((sum, campaign) => 
        sum + (campaign.insights?.spend || 0), 0
      );

      return {
        success: true,
        account,
        campaigns,
        insights: accountInsights,
        totals: {
          impressions: totalImpressions,
          clicks: totalClicks,
          spent: totalSpent,
          ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
          cpc: totalClicks > 0 ? totalSpent / totalClicks : 0,
          cpm: totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0,
        },
        dateRange
      };
    } catch (error) {
      console.error('Error fetching Facebook Ad Manager dashboard data:', error);
      throw error;
    }
  }
}

// Environment variables
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

// Export singleton instance
export const facebookAdManager = FACEBOOK_ACCESS_TOKEN && FACEBOOK_AD_ACCOUNT_ID
  ? new FacebookAdManagerAPI(FACEBOOK_ACCESS_TOKEN, FACEBOOK_AD_ACCOUNT_ID, FACEBOOK_APP_SECRET)
  : null;

/**
 * Maak een Facebook Ad Manager instance met user credentials
 */
export function createFacebookAdManager(accessToken: string, adAccountId: string): FacebookAdManagerAPI {
  return new FacebookAdManagerAPI(accessToken, adAccountId, FACEBOOK_APP_SECRET);
}

export type { 
  FacebookCampaign, 
  FacebookAdSet, 
  FacebookAd, 
  FacebookAdAccount 
};
