'use client';

import { useEffect } from 'react';

interface CacheBusterProps {
  version: string;
  forceRefresh?: boolean;
}

export default function CacheBuster({ version, forceRefresh = false }: CacheBusterProps) {
  useEffect(() => {
    // Force cache refresh for Rick's dashboard access
    if (forceRefresh || version !== localStorage.getItem('ttm-app-version')) {
      console.log('🔄 Cache busting: Version mismatch or force refresh');
      console.log(`   - Current version: ${version}`);
      console.log(`   - Force refresh: ${forceRefresh}`);
      
      // Clear all cached data
      localStorage.clear();
      sessionStorage.clear();
      
      // Force a hard refresh to clear all caches
      window.location.reload();
      return;
    }
    
    // Store current version
    localStorage.setItem('ttm-app-version', version);
    
    // Additional cache busting for specific issues
    const cacheBustKey = localStorage.getItem('ttm-cache-bust');
    if (!cacheBustKey) {
      console.log('🔄 Cache busting: First time user or cache reset');
      localStorage.setItem('ttm-cache-bust', Date.now().toString());
      
      // Clear any potentially problematic cached data
      if (typeof window !== 'undefined') {
        // Clear service worker cache if exists
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
              registration.unregister();
            });
          });
        }
        
        // Clear fetch cache
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
      }
    }
  }, [version, forceRefresh]);

  return null;
}
