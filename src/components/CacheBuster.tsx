'use client';

import { useEffect } from 'react';

interface CacheBusterProps {
  version?: string;
  forceRefresh?: boolean;
}

export function CacheBuster({ version = '2.0.1', forceRefresh = false }: CacheBusterProps) {
  useEffect(() => {
    // Force cache refresh on mount
    if (forceRefresh) {
      console.log('🔄 CacheBuster: Forcing cache refresh...');
      
      // Clear localStorage and sessionStorage
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ CacheBuster: Cleared browser storage');
      } catch (error) {
        console.warn('⚠️ CacheBuster: Could not clear browser storage:', error);
      }

      // Clear caches if available
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
          console.log('✅ CacheBuster: Cleared browser caches');
        }).catch(error => {
          console.warn('⚠️ CacheBuster: Could not clear caches:', error);
        });
      }

      // Force page reload with cache busting
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('_cb', Date.now().toString());
      currentUrl.searchParams.set('_v', version);
      
      // Only reload if we're not already on a cache-busted URL
      if (!currentUrl.searchParams.has('_cb')) {
        window.location.href = currentUrl.toString();
      }
    }

    // Add cache-busting meta tags dynamically
    const addCacheBustingMetaTags = () => {
      const existingTags = document.querySelectorAll('meta[name="cache-control"], meta[http-equiv="Cache-Control"]');
      existingTags.forEach(tag => tag.remove());

      const metaTags = [
        { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate, max-age=0' },
        { 'http-equiv': 'Pragma', content: 'no-cache' },
        { 'http-equiv': 'Expires', content: '0' },
        { name: 'X-TTM-Version', content: version },
        { name: 'X-Cache-Bust', content: Date.now().toString() }
      ];

      metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        Object.entries(tag).forEach(([key, value]) => {
          meta.setAttribute(key, value);
        });
        document.head.appendChild(meta);
      });

      console.log('✅ CacheBuster: Added cache-busting meta tags');
    };

    addCacheBustingMetaTags();

    // Add cache-busting headers to all fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : input.url;
      
      // Add cache-busting parameters to API requests
      if (url.includes('/api/') || url.includes('/auth/')) {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set('_cb', Date.now().toString());
        urlObj.searchParams.set('_v', version);
        
        // Update the request
        const newInput = typeof input === 'string' ? urlObj.toString() : { ...input, url: urlObj.toString() };
        
        // Add cache-busting headers
        const newInit = {
          ...init,
          headers: {
            ...init?.headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'X-TTM-Version': version,
            'X-Cache-Bust': Date.now().toString()
          }
        };
        
        return originalFetch(newInput, newInit);
      }
      
      return originalFetch(input, init);
    };

    console.log('✅ CacheBuster: Intercepted fetch requests for cache busting');

    // Cleanup function
    return () => {
      window.fetch = originalFetch;
    };
  }, [version, forceRefresh]);

  // This component doesn't render anything visible
  return null;
}

// Hook for manual cache busting
export function useCacheBuster() {
  const bustCache = () => {
    console.log('🔄 Manual cache busting triggered...');
    
    // Clear storage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.warn('Could not clear storage:', error);
    }

    // Clear caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }

    // Force reload
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('_cb', Date.now().toString());
    window.location.href = currentUrl.toString();
  };

  return { bustCache };
}
