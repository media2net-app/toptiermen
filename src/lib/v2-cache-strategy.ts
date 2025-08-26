// V2.0: Intelligent Cache Strategy System
import React from 'react';
import { useV2State } from '@/contexts/V2StateContext';

// V2.0: Cache strategy types
export type CacheStrategy = 
  | 'memory'      // In-memory cache (fastest, lost on refresh)
  | 'session'     // Session storage (persists during session)
  | 'local'       // Local storage (persists across sessions)
  | 'network'     // Network cache (HTTP cache headers)
  | 'hybrid';     // Combination of strategies

// V2.0: Cache entry interface
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  strategy: CacheStrategy;
  version: string;
  etag?: string;
  lastModified?: string;
}

// V2.0: Cache configuration
export interface CacheConfig {
  strategy: CacheStrategy;
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  version?: string; // Cache version for invalidation
  staleWhileRevalidate?: number; // Time to serve stale data while revalidating
}

// V2.0: Default cache configurations
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // User data - short TTL, memory strategy
  'user-profile': {
    strategy: 'memory',
    ttl: 2 * 60 * 1000, // 2 minutes
    maxSize: 1,
  },
  
  // UI state - long TTL, local storage
  'ui-preferences': {
    strategy: 'local',
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 10,
  },
  
  // Static content - long TTL, hybrid strategy
  'static-content': {
    strategy: 'hybrid',
    ttl: 60 * 60 * 1000, // 1 hour
    maxSize: 100,
    staleWhileRevalidate: 5 * 60 * 1000, // 5 minutes
  },
  
  // API responses - medium TTL, memory strategy
  'api-response': {
    strategy: 'memory',
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 50,
  },
  
  // Navigation data - short TTL, session strategy
  'navigation': {
    strategy: 'session',
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 20,
  },
  
  // Form data - medium TTL, session strategy
  'form-data': {
    strategy: 'session',
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 10,
  },
  
  // Search results - short TTL, memory strategy
  'search-results': {
    strategy: 'memory',
    ttl: 2 * 60 * 1000, // 2 minutes
    maxSize: 20,
  },
  
  // Analytics data - long TTL, local strategy
  'analytics': {
    strategy: 'local',
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxSize: 100,
  },
};

