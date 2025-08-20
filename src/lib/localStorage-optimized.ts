/**
 * Optimized localStorage utility to address overuse issues
 * Implements proper error handling, size limits, compression, and batch operations
 */

interface StorageItem {
  value: any;
  timestamp: number;
  size: number;
  compressed?: boolean;
}

interface StorageConfig {
  maxSize: number; // in bytes
  compressionThreshold: number; // in bytes
  batchDelay: number; // in ms
  enableCompression: boolean;
}

class OptimizedLocalStorage {
  private config: StorageConfig;
  private batchQueue: Map<string, any> = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  private isAvailable: boolean = true;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      maxSize: 4 * 1024 * 1024, // 4MB limit
      compressionThreshold: 1024, // 1KB
      batchDelay: 100, // 100ms
      enableCompression: true,
      ...config
    };

    this.checkAvailability();
  }

  private checkAvailability(): void {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isAvailable = true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      this.isAvailable = false;
    }
  }

  private compress(data: string): string {
    if (!this.config.enableCompression || data.length < this.config.compressionThreshold) {
      return data;
    }

    try {
      // Simple compression: remove unnecessary whitespace and use shorter format
      const compressed = JSON.stringify(JSON.parse(data));
      return compressed;
    } catch (error) {
      console.warn('Compression failed, using original data:', error);
      return data;
    }
  }

  private decompress(data: string): string {
    try {
      // If data looks compressed, try to parse it
      if (data.startsWith('"') && data.endsWith('"')) {
        return JSON.parse(data);
      }
      return data;
    } catch (error) {
      console.warn('Decompression failed, returning original data:', error);
      return data;
    }
  }

  private getStorageSize(): number {
    let totalSize = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          totalSize += new Blob([value || '']).size;
        }
      }
    } catch (error) {
      console.warn('Error calculating storage size:', error);
    }
    return totalSize;
  }

  private cleanupOldItems(): void {
    try {
      const items: Array<{ key: string; timestamp: number; size: number }> = [];
      
      // Collect all items with timestamps
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ttm_')) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const parsed = JSON.parse(value) as StorageItem;
              items.push({
                key,
                timestamp: parsed.timestamp || 0,
                size: parsed.size || 0
              });
            } catch {
              // Skip items without proper format
            }
          }
        }
      }

      // Sort by timestamp (oldest first) and remove oldest items if over limit
      items.sort((a, b) => a.timestamp - b.timestamp);
      
      const currentSize = this.getStorageSize();
      let removedSize = 0;
      
      for (const item of items) {
        if (currentSize - removedSize > this.config.maxSize * 0.8) { // Keep 20% buffer
          localStorage.removeItem(item.key);
          removedSize += item.size;
        } else {
          break;
        }
      }
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  }

  private batchSet(key: string, value: any): void {
    this.batchQueue.set(key, value);

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.flushBatch();
    }, this.config.batchDelay);
  }

  private flushBatch(): void {
    if (this.batchQueue.size === 0) return;

    try {
      const currentSize = this.getStorageSize();
      
      for (const [key, value] of this.batchQueue) {
        const serialized = JSON.stringify({
          value,
          timestamp: Date.now(),
          size: new Blob([JSON.stringify(value)]).size
        });

        const compressed = this.compress(serialized);
        const itemSize = new Blob([compressed]).size;

        // Check if adding this item would exceed the limit
        if (currentSize + itemSize > this.config.maxSize) {
          this.cleanupOldItems();
        }

        localStorage.setItem(key, compressed);
      }
    } catch (error) {
      console.error('Error in batch flush:', error);
    } finally {
      this.batchQueue.clear();
      this.batchTimeout = null;
    }
  }

  // Public API
  setItem(key: string, value: any, useBatch: boolean = true): boolean {
    if (!this.isAvailable) {
      console.warn('localStorage not available, cannot set item:', key);
      return false;
    }

    try {
      if (useBatch) {
        this.batchSet(key, value);
        return true;
      } else {
        const serialized = JSON.stringify({
          value,
          timestamp: Date.now(),
          size: new Blob([JSON.stringify(value)]).size
        });

        const compressed = this.compress(serialized);
        localStorage.setItem(key, compressed);
        return true;
      }
    } catch (error) {
      console.error('Error setting localStorage item:', key, error);
      return false;
    }
  }

  getItem<T = any>(key: string): T | null {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const decompressed = this.decompress(item);
      const parsed = JSON.parse(decompressed) as StorageItem;
      
      return parsed.value as T;
    } catch (error) {
      console.error('Error getting localStorage item:', key, error);
      return null;
    }
  }

  removeItem(key: string): boolean {
    if (!this.isAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing localStorage item:', key, error);
      return false;
    }
  }

  clear(): boolean {
    if (!this.isAvailable) {
      return false;
    }

    try {
      // Only clear our app's items (prefixed with 'ttm_')
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ttm_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  getInfo(): {
    available: boolean;
    currentSize: number;
    maxSize: number;
    usagePercentage: number;
    itemCount: number;
  } {
    const currentSize = this.getStorageSize();
    const itemCount = this.isAvailable ? localStorage.length : 0;

    return {
      available: this.isAvailable,
      currentSize,
      maxSize: this.config.maxSize,
      usagePercentage: (currentSize / this.config.maxSize) * 100,
      itemCount
    };
  }

  // Force flush any pending batch operations
  flush(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.flushBatch();
    }
  }
}

// Create singleton instance
export const optimizedStorage = new OptimizedLocalStorage();

// Convenience functions
export const setStorageItem = (key: string, value: any, useBatch = true) => 
  optimizedStorage.setItem(key, value, useBatch);

export const getStorageItem = <T = any>(key: string): T | null => 
  optimizedStorage.getItem<T>(key);

export const removeStorageItem = (key: string) => 
  optimizedStorage.removeItem(key);

export const clearStorage = () => 
  optimizedStorage.clear();

export const getStorageInfo = () => 
  optimizedStorage.getInfo();

export const flushStorage = () => 
  optimizedStorage.flush();

// Migration helper
export const migrateToOptimizedStorage = (oldKey: string, newKey: string): boolean => {
  try {
    const oldValue = localStorage.getItem(oldKey);
    if (oldValue) {
      const success = optimizedStorage.setItem(newKey, oldValue, false);
      if (success) {
        localStorage.removeItem(oldKey);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};
