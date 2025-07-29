/**
 * Cache utility functions to help resolve loading issues
 */

// Timeout utility for async operations - optimized for performance
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 8000, // Reduced default timeout
  errorMessage: string = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
};

// Safe async operation with timeout and error handling
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  options: {
    timeout?: number;
    defaultValue?: T;
    onError?: (error: Error) => void;
    retries?: number;
  } = {}
): Promise<T | null> => {
  const { timeout = 8000, defaultValue = null, onError, retries = 0 } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await withTimeout(operation(), timeout, `Operation timed out after ${timeout}ms`);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (onError) {
        onError(lastError);
      }
      
      if (attempt === retries) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return defaultValue as T;
};

// Loading state manager to prevent stuck loading states
export class LoadingStateManager {
  private loadingStates = new Map<string, { timeout: NodeJS.Timeout; startTime: number }>();
  
  startLoading(key: string, timeoutMs: number = 12000, onTimeout?: () => void): void {
    // Clear any existing timeout for this key
    this.clearLoading(key);
    
    const timeout = setTimeout(() => {
      console.warn(`Loading state for "${key}" timed out after ${timeoutMs}ms`);
      this.clearLoading(key);
      if (onTimeout) {
        onTimeout();
      }
    }, timeoutMs);
    
    this.loadingStates.set(key, {
      timeout,
      startTime: Date.now()
    });
    
    console.log(`Started loading state for "${key}"`);
  }
  
  clearLoading(key: string): void {
    const state = this.loadingStates.get(key);
    if (state) {
      clearTimeout(state.timeout);
      const duration = Date.now() - state.startTime;
      console.log(`Cleared loading state for "${key}" after ${duration}ms`);
      this.loadingStates.delete(key);
    }
  }
  
  isLoading(key: string): boolean {
    return this.loadingStates.has(key);
  }
  
  getLoadingDuration(key: string): number {
    const state = this.loadingStates.get(key);
    return state ? Date.now() - state.startTime : 0;
  }
  
  clearAll(): void {
    for (const [key] of this.loadingStates) {
      this.clearLoading(key);
    }
  }
  
  getAllLoadingStates(): Array<{ key: string; duration: number }> {
    return Array.from(this.loadingStates.entries()).map(([key, state]) => ({
      key,
      duration: Date.now() - state.startTime
    }));
  }
}

// Global loading state manager instance
export const globalLoadingManager = new LoadingStateManager();

// Cleanup function for components
export const useLoadingCleanup = (componentName: string) => {
  if (typeof window !== 'undefined') {
    const cleanup = () => {
      globalLoadingManager.clearLoading(`${componentName}-data-fetch`);
      globalLoadingManager.clearLoading(`${componentName}-auth-check`);
      globalLoadingManager.clearLoading(`${componentName}-init`);
    };
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
    
    return cleanup;
  }
  
  return () => {};
};

export const clearAllCache = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 Clearing all cache and localStorage...');
  
  // Clear loading states
  globalLoadingManager.clearAll();
  
  // Clear all localStorage items
  localStorage.clear();
  
  // Clear all sessionStorage items
  sessionStorage.clear();
  
  // Clear any cached data in memory
  if (window.location) {
    window.location.reload();
  }
};

export const clearSpecificCache = (keys: string[]) => {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 Clearing specific cache items:', keys);
  
  keys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const getCacheInfo = () => {
  if (typeof window === 'undefined') return {};
  
  const info: any = {
    localStorage: {},
    sessionStorage: {},
    localStorageSize: 0,
    sessionStorageSize: 0,
    loadingStates: globalLoadingManager.getAllLoadingStates(),
  };

  // Get localStorage info
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      info.localStorage[key] = {
        value: value?.substring(0, 100) + (value && value.length > 100 ? '...' : ''),
        size: value ? new Blob([value]).size : 0
      };
      info.localStorageSize += value ? new Blob([value]).size : 0;
    }
  }

  // Get sessionStorage info
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      const value = sessionStorage.getItem(key);
      info.sessionStorage[key] = {
        value: value?.substring(0, 100) + (value && value.length > 100 ? '...' : ''),
        size: value ? new Blob([value]).size : 0
      };
      info.sessionStorageSize += value ? new Blob([value]).size : 0;
    }
  }

  return info;
};

export const clearAppSpecificCache = () => {
  if (typeof window === 'undefined') return;
  
  const appKeys = [
    'welcomeVideoShown',
    'onboardingCompleted',
    'nutritionPlanCompleted',
    'trainingSchemaCompleted',
    'onboardingCompletedSteps',
    'ttm_main_goal'
  ];
  
  console.log('🧹 Clearing app-specific cache items');
  clearSpecificCache(appKeys);
};

export const checkForCacheIssues = () => {
  if (typeof window === 'undefined') return { hasIssues: false, issues: [] };
  
  const issues: string[] = [];
  const info = getCacheInfo();
  
  // Check for large localStorage items
  if (info.localStorageSize > 5 * 1024 * 1024) { // 5MB
    issues.push('localStorage is very large (>5MB)');
  }
  
  // Check for specific problematic items
  const problematicKeys = Object.keys(info.localStorage).filter(key => {
    const item = info.localStorage[key];
    return item.size > 1024 * 1024; // Items larger than 1MB
  });
  
  if (problematicKeys.length > 0) {
    issues.push(`Large localStorage items found: ${problematicKeys.join(', ')}`);
  }
  
  // Check for stuck loading states
  const stuckLoadingStates = info.loadingStates.filter((state: any) => state.duration > 30000); // 30 seconds
  if (stuckLoadingStates.length > 0) {
    issues.push(`Stuck loading states found: ${stuckLoadingStates.map((s: any) => s.key).join(', ')}`);
  }
  
  return {
    hasIssues: issues.length > 0,
    issues
  };
}; 