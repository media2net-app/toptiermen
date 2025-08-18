'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { trackPageView } from '@/lib/google-analytics';

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views when pathname changes
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-YT2NR1LKHX"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YT2NR1LKHX');
        `}
      </Script>
    </>
  );
} 