// Complete Facebook Ads API Integration
// Voor Rick's Facebook Ad Account met alle benodigde velden

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
  insights?: CampaignInsights;
}

interface CampaignInsights {
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
  targeting: TargetingSpec;
  created_time: string;
  updated_time: string;
  insights?: CampaignInsights;
}

interface TargetingSpec {
  age_min: number;
  age_max: number;
  genders: string[];
  geo_locations: {
    countries: string[];
    cities?: Array<{ key: string; name: string; region: string; country: string }>;
    regions?: Array<{ key: string; name: string; country: string }>;
  };
  interests?: Array<{ id: string; name: string }>;
  behaviors?: Array<{ id: string; name: string }>;
  demographics?: {
    education_statuses?: string[];
    relationship_statuses?: string[];
    life_events?: Array<{ id: string; name: string }>;
  };
  exclusions?: {
    interests?: Array<{ id: string; name: string }>;
    behaviors?: Array<{ id: string; name: string }>;
  };
  custom_audiences?: Array<{ id: string; name: string }>;
  lookalike_audiences?: Array<{ id: string; name: string }>;
  languages?: string[];
  place_page_ids?: string[];
  radius?: number;
  location_types?: string[];
}

interface FacebookAd {
  id: string;
  name: string;
  adset_id: string;
  campaign_id: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | 'PENDING_REVIEW' | 'DISAPPROVED';
  creative: AdCreative;
  created_time: string;
  updated_time: string;
  insights?: CampaignInsights;
}

interface AdCreative {
  id: string;
  title?: string;
  body?: string;
  image_url?: string;
  video_id?: string;
  link_url?: string;
  call_to_action_type?: string;
  object_story_spec?: {
    page_id?: string;
    link_data?: {
      image_hash?: string;
      link?: string;
      message?: string;
      name?: string;
      description?: string;
      call_to_action?: {
        type: string;
        value?: {
          link?: string;
        };
      };
    };
  };
}

interface CreateCampaignData {
  name: string;
  objective: 'AWARENESS' | 'CONSIDERATION' | 'CONVERSIONS' | 'ENGAGEMENT' | 'LEADS' | 'SALES' | 'TRAFFIC';
  status: 'ACTIVE' | 'PAUSED';
  start_time?: string;
  stop_time?: string;
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
    demographics?: {
      education_statuses?: string[];
      relationship_statuses?: string[];
    };
    exclusions?: {
      interests?: string[];
      behaviors?: string[];
    };
    languages?: string[];
    radius?: number;
  };
  ad_creative: {
    title?: string;
    body?: string;
    link_url: string;
    call_to_action_type?: string;
  };
  video_url?: string;
  video_name?: string;
  page_id?: string;
}

