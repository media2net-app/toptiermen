/**
 * Cache utility functions to help resolve loading issues
 */

export const clearAllCache = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 Clearing all cache and localStorage...');
  
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
  
  return {
    hasIssues: issues.length > 0,
    issues
  };
}; 