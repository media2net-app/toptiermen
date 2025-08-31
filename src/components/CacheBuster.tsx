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
      
      // Clear only non-auth storage to preserve login state
      try {
        const clearStorageExceptAuth = () => {
          try {
            // Get auth tokens before clearing
            const authToken = localStorage.getItem('toptiermen-v2-auth');
            const rememberMe = localStorage.getItem('toptiermen-remember-me');
            const supabaseAuth = localStorage.getItem('sb-toptiermen-auth-token');
            
            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear service worker cache if available
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => registration.unregister());
              });
            }
            
            // Clear all caches
            if ('caches' in window) {
              caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
              });
            }
            
            // Restore auth tokens
            if (authToken) {
              localStorage.setItem('toptiermen-v2-auth', authToken);
            }
            if (rememberMe) {
              localStorage.setItem('toptiermen-remember-me', rememberMe);
            }
            if (supabaseAuth) {
              localStorage.setItem('sb-toptiermen-auth-token', supabaseAuth);
            }
            
            console.log('🧹 Storage and caches cleared (auth preserved)');
          } catch (error) {
            console.error('Error clearing storage:', error);
          }
        };
        clearStorageExceptAuth();
        
        console.log('✅ CacheBuster: Cleared browser storage (preserved auth)');
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
      let url: string;
      
      // Handle different input types
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
      } else if (input instanceof URL) {
        url = input.toString();
      } else {
        // Fallback for other types
        return originalFetch(input, init);
      }
      
      // Add cache-busting parameters to API requests
      if (url.includes('/api/') || url.includes('/auth/')) {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set('_cb', Date.now().toString());
        urlObj.searchParams.set('_v', version);
        
        // Update the request
        let newInput: RequestInfo | URL;
        if (typeof input === 'string') {
          newInput = urlObj.toString();
        } else if (input instanceof Request) {
          newInput = new Request(urlObj.toString(), input);
        } else if (input instanceof URL) {
          newInput = urlObj;
        } else {
          newInput = input;
        }
        
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
    
    // Clear storage but preserve auth
    try {
      const authKeys = ['toptiermen-v2-auth', 'toptiermen-remember-me'];
      const preservedData: Record<string, string> = {};
      
      // Save auth data
      authKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) preservedData[key] = value;
      });
      
      localStorage.clear();
      sessionStorage.clear();
      
      // Restore auth data
      Object.entries(preservedData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
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
