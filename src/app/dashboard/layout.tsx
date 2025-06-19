'use client';
import { HomeIcon, FireIcon, AcademicCapIcon, ChartBarIcon, CurrencyDollarIcon, UsersIcon, BookOpenIcon, StarIcon, UserCircleIcon, ChatBubbleLeftRightIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
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
  { label: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
  { label: 'Mijn Profiel', icon: UserCircleIcon, parent: 'Dashboard', href: '/dashboard/mijn-profiel', isSub: true },
  {
    label: 'Mijn Missies',
    icon: FireIcon,
    parent: 'Dashboard',
    href: '/dashboard/mijn-missies',
    isSub: true
  },
  { label: 'Mijn Trainingen', icon: AcademicCapIcon, parent: 'Dashboard', href: '/dashboard/mijn-trainingen', isSub: true },
  { label: 'Finance & Business', icon: CurrencyDollarIcon, parent: 'Dashboard', href: '/dashboard/finance-en-business', isSub: true },
  { label: 'Academy', icon: FireIcon, href: '/dashboard/academy' },
  { label: 'Trainingscentrum', icon: AcademicCapIcon, href: '/dashboard/trainingscentrum' },
  { label: 'Mind & Focus', icon: ChartBarIcon, href: '/dashboard/mind-en-focus' },
  { label: 'Brotherhood', icon: UsersIcon, href: '/dashboard/brotherhood' },
  { label: 'Social Feed', icon: ChatBubbleLeftRightIcon, parent: 'Brotherhood', href: '/dashboard/brotherhood/social-feed', isSub: true },
  { label: 'Forum', icon: FireIcon, parent: 'Brotherhood', href: '/dashboard/brotherhood/forum', isSub: true },
  { label: 'Leden', icon: UsersIcon, parent: 'Brotherhood', href: '/dashboard/brotherhood/leden', isSub: true },
  { label: 'Mijn Groepen & Evenementen', icon: StarIcon, parent: 'Brotherhood', href: '/dashboard/brotherhood/mijn-groepen', isSub: true },
  { label: 'Boekenkamer', icon: BookOpenIcon, href: '/dashboard/boekenkamer' },
  { label: 'Badges & Rangen', icon: StarIcon, href: '/dashboard/badges-en-rangen' },
  { label: 'Mentorship & Coaching', icon: ChatBubbleLeftRightIcon, href: '/dashboard/mentorship-en-coaching' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openBrotherhood, setOpenBrotherhood] = useState(false);
  const [openDashboard, setOpenDashboard] = useState(false);
  const safePathname = pathname || '';
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col ${collapsed ? 'w-20' : 'w-64'} bg-[#181F17] border-r border-[#3A4D23] shadow-2xl z-20 py-8 px-4 font-figtree transition-all duration-300`}>
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
            if (!item.parent) {
              // Hoofditem
              const isActive = safePathname === item.href;
              // Dashboard special case
              if (item.label === 'Dashboard') {
                return (
                  <div key={item.label} className="group">
                    <div className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-150 font-figtree w-full text-left ${isActive ? 'bg-[#8BAE5A] text-black shadow-lg' : 'text-white hover:text-[#8BAE5A]'} ${collapsed ? 'justify-center px-2' : ''}`}
                    >
                      <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#8BAE5A]'}`} />
                      {!collapsed && (
                        <Link href={item.href} className="col-start-2" style={{ minWidth: 0 }}>
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )}
                      <button
                        className={`col-start-3 ml-2 p-1 ${collapsed ? 'pointer-events-none opacity-50' : 'pointer-events-auto'} bg-transparent border-none`}
                        onClick={e => { e.stopPropagation(); setOpenDashboard(v => !v); }}
                        aria-label={openDashboard ? 'Dashboard submenu inklappen' : 'Dashboard submenu uitklappen'}
                        tabIndex={0}
                        type="button"
                      >
                        {openDashboard
                          ? <ChevronUpIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8BAE5A]'}`} />
                          : <ChevronDownIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8BAE5A]'}`} />}
                      </button>
                    </div>
                    {/* Subitems */}
                    {menu.filter(sub => sub.parent === item.label).length > 0 && !collapsed && (
                      <div className={`ml-8 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-300 ${openDashboard ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                        {menu.filter(sub => sub.parent === item.label).map(sub => {
                          const isSubActive = safePathname === sub.href;
                          return (
                            <Link
                              href={sub.href}
                              key={sub.label}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${isSubActive ? 'bg-[#8BAE5A] text-black' : 'text-white hover:text-[#8BAE5A]'}`}
                            >
                              <span className='text-[#8BAE5A] w-5 inline-block text-lg'>-</span>
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              // Brotherhood special case
              if (item.label === 'Brotherhood') {
                return (
                  <div key={item.label} className="group">
                    <div className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-150 font-figtree w-full text-left ${isActive ? 'bg-[#8BAE5A] text-black shadow-lg' : 'text-white hover:text-[#8BAE5A]'} ${collapsed ? 'justify-center px-2' : ''}`}
                    >
                      <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#8BAE5A]'}`} />
                      {!collapsed && (
                        <Link href={item.href} className="col-start-2" style={{ minWidth: 0 }}>
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )}
                      <button
                        className={`col-start-3 ml-2 p-1 ${collapsed ? 'pointer-events-none opacity-50' : 'pointer-events-auto'} bg-transparent border-none`}
                        onClick={e => { e.stopPropagation(); setOpenBrotherhood(v => !v); }}
                        aria-label={openBrotherhood ? 'Brotherhood submenu inklappen' : 'Brotherhood submenu uitklappen'}
                        tabIndex={0}
                        type="button"
                      >
                        {openBrotherhood
                          ? <ChevronUpIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8BAE5A]'}`} />
                          : <ChevronDownIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8BAE5A]'}`} />}
                      </button>
                    </div>
                    {/* Subitems */}
                    {menu.filter(sub => sub.parent === item.label).length > 0 && !collapsed && (
                      <div className={`ml-8 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-300 ${openBrotherhood ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                        {menu.filter(sub => sub.parent === item.label).map(sub => {
                          const isSubActive = safePathname === sub.href;
                          return (
                            <Link
                              href={sub.href}
                              key={sub.label}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${isSubActive ? 'bg-[#8BAE5A] text-black' : 'text-white hover:text-[#8BAE5A]'}`}
                            >
                              <span className='text-[#8BAE5A] w-5 inline-block text-lg'>-</span>
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              // Overige hoofditems
              return (
                <div key={item.label} className="group">
                  <div className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-150 font-figtree w-full text-left ${isActive ? 'bg-[#8BAE5A] text-black shadow-lg' : 'text-white hover:text-[#8BAE5A]'} ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <item.icon className={`w-6 h-6 ${isActive ? 'text-[#181F17]' : 'text-[#8BAE5A]'}`} />
                    {!collapsed && (
                      <Link href={item.href} className="col-start-2" style={{ minWidth: 0 }}>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            }
            // Subitems worden hierboven al gerenderd
            return null;
          })}
        </nav>
        <button className={`mt-10 w-full py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-black font-bold border border-[#8BAE5A] hover:from-[#A6C97B] hover:to-[#8BAE5A] transition font-figtree ${collapsed ? 'text-xs px-0' : ''}`}>{!collapsed ? 'Log Out' : <span className="w-6 h-6"><ChevronLeftIcon className="w-5 h-5 mx-auto text-black" /></span>}</button>
      </aside>
      {/* Main content section */}
      <section className="flex-1 p-8 md:p-12 bg-[#232D1A] font-figtree">{children}</section>
    </div>
  );
} 