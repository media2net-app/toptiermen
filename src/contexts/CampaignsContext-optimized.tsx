'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setStorageItem, getStorageItem, removeStorageItem, flushStorage } from '@/lib/localStorage-optimized';

interface Campaign {
  id: string;
  name: string;
  videoId: string;
  videoName: string;
  objective: string;
  budget: {
    amount: number;
    currency: string;
    type: string;
  };
  targeting?: any;
  placements?: any;
  adFormat?: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
}

interface CampaignsContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  getCampaignsByVideo: (videoId: string) => Campaign[];
  loading: boolean;
  error: string | null;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

const STORAGE_KEY = 'ttm_campaigns';
const BATCH_UPDATE_DELAY = 500; // 500ms delay for batch updates

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);

  // Load campaigns from optimized storage on mount
  useEffect(() => {
    const loadCampaigns = () => {
      try {
        setError(null);
        const savedCampaigns = getStorageItem<Campaign[]>(STORAGE_KEY);
        
        if (savedCampaigns && Array.isArray(savedCampaigns)) {
          setCampaigns(savedCampaigns);
          console.log('📦 Loaded campaigns from optimized storage:', savedCampaigns.length);
        } else {
          console.log('📦 No saved campaigns found, starting with empty array');
          setCampaigns([]);
        }
      } catch (error) {
        console.error('❌ Error loading campaigns from storage:', error);
        setError('Failed to load campaigns from storage');
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  // Optimized save function with debouncing and batch operations
  const saveCampaigns = (newCampaigns: Campaign[]) => {
    const now = Date.now();
    
    // Only save if enough time has passed since last save (debouncing)
    if (now - lastSaveTime < BATCH_UPDATE_DELAY) {
      return;
    }

    try {
      const success = setStorageItem(STORAGE_KEY, newCampaigns, true); // Use batch mode
      
      if (success) {
        setLastSaveTime(now);
        console.log('💾 Campaigns saved to optimized storage:', newCampaigns.length);
      } else {
        console.warn('⚠️ Failed to save campaigns to storage');
        setError('Failed to save campaigns');
      }
    } catch (error) {
      console.error('❌ Error saving campaigns:', error);
      setError('Failed to save campaigns');
    }
  };

  // Debounced save effect
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        saveCampaigns(campaigns);
      }, BATCH_UPDATE_DELAY);

      return () => clearTimeout(timeoutId);
    }
  }, [campaigns, loading]);

  // Force save on unmount
  useEffect(() => {
    return () => {
      flushStorage(); // Ensure any pending batch operations are saved
    };
  }, []);

  const addCampaign = (campaign: Campaign) => {
    setCampaigns(prev => {
      const newCampaigns = [...prev, campaign];
      return newCampaigns;
    });
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === id 
          ? { 
              ...campaign, 
              ...updates, 
              lastUpdated: new Date().toISOString() 
            }
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

  // Clear error when user takes action
  const clearError = () => setError(null);

  return (
    <CampaignsContext.Provider value={{
      campaigns,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      getCampaignsByVideo,
      loading,
      error
    }}>
      {children}
      
      {/* Error display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={clearError}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
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

// Migration utility to move from old localStorage to optimized storage
export const migrateCampaignsToOptimizedStorage = () => {
  try {
    const oldCampaigns = localStorage.getItem('campaigns');
    if (oldCampaigns) {
      const success = setStorageItem(STORAGE_KEY, JSON.parse(oldCampaigns), false);
      if (success) {
        localStorage.removeItem('campaigns');
        console.log('✅ Migrated campaigns to optimized storage');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
};
