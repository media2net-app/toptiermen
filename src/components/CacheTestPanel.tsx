'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export function CacheTestPanel() {
  const { user } = useSupabaseAuth();
  const [cacheInfo, setCacheInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  // Enhanced user detection
  const getUserType = () => {
    if (!user?.email) return 'unknown';
    
    const email = user.email.toLowerCase();
    if (email.includes('rick') || email.includes('cuijpers')) return 'rick';
    if (email.includes('chiel')) return 'chiel';
    if (email.includes('test') || email.includes('demo')) return 'test';
    if (email.includes('admin')) return 'admin';
    return 'user';
  };

  // Collect cache information
  const collectCacheInfo = () => {
    const info = {
      userType: getUserType(),
      userEmail: user?.email,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      isChrome: /Chrome/.test(typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown') && !/Edge/.test(typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'),
      timestamp: new Date().toISOString(),
      
      // Performance metrics
      performance: {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime,
      },
      
      // Cache indicators
      cacheIndicators: {
        cachedResources: performance.getEntriesByType('resource').filter(entry => (entry as any).transferSize === 0).length,
        totalResources: performance.getEntriesByType('resource').length,
        cacheRatio: performance.getEntriesByType('resource').filter(entry => (entry as any).transferSize === 0).length / performance.getEntriesByType('resource').length,
      },
      
      // Storage info
      storage: {
        localStorageSize: JSON.stringify(localStorage).length,
        sessionStorageSize: JSON.stringify(sessionStorage).length,
        hasServiceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
        serviceWorkerController: typeof navigator !== 'undefined' && navigator.serviceWorker?.controller ? true : false,
      },
      
      // Cache headers
      cacheHeaders: {
        hasCacheControl: !!document.querySelector('meta[http-equiv="Cache-Control"]'),
        hasPragma: !!document.querySelector('meta[http-equiv="Pragma"]'),
        hasExpires: !!document.querySelector('meta[http-equiv="Expires"]'),
      },
      
      // Browser cache info
      browserCache: {
        hasCaches: 'caches' in window,
        cacheNames: [] as string[],
      }
    };

    // Get cache names if available
    if ('caches' in window) {
      caches.keys().then(names => {
        info.browserCache.cacheNames = names;
        setCacheInfo(info);
      });
    } else {
      setCacheInfo(info);
    }
  };

  // Force cache clear
  const forceCacheClear = async () => {
    try {
      // Clear browser cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear service worker
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      // Reload with cache busting
      const timestamp = Date.now();
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('_cb', timestamp.toString());
      window.location.href = currentUrl.toString();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  // Test cache headers
  const testCacheHeaders = async () => {
    try {
      const response = await fetch('/api/test-cache-headers', {
        headers: {
          'x-user-email': user?.email || ''
        }
      });
      
      const headers = Object.fromEntries(response.headers.entries());
      setCacheInfo(prev => ({
        ...prev,
        responseHeaders: headers
      }));
    } catch (error) {
      console.error('Error testing cache headers:', error);
    }
  };

  useEffect(() => {
    collectCacheInfo();
    
    // Update cache info every 10 seconds
    const interval = setInterval(collectCacheInfo, 10000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Only show for Rick or in development
  if (getUserType() !== 'rick' && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 left-4 z-50 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg"
      >
        🔧 Cache Test Panel
      </button>

      {/* Panel */}
      {isVisible && (
        <div className="fixed top-16 left-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-y-auto text-xs">
          <h3 className="font-bold mb-2 text-red-400">Cache Test Panel</h3>
          
          <div className="space-y-2">
            <div>
              <strong>User:</strong> {cacheInfo.userType} ({cacheInfo.userEmail})
            </div>
            
            <div>
              <strong>Browser:</strong> {cacheInfo.isChrome ? 'Chrome' : 'Other'}
            </div>
            
            <div>
              <strong>Load Time:</strong> {cacheInfo.performance?.loadTime}ms
            </div>
            
            <div>
              <strong>Cache Ratio:</strong> {(cacheInfo.cacheIndicators?.cacheRatio * 100).toFixed(1)}%
            </div>
            
            <div>
              <strong>Cached Resources:</strong> {cacheInfo.cacheIndicators?.cachedResources}/{cacheInfo.cacheIndicators?.totalResources}
            </div>
            
            <div>
              <strong>Service Worker:</strong> {cacheInfo.storage?.serviceWorkerController ? 'Active' : 'Inactive'}
            </div>
            
            <div>
              <strong>Cache Headers:</strong> {cacheInfo.cacheHeaders?.hasCacheControl ? '✅' : '❌'}
            </div>
            
            {cacheInfo.responseHeaders && (
              <div>
                <strong>Response Cache:</strong> {cacheInfo.responseHeaders['x-cache-strategy'] || 'Unknown'}
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-2">
            <button
              onClick={collectCacheInfo}
              className="w-full bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              🔄 Refresh Info
            </button>
            
            <button
              onClick={testCacheHeaders}
              className="w-full bg-green-600 text-white px-2 py-1 rounded text-xs"
            >
              🧪 Test Headers
            </button>
            
            <button
              onClick={forceCacheClear}
              className="w-full bg-red-600 text-white px-2 py-1 rounded text-xs"
            >
              🗑️ Force Clear Cache
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            Last updated: {cacheInfo.timestamp}
          </div>
        </div>
      )}
    </>
  );
}
