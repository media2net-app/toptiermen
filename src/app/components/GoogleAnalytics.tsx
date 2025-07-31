'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initGA, trackPageView } from '@/lib/google-analytics';

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Google Analytics
    initGA();
  }, []);

  useEffect(() => {
    // Track page views
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  // Don't render anything in the DOM
  return null;
} 