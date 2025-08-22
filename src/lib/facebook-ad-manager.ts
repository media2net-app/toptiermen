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
  billing_event: string;
  optimization_goal: string;
  targeting: {
    age_min: number;
    age_max: number;
    genders: string[];
    geo_locations: {
      countries: string[];
      cities?: Array<{ key: string; name: string; region: string; country: string }>;
    };
    interests?: Array<{ id: string; name: string }>;
    behaviors?: Array<{ id: string; name: string }>;
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
  business_name?: string;
  business_id?: string;
}

interface CreateCampaignData {
    name: string;
  objective: 'AWARENESS' | 'CONSIDERATION' | 'CONVERSIONS' | 'ENGAGEMENT' | 'LEADS' | 'SALES' | 'TRAFFIC';
  status: 'ACTIVE' | 'PAUSED';
  daily_budget?: number;
  lifetime_budget?: number;
  special_ad_categories?: string[];
  targeting: {
    age_min: number;
    age_max: number;
    genders: string[];
    locations: string[];
    interests?: string[];
    behaviors?: string[];
  };
  video_url?: string;
  video_name?: string;
}

class FacebookAdManagerAPI {
  private accessToken: string;
  private adAccountId: string;
  private baseUrl: string = 'https://graph.facebook.com/v18.0';

  constructor(accessToken: string, adAccountId: string) {
    this.accessToken = accessToken;
    this.adAccountId = adAccountId;
  }

  /**
   * Test de verbinding met Facebook API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/me?access_token=${this.accessToken}`);
      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error('Facebook API connection test failed:', error);
      return false;
    }
  }

  /**
   * Haal server-side token op (voor betere beveiliging)
   */
  private async getServerSideToken(): Promise<string> {
    // Voor nu gebruiken we de client token, maar in productie zou je server-side token exchange doen
    return this.accessToken;
  }

  /**
   * Haal ad account informatie op
   */
  async getAdAccount(): Promise<FacebookAdAccount> {
    const serverToken = await this.getServerSideToken();
    const response = await fetch(
      `${this.baseUrl}/${this.adAccountId}?fields=id,name,account_status,currency,timezone_name,business_name,business_id&access_token=${serverToken}`
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
    const serverToken = await this.getServerSideToken();
    const response = await fetch(
      `${this.baseUrl}/${this.adAccountId}/campaigns?fields=id,name,status,objective,special_ad_categories,created_time,updated_time,start_time,stop_time,daily_budget,lifetime_budget,budget_remaining,spend_cap,insights{impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions}&limit=${limit}&access_token=${serverToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Maak een nieuwe campagne aan
   */
  async createCampaign(campaignData: CreateCampaignData): Promise<FacebookCampaign> {
    const serverToken = await this.getServerSideToken();
    
    // 1. Maak de campagne aan
    const campaignPayload = {
      name: campaignData.name,
      objective: campaignData.objective,
      status: campaignData.status,
      special_ad_categories: campaignData.special_ad_categories || [],
      ...(campaignData.daily_budget && { daily_budget: campaignData.daily_budget * 100 }), // Convert to cents
      ...(campaignData.lifetime_budget && { lifetime_budget: campaignData.lifetime_budget * 100 })
    };

    const campaignResponse = await fetch(
      `${this.baseUrl}/${this.adAccountId}/campaigns?access_token=${serverToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignPayload)
      }
    );

    if (!campaignResponse.ok) {
      const errorData = await campaignResponse.json();
      throw new Error(`Campaign creation failed: ${JSON.stringify(errorData)}`);
    }

    const campaign = await campaignResponse.json();

    // 2. Upload video als die er is
    let videoId: string | undefined;
    if (campaignData.video_url) {
      videoId = await this.uploadVideo(campaignData.video_url, campaignData.video_name || 'Ad Video');
    }

    // 3. Maak ad set aan
    const adSetPayload = {
      name: `${campaignData.name} - Ad Set`,
      campaign_id: campaign.id,
      daily_budget: campaignData.daily_budget ? campaignData.daily_budget * 100 : undefined,
      billing_event: 'IMPRESSIONS',
      optimization_goal: this.getOptimizationGoal(campaignData.objective),
      targeting: {
        age_min: campaignData.targeting.age_min,
        age_max: campaignData.targeting.age_max,
        genders: campaignData.targeting.genders,
        geo_locations: {
          countries: campaignData.targeting.locations
        },
        ...(campaignData.targeting.interests && { interests: campaignData.targeting.interests.map(id => ({ id })) }),
        ...(campaignData.targeting.behaviors && { behaviors: campaignData.targeting.behaviors.map(id => ({ id })) })
      },
      status: 'ACTIVE'
    };

    const adSetResponse = await fetch(
      `${this.baseUrl}/${this.adAccountId}/adsets?access_token=${serverToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adSetPayload)
      }
    );

    if (!adSetResponse.ok) {
      const errorData = await adSetResponse.json();
      throw new Error(`Ad Set creation failed: ${JSON.stringify(errorData)}`);
    }

    const adSet = await adSetResponse.json();

    // 4. Maak ad aan
    const adPayload = {
      name: `${campaignData.name} - Ad`,
      adset_id: adSet.id,
      creative: {
        ...(videoId && { video_id: videoId }),
        link_url: 'https://platform.toptiermen.eu',
        call_to_action_type: 'LEARN_MORE'
      },
      status: 'ACTIVE'
    };

    const adResponse = await fetch(
      `${this.baseUrl}/${this.adAccountId}/ads?access_token=${serverToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adPayload)
      }
    );

