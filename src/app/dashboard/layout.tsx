'use client';
import { HomeIcon, FireIcon, AcademicCapIcon, ChartBarIcon, CurrencyDollarIcon, UsersIcon, BookOpenIcon, StarIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

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
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col ${collapsed ? 'w-20' : 'w-64'} bg-[#181F17] border-r border-[#3A4D23] shadow-2xl z-20 py-8 px-4 font-['Figtree'] transition-all duration-300`}>
        <div className={`mb-6 flex items-center justify-center ${collapsed ? 'px-0' : ''}`}>
          <img src="/logo.svg" alt="Top Tier Men logo" className={`${collapsed ? 'w-10' : 'w-full max-w-[160px]'} h-auto transition-all duration-300`} />
        </div>
        <div className="flex justify-center mb-8">
          <button
            className={`w-10 h-10 bg-[#232D1A] border border-[#3A4D23] rounded-full flex items-center justify-center shadow transition-all duration-300 z-30 mt-0 hover:bg-[#8BAE5A]/20`}
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Sidebar toggler"
            type="button"
          >
            {collapsed ? <ChevronRightIcon className="w-6 h-6 text-[#8BAE5A]" /> : <ChevronLeftIcon className="w-6 h-6 text-[#8BAE5A]" />}
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-2 mt-4">
          {menu.map((item, idx) => {
            const slug = idx === 0 ? 'dashboard' : `dashboard/${slugify(item.label)}`;
            const href = `/${slug}`;
            const isActive = pathname === href;
            return (
              <Link
                href={href}
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-150 font-['Figtree']
                  ${isActive ? 'bg-[#8BAE5A] text-black shadow-lg' : 'text-[#8BAE5A] hover:bg-[#232D1A] hover:text-white'}
                  ${collapsed ? 'justify-center px-2' : ''}`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'text-black' : 'text-[#8BAE5A]'}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <button className={`mt-10 w-full py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-black font-bold border border-[#8BAE5A] hover:from-[#A6C97B] hover:to-[#8BAE5A] transition font-['Figtree'] ${collapsed ? 'text-xs px-0' : ''}`}>{!collapsed ? 'Log Out' : <span className="w-6 h-6"><ChevronLeftIcon className="w-5 h-5 mx-auto text-black" /></span>}</button>
      </aside>
      {/* Main content section */}
      <section className="flex-1 p-8 md:p-12 bg-[#232D1A] font-['Figtree']">{children}</section>
    </div>
  );
} 