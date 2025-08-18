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

  // Force cache refresh for Rick (all browsers) - AGGRESSIVE
  const forceCacheRefresh = useCallback(() => {
    if (getUserType() === 'rick') {
      const userAgent = navigator.userAgent;
      const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
      
      console.log('🔄 Rick: Starting aggressive cache clearing for', isChrome ? 'Chrome' : 'browser');

      // Clear browser cache for current domain (all browsers)
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          console.log('🗑️ Clearing caches:', cacheNames);
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }

      // Clear IndexedDB for Edge/Chrome
      if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
          console.log('🗑️ Clearing IndexedDB databases:', databases.map(db => db.name));
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        }).catch(() => {
          // IndexedDB not supported or error
        });
      }

      // Chrome-specific aggressive clearing
      if (isChrome) {
        // Clear Chrome's V8 cache
        if ('gc' in window) {
          try {
            (window as any).gc();
            console.log('🗑️ Chrome: Forced garbage collection');
          } catch (e) {
            console.log('⚠️ Chrome: Could not force garbage collection');
          }
        }

        // Clear Chrome's memory cache
        if ('memory' in performance) {
          console.log('🗑️ Chrome: Memory usage before clear:', (performance as any).memory.usedJSHeapSize / 1024 / 1024, 'MB');
        }

        // Clear Chrome's service worker cache more aggressively
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            console.log('🗑️ Chrome: Clearing service workers:', registrations.length);
            registrations.forEach(registration => {
              registration.unregister();
            });
          });
        }

        // Clear Chrome's application cache
        if ('applicationCache' in window) {
          try {
            (window as any).applicationCache.clear();
            console.log('🗑️ Chrome: Cleared application cache');
          } catch (e) {
            console.log('⚠️ Chrome: Could not clear application cache');
          }
        }
      }

      // Clear localStorage and sessionStorage
      console.log('🗑️ Clearing localStorage and sessionStorage');
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies for current domain (more aggressive)
      const cookies = document.cookie.split(";");
      console.log('🗑️ Clearing cookies:', cookies.length);
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name) {
          // Clear with multiple paths and domains
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/dashboard`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/login`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=${window.location.hostname}`;
        }
      });

      // Clear Chrome's disk cache (if possible)
      if (isChrome && 'webkitRequestFileSystem' in window) {
        try {
          (window as any).webkitRequestFileSystem((window as any).TEMPORARY, 0, (fs: any) => {
            fs.root.createReader().readEntries((entries: any[]) => {
              entries.forEach(entry => {
                if (entry.isFile) {
                  entry.remove();
                }
              });
            });
          });
          console.log('🗑️ Chrome: Cleared temporary file system');
        } catch (e) {
          console.log('⚠️ Chrome: Could not clear temporary file system');
        }
      }

      // Force reload with cache busting
      const timestamp = Date.now();
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('_cb', timestamp.toString());
      currentUrl.searchParams.set('_nocache', '1');
      currentUrl.searchParams.set('_t', timestamp.toString());
      
      logCacheIssue({
        error_message: `Aggressive cache refresh for Rick (${isChrome ? 'Chrome' : 'browser'})`,
        details: {
          action: 'aggressive_cache_refresh',
          browser: userAgent,
          is_chrome: isChrome,
          timestamp: new Date().toISOString(),
          new_url: currentUrl.toString()
        }
      });

      // Wait a bit then reload page with cache busting
      setTimeout(() => {
        console.log('🔄 Rick: Reloading page with cache busting');
        window.location.href = currentUrl.toString();
      }, 100);
    }
  }, [getUserType, logCacheIssue]);

  // Auto-cache refresh for Rick when issues are detected (disabled for Chrome)
  useEffect(() => {
    if (getUserType() !== 'rick') return;

    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
    
    // Skip cache monitoring for Rick in Chrome (we auto-clear everything)
    if (isChrome) {
      console.log('🔄 Rick: Skipping cache monitoring in Chrome (auto-clear enabled)');
      return;
    }

    const checkAndFixCache = () => {
      detectCacheIssues();
      
      // If multiple cache issues detected, auto-refresh
      const threshold = 3;
      
      if (cacheIssueCount.current >= threshold) {
        logCacheIssue({
          error_message: 'Auto-refreshing cache due to multiple issues',
          details: {
            cache_issue_count: cacheIssueCount.current,
            action: 'auto_cache_refresh',
            timestamp: new Date().toISOString()
          }
        });
        
        // Reset counter and force refresh
        cacheIssueCount.current = 0;
        forceCacheRefresh();
      }
    };

    // Check cache every 30 seconds for Rick (non-Chrome browsers)
    const cacheCheckInterval = setInterval(checkAndFixCache, 30000);
    
    // Initial check
    checkAndFixCache();
    
    return () => clearInterval(cacheCheckInterval);
  }, [getUserType, detectCacheIssues, forceCacheRefresh, logCacheIssue]);

  // Monitor for browser-specific cache issues (Edge, Firefox - Chrome disabled)
  useEffect(() => {
    if (getUserType() !== 'rick') return;

    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
    const isEdge = /Edge/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    
    // Skip Chrome monitoring (we auto-clear everything)
    if (isChrome) {
      console.log('🔄 Rick: Skipping Chrome cache monitoring (auto-clear enabled)');
      return;
    }
    
    if (isEdge || isFirefox) {
      // Browser-specific cache monitoring
      const monitorBrowserCache = () => {
        // Check for browser-specific aggressive caching
        const browserCacheIndicators = [
          // Check if page loads instantly (browser cache)
          performance.timing.loadEventEnd - performance.timing.navigationStart < 50,
          // Check for cached resources
          performance.getEntriesByType('resource').filter(entry => (entry as any).transferSize === 0).length > 5,
          // Check for old service worker cache
          'serviceWorker' in navigator && navigator.serviceWorker.controller,
          // Edge-specific: check for aggressive memory caching
          isEdge && 'memory' in performance && (performance as any).memory.usedJSHeapSize > 50 * 1024 * 1024, // 50MB
          // Chrome monitoring disabled (auto-clear enabled)
          // Firefox-specific: check for aggressive disk cache
          isFirefox && sessionStorage.getItem('firefox_cache_check') !== 'cleared'
        ];

        const hasBrowserCacheIssues = browserCacheIndicators.some(indicator => indicator);
        
        if (hasBrowserCacheIssues) {
          logCacheIssue({
            error_message: `${isEdge ? 'Edge' : isChrome ? 'Chrome' : 'Firefox'} cache issue detected`,
            details: {
              browser_cache_indicators: browserCacheIndicators,
              browser_type: isEdge ? 'Edge' : isChrome ? 'Chrome' : 'Firefox',
              user_agent: userAgent,
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

      const userAgent = navigator.userAgent;
      const isEdge = /Edge/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
      const isFirefox = /Firefox/.test(userAgent);
      const browserType = isEdge ? 'Edge' : isChrome ? 'Chrome' : isFirefox ? 'Firefox' : 'Unknown';

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
          🔄 ${browserType} Cache Issue (${cacheIssueCount.current})
          <br>
          <small>Click to fix all browsers</small>
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
      
      // Chrome-specific cache prevention
      const userAgent = navigator.userAgent;
      const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
      
      if (isChrome) {
        console.log('🔄 Rick: Chrome detected, implementing aggressive cache prevention');
        
        // Set Chrome-specific cache version
        localStorage.setItem('chrome_cache_version', 'v4');
        
        // Add Chrome-specific meta tags (more aggressive)
        const chromeMeta = document.createElement('meta');
        chromeMeta.setAttribute('name', 'chrome-cache-control');
        chromeMeta.setAttribute('content', 'no-cache, no-store, must-revalidate, max-age=0, private');
        document.head.appendChild(chromeMeta);
        
        // Add additional Chrome cache prevention
        const additionalMeta = document.createElement('meta');
        additionalMeta.setAttribute('name', 'chrome-cache-busting');
        additionalMeta.setAttribute('content', `timestamp-${Date.now()}`);
        document.head.appendChild(additionalMeta);
        
        // Disable Chrome's back-forward cache
        if ('performance' in window && 'navigation' in performance) {
          const nav = (performance as any).navigation;
          if (nav.type === 1) { // NavigationType.RELOAD
            console.log('🔄 Chrome: Page reload detected, clearing cache');
            localStorage.clear();
            sessionStorage.clear();
          }
        }
        
        // Auto-clear cache on page load for Rick in Chrome
        const autoClearCache = () => {
          console.log('🔄 Rick: Auto-clearing Chrome cache on page load');
          
          // Clear all storage immediately
          localStorage.clear();
          sessionStorage.clear();
          
          // Clear cookies
          document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name && !name.includes('user-email')) { // Keep user email cookie
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            }
          });
          
          // Clear caches
          if ('caches' in window) {
            caches.keys().then(cacheNames => {
              cacheNames.forEach(cacheName => {
                caches.delete(cacheName);
              });
            });
          }
          
          // Clear IndexedDB
          if ('indexedDB' in window) {
            indexedDB.databases().then(databases => {
              databases.forEach(db => {
                if (db.name) {
                  indexedDB.deleteDatabase(db.name);
                }
              });
            });
          }
          
          // Unregister service workers
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
              registrations.forEach(registration => {
                registration.unregister();
              });
            });
          }
        };
        
        // Run auto-clear on page load
        autoClearCache();
        
        // Also clear cache every 5 seconds for Rick in Chrome
        const autoClearInterval = setInterval(autoClearCache, 5000);
        
        // Cleanup interval on component unmount
        return () => clearInterval(autoClearInterval);
      }
      
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
