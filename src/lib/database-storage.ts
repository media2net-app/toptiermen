/**
 * Database-First Storage Utility
 * Replaces localStorage with Supabase database storage for better scalability
 */

import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface StorageItem {
  id: string;
  key: string;
  value: any;
  user_id?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  size: number;
}

interface StorageConfig {
  tableName: string;
  enableCache: boolean;
  cacheTimeout: number; // in ms
  maxItemSize: number; // in bytes
  enableCompression: boolean;
}

class DatabaseStorage {
  private config: StorageConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private isInitialized: boolean = false;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      tableName: 'user_storage',
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      maxItemSize: 1024 * 1024, // 1MB
      enableCompression: true,
      ...config
    };
  }

  private async ensureTableExists(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Check if table exists
      const { data: existingTable } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', this.config.tableName)
        .single();

      if (!existingTable) {
        console.log('🔧 Creating user_storage table...');
        
        // Create table using raw SQL
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS ${this.config.tableName} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            key VARCHAR(255) NOT NULL,
            value JSONB NOT NULL,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE,
            size INTEGER NOT NULL DEFAULT 0,
            UNIQUE(key, user_id)
          );

          -- Add indexes for better performance
          CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_key_user 
            ON ${this.config.tableName}(key, user_id);
          
          CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_expires 
            ON ${this.config.tableName}(expires_at) 
            WHERE expires_at IS NOT NULL;

          -- Add RLS policies
          ALTER TABLE ${this.config.tableName} ENABLE ROW LEVEL SECURITY;

          -- Users can only access their own storage
          CREATE POLICY "Users can access own storage" ON ${this.config.tableName}
            FOR ALL USING (auth.uid() = user_id);

          -- Allow anonymous access for non-user-specific data
          CREATE POLICY "Allow anonymous access" ON ${this.config.tableName}
            FOR SELECT USING (user_id IS NULL);
        `;

        const { error } = await supabaseAdmin.rpc('exec_sql', { 
          sql: createTableSQL 
        });

        if (error) {
          console.error('❌ Error creating storage table:', error);
          return false;
        }

        console.log('✅ User storage table created successfully');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Error ensuring table exists:', error);
      return false;
    }
  }

  private compress(data: any): any {
    if (!this.config.enableCompression) return data;

    try {
      // Simple compression: remove unnecessary whitespace
      const stringified = JSON.stringify(data);
      if (stringified.length > 1000) {
        // For large objects, try to minimize
        return JSON.parse(stringified);
      }
      return data;
    } catch (error) {
      console.warn('Compression failed, using original data:', error);
      return data;
    }
  }

  private getCurrentUserId(): string | null {
    try {
      // Get user from Supabase auth
      const { data: { user } } = supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.warn('Could not get current user:', error);
      return null;
    }
  }

  private getCacheKey(key: string): string {
    const userId = this.getCurrentUserId();
    return `${key}_${userId || 'anonymous'}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.config.cacheTimeout;
  }

  async setItem(key: string, value: any, options: {
    expiresIn?: number; // in seconds
    userId?: string;
  } = {}): Promise<boolean> {
    try {
      const tableExists = await this.ensureTableExists();
      if (!tableExists) {
        console.warn('Storage table not available, falling back to localStorage');
        return this.fallbackToLocalStorage(key, value);
      }

      const userId = options.userId || this.getCurrentUserId();
      const compressedValue = this.compress(value);
      const size = new Blob([JSON.stringify(compressedValue)]).size;

      if (size > this.config.maxItemSize) {
        console.error('Item too large for storage:', size, 'bytes');
        return false;
      }

      const expiresAt = options.expiresIn 
        ? new Date(Date.now() + options.expiresIn * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from(this.config.tableName)
        .upsert({
          key,
          value: compressedValue,
          user_id: userId,
          updated_at: new Date().toISOString(),
          expires_at: expiresAt,
          size
        }, {
          onConflict: 'key,user_id'
        });

      if (error) {
        console.error('Error saving to database:', error);
        return this.fallbackToLocalStorage(key, value);
      }

      // Update cache
      if (this.config.enableCache) {
        const cacheKey = this.getCacheKey(key);
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

  async getItem<T = any>(key: string, userId?: string): Promise<T | null> {
    try {
      const tableExists = await this.ensureTableExists();
      if (!tableExists) {
        return this.fallbackFromLocalStorage(key);
      }

      // Check cache first
      if (this.config.enableCache) {
        const cacheKey = this.getCacheKey(key);
        const cached = this.cache.get(cacheKey);
        if (cached && this.isCacheValid(cached.timestamp)) {
          console.log('📦 Retrieved from cache:', key);
          return cached.data as T;
        }
      }

      const currentUserId = userId || this.getCurrentUserId();
      
      let { data, error } = await supabase
        .from(this.config.tableName)
        .select('value, expires_at')
        .eq('key', key)
        .eq('user_id', currentUserId)
        .single();

      if (error || !data) {
        // Try anonymous storage
        const { data: anonymousData } = await supabase
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
        const cacheKey = this.getCacheKey(key);
        this.cache.set(cacheKey, {
          data: data.value,
          timestamp: Date.now()
        });
      }

      console.log('📦 Retrieved from database:', key);
      return data.value as T;
    } catch (error) {
      console.error('Error in getItem:', error);
      return this.fallbackFromLocalStorage(key);
    }
  }

  async removeItem(key: string, userId?: string): Promise<boolean> {
    try {
      const tableExists = await this.ensureTableExists();
      if (!tableExists) {
        return this.fallbackRemoveFromLocalStorage(key);
      }

      const currentUserId = userId || this.getCurrentUserId();

      const { error } = await supabase
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
        const cacheKey = this.getCacheKey(key);
        this.cache.delete(cacheKey);
      }

      console.log('🗑️ Removed from database storage:', key);
      return true;
    } catch (error) {
      console.error('Error in removeItem:', error);
      return this.fallbackRemoveFromLocalStorage(key);
    }
  }

  async clear(userId?: string): Promise<boolean> {
    try {
      const tableExists = await this.ensureTableExists();
      if (!tableExists) {
        return this.fallbackClearLocalStorage();
      }

      const currentUserId = userId || this.getCurrentUserId();

      const { error } = await supabase
        .from(this.config.tableName)
        .delete()
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Error clearing database storage:', error);
        return this.fallbackClearLocalStorage();
      }

      // Clear cache
      if (this.config.enableCache) {
        this.cache.clear();
      }

      console.log('🧹 Cleared database storage for user:', currentUserId);
      return true;
    } catch (error) {
      console.error('Error in clear:', error);
      return this.fallbackClearLocalStorage();
    }
  }

  async getInfo(): Promise<{
    totalItems: number;
    totalSize: number;
    cacheSize: number;
    tableExists: boolean;
  }> {
    try {
      const tableExists = await this.ensureTableExists();
      
      if (!tableExists) {
        return {
          totalItems: 0,
          totalSize: 0,
          cacheSize: this.cache.size,
          tableExists: false
        };
      }

      const currentUserId = this.getCurrentUserId();

      const { data, error } = await supabase
        .from(this.config.tableName)
        .select('size')
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Error getting storage info:', error);
        return {
          totalItems: 0,
          totalSize: 0,
          cacheSize: this.cache.size,
          tableExists: true
        };
      }

      const totalSize = data.reduce((sum, item) => sum + (item.size || 0), 0);

      return {
        totalItems: data.length,
        totalSize,
        cacheSize: this.cache.size,
        tableExists: true
      };
    } catch (error) {
      console.error('Error in getInfo:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        cacheSize: this.cache.size,
        tableExists: false
      };
    }
  }

  // Fallback methods to localStorage
  private fallbackToLocalStorage(key: string, value: any): boolean {
    try {
      localStorage.setItem(`db_fallback_${key}`, JSON.stringify(value));
      console.log('📦 Fallback to localStorage:', key);
      return true;
    } catch (error) {
      console.error('Fallback to localStorage failed:', error);
      return false;
    }
  }

  private fallbackFromLocalStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`db_fallback_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Fallback from localStorage failed:', error);
      return null;
    }
  }

  private fallbackRemoveFromLocalStorage(key: string): boolean {
    try {
      localStorage.removeItem(`db_fallback_${key}`);
      return true;
    } catch (error) {
      console.error('Fallback remove from localStorage failed:', error);
      return false;
    }
  }

  private fallbackClearLocalStorage(): boolean {
    try {
      // Only remove fallback items
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('db_fallback_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Fallback clear localStorage failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const databaseStorage = new DatabaseStorage();

// Convenience functions
export const setDbItem = (key: string, value: any, options?: any) => 
  databaseStorage.setItem(key, value, options);

export const getDbItem = <T = any>(key: string, userId?: string): Promise<T | null> => 
  databaseStorage.getItem<T>(key, userId);

export const removeDbItem = (key: string, userId?: string) => 
  databaseStorage.removeItem(key, userId);

export const clearDbStorage = (userId?: string) => 
  databaseStorage.clear(userId);

export const getDbStorageInfo = () => 
  databaseStorage.getInfo();

// Migration utility
export const migrateFromLocalStorage = async (localStorageKey: string, dbKey: string): Promise<boolean> => {
  try {
    const localValue = localStorage.getItem(localStorageKey);
    if (localValue) {
      const parsedValue = JSON.parse(localValue);
      const success = await databaseStorage.setItem(dbKey, parsedValue);
      if (success) {
        localStorage.removeItem(localStorageKey);
        console.log('✅ Migrated from localStorage to database:', localStorageKey);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};