interface CreateMultiAdSetCampaignData {
  name: string;
  objective: 'APP_INSTALLS' | 'BRAND_AWARENESS' | 'EVENT_RESPONSES' | 'LEAD_GENERATION' | 'LINK_CLICKS' | 'LOCAL_AWARENESS' | 'MESSAGES' | 'OFFER_CLAIMS' | 'PAGE_LIKES' | 'POST_ENGAGEMENT' | 'PRODUCT_CATALOG_SALES' | 'REACH' | 'STORE_VISITS' | 'VIDEO_VIEWS' | 'OUTCOME_AWARENESS' | 'OUTCOME_ENGAGEMENT' | 'OUTCOME_LEADS' | 'OUTCOME_SALES' | 'OUTCOME_TRAFFIC' | 'OUTCOME_APP_PROMOTION' | 'CONVERSIONS';
  status: 'ACTIVE' | 'PAUSED';
  start_time?: string;
  stop_time?: string;
  campaign_daily_budget?: number;
  lifetime_budget?: number;
  special_ad_categories?: string[];
  ad_account_id?: string;
  ad_sets: Array<{
    name: string;
    daily_budget: number;
    targeting: {
      age_min: number;
      age_max: number;
      genders: string[];
      locations: string[];
      interests?: string[];
      behaviors?: string[];
      demographics?: {
        education_statuses?: string[];
        relationship_statuses?: string[];
      };
      exclusions?: {
        interests?: string[];
        behaviors?: string[];
      };
      languages?: string[];
      radius?: number;
    };
    ad_creative: {
      title?: string;
      body?: string;
      link_url: string;
      call_to_action_type?: string;
    };
    video_url?: string;
    video_name?: string;
  }>;
  page_id?: string;
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

interface Interest {
  id: string;
  name: string;
  audience_size: number;
  path: string[];
  topic?: string;
}

interface Behavior {
  id: string;
  name: string;
  audience_size: number;
  path: string[];
}

class FacebookAdManagerComplete {
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
   * Haal server-side token op
   */
  private async getServerSideToken(): Promise<string> {
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
   * Zoek interesses op basis van keyword
   */
  async searchInterests(query: string): Promise<Interest[]> {
    const serverToken = await this.getServerSideToken();
    const response = await fetch(
      `${this.baseUrl}/search?type=adinterest&q=${encodeURIComponent(query)}&limit=50&access_token=${serverToken}`
    );

    if (!response.ok) {
      throw new Error(`Interest search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Zoek behaviors op basis van keyword
   */
  async searchBehaviors(query: string): Promise<Behavior[]> {
    const serverToken = await this.getServerSideToken();
    const response = await fetch(
      `${this.baseUrl}/search?type=adbehavior&q=${encodeURIComponent(query)}&limit=50&access_token=${serverToken}`
    );

    if (!response.ok) {
      throw new Error(`Behavior search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Maak een complete campagne aan met alle benodigde velden
   */
  async createCompleteCampaign(campaignData: CreateCampaignData): Promise<{
    campaign: FacebookCampaign;
    adSet: FacebookAdSet;
    ad: FacebookAd;
  }> {
    const serverToken = await this.getServerSideToken();
    
    console.log('🚀 Creating complete Facebook campaign...');
    
    // 1. Maak de campagne aan
    const campaignPayload = {
      name: campaignData.name,
      objective: campaignData.objective,
      status: campaignData.status,
      special_ad_categories: campaignData.special_ad_categories || [],
      ...(campaignData.start_time && { start_time: campaignData.start_time }),
      ...(campaignData.stop_time && { stop_time: campaignData.stop_time }),
      ...(campaignData.daily_budget && { daily_budget: campaignData.daily_budget * 100 }), // Convert to cents
      ...(campaignData.lifetime_budget && { lifetime_budget: campaignData.lifetime_budget * 100 })
    };

    console.log('📋 Creating campaign with payload:', campaignPayload);

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
    console.log('✅ Campaign created:', campaign.id);

    // 2. Upload video als die er is
    let videoId: string | undefined;
    if (campaignData.video_url) {
      console.log('🎥 Uploading video...');
      videoId = await this.uploadVideo(campaignData.video_url, campaignData.video_name || 'Ad Video');
      console.log('✅ Video uploaded:', videoId);
    }

    // 3. Maak ad set aan met uitgebreide targeting
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
        ...(campaignData.targeting.interests && { 
          interests: campaignData.targeting.interests.map(id => ({ id })) 
        }),
        ...(campaignData.targeting.behaviors && { 
          behaviors: campaignData.targeting.behaviors.map(id => ({ id })) 
        }),
        ...(campaignData.targeting.demographics && {
          demographics: campaignData.targeting.demographics
        }),
        ...(campaignData.targeting.exclusions && {
          exclusions: campaignData.targeting.exclusions
        }),
        ...(campaignData.targeting.languages && {
          languages: campaignData.targeting.languages
        }),
        ...(campaignData.targeting.radius && {
          radius: campaignData.targeting.radius
        })
      },
      status: 'ACTIVE'
    };

    console.log('🎯 Creating ad set with targeting:', adSetPayload.targeting);

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
    console.log('✅ Ad Set created:', adSet.id);

    // 4. Maak ad creative aan
    const creativePayload = {
      name: `${campaignData.name} - Creative`,
      object_story_spec: {
        ...(campaignData.page_id && { page_id: campaignData.page_id }),
        link_data: {
          ...(videoId && { video_id: videoId }),
          link: campaignData.ad_creative.link_url,
          message: campaignData.ad_creative.body,
          name: campaignData.ad_creative.title,
          call_to_action: {
            type: campaignData.ad_creative.call_to_action_type || 'LEARN_MORE',
            value: {
              link: campaignData.ad_creative.link_url
            }
          }
        }
      }
    };

    console.log('🎨 Creating ad creative...');

    const creativeResponse = await fetch(
      `${this.baseUrl}/${this.adAccountId}/adcreatives?access_token=${serverToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creativePayload)
      }
    );

    if (!creativeResponse.ok) {
      const errorData = await creativeResponse.json();
      throw new Error(`Ad Creative creation failed: ${JSON.stringify(errorData)}`);
    }

    const creative = await creativeResponse.json();
    console.log('✅ Ad Creative created:', creative.id);

    // 5. Maak ad aan
    const adPayload = {
      name: `${campaignData.name} - Ad`,
      adset_id: adSet.id,
      creative: {
        creative_id: creative.id
      },
      status: 'ACTIVE'
    };

    console.log('📢 Creating ad...');

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

    const ad = await adResponse.json();
    console.log('✅ Ad created:', ad.id);

    return { campaign, adSet, ad };
  }

  /**
   * Upload video naar Facebook
   */
  private async uploadVideo(videoUrl: string, videoName: string, adAccountId?: string): Promise<string> {
    const serverToken = await this.getServerSideToken();
    
    // Use provided ad account ID or fall back to default
    const targetAdAccountId = adAccountId || this.adAccountId;
    
    // 1. Maak video container aan
    const containerResponse = await fetch(
      `${this.baseUrl}/${targetAdAccountId}/advideos?access_token=${serverToken}`,
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
      case 'BRAND_AWARENESS':
        return 'REACH';
      case 'LINK_CLICKS':
        return 'LINK_CLICKS';
      case 'OUTCOME_TRAFFIC':
        return 'LINK_CLICKS';
      case 'POST_ENGAGEMENT':
        return 'POST_ENGAGEMENT';
      case 'LEAD_GENERATION':
        return 'LEAD_GENERATION';
      case 'CONVERSIONS':
        return 'OFFSITE_CONVERSIONS';
      case 'VIDEO_VIEWS':
        return 'VIDEO_VIEWS';
      case 'REACH':
        return 'REACH';
      case 'APP_INSTALLS':
        return 'APP_INSTALLS';
      case 'MESSAGES':
        return 'CONVERSATIONS';
      case 'PAGE_LIKES':
        return 'PAGE_LIKES';
      case 'EVENT_RESPONSES':
        return 'EVENT_RESPONSES';
      case 'OFFER_CLAIMS':
        return 'OFFER_CLAIMS';
      case 'STORE_VISITS':
        return 'STORE_VISITS';
      case 'PRODUCT_CATALOG_SALES':
        return 'OFFSITE_CONVERSIONS';
      case 'LOCAL_AWARENESS':
        return 'REACH';
      default:
        return 'LINK_CLICKS';
    }
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
   * Maak een campagne aan met meerdere ad sets
   */
  async createMultiAdSetCampaign(campaignData: CreateMultiAdSetCampaignData): Promise<{
    campaign: FacebookCampaign;
    adSets: FacebookAdSet[];
    ads: FacebookAd[];
  }> {
    const serverToken = await this.getServerSideToken();
    
    console.log('🚀 Creating Facebook campaign with multiple ad sets...');
    
    // Use provided ad account ID or fall back to default
    const adAccountId = campaignData.ad_account_id || this.adAccountId;
    console.log(`📊 Using Ad Account ID: ${adAccountId}`);
    
    // 1. Maak de campagne aan
    const campaignPayload = {
      name: campaignData.name,
      objective: campaignData.objective,
      status: campaignData.status,
      special_ad_categories: campaignData.special_ad_categories || [],
      ...(campaignData.start_time && { start_time: campaignData.start_time }),
      ...(campaignData.stop_time && { stop_time: campaignData.stop_time })
      // Removed campaign daily_budget and lifetime_budget - using ad set budgets instead
    };

    console.log('📋 Creating campaign with payload:', campaignPayload);

    const campaignResponse = await fetch(
      `${this.baseUrl}/${adAccountId}/campaigns?access_token=${serverToken}`,
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
    console.log('✅ Campaign created:', campaign.id);

    const adSets: FacebookAdSet[] = [];
    const ads: FacebookAd[] = [];

    // 2. Maak ad sets en ads aan voor elke ad set configuratie
    for (let i = 0; i < campaignData.ad_sets.length; i++) {
      const adSetConfig = campaignData.ad_sets[i];
      
      console.log(`🎯 Creating ad set ${i + 1}/${campaignData.ad_sets.length}: ${adSetConfig.name}`);

      // Upload video als die er is
      let videoId: string | undefined;
      if (adSetConfig.video_url) {
        console.log('🎥 Uploading video...');
        videoId = await this.uploadVideo(adSetConfig.video_url, adSetConfig.video_name || 'Ad Video', adAccountId);
        console.log('✅ Video uploaded:', videoId);
      }

      // Maak ad set aan
      const adSetPayload = {
        name: adSetConfig.name,
        campaign_id: campaign.id,
        daily_budget: adSetConfig.daily_budget * 100,
        billing_event: 'IMPRESSIONS',
        optimization_goal: this.getOptimizationGoal(campaignData.objective),
        bid_amount: Math.floor(adSetConfig.daily_budget * 50), // €0.50 per click (50 cents)
        dsa_beneficiary: 'Top Tier Men', // DSA beneficiary requirement
        dsa_payor: 'Top Tier Men', // DSA payor requirement
        targeting: {
          age_min: adSetConfig.targeting.age_min,
          age_max: adSetConfig.targeting.age_max,
          genders: adSetConfig.targeting.genders.map(gender => {
            if (gender === 'all') return 0;
            if (gender === 'men') return 1;
            if (gender === 'women') return 2;
            return 0; // default to all
          }),
          geo_locations: {
            countries: adSetConfig.targeting.locations
          },
          ...(adSetConfig.targeting.interests && { 
            interests: adSetConfig.targeting.interests.map(id => ({ id })) 
          }),
          ...(adSetConfig.targeting.behaviors && { 
            behaviors: adSetConfig.targeting.behaviors.map(id => ({ id })) 
          }),
          ...(adSetConfig.targeting.demographics && {
            demographics: adSetConfig.targeting.demographics
          }),
          ...(adSetConfig.targeting.exclusions && {
            exclusions: adSetConfig.targeting.exclusions
          }),
          ...(adSetConfig.targeting.languages && {
            languages: adSetConfig.targeting.languages
          }),
          ...(adSetConfig.targeting.radius && {
            radius: adSetConfig.targeting.radius
          }),
          targeting_automation: {
            advantage_audience: 0 // Disable Advantage Audience
          }
        },
        status: 'ACTIVE'
      };

      const adSetResponse = await fetch(
        `${this.baseUrl}/${adAccountId}/adsets?access_token=${serverToken}`,
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
      adSets.push(adSet);
      console.log('✅ Ad Set created:', adSet.id);

      // Maak ad creative aan met alleen Facebook pagina
      const creativePayload = {
        name: `${adSetConfig.name} - Creative`,
        object_story_spec: {
          page_id: '610571295471584', // Top Tier Men Facebook page
          link_data: {
            ...(videoId && { video_id: videoId }),
            link: adSetConfig.ad_creative.link_url,
            message: adSetConfig.ad_creative.body,
            name: adSetConfig.ad_creative.title,
            call_to_action: {
              type: adSetConfig.ad_creative.call_to_action_type || 'LEARN_MORE',
              value: {
                link: adSetConfig.ad_creative.link_url
              }
            }
          }
        }
      };

      const creativeResponse = await fetch(
        `${this.baseUrl}/${adAccountId}/adcreatives?access_token=${serverToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(creativePayload)
        }
      );

      if (!creativeResponse.ok) {
        const errorData = await creativeResponse.json();
        throw new Error(`Ad Creative creation failed: ${JSON.stringify(errorData)}`);
      }

      const creative = await creativeResponse.json();
      console.log('✅ Ad Creative created:', creative.id);

      // Maak ad aan
      const adPayload = {
        name: `${adSetConfig.name} - Ad`,
        adset_id: adSet.id,
        creative: {
          creative_id: creative.id
        },
        status: 'ACTIVE'
      };

      const adResponse = await fetch(
        `${this.baseUrl}/${adAccountId}/ads?access_token=${serverToken}`,
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

      const ad = await adResponse.json();
      ads.push(ad);
      console.log('✅ Ad created:', ad.id);

      // Wait a bit between ad sets to avoid rate limiting
      if (i < campaignData.ad_sets.length - 1) {
        console.log('⏳ Waiting 2 seconds before next ad set...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { campaign, adSets, ads };
  }

  /**
   * Toggle campagne status
   */
  async toggleCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED'): Promise<FacebookCampaign> {
    return this.updateCampaign(campaignId, { status });
  }
}

// Singleton instance
let facebookAdManagerComplete: FacebookAdManagerComplete | null = null;

export function initializeFacebookAdManagerComplete(accessToken: string, adAccountId: string): FacebookAdManagerComplete {
  if (!facebookAdManagerComplete) {
    facebookAdManagerComplete = new FacebookAdManagerComplete(accessToken, adAccountId);
  }
  return facebookAdManagerComplete;
}

export function getFacebookAdManagerComplete(): FacebookAdManagerComplete | null {
  return facebookAdManagerComplete;
}

export type {
  FacebookCampaign,
  FacebookAdSet,
  FacebookAd,
  FacebookAdAccount,
  CreateCampaignData,
  CreateMultiAdSetCampaignData,
  Interest,
  Behavior,
  TargetingSpec,
  AdCreative
};
