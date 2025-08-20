'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Campaign {
  id: string;
  name: string;
  videoId: string;
  videoName: string;
  platform: string;
  status: 'active' | 'paused' | 'completed' | 'draft' | 'scheduled';
  objective: 'awareness' | 'traffic' | 'conversions' | 'engagement' | 'sales';
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  budget: number;
  dailyBudget: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roas: number;
  targetAudience: string;
  startDate: string;
  endDate: string;
  adsCount: number;
  createdAt: string;
  lastUpdated: string;
  targeting: {
    ageMin: number;
    ageMax: number;
    gender: 'ALL' | 'MEN' | 'WOMEN';
    locations: string[];
    languages: string[];
    interests: string[];
    behaviors: string[];
    exclusions: string[];
  };
  placements: {
    facebook: boolean;
    instagram: boolean;
    audienceNetwork: boolean;
    messenger: boolean;
  };
  adFormat: 'VIDEO' | 'CAROUSEL' | 'STORY';
}

interface CampaignsContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  getCampaignsByVideo: (videoId: string) => Campaign[];
  loading: boolean;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Load campaigns from localStorage on mount
  useEffect(() => {
    const savedCampaigns = localStorage.getItem('campaigns');
    if (savedCampaigns) {
      try {
        setCampaigns(JSON.parse(savedCampaigns));
      } catch (error) {
        console.error('Error loading campaigns from localStorage:', error);
      }
    }
    setLoading(false);
  }, []);

  // Save campaigns to localStorage whenever campaigns change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('campaigns', JSON.stringify(campaigns));
    }
  }, [campaigns, loading]);

  const addCampaign = (campaign: Campaign) => {
    setCampaigns(prev => [...prev, campaign]);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === id 
          ? { ...campaign, ...updates, lastUpdated: new Date().toISOString() }
          : campaign
      )
    );
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
  };

  const getCampaignsByVideo = (videoId: string) => {
    return campaigns.filter(campaign => campaign.videoId === videoId);
  };

  return (
    <CampaignsContext.Provider value={{
      campaigns,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      getCampaignsByVideo,
      loading
    }}>
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignsContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignsProvider');
  }
  return context;
}
