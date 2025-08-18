'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export function CacheManager() {
  const { user } = useSupabaseAuth();
  const cacheIssueCount = useRef<number>(0);
  const lastCacheCheck = useRef<number>(0);

  // Enhanced user detection for special monitoring
  const getUserType = useCallback(() => {
    if (!user?.email) return 'unknown';
    
    const email = user.email.toLowerCase();
    if (email.includes('rick') || email.includes('cuijpers')) return 'rick';
    if (email.includes('chiel')) return 'chiel';
    if (email.includes('test') || email.includes('demo')) return 'test';
    if (email.includes('admin')) return 'admin';
    return 'user';
  }, [user]);

  // Log cache issues to database - DISABLED
  const logCacheIssue = useCallback(async (data: any) => {
    // Session logging disabled to prevent infinite loops
    return;
  }, [user, getUserType]);

  // Detect cache issues
  const detectCacheIssues = useCallback(() => {
    const now = Date.now();
    
    // Check for stale cache indicators
    const staleCacheIndicators = [
      // Check if page loads are unusually fast (cached)
      performance.timing.loadEventEnd - performance.timing.navigationStart < 100,
      // Check if resources are served from cache
      performance.getEntriesByType('resource').some(entry => (entry as any).transferSize === 0),
      // Check for old timestamps in localStorage/sessionStorage
      localStorage.getItem('lastCacheCheck') && 
      (now - parseInt(localStorage.getItem('lastCacheCheck') || '0')) > 300000, // 5 minutes
      // Check for browser cache headers
      document.querySelector('meta[http-equiv="Cache-Control"]')?.getAttribute('content')?.includes('no-cache')
    ];

    const hasCacheIssues = staleCacheIndicators.some(indicator => indicator);
    
    if (hasCacheIssues) {
      cacheIssueCount.current++;
      
      logCacheIssue({
        error_message: `Cache issue detected (count: ${cacheIssueCount.current})`,
        details: {
          cache_issue_count: cacheIssueCount.current,
          stale_cache_indicators: staleCacheIndicators,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Update last cache check
    localStorage.setItem('lastCacheCheck', now.toString());
    lastCacheCheck.current = now;
  }, [logCacheIssue]);

  // Force cache refresh for Rick (all browsers)
  const forceCacheRefresh = useCallback(() => {
    if (getUserType() === 'rick') {
      // Clear browser cache for current domain (works for Chrome, Edge, Firefox, Safari)
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }

      // Clear IndexedDB (Edge specific)
      if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        }).catch(() => {
          // IndexedDB not supported or error, continue
        });
      }

      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies for current domain
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      // Force reload with cache busting
      const timestamp = Date.now();
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('_cb', timestamp.toString());
      
      logCacheIssue({
        error_message: 'Forced cache refresh for Rick (all browsers)',
        details: {
          action: 'force_cache_refresh',
          browser: navigator.userAgent,
          timestamp: new Date().toISOString(),
          new_url: currentUrl.toString()
        }
      });

      // Reload page with cache busting
      window.location.href = currentUrl.toString();
    }
  }, [getUserType, logCacheIssue]);

  // Auto-cache refresh for Rick when issues are detected (all browsers)
  useEffect(() => {
    if (getUserType() !== 'rick') return;

    const checkAndFixCache = () => {
      detectCacheIssues();
      
      // If multiple cache issues detected, auto-refresh
      if (cacheIssueCount.current >= 3) {
        logCacheIssue({
          error_message: 'Auto-refreshing cache due to multiple issues (all browsers)',
          details: {
            cache_issue_count: cacheIssueCount.current,
            browser: navigator.userAgent,
            action: 'auto_cache_refresh',
            timestamp: new Date().toISOString()
          }
        });
        
        // Reset counter and force refresh
        cacheIssueCount.current = 0;
        forceCacheRefresh();
      }
    };

    // Check cache every 30 seconds for Rick
    const cacheCheckInterval = setInterval(checkAndFixCache, 30000);
    
    // Initial check
    checkAndFixCache();
    
    return () => clearInterval(cacheCheckInterval);
  }, [getUserType, detectCacheIssues, forceCacheRefresh, logCacheIssue]);

  // Monitor for browser-specific cache issues (Chrome, Edge, Firefox, Safari)
  useEffect(() => {
    if (getUserType() !== 'rick') return;

    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    const isEdge = /Edge/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isChrome || isEdge || isFirefox || isSafari) {
      // Browser-specific cache monitoring
      const monitorBrowserCache = () => {
        // Check for browser's aggressive caching
        const browserCacheIndicators = [
          // Check if page loads instantly (browser cache)
          performance.timing.loadEventEnd - performance.timing.navigationStart < 50,
          // Check for cached resources
          performance.getEntriesByType('resource').filter(entry => (entry as any).transferSize === 0).length > 5,
          // Check for old service worker cache
          'serviceWorker' in navigator && navigator.serviceWorker.controller,
          // Edge-specific: Check for IndexedDB cache
          isEdge && 'indexedDB' in window
        ];

        const hasBrowserCacheIssues = browserCacheIndicators.some(indicator => indicator);
        
        if (hasBrowserCacheIssues) {
          logCacheIssue({
            error_message: `${isEdge ? 'Edge' : isChrome ? 'Chrome' : isFirefox ? 'Firefox' : 'Safari'} cache issue detected`,
            details: {
              browser_cache_indicators: browserCacheIndicators,
              browser_type: isEdge ? 'Edge' : isChrome ? 'Chrome' : isFirefox ? 'Firefox' : 'Safari',
              user_agent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          });
        }
      };

      // Monitor browser cache every 15 seconds
      const browserCacheInterval = setInterval(monitorBrowserCache, 15000);
      
              return () => clearInterval(browserCacheInterval);
    }
  }, [getUserType, logCacheIssue]);

  // Add cache management UI for Rick
  useEffect(() => {
    if (getUserType() !== 'rick') return;

    // Create cache management button
    const createCacheButton = () => {
      // Remove existing button if any
      const existingButton = document.getElementById('rick-cache-manager');
      if (existingButton) {
        existingButton.remove();
      }

      const button = document.createElement('div');
      button.id = 'rick-cache-manager';
      button.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #dc2626;
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 2px solid #ef4444;
        ">
          🔄 Cache Issue Detected (${cacheIssueCount.current})
          <br>
          <small>Click to fix</small>
        </div>
      `;

      button.addEventListener('click', () => {
        forceCacheRefresh();
      });

      document.body.appendChild(button);
    };

    // Show button if cache issues detected
    if (cacheIssueCount.current > 0) {
      createCacheButton();
    }

    // Cleanup on unmount
    return () => {
      const button = document.getElementById('rick-cache-manager');
      if (button) {
        button.remove();
      }
    };
  }, [getUserType, cacheIssueCount.current, forceCacheRefresh]);

  // Add cache prevention headers and user identification
  useEffect(() => {
    if (getUserType() === 'rick') {
      // Add meta tags to prevent caching
      const addNoCacheMeta = () => {
        const existingMeta = document.querySelector('meta[http-equiv="Cache-Control"]');
        if (!existingMeta) {
          const meta = document.createElement('meta');
          meta.setAttribute('http-equiv', 'Cache-Control');
          meta.setAttribute('content', 'no-cache, no-store, must-revalidate');
          document.head.appendChild(meta);
        }

        const existingPragma = document.querySelector('meta[http-equiv="Pragma"]');
        if (!existingPragma) {
          const meta = document.createElement('meta');
          meta.setAttribute('http-equiv', 'Pragma');
          meta.setAttribute('content', 'no-cache');
          document.head.appendChild(meta);
        }

        const existingExpires = document.querySelector('meta[http-equiv="Expires"]');
        if (!existingExpires) {
          const meta = document.createElement('meta');
          meta.setAttribute('http-equiv', 'Expires');
          meta.setAttribute('content', '0');
          document.head.appendChild(meta);
        }
      };

      addNoCacheMeta();
      
      // Set user email in cookie for middleware identification
      document.cookie = `user-email=${user?.email || ''}; path=/; max-age=3600`;
      
      // Add user email to all fetch requests
      const originalFetch = window.fetch;
      window.fetch = function(input, init) {
        const newInit = {
          ...init,
          headers: {
            ...init?.headers,
            'x-user-email': user?.email || ''
          }
        };
        return originalFetch(input, newInit);
      };
    }
  }, [getUserType, user]);

  // This component doesn't render anything visible
  return null;
}
