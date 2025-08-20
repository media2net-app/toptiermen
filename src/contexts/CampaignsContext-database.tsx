'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setDbItem, getDbItem, removeDbItem, clearDbStorage, migrateFromLocalStorage } from '@/lib/database-storage';

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
  syncStatus: 'synced' | 'syncing' | 'error';
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

const STORAGE_KEY = 'campaigns';
const SYNC_DELAY = 1000; // 1 second delay for sync

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);

  // Load campaigns from database storage on mount
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setError(null);
        setLoading(true);

        // First, try to migrate from localStorage if needed
        await migrateFromLocalStorage('campaigns', STORAGE_KEY);

        // Load from database
        const savedCampaigns = await getDbItem<Campaign[]>(STORAGE_KEY);
        
        if (savedCampaigns && Array.isArray(savedCampaigns)) {
          setCampaigns(savedCampaigns);
          console.log('📦 Loaded campaigns from database storage:', savedCampaigns.length);
        } else {
          console.log('📦 No saved campaigns found, starting with empty array');
          setCampaigns([]);
        }
      } catch (error) {
        console.error('❌ Error loading campaigns from database:', error);
        setError('Failed to load campaigns from database');
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  // Sync campaigns to database with debouncing
  const syncCampaigns = async (newCampaigns: Campaign[]) => {
    const now = Date.now();
    
    // Only sync if enough time has passed since last sync
    if (now - lastSyncTime < SYNC_DELAY) {
      return;
    }

    try {
      setSyncStatus('syncing');
      const success = await setDbItem(STORAGE_KEY, newCampaigns, {
        expiresIn: 30 * 24 * 60 * 60 // 30 days
      });
      
      if (success) {
        setLastSyncTime(now);
        setSyncStatus('synced');
        console.log('💾 Campaigns synced to database:', newCampaigns.length);
      } else {
        setSyncStatus('error');
        console.warn('⚠️ Failed to sync campaigns to database');
        setError('Failed to sync campaigns');
      }
    } catch (error) {
      console.error('❌ Error syncing campaigns:', error);
      setSyncStatus('error');
      setError('Failed to sync campaigns');
    }
  };

  // Debounced sync effect
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        syncCampaigns(campaigns);
      }, SYNC_DELAY);

      return () => clearTimeout(timeoutId);
    }
  }, [campaigns, loading]);

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

  // Force sync function for manual sync
  const forceSync = async () => {
    await syncCampaigns(campaigns);
  };

  return (
    <CampaignsContext.Provider value={{
      campaigns,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      getCampaignsByVideo,
      loading,
      error,
      syncStatus
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

      {/* Sync status indicator */}
      {syncStatus === 'syncing' && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Syncing...</span>
          </div>
        </div>
      )}

      {syncStatus === 'error' && (
        <div className="fixed bottom-4 left-4 bg-yellow-600 text-white p-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <span className="text-sm mr-2">Sync failed</span>
            <button 
              onClick={forceSync}
              className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30"
            >
              Retry
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

// Migration utility to move from localStorage to database storage
export const migrateAllCampaignsToDatabase = async (): Promise<{
  success: boolean;
  migratedCount: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    // Migrate campaigns
    const campaignsMigrated = await migrateFromLocalStorage('campaigns', STORAGE_KEY);
    if (campaignsMigrated) migratedCount++;

    // Migrate other related data
    const relatedKeys = [
      'campaign_drafts',
      'campaign_templates',
      'campaign_analytics'
    ];

    for (const key of relatedKeys) {
      try {
        const migrated = await migrateFromLocalStorage(key, key);
        if (migrated) migratedCount++;
      } catch (error) {
        errors.push(`Failed to migrate ${key}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors
    };
  } catch (error) {
    errors.push(`Migration failed: ${error}`);
    return {
      success: false,
      migratedCount,
      errors
    };
  }
};
