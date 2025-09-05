import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sneak Preview - Top Tier Men Platform',
  description: 'Exclusieve preview van het Top Tier Men platform. Alleen beschikbaar voor pre-launch leden.',
  robots: 'noindex, nofollow', // Keep this exclusive and private
  openGraph: {
    title: 'Exclusieve Platform Preview - Top Tier Men',
    description: 'Eerste blik op het Top Tier Men platform voor uitgenodigde pre-launch leden.',
    type: 'website',
    url: 'https://platform.toptiermen.eu/sneakpreview',
  },
};

export default function SneakPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
