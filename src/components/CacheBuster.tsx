'use client';

import { useEffect } from 'react';

interface CacheBusterProps {
  version?: string;
  forceRefresh?: boolean;
}

// DISABLED: CacheBuster causing logout issues
export function CacheBuster({ version = '2.0.3', forceRefresh = false }: CacheBusterProps) {
  useEffect(() => {
    // DISABLED: CacheBuster causing logout issues
    console.log('🔄 CacheBuster: DISABLED to prevent logout issues');
  }, [version, forceRefresh]);

  // This component doesn't render anything visible
  return null;
}

// Hook for manual cache busting - DISABLED
export function useCacheBuster() {
  const bustCache = () => {
    console.log('🔄 Manual cache busting: DISABLED to prevent logout issues');
  };

  return { bustCache };
}
