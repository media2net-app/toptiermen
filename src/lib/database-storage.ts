// V1.2: Database-First Storage Utility
// Provides database storage with localStorage fallback

import { supabaseAdmin } from '@/lib/supabase-admin';

export interface StorageOptions {
  userId?: string;
  ttl?: number; // time to live in seconds
  compress?: boolean;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
}

export class DatabaseStorage {
  private config = {
    tableName: 'user_storage',
    enableCache: true,
    cacheSize: 100,
    defaultTTL: 3600, // 1 hour
    enableCompression: true
  };

  private cache = new Map<string, CacheEntry>();

  constructor(config: Partial<typeof DatabaseStorage.prototype.config> = {}) {
    this.config = { ...this.config, ...config };
  }

  // Ensure the storage table exists
  private async ensureTableExists(): Promise<boolean> {
    try {
      // Check if table exists by trying to select from it
      const { error } = await supabaseAdmin
        .from(this.config.tableName)
        .select('key')
        .limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist, create it
        console.log('📋 Creating storage table...');
        const { error: createError } = await supabaseAdmin.rpc('create_storage_table', {
          table_name: this.config.tableName
        });

        if (createError) {
          console.error('Failed to create storage table:', createError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error ensuring table exists:', error);
      return false;
    }
  }

  // Get current user ID
  private async getCurrentUserId(): Promise<string | null> {
    try {
      // Get user from Supabase auth
      const { data } = await supabaseAdmin.auth.getUser();
      return data.user?.id || null;
    } catch (error) {
      console.warn('Could not get current user:', error);
      return null;
    }
  }

  // Generate cache key
  private async getCacheKey(key: string): Promise<string> {
    const userId = await this.getCurrentUserId();
    return `${key}_${userId || 'anonymous'}`;
  }

  // Compress data if enabled
  private compress(data: any): any {
    if (!this.config.enableCompression) return data;
    
    try {
      const jsonString = JSON.stringify(data);
      if (jsonString.length > 1000) {
        // Simple compression for large data
        return {
          compressed: true,
          data: btoa(jsonString)
        };
      }
    } catch (error) {
      console.warn('Compression failed:', error);
    }
    
    return data;
  }

  // Decompress data if needed
  private decompress(data: any): any {
    if (data && data.compressed && data.data) {
      try {
        const jsonString = atob(data.data);
        return JSON.parse(jsonString);
      } catch (error) {
        console.warn('Decompression failed:', error);
      }
    }
    return data;
  }

  // Check if cache entry is still valid
  private isCacheValid(timestamp: number): boolean {
    const maxAge = 5 * 60 * 1000; // 5 minutes
    return Date.now() - timestamp < maxAge;
  }

  // Fallback to localStorage
  private fallbackToLocalStorage(key: string, value: any): boolean {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
        console.log('💾 Fallback to localStorage:', key);
        return true;
      }
    } catch (error) {
      console.error('localStorage fallback failed:', error);
    }
    return false;
  }

