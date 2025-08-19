import './globals.css';
import { Figtree } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Providers from './components/Providers';
import GoogleAnalytics from './components/GoogleAnalytics';

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export const metadata = {
  title: 'Top Tier Men',
  description: 'Become the best version of yourself',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Top Tier Men',
  },
  icons: {
            icon: '/logo_white-full.svg',
        apple: '/logo_white-full.svg',
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