// V2.0: Cache manager class
export class V2CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private configs: Record<string, CacheConfig>;
  
  constructor(configs: Record<string, CacheConfig> = CACHE_CONFIGS) {
    this.configs = configs;
    // Only cleanup on client side
    if (typeof window !== 'undefined') {
      this.cleanupExpiredEntries();
    }
  }
  
  // V2.0: Set cache entry
  async set<T>(key: string, data: T, configKey?: string): Promise<void> {
    const config = configKey ? this.configs[configKey] : this.configs['api-response'];
    if (!config) {
      throw new Error(`V2.0: No cache config found for key: ${configKey}`);
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      strategy: config.strategy,
      version: config.version || '2.0',
    };
    
    // Store based on strategy
    switch (config.strategy) {
      case 'memory':
        this.setMemoryCache(key, entry, config.maxSize);
        break;
        
      case 'session':
        this.setSessionCache(key, entry);
        break;
        
      case 'local':
        this.setLocalCache(key, entry);
        break;
        
      case 'hybrid':
        this.setMemoryCache(key, entry, config.maxSize);
        this.setLocalCache(key, entry);
        break;
        
      default:
        this.setMemoryCache(key, entry, config.maxSize);
    }
  }
  
  // V2.0: Get cache entry
  async get<T>(key: string, configKey?: string): Promise<T | null> {
    const config = configKey ? this.configs[configKey] : this.configs['api-response'];
    if (!config) {
      return null;
    }
    
    let entry: CacheEntry<T> | null = null;
    
    // Try to get from cache based on strategy
    switch (config.strategy) {
      case 'memory':
        entry = this.getMemoryCache<T>(key);
        break;
        
      case 'session':
        entry = this.getSessionCache<T>(key);
        break;
        
      case 'local':
        entry = this.getLocalCache<T>(key);
        break;
        
      case 'hybrid':
        entry = this.getMemoryCache<T>(key) || this.getLocalCache<T>(key);
        break;
        
      default:
        entry = this.getMemoryCache<T>(key);
    }
    
    if (!entry) {
      return null;
    }
    
    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.delete(key, configKey);
      return null;
    }
    
    // Check version compatibility
    if (entry.version !== config.version && config.version) {
      this.delete(key, configKey);
      return null;
    }
    
    return entry.data;
  }
  
  // V2.0: Delete cache entry
  async delete(key: string, configKey?: string): Promise<void> {
    const config = configKey ? this.configs[configKey] : this.configs['api-response'];
    if (!config) {
      return;
    }
    
    switch (config.strategy) {
      case 'memory':
        this.memoryCache.delete(key);
        break;
        
      case 'session':
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(`v2-cache-${key}`);
        }
        break;
        
      case 'local':
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`v2-cache-${key}`);
        }
        break;
        
      case 'hybrid':
        this.memoryCache.delete(key);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(`v2-cache-${key}`);
          localStorage.removeItem(`v2-cache-${key}`);
        }
        break;
    }
  }
  
  // V2.0: Clear all cache
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    if (typeof window === 'undefined') return;
    
    // Clear session storage cache
    const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('v2-cache-'));
    sessionKeys.forEach(key => sessionStorage.removeItem(key));
    
    // Clear local storage cache
    const localKeys = Object.keys(localStorage).filter(key => key.startsWith('v2-cache-'));
    localKeys.forEach(key => localStorage.removeItem(key));
  }
  
  // V2.0: Clear cache by pattern
  async clearPattern(pattern: string): Promise<void> {
    // Clear memory cache
    const memoryKeys = Array.from(this.memoryCache.keys()).filter(key => key.includes(pattern));
    memoryKeys.forEach(key => this.memoryCache.delete(key));
    
    if (typeof window === 'undefined') return;
    
    // Clear session storage
    const sessionKeys = Object.keys(sessionStorage).filter(key => 
      key.startsWith('v2-cache-') && key.includes(pattern)
    );
    sessionKeys.forEach(key => sessionStorage.removeItem(key));
    
    // Clear local storage
    const localKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('v2-cache-') && key.includes(pattern)
    );
    localKeys.forEach(key => localStorage.removeItem(key));
  }
  
  // V2.0: Get cache statistics
  getStats(): {
    memorySize: number;
    sessionSize: number;
    localSize: number;
    totalEntries: number;
  } {
    if (typeof window === 'undefined') {
      return {
        memorySize: this.memoryCache.size,
        sessionSize: 0,
        localSize: 0,
        totalEntries: this.memoryCache.size,
      };
    }
    
    const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('v2-cache-'));
    const localKeys = Object.keys(localStorage).filter(key => key.startsWith('v2-cache-'));
    
    return {
      memorySize: this.memoryCache.size,
      sessionSize: sessionKeys.length,
      localSize: localKeys.length,
      totalEntries: this.memoryCache.size + sessionKeys.length + localKeys.length,
    };
  }
  
  // V2.0: Private methods
  private setMemoryCache<T>(key: string, entry: CacheEntry<T>, maxSize?: number): void {
    if (maxSize && this.memoryCache.size >= maxSize) {
      // Remove oldest entry
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
    this.memoryCache.set(key, entry);
  }
  
  private setSessionCache<T>(key: string, entry: CacheEntry<T>): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(`v2-cache-${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('V2.0: Error setting session cache:', error);
    }
  }
  
  private setLocalCache<T>(key: string, entry: CacheEntry<T>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`v2-cache-${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('V2.0: Error setting local cache:', error);
    }
  }
  
  private getMemoryCache<T>(key: string): CacheEntry<T> | null {
    return this.memoryCache.get(key) as CacheEntry<T> | null;
  }
  
  private getSessionCache<T>(key: string): CacheEntry<T> | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = sessionStorage.getItem(`v2-cache-${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('V2.0: Error getting session cache:', error);
      return null;
    }
  }
  
  private getLocalCache<T>(key: string): CacheEntry<T> | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(`v2-cache-${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('V2.0: Error getting local cache:', error);
      return null;
    }
  }
  
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
  
  private cleanupExpiredEntries(): void {
    // Clean up memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }
    
    if (typeof window === 'undefined') return;
    
    // Clean up session storage
    const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('v2-cache-'));
    sessionKeys.forEach(key => {
      try {
        const entry = JSON.parse(sessionStorage.getItem(key)!);
        if (this.isExpired(entry)) {
          sessionStorage.removeItem(key);
        }
      } catch (error) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clean up local storage
    const localKeys = Object.keys(localStorage).filter(key => key.startsWith('v2-cache-'));
    localKeys.forEach(key => {
      try {
        const entry = JSON.parse(localStorage.getItem(key)!);
        if (this.isExpired(entry)) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        localStorage.removeItem(key);
      }
    });
  }
}

// V2.0: Global cache manager instance
export const v2CacheManager = new V2CacheManager();

// V2.0: React hook for cache management
export function useV2Cache() {
  const { setCacheData, getCacheData, clearCacheData, clearAllCache } = useV2State();
  
  return {
    // V2.0: Set cache with strategy
    set: async <T>(key: string, data: T, configKey?: string): Promise<void> => {
      await v2CacheManager.set(key, data, configKey);
      setCacheData(key, data, configKey ? CACHE_CONFIGS[configKey]?.ttl : undefined);
    },
    
    // V2.0: Get cache with strategy
    get: async <T>(key: string, configKey?: string): Promise<T | null> => {
      const cacheData = await v2CacheManager.get<T>(key, configKey);
      if (cacheData) {
        setCacheData(key, cacheData, configKey ? CACHE_CONFIGS[configKey]?.ttl : undefined);
      }
      return cacheData;
    },
    
    // V2.0: Delete cache
    delete: async (key: string, configKey?: string): Promise<void> => {
      await v2CacheManager.delete(key, configKey);
      clearCacheData(key);
    },
    
    // V2.0: Clear all cache
    clear: async (): Promise<void> => {
      await v2CacheManager.clear();
      clearAllCache();
    },
    
    // V2.0: Clear cache by pattern
    clearPattern: async (pattern: string): Promise<void> => {
      await v2CacheManager.clearPattern(pattern);
    },
    
    // V2.0: Get cache statistics
    getStats: (): ReturnType<typeof v2CacheManager.getStats> => {
      return v2CacheManager.getStats();
    },
  };
}

// V2.0: Cache-aware data fetching hook
export function useV2CachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  configKey?: string,
  dependencies: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const { get, set } = useV2Cache();
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get from cache first
      const cachedData = await get<T>(key, configKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }
      
      // Fetch fresh data
      const freshData = await fetcher();
      await set(key, freshData, configKey);
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [key, configKey, fetcher, get, set]);
  
  React.useEffect(() => {
    fetchData();
  }, dependencies);
  
  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
