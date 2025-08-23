import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Tier Men - Registreer Nu voor de Launch op 10 September',
  description: 'Registreer je nu voor Top Tier Men en word onderdeel van een elite community. We gaan live op 10 september! Transformeer jezelf met fitness, mindset en brotherhood.',
  keywords: ['fitness', 'mindset', 'brotherhood', 'registratie', 'prelaunch', 'elite community', 'mannen', 'gezondheid', 'welzijn'],
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
  // Open Graph / Facebook
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://platform.toptiermen.eu/prelaunch',
    siteName: 'Top Tier Men',
    title: 'Top Tier Men - Registreer Nu voor de Launch op 10 September',
    description: 'Registreer je nu voor Top Tier Men en word onderdeel van een elite community. We gaan live op 10 september! Transformeer jezelf met fitness, mindset en brotherhood.',
    images: [
      {
        url: '/toptiermen-logo-fb.jpg',
        width: 1200,
        height: 630,
        alt: 'Top Tier Men - Registreer Nu voor de Launch op 10 September',
        type: 'image/jpeg',
      },
    ],
  },
  // Twitter
  twitter: {
    card: 'summary_large_image',
    site: '@toptiermen',
    creator: '@toptiermen',
    title: 'Top Tier Men - Registreer Nu voor de Launch op 10 September',
    description: 'Registreer je nu voor Top Tier Men en word onderdeel van een elite community. We gaan live op 10 september! Transformeer jezelf met fitness, mindset en brotherhood.',
    images: [
      {
        url: '/toptiermen-logo-fb.jpg',
        alt: 'Top Tier Men - Registreer Nu voor de Launch op 10 September',
      }
    ],
  },
};

export default function PrelaunchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
