import './globals.css';
import { Figtree } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Providers from './components/Providers';
import GoogleAnalytics from './components/GoogleAnalytics';
import MetaPixel from './components/MetaPixel';

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export const metadata = {
  title: 'Top Tier Men',
  description: 'Become the best version of yourself. Join the Top Tier Men community and transform your life with fitness, nutrition, mindset, and brotherhood.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Top Tier Men',
    startupImage: [
      {
        url: '/logo_white-full.svg',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/logo_white-full.svg',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/logo_white-full.svg',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/logo_white-full.svg',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/logo_white-full.svg',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/logo_white-full.svg',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  icons: {
    icon: '/logo_white-full.svg',
    apple: '/logo_white-full.svg',
    shortcut: '/logo_white-full.svg',
  },
  // Open Graph / Facebook
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://platform.toptiermen.eu',
    siteName: 'Top Tier Men',
    title: 'Top Tier Men - Become the Best Version of Yourself',
    description: 'Join the Top Tier Men community and transform your life with fitness, nutrition, mindset, and brotherhood.',
    images: [
      {
        url: '/logo_white-full.png',
        width: 1200,
        height: 630,
        alt: 'Top Tier Men - Fitness, Nutrition, Mindset & Brotherhood',
        type: 'image/png',
      },
    ],
  },
  // Twitter
  twitter: {
    card: 'summary_large_image',
    site: '@toptiermen',
    creator: '@toptiermen',
    title: 'Top Tier Men - Become the Best Version of Yourself',
    description: 'Join the Top Tier Men community and transform your life with fitness, nutrition, mindset, and brotherhood.',
    images: [
      {
        url: '/logo_white-full.png',
        alt: 'Top Tier Men - Fitness, Nutrition, Mindset & Brotherhood',
      }
    ],
  },
  // Additional meta tags
  keywords: ['fitness', 'nutrition', 'mindset', 'brotherhood', 'personal development', 'men', 'health', 'wellness'],
  authors: [{ name: 'Top Tier Men' }],
  creator: 'Top Tier Men',
  publisher: 'Top Tier Men',
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
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8BAE5A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={figtree.className}>
      <head>
        <GoogleAnalytics />
        <MetaPixel />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              backgroundColor: '#232D1A',
              color: '#8BAE5A',
              border: '1px solid #3A4D23',
            },
          }}
        />
      </body>
    </html>
  );
}
