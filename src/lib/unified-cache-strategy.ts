// V1.2: Unified Cache Strategy
// Replaces complex Rick-specific cache logic with a consistent approach for all users

export interface CacheConfig {
  // Storage configuration
  storage: {
    type: 'database' | 'localStorage' | 'sessionStorage' | 'hybrid';
    maxSize: number; // in bytes
    ttl: number; // time to live in seconds
    compression: boolean;
  };
  
  // Cache invalidation
  invalidation: {
    strategy: 'time-based' | 'version-based' | 'event-based';
    version: string;
    events: string[];
  };
  
  // Performance settings
  performance: {
    batchSize: number;
    debounceMs: number;
    retryAttempts: number;
    retryDelay: number;
  };
  
  // User-specific overrides
  userOverrides: {
    [userId: string]: Partial<CacheConfig>;
  };
}

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  version: string;
  userId?: string;
  expiresAt?: number;
  size: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  errors: number;
}

class UnifiedCacheStrategy {
  private config: CacheConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0,
    evictions: 0,
    errors: 0
  };
  private batchQueue: Array<{ key: string; value: any; operation: 'set' | 'remove' }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      storage: {
        type: 'hybrid',
        maxSize: 10 * 1024 * 1024, // 10MB
        ttl: 3600, // 1 hour
        compression: true
      },
      invalidation: {
        strategy: 'version-based',
        version: '1.2.0',
        events: ['user-login', 'user-logout', 'data-update']
      },
      performance: {
        batchSize: 10,
        debounceMs: 100,
        retryAttempts: 3,
        retryDelay: 1000
      },
      userOverrides: {},
      ...config
    };
  }

  // Get current user ID
  private getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get from auth context or localStorage
    const authData = localStorage.getItem('supabase.auth.token');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        return parsed.currentSession?.user?.id || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  // Get user-specific config
  private getUserConfig(): CacheConfig {
    const userId = this.getCurrentUserId();
    if (userId && this.config.userOverrides[userId]) {
      return { ...this.config, ...this.config.userOverrides[userId] };
    }
    return this.config;
  }

  // Generate cache key
  private generateKey(key: string): string {
    const userId = this.getCurrentUserId();
    const version = this.config.invalidation.version;
    return `${version}:${userId || 'anonymous'}:${key}`;
  }

  // Compress data if enabled
  private compress(data: any): string {
    if (!this.config.storage.compression) {
      return JSON.stringify(data);
    }
    
    try {
      const jsonString = JSON.stringify(data);
      // Simple compression for now - can be enhanced with LZ-string or similar
      return btoa(jsonString);
    } catch {
      return JSON.stringify(data);
    }
  }

  // Decompress data if enabled
  private decompress(data: string): any {
    if (!this.config.storage.compression) {
      return JSON.parse(data);
    }
    
    try {
      // Try to decompress first
      const decompressed = atob(data);
      return JSON.parse(decompressed);
    } catch {
      // Fallback to regular JSON
      return JSON.parse(data);
    }
  }

  // Check if entry is expired
  private isExpired(entry: CacheEntry): boolean {
    if (!entry.expiresAt) return false;
    return Date.now() > entry.expiresAt;
  }

  // Calculate entry size
  private calculateSize(value: any): number {
    const jsonString = JSON.stringify(value);
    return new Blob([jsonString]).size;
  }

  // Evict entries if needed
  private evictIfNeeded(newSize: number): void {
    const userConfig = this.getUserConfig();
    const maxSize = userConfig.storage.maxSize;
    
    if (this.stats.totalSize + newSize <= maxSize) return;

    // Sort entries by timestamp (oldest first)
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Remove oldest entries until we have enough space
    for (const [key, entry] of entries) {
      this.cache.delete(key);
      this.stats.totalSize -= entry.size;
      this.stats.evictions++;
      
      if (this.stats.totalSize + newSize <= maxSize) break;
    }
  }

  // Batch operations
  private scheduleBatch(): void {
    if (this.batchTimeout) return;
    
    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.config.performance.debounceMs);
  }

  private async processBatch(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    if (batch.length === 0) return;

    const userConfig = this.getUserConfig();
    
    for (const { key, value, operation } of batch) {
      try {
        if (operation === 'set') {
          await this.setItemInternal(key, value);
        } else if (operation === 'remove') {
          await this.removeItemInternal(key);
        }
      } catch (error) {
        console.error('Batch operation failed:', error);
        this.stats.errors++;
      }
    }
  }

  // Internal set item
  private async setItemInternal(key: string, value: any): Promise<void> {
    const userConfig = this.getUserConfig();
    const cacheKey = this.generateKey(key);
    const compressedValue = this.compress(value);
    const size = this.calculateSize(value);
    
    // Evict if needed
    this.evictIfNeeded(size);
    
    const entry: CacheEntry = {
      key: cacheKey,
      value: compressedValue,
      timestamp: Date.now(),
      version: userConfig.invalidation.version,
      userId: this.getCurrentUserId() || undefined,
      expiresAt: Date.now() + (userConfig.storage.ttl * 1000),
      size
    };

    // Store in memory cache
    this.cache.set(cacheKey, entry);
    this.stats.totalEntries++;
    this.stats.totalSize += size;

    // Store in persistent storage based on config
    await this.storePersistent(cacheKey, entry);
  }

  // Internal remove item
  private async removeItemInternal(key: string): Promise<void> {
    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (entry) {
      this.cache.delete(cacheKey);
      this.stats.totalEntries--;
      this.stats.totalSize -= entry.size;
    }

    // Remove from persistent storage
    await this.removePersistent(cacheKey);
  }

  // Store in persistent storage
  private async storePersistent(key: string, entry: CacheEntry): Promise<void> {
    const userConfig = this.getUserConfig();
    
    try {
      switch (userConfig.storage.type) {
        case 'localStorage':
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(entry));
          }
          break;
          
        case 'sessionStorage':
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(key, JSON.stringify(entry));
          }
          break;
          
        case 'database':
          // Use database storage if available
          const { DatabaseStorage } = await import('./database-storage');
          const dbStorage = new DatabaseStorage();
          await dbStorage.setItem(key, entry);
          break;
          
        case 'hybrid':
          // Store in both localStorage and database
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(entry));
          }
          try {
            const { DatabaseStorage } = await import('./database-storage');
            const dbStorage = new DatabaseStorage();
            await dbStorage.setItem(key, entry);
          } catch {
            // Database storage failed, localStorage is sufficient
          }
          break;
      }
    } catch (error) {
      console.error('Failed to store in persistent storage:', error);
      this.stats.errors++;
    }
  }

  // Remove from persistent storage
  private async removePersistent(key: string): Promise<void> {
    const userConfig = this.getUserConfig();
    
    try {
      switch (userConfig.storage.type) {
        case 'localStorage':
          if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
          }
          break;
          
        case 'sessionStorage':
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(key);
          }
          break;
          
        case 'database':
        case 'hybrid':
          try {
            const { DatabaseStorage } = await import('./database-storage');
            const dbStorage = new DatabaseStorage();
            await dbStorage.removeItem(key);
          } catch {
            // Database removal failed, continue
          }
          break;
      }
    } catch (error) {
      console.error('Failed to remove from persistent storage:', error);
      this.stats.errors++;
    }
  }

  // Load from persistent storage
  private async loadPersistent(key: string): Promise<CacheEntry | null> {
    const userConfig = this.getUserConfig();
    
    try {
      switch (userConfig.storage.type) {
        case 'localStorage':
          if (typeof window !== 'undefined') {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
          }
          break;
          
        case 'sessionStorage':
          if (typeof window !== 'undefined') {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
          }
          break;
          
        case 'database':
          try {
            const { DatabaseStorage } = await import('./database-storage');
            const dbStorage = new DatabaseStorage();
            const data = await dbStorage.getItem(key);
            return data ? { key, value: data, timestamp: Date.now(), version: userConfig.invalidation.version, size: this.calculateSize(data) } : null;
          } catch {
            return null;
          }
          
        case 'hybrid':
          // Try localStorage first, then database
          if (typeof window !== 'undefined') {
            const localData = localStorage.getItem(key);
            if (localData) {
              return JSON.parse(localData);
            }
          }
          try {
            const { DatabaseStorage } = await import('./database-storage');
            const dbStorage = new DatabaseStorage();
            const data = await dbStorage.getItem(key);
            return data ? { key, value: data, timestamp: Date.now(), version: userConfig.invalidation.version, size: this.calculateSize(data) } : null;
          } catch {
            return null;
          }
      }
    } catch (error) {
      console.error('Failed to load from persistent storage:', error);
      this.stats.errors++;
    }
    
    return null;
  }

  // Public API methods
  async setItem(key: string, value: any): Promise<void> {
    this.batchQueue.push({ key, value, operation: 'set' });
    this.scheduleBatch();
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    const cacheKey = this.generateKey(key);
    
    // Check memory cache first
    let entry = this.cache.get(cacheKey);
    
    if (!entry) {
      // Try to load from persistent storage
      entry = await this.loadPersistent(cacheKey);
      if (entry) {
        this.cache.set(cacheKey, entry);
        this.stats.totalEntries++;
        this.stats.totalSize += entry.size;
      }
    }
    
    if (!entry) {
      this.stats.missRate++;
      return null;
    }
    
    // Check if expired
    if (this.isExpired(entry)) {
      await this.removeItem(key);
      this.stats.missRate++;
      return null;
    }
    
    // Check version
    const userConfig = this.getUserConfig();
    if (entry.version !== userConfig.invalidation.version) {
      await this.removeItem(key);
      this.stats.missRate++;
      return null;
    }
    
    this.stats.hitRate++;
    
    try {
      return this.decompress(entry.value);
    } catch (error) {
      console.error('Failed to decompress cache entry:', error);
      await this.removeItem(key);
      this.stats.errors++;
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    this.batchQueue.push({ key, value: null, operation: 'remove' });
    this.scheduleBatch();
  }

  async clear(): Promise<void> {
    // Clear memory cache
    this.cache.clear();
    this.stats.totalEntries = 0;
    this.stats.totalSize = 0;
    
    // Clear persistent storage
    const userConfig = this.getUserConfig();
    
    try {
      switch (userConfig.storage.type) {
        case 'localStorage':
          if (typeof window !== 'undefined') {
            localStorage.clear();
          }
          break;
          
        case 'sessionStorage':
          if (typeof window !== 'undefined') {
            sessionStorage.clear();
          }
          break;
          
        case 'database':
        case 'hybrid':
          try {
            const { DatabaseStorage } = await import('./database-storage');
            const dbStorage = new DatabaseStorage();
            await dbStorage.clear();
          } catch {
            // Database clear failed, continue
          }
          break;
      }
    } catch (error) {
      console.error('Failed to clear persistent storage:', error);
      this.stats.errors++;
    }
  }

  // Invalidate cache by version
  async invalidateByVersion(version: string): Promise<void> {
    const entriesToRemove: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.version !== version) {
        entriesToRemove.push(key);
      }
    }
    
    for (const key of entriesToRemove) {
      await this.removeItem(key);
    }
  }

  // Invalidate cache by event
  async invalidateByEvent(event: string): Promise<void> {
    if (!this.config.invalidation.events.includes(event)) return;
    
    // Clear all cache for major events
    if (['user-login', 'user-logout'].includes(event)) {
      await this.clear();
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Get cache info
  getInfo(): { entries: number; size: number; config: CacheConfig } {
    return {
      entries: this.stats.totalEntries,
      size: this.stats.totalSize,
      config: this.getUserConfig()
    };
  }
}

// Export singleton instance
export const unifiedCache = new UnifiedCacheStrategy();

// Export types and class for advanced usage
export { UnifiedCacheStrategy, type CacheConfig, type CacheEntry, type CacheStats };
