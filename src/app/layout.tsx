import './globals.css';
import { Inter, Figtree } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const figtree = Figtree({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={figtree.className}>
      <body>
        <div className="flex min-h-screen">
          {/* Sidebar wordt nu niet gerenderd in layout, alleen in sub-layouts */}
          <main className="flex-1 min-h-screen bg-[#18122B]" style={{ width: '100%' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
