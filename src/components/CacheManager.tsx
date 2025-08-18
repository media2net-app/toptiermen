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

  // Force cache refresh for Rick (Chrome + PWA)
  const forceCacheRefresh = useCallback(() => {
    if (getUserType() === 'rick') {
      const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                   (window.navigator as any).standalone === true ||
                   document.referrer.includes('android-app://');
      
      if (isChrome || isPWA) {
        // Clear browser cache for current domain (Chrome + PWA)
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName);
            });
          });
        }

        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // Clear service worker cache for PWA
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
              registration.unregister();
            });
          });
        }

        // Force reload with cache busting
        const timestamp = Date.now();
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('_cb', timestamp.toString());
        
        logCacheIssue({
          error_message: `Forced cache refresh for Rick (${isPWA ? 'PWA' : 'Chrome'})`,
          details: {
            action: 'force_cache_refresh',
            browser: navigator.userAgent,
            is_pwa: isPWA,
            display_mode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
            timestamp: new Date().toISOString(),
            new_url: currentUrl.toString()
          }
        });

        // Reload page with cache busting
        window.location.href = currentUrl.toString();
      } else {
        // For non-Chrome/non-PWA browsers, just log the issue but don't force refresh
        logCacheIssue({
          error_message: 'Cache refresh skipped for non-Chrome/non-PWA browser',
          details: {
            action: 'cache_refresh_skipped',
            browser: navigator.userAgent,
            is_pwa: isPWA,
            display_mode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
            timestamp: new Date().toISOString()
          }
        });
      }
    }
  }, [getUserType, logCacheIssue]);

  // Auto-cache refresh for Rick when issues are detected (Chrome + PWA)
  useEffect(() => {
    if (getUserType() !== 'rick') return;

    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                 (window.navigator as any).standalone === true ||
                 document.referrer.includes('android-app://');
    
    if (isChrome || isPWA) {
      const checkAndFixCache = () => {
        detectCacheIssues();
        
        // If multiple cache issues detected, auto-refresh
        if (cacheIssueCount.current >= 3) {
          logCacheIssue({
            error_message: `Auto-refreshing cache due to multiple issues (${isPWA ? 'PWA' : 'Chrome'})`,
            details: {
              cache_issue_count: cacheIssueCount.current,
              browser: navigator.userAgent,
              is_pwa: isPWA,
              display_mode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
              action: 'auto_cache_refresh',
              timestamp: new Date().toISOString()
            }
          });
          
          // Reset counter and force refresh
          cacheIssueCount.current = 0;
          forceCacheRefresh();
        }
      };

      // Check cache every 30 seconds for Rick (Chrome + PWA)
      const cacheCheckInterval = setInterval(checkAndFixCache, 30000);
      
      // Initial check
      checkAndFixCache();
      
      return () => clearInterval(cacheCheckInterval);
    }
  }, [getUserType, detectCacheIssues, forceCacheRefresh, logCacheIssue]);

    // Monitor for Chrome/PWA-specific cache issues
  useEffect(() => {
    if (getUserType() !== 'rick') return;

    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                 (window.navigator as any).standalone === true ||
                 document.referrer.includes('android-app://');
    
    if (isChrome || isPWA) {
      // Chrome/PWA-specific cache monitoring
      const monitorChromePWACache = () => {
        // Check for Chrome's/PWA's aggressive caching
        const cacheIndicators = [
          // Check if page loads instantly (cache)
          performance.timing.loadEventEnd - performance.timing.navigationStart < 50,
          // Check for cached resources
          performance.getEntriesByType('resource').filter(entry => (entry as any).transferSize === 0).length > 5,
          // Check for old service worker cache
          'serviceWorker' in navigator && navigator.serviceWorker.controller,
          // PWA-specific: Check for standalone mode
          isPWA && window.matchMedia('(display-mode: standalone)').matches
        ];

        const hasCacheIssues = cacheIndicators.some(indicator => indicator);
        
        if (hasCacheIssues) {
          logCacheIssue({
            error_message: `${isPWA ? 'PWA' : 'Chrome'} cache issue detected`,
            details: {
              cache_indicators: cacheIndicators,
              browser_type: isPWA ? 'PWA' : 'Chrome',
              is_pwa: isPWA,
              display_mode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
              user_agent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          });
        }
      };

      // Monitor cache every 15 seconds
      const cacheInterval = setInterval(monitorChromePWACache, 15000);
      
      return () => clearInterval(cacheInterval);
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
