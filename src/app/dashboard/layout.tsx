'use client';
import { HomeIcon, FireIcon, AcademicCapIcon, ChartBarIcon, CurrencyDollarIcon, UsersIcon, BookOpenIcon, StarIcon, UserCircleIcon, ChatBubbleLeftRightIcon, ChevronUpIcon, ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
// import MobileNav from '../components/MobileNav';

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

const SidebarContent = ({ collapsed, onLinkClick }: { collapsed: boolean, onLinkClick?: () => void }) => {
  const pathname = usePathname();
  const [openBrotherhood, setOpenBrotherhood] = useState(false);
  const [openDashboard, setOpenDashboard] = useState(false);
  const safePathname = pathname || '';

  const handleLinkClick = () => {
    if(onLinkClick) {
      onLinkClick();
    }
  }

  return (
    <nav className="flex-1 flex flex-col gap-2 mt-4">
      {menu.map((item) => {
        if (!item.parent) {
          const isActive = safePathname === item.href;
          const hasSubmenu = menu.some(sub => sub.parent === item.label);

          if (hasSubmenu) {
            const isOpen = item.label === 'Dashboard' ? openDashboard : openBrotherhood;
            const setIsOpen = item.label === 'Dashboard' ? setOpenDashboard : setOpenBrotherhood;
            return (
              <div key={item.label} className="group">
                <div
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-150 font-figtree w-full text-left ${isActive && !isOpen ? 'bg-[#8BAE5A] text-black shadow-lg' : 'text-white hover:text-[#8BAE5A]'} ${collapsed ? 'justify-center px-2' : ''}`}
                  onClick={collapsed ? () => {} : () => setIsOpen(v => !v)}
                >
                  <item.icon className={`w-6 h-6 ${isActive && !isOpen ? 'text-white' : 'text-[#8BAE5A]'}`} />
                  {!collapsed && (
                    <span className="truncate col-start-2">{item.label}</span>
                  )}
                  {!collapsed && (
                    <button
                      className="col-start-3 ml-2 p-1 bg-transparent border-none"
                      aria-label={`${isOpen ? 'submenu inklappen' : 'submenu uitklappen'}`}
                    >
                      {isOpen
                        ? <ChevronUpIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8BAE5A]'}`} />
                        : <ChevronDownIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8BAE5A]'}`} />}
                    </button>
                  )}
                </div>
                {!collapsed && (
                  <div className={`ml-8 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                    {menu.filter(sub => sub.parent === item.label).map(sub => {
                      const isSubActive = safePathname === sub.href;
                      return (
                        <Link
                          href={sub.href}
                          key={sub.label}
                          onClick={handleLinkClick}
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
          // Other main items
          return (
            <Link
              href={item.href}
              key={item.label}
              onClick={handleLinkClick}
              className={`grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-150 font-figtree w-full text-left ${isActive ? 'bg-[#8BAE5A] text-black shadow-lg' : 'text-white hover:text-[#8BAE5A]'} ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'text-[#181F17]' : 'text-[#8BAE5A]'}`} />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        }
        return null;
      })}
    </nav>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (!loading && user && user.role === 'admin') {
      router.push('/dashboard-admin');
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    // Close mobile menu on resize to desktop
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-[#8BAE5A] text-xl">Laden...</div>
      </div>
    );
  }

  // Show unauthorized message if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex min-h-screen bg-[#181F17]">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#181F17] border-r border-[#3A4D23] p-4">
            <div className="flex justify-between items-center mb-6">
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <img src="/logo.svg" alt="Top Tier Men logo" className="w-32 h-auto" />
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-[#8BAE5A]"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <SidebarContent collapsed={false} onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col ${collapsed ? 'w-20' : 'w-64'} bg-[#181F17] border-r border-[#3A4D23] shadow-2xl z-20 py-8 px-4 font-figtree transition-all duration-300 fixed h-full`}>
        <div className={`mb-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link href="/dashboard" className="cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="Top Tier Men logo" className="w-full max-w-[160px] h-auto" />
            </Link>
          )}
          <button
            className="w-10 h-10 bg-[#232D1A] border border-[#3A4D23] rounded-full flex items-center justify-center shadow hover:bg-[#8BAE5A]/20"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Sidebar toggler"
          >
            {collapsed ? <ChevronRightIcon className="w-6 h-6 text-[#8BAE5A]" /> : <ChevronLeftIcon className="w-6 h-6 text-[#8BAE5A]" />}
          </button>
        </div>
        <SidebarContent collapsed={collapsed} />
        <button 
          onClick={handleLogout}
          className={`mt-auto w-full py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-black font-bold border border-[#8BAE5A] hover:from-[#A6C97B] hover:to-[#8BAE5A] transition font-figtree ${collapsed ? 'text-xs px-0' : ''}`}
        >
          {!collapsed ? 'Log Out' : <ChevronLeftIcon className="w-5 h-5 mx-auto text-black" />}
        </button>
      </aside>
      
      <div className="flex flex-col flex-1">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between bg-[#181F17] border-b border-[#3A4D23] p-4 sticky top-0 z-10">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-[#8BAE5A]"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <Link href="/dashboard">
            <img src="/logo.svg" alt="Top Tier Men logo" className="w-28 h-auto" />
          </Link>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        {/* Main content section */}
        <main className={`flex-1 p-4 sm:p-6 md:p-12 bg-[#232D1A] font-figtree min-h-screen pb-12 ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 