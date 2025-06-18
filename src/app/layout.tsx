import './globals.css';
import { Inter, Figtree } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export const metadata = {
  title: 'Top Tier Men',
  description: 'Become the best version of yourself',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} ${figtree.className}`}>
      <body>{children}</body>
    </html>
  );
}
