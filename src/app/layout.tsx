import './globals.css';
import { HomeIcon, FireIcon, AcademicCapIcon, ChartBarIcon, CurrencyDollarIcon, UsersIcon, BookOpenIcon, StarIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

function slugify(str: string) {
  return str.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
}

const menu = [
  { label: 'Dashboard', icon: HomeIcon },
  { label: 'Mijn Missies', icon: FireIcon },
  { label: 'Trainingscentrum', icon: AcademicCapIcon },
  { label: 'Mind & Focus', icon: ChartBarIcon },
  { label: 'Finance & Business', icon: CurrencyDollarIcon },
  { label: 'Brotherhood', icon: UsersIcon },
  { label: 'Boekenkamer', icon: BookOpenIcon },
  { label: 'Badges & Rangen', icon: StarIcon },
  { label: 'Mijn Profiel', icon: UserCircleIcon },
  { label: 'Mentorship & Coaching', icon: ChatBubbleLeftRightIcon },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
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
