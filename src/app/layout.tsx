import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
// import { V2StateProvider } from '@/contexts/V2StateContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Top Tier Men - Platform',
  description: 'Het ultieme platform voor mannen die hun leven naar het volgende niveau willen tillen.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <ErrorBoundary>
          {/* <V2StateProvider> */}
            <SupabaseAuthProvider>
              {children}
            </SupabaseAuthProvider>
          {/* </V2StateProvider> */}
        </ErrorBoundary>
      </body>
    </html>
  );
}
