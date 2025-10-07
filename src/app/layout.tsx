import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { OnboardingV2Provider } from '@/contexts/OnboardingV2Context';
// import { V2StateProvider } from '@/contexts/V2StateContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
// import { CacheBuster } from '@/components/CacheBuster'; - DISABLED TO PREVENT LOGOUT

const inter = Inter({ subsets: ['latin'] });

// Client-only responsive debugger overlay (visible platform-wide)
const ResponsiveDebugger = dynamic(() => import('@/components/ResponsiveDebugger'), { ssr: false });
const OnboardingDebugger = dynamic(() => import('@/components/OnboardingDebugger'), { ssr: false });

export const metadata: Metadata = {
  title: {
    default: 'Top Tier Men - Complete Lifestyle Transformation Platform',
    template: '%s | Top Tier Men'
  },
  description: 'Transform your life with Top Tier Men. Complete platform for fitness, nutrition, mindset, business, and brotherhood. Join the elite community of high-performing men.',
  keywords: ['fitness', 'nutrition', 'mindset', 'business', 'brotherhood', 'men', 'transformation', 'lifestyle', 'coaching'],
  authors: [{ name: 'Top Tier Men Team' }],
  creator: 'Top Tier Men',
  publisher: 'Top Tier Men',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://platform.toptiermen.eu'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://platform.toptiermen.eu',
    title: 'Top Tier Men - Complete Lifestyle Transformation Platform',
    description: 'Transform your life with Top Tier Men. Complete platform for fitness, nutrition, mindset, business, and brotherhood.',
    siteName: 'Top Tier Men',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Top Tier Men Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top Tier Men - Complete Lifestyle Transformation Platform',
    description: 'Transform your life with Top Tier Men. Complete platform for fitness, nutrition, mindset, business, and brotherhood.',
    images: ['/og-image.jpg'],
    creator: '@toptiermen',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  other: {
    'X-TTM-Version': '3.0.0',
    'X-Platform': 'Top Tier Men',
    'X-Environment': process.env.NODE_ENV || 'development',
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
};

// Prevent zooming on mobile (iOS & Android)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          {/* <CacheBuster version="3.0.0" forceRefresh={true} /> - DISABLED TO PREVENT LOGOUT */}
          {/* <V2StateProvider> */}
          <SupabaseAuthProvider>
        <OnboardingV2Provider>
          <div className="w-full max-w-[100vw] overflow-x-hidden">
            {children}
          </div>
          {/* Onboarding debugger must be inside providers */}
          <OnboardingDebugger />
        </OnboardingV2Provider>
          </SupabaseAuthProvider>
          {/* Global debug overlay */}
          <ResponsiveDebugger />
          {/* </V2StateProvider> */}
          <SpeedInsights />
          <Analytics />
        </ErrorBoundary>
      </body>
    </html>
  );
}