  // Fallback from localStorage
  private fallbackFromLocalStorage<T = any>(key: string): T | null {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key);
        if (item) {
          console.log('📦 Retrieved from localStorage fallback:', key);
          return JSON.parse(item);
        }
      }
    } catch (error) {
      console.error('localStorage fallback retrieval failed:', error);
    }
    return null;
  }

  // Fallback remove from localStorage
  private fallbackRemoveFromLocalStorage(key: string): boolean {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
        console.log('🗑️ Removed from localStorage fallback:', key);
        return true;
      }
    } catch (error) {
      console.error('localStorage fallback removal failed:', error);
    }
    return false;
  }

  // Fallback clear localStorage
  private fallbackClearLocalStorage(): boolean {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        console.log('🗑️ Cleared localStorage fallback');
        return true;
      }
    } catch (error) {
      console.error('localStorage fallback clear failed:', error);
    }
    return false;
  }

  // Set item in database storage
  async setItem(key: string, value: any, options: StorageOptions = {}): Promise<boolean> {
    try {
      const tableExists = await this.ensureTableExists();
      if (!tableExists) {
        return this.fallbackToLocalStorage(key, value);
      }

      const userId = options.userId || await this.getCurrentUserId();
      const compressedValue = this.compress(value);
      const size = new Blob([JSON.stringify(compressedValue)]).size;

      // Check size limit (10MB)
      if (size > 10 * 1024 * 1024) {
        console.warn('Data too large for database storage, using localStorage fallback');
        return this.fallbackToLocalStorage(key, value);
      }

      const expiresAt = options.ttl 
        ? new Date(Date.now() + options.ttl * 1000).toISOString()
        : new Date(Date.now() + this.config.defaultTTL * 1000).toISOString();

      const { error } = await supabaseAdmin
        .from(this.config.tableName)
        .upsert({
          key,
          user_id: userId,
          value: compressedValue,
          expires_at: expiresAt,
          size,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving to database:', error);
        return this.fallbackToLocalStorage(key, value);
      }

      // Update cache
      if (this.config.enableCache) {
        const cacheKey = await this.getCacheKey(key);
        this.cache.set(cacheKey, {
          data: value,
          timestamp: Date.now()
        });
      }

      console.log('💾 Saved to database storage:', key);
      return true;
    } catch (error) {
      console.error('Error in setItem:', error);
      return this.fallbackToLocalStorage(key, value);
    }
  }

  // Get item from database storage
  async getItem<T = any>(key: string, userId?: string): Promise<T | null> {
    try {
      const tableExists = await this.ensureTableExists();
      if (!tableExists) {
        return this.fallbackFromLocalStorage(key);
      }

      // Check cache first
      if (this.config.enableCache) {
        const cacheKey = await this.getCacheKey(key);
        const cached = this.cache.get(cacheKey);
        if (cached && this.isCacheValid(cached.timestamp)) {
          console.log('📦 Retrieved from cache:', key);
          return cached.data as T;
        }
      }

      const currentUserId = userId || await this.getCurrentUserId();
      
      let { data, error } = await supabaseAdmin
        .from(this.config.tableName)
        .select('value, expires_at')
        .eq('key', key)
        .eq('user_id', currentUserId)
        .single();

      if (error || !data) {
        // Try anonymous storage
        const { data: anonymousData } = await supabaseAdmin
          .from(this.config.tableName)
          .select('value, expires_at')
          .eq('key', key)
          .is('user_id', null)
          .single();

        if (!anonymousData) {
          return this.fallbackFromLocalStorage(key);
        }
        data = anonymousData;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await this.removeItem(key, userId);
        return null;
      }

      // Update cache
      if (this.config.enableCache) {
        const cacheKey = await this.getCacheKey(key);
        this.cache.set(cacheKey, {
          data: data.value,
          timestamp: Date.now()
        });
      }

      console.log('📦 Retrieved from database:', key);
      return this.decompress(data.value) as T;
    } catch (error) {
      console.error('Error in getItem:', error);
      return this.fallbackFromLocalStorage(key);
    }
  }

  // Remove item from database storage
  async removeItem(key: string, userId?: string): Promise<boolean> {
    try {
      const tableExists = await this.ensureTableExists();
      if (!tableExists) {
        return this.fallbackRemoveFromLocalStorage(key);
      }

      const currentUserId = userId || await this.getCurrentUserId();

      const { error } = await supabaseAdmin
        .from(this.config.tableName)
        .delete()
        .eq('key', key)
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Error removing from database:', error);
        return this.fallbackRemoveFromLocalStorage(key);
      }

      // Remove from cache
      if (this.config.enableCache) {
        const cacheKey = await this.getCacheKey(key);
        this.cache.delete(cacheKey);
      }

      console.log('🗑️ Removed from database storage:', key);
      return true;
    } catch (error) {
      console.error('Error in removeItem:', error);
      return this.fallbackRemoveFromLocalStorage(key);
    }
  }

  // Clear all items for current user
  async clear(userId?: string): Promise<boolean> {
    try {
      const tableExists = await this.ensureTableExists();
      if (!tableExists) {
        return this.fallbackClearLocalStorage();
      }

      const currentUserId = userId || await this.getCurrentUserId();

      const { error } = await supabaseAdmin
        .from(this.config.tableName)
        .delete()
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Error clearing database:', error);
        return this.fallbackClearLocalStorage();
      }

      // Clear cache
      if (this.config.enableCache) {
        this.cache.clear();
      }

      console.log('🗑️ Cleared database storage for user:', currentUserId);
      return true;
    } catch (error) {
      console.error('Error in clear:', error);
      return this.fallbackClearLocalStorage();
    }
  }

  // Get storage statistics
  async getStats(): Promise<{
    totalItems: number;
    totalSize: number;
    cacheSize: number;
    cacheHitRate: number;
  }> {
    try {
      const currentUserId = await this.getCurrentUserId();
      
      const { data, error } = await supabaseAdmin
        .from(this.config.tableName)
        .select('size')
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Error getting stats:', error);
        return {
          totalItems: 0,
          totalSize: 0,
          cacheSize: this.cache.size,
          cacheHitRate: 0
        };
      }

      const totalSize = data.reduce((sum, item) => sum + (item.size || 0), 0);

      return {
        totalItems: data.length,
        totalSize,
        cacheSize: this.cache.size,
        cacheHitRate: 0 // Would need to track hits/misses
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        cacheSize: this.cache.size,
        cacheHitRate: 0
      };
    }
  }

  // Check if storage is available
  async isAvailable(): Promise<boolean> {
    try {
      return await this.ensureTableExists();
    } catch (error) {
      console.error('Storage availability check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const databaseStorage = new DatabaseStorage();
