// Competitive Analysis Caching Layer
// Improves performance by caching competitor data and reducing API calls

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CompetitorCacheData {
  id: string;
  name: string;
  ads: any[];
  analysis: any;
  lastUpdated: string;
}

interface MarketCacheData {
  period: string;
  insights: any;
  trends: any[];
  lastUpdated: string;
}

class CompetitiveCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 30 * 60 * 1000; // 30 minutes
  private readonly shortTTL = 5 * 60 * 1000; // 5 minutes
  private readonly longTTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get cached data if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if data exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    this.cache.forEach(entry => {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get memory usage estimation
   */
  private getMemoryUsage(): number {
    let size = 0;
    this.cache.forEach((entry, key) => {
      size += key.length;
      size += JSON.stringify(entry.data).length;
    });
    return size;
  }

  // Specific cache methods for competitive analysis

  /**
   * Cache competitor data
   */
  setCompetitorData(competitorId: string, data: CompetitorCacheData): void {
    this.set(`competitor:${competitorId}`, data, this.defaultTTL);
  }

  /**
   * Get competitor data
   */
  getCompetitorData(competitorId: string): CompetitorCacheData | null {
    return this.get<CompetitorCacheData>(`competitor:${competitorId}`);
  }

  /**
   * Cache competitor ads
   */
  setCompetitorAds(competitorId: string, ads: any[]): void {
    this.set(`competitor:${competitorId}:ads`, ads, this.shortTTL);
  }

  /**
   * Get competitor ads
   */
  getCompetitorAds(competitorId: string): any[] | null {
    return this.get<any[]>(`competitor:${competitorId}:ads`);
  }

  /**
   * Cache market insights
   */
  setMarketInsights(period: string, insights: MarketCacheData): void {
    this.set(`market:${period}`, insights, this.longTTL);
  }

  /**
   * Get market insights
   */
  getMarketInsights(period: string): MarketCacheData | null {
    return this.get<MarketCacheData>(`market:${period}`);
  }

  /**
   * Cache Facebook ads data
   */
  setFacebookAds(competitorName: string, ads: any[]): void {
    this.set(`facebook:${competitorName}`, ads, this.shortTTL);
  }

  /**
   * Get Facebook ads data
   */
  getFacebookAds(competitorName: string): any[] | null {
    return this.get<any[]>(`facebook:${competitorName}`);
  }

  /**
   * Cache competitive analysis report
   */
  setReport(period: string, report: any): void {
    this.set(`report:${period}`, report, this.defaultTTL);
  }

  /**
   * Get competitive analysis report
   */
  getReport(period: string): any | null {
    return this.get<any>(`report:${period}`);
  }

  /**
   * Invalidate all competitor-related cache
   */
  invalidateCompetitor(competitorId: string): void {
    this.delete(`competitor:${competitorId}`);
    this.delete(`competitor:${competitorId}:ads`);
    this.delete(`facebook:${competitorId}`);
  }

  /**
   * Invalidate all cache for a specific period
   */
  invalidatePeriod(period: string): void {
    this.delete(`market:${period}`);
    this.delete(`report:${period}`);
  }
}

// Export singleton instance
export const competitiveCache = new CompetitiveCache();

// Cache keys constants
export const CACHE_KEYS = {
  COMPETITOR: (id: string) => `competitor:${id}`,
  COMPETITOR_ADS: (id: string) => `competitor:${id}:ads`,
  MARKET_INSIGHTS: (period: string) => `market:${period}`,
  FACEBOOK_ADS: (name: string) => `facebook:${name}`,
  REPORT: (period: string) => `report:${period}`,
  ALERTS: 'alerts',
  RULES: 'rules'
} as const;

// Cache utilities
export const cacheUtils = {
  /**
   * Generate cache key with parameters
   */
  generateKey: (prefix: string, ...params: any[]): string => {
    return `${prefix}:${params.join(':')}`;
  },

  /**
   * Check if cache should be refreshed based on last update
   */
  shouldRefresh: (lastUpdated: string, maxAge: number = 30 * 60 * 1000): boolean => {
    const lastUpdate = new Date(lastUpdated).getTime();
    const now = Date.now();
    return now - lastUpdate > maxAge;
  },

  /**
   * Get cache age in minutes
   */
  getCacheAge: (timestamp: number): number => {
    return Math.floor((Date.now() - timestamp) / (1000 * 60));
  },

  /**
   * Format cache age for display
   */
  formatCacheAge: (timestamp: number): string => {
    const age = cacheUtils.getCacheAge(timestamp);
    if (age < 1) return 'Just now';
    if (age < 60) return `${age}m ago`;
    if (age < 1440) return `${Math.floor(age / 60)}h ago`;
    return `${Math.floor(age / 1440)}d ago`;
  }
};

// Auto-cleanup every 5 minutes
setInterval(() => {
  const deleted = competitiveCache.cleanup();
  if (deleted > 0) {
    console.log(`Cleaned up ${deleted} expired cache entries`);
  }
}, 5 * 60 * 1000); 