'use client';
import { HomeIcon, FireIcon, AcademicCapIcon, ChartBarIcon, CurrencyDollarIcon, UsersIcon, BookOpenIcon, StarIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '') // verwijder accenten
    .replace(/&/g, 'en')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111111]/95 border-r border-[#C49C48]/60 shadow-2xl z-20 py-8 px-4">
        <div className="mb-10 flex items-center gap-3 px-2">
          <span className="text-2xl font-bold text-[#C49C48] tracking-tight">TopTierMen</span>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {menu.map((item, idx) => {
            const slug = idx === 0 ? 'dashboard' : `dashboard/${slugify(item.label)}`;
            const href = `/${slug}`;
            return (
              <Link
                href={href}
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[#C49C48] hover:bg-[#181818] transition-all duration-150 ${pathname === href ? 'bg-gradient-to-r from-[#C49C48] to-[#B8860B] text-black shadow-lg' : ''}`}
              >
                <item.icon className="w-6 h-6 text-[#C49C48]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button className="mt-10 w-full py-2 rounded-xl bg-gradient-to-r from-[#C49C48] to-[#B8860B] text-black font-semibold border border-[#C49C48]/80 hover:from-[#E5C97B] hover:to-[#C49C48] transition">Log Out</button>
      </aside>
      {/* Main content section */}
      <section className="flex-1 p-8 md:p-12 bg-[#111111]">{children}</section>
    </div>
  );
} 