    if (!adResponse.ok) {
      const errorData = await adResponse.json();
      throw new Error(`Ad creation failed: ${JSON.stringify(errorData)}`);
    }

    return campaign;
  }

  /**
   * Upload video naar Facebook
   */
  private async uploadVideo(videoUrl: string, videoName: string): Promise<string> {
    const serverToken = await this.getServerSideToken();
    
    // 1. Maak video container aan
    const containerResponse = await fetch(
      `${this.baseUrl}/${this.adAccountId}/advideos?access_token=${serverToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: videoName,
          file_url: videoUrl
        })
      }
    );

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json();
      throw new Error(`Video upload failed: ${JSON.stringify(errorData)}`);
    }

    const videoData = await containerResponse.json();
    return videoData.id;
  }

  /**
   * Bepaal optimization goal op basis van objective
   */
  private getOptimizationGoal(objective: string): string {
    switch (objective) {
      case 'AWARENESS':
        return 'REACH';
      case 'CONSIDERATION':
        return 'LINK_CLICKS';
      case 'CONVERSIONS':
        return 'OFFSITE_CONVERSIONS';
      case 'ENGAGEMENT':
        return 'POST_ENGAGEMENT';
      case 'LEADS':
        return 'LEAD_GENERATION';
      case 'SALES':
        return 'OFFSITE_CONVERSIONS';
      case 'TRAFFIC':
        return 'LINK_CLICKS';
      default:
        return 'LINK_CLICKS';
    }
  }

  /**
   * Update campagne status
   */
  async updateCampaign(campaignId: string, updates: Partial<FacebookCampaign>): Promise<FacebookCampaign> {
    const serverToken = await this.getServerSideToken();
    const response = await fetch(
      `${this.baseUrl}/${campaignId}?access_token=${serverToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Campaign update failed: ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  /**
   * Toggle campagne status
   */
  async toggleCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED'): Promise<FacebookCampaign> {
    return this.updateCampaign(campaignId, { status });
  }
}

// Singleton instance
let facebookAdManager: FacebookAdManagerAPI | null = null;

export function initializeFacebookAdManager(accessToken: string, adAccountId: string): FacebookAdManagerAPI {
  if (!facebookAdManager) {
    facebookAdManager = new FacebookAdManagerAPI(accessToken, adAccountId);
  }
  return facebookAdManager;
}

export function getFacebookAdManager(): FacebookAdManagerAPI | null {
  return facebookAdManager;
}

export type { 
  FacebookCampaign, 
  FacebookAdSet, 
  FacebookAd, 
  FacebookAdAccount,
  CreateCampaignData
};
