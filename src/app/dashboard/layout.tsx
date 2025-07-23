'use client';
import { HomeIcon, FireIcon, AcademicCapIcon, ChartBarIcon, CurrencyDollarIcon, UsersIcon, BookOpenIcon, StarIcon, UserCircleIcon, ChatBubbleLeftRightIcon, ChevronUpIcon, ChevronDownIcon, Bars3Icon, XMarkIcon, BellIcon, EnvelopeIcon, CheckCircleIcon, UserGroupIcon, TrophyIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import { useDebug } from '@/contexts/DebugContext';
import DebugPanel from '@/components/DebugPanel';
import Image from 'next/image';
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
  {
    label: 'Mijn Challenges',
    icon: TrophyIcon,
    parent: 'Dashboard',
    href: '/dashboard/mijn-challenges',
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

// Dummy data voor notificaties en berichten (kan later uit context of API komen)
const notifications: any[] = [];
const messages: any[] = [];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, signOut, isAuthenticated, initialized } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState<'notifications'|'messages'|null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Check authentication with better handling
  useEffect(() => {
    if (initialized && !loading && !isAuthenticated && !redirecting) {
      console.log('User not authenticated, redirecting to login...');
      setRedirecting(true);
      router.replace('/login');
    }
  }, [initialized, loading, isAuthenticated, router, redirecting]);

  // Note: Admin users can now access both admin dashboard and regular dashboard
  // The redirect to admin dashboard only happens on initial login in AuthContext

  const handleLogout = async () => {
    try {
      console.log('Dashboard logout initiated...');
      setIsLoggingOut(true);
      await signOut();
      
      // Force redirect after a short delay to ensure cleanup
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      
    } catch (error) {
      console.error('Error logging out:', error);
      
      // Show user feedback
      alert('Er is een fout opgetreden bij het uitloggen. Probeer het opnieuw.');
      
      // Fallback: force redirect even if signOut fails
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
    } finally {
      setIsLoggingOut(false);
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

  // Sluit dropdown als je buiten het menu klikt
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  // Show loading state during initialization or authentication check
  if (loading || !initialized || redirecting) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <div className="text-[#8BAE5A] text-xl">Laden...</div>
          {redirecting && (
            <div className="text-[#8BAE5A] text-sm mt-2">Doorsturen naar login...</div>
          )}
        </div>
      </div>
    );
  }

  // Show unauthorized message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#8BAE5A] text-xl mb-4">Niet geautoriseerd</div>
          <div className="text-[#8BAE5A] text-sm">Je wordt doorgestuurd naar de login pagina...</div>
        </div>
      </div>
    );
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
          disabled={isLoggingOut}
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
          <div className="w-10 flex items-center justify-end">
            <img
              src={user?.avatar_url || "/profielfoto.png"}
              alt="Profielfoto"
              className="w-8 h-8 rounded-full border-2 border-[#8BAE5A] object-cover"
            />
          </div>
        </header>

        {/* Desktop Header (rechtsboven) */}
        <div className="hidden md:flex justify-end items-center px-8 pt-6 pb-2 gap-4">
          {/* Notificatie */}
          <div className="relative">
            <button className={`relative p-2 rounded-full bg-[#232D1A] hover:bg-[#8BAE5A]/10 transition w-12 h-12 ${dropdownOpen==='notifications' ? 'ring-2 ring-[#8BAE5A]' : ''}`} onClick={() => setDropdownOpen(dropdownOpen==='notifications'?null:'notifications')}>
              <BellIcon className="w-7 h-7 text-white" />
            </button>
            {dropdownOpen==='notifications' && (
              <div ref={dropdownRef} className="absolute right-0 mt-3 w-96 bg-[#181F17] border border-[#232D1A] rounded-2xl shadow-2xl py-4 px-0 text-white z-50">
                <div className="flex items-center justify-between px-6 mb-3">
                  <span className="text-xl font-bold">Notifications</span>
                  <button 
                    onClick={() => {/* Mark all as read functionaliteit */}}
                    className="text-[#8BAE5A] text-sm font-semibold hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {/* Social Notificaties */}
                  <div className="px-6 py-2">
                    <h4 className="text-sm font-semibold text-[#8BAE5A] mb-2">Social</h4>
                    {notifications.filter(n => n.category === 'social').map(n => (
                      <Link href={n.link} key={n.id} className="flex items-center gap-4 py-3 hover:bg-[#232D1A] transition">
                        <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#232D1A]">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-sm">{n.title}</div>
                          <div className="text-xs text-[#8BAE5A]">{n.time}</div>
                        </div>
                        {n.unread ? <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span> : <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] ml-2" />}
                      </Link>
                    ))}
                  </div>
                  {/* Prestaties Notificaties */}
                  <div className="px-6 py-2">
                    <h4 className="text-sm font-semibold text-[#FFD700] mb-2">Prestaties</h4>
                    {notifications.filter(n => n.category === 'prestaties').map(n => (
                      <Link href={n.link} key={n.id} className="flex items-center gap-4 py-3 hover:bg-[#232D1A] transition">
                        <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#232D1A]">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-sm">{n.title}</div>
                          <div className="text-xs text-[#8BAE5A]">{n.time}</div>
                        </div>
                        {n.unread ? <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span> : <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] ml-2" />}
                      </Link>
                    ))}
                  </div>
                  {/* Training Notificaties */}
                  <div className="px-6 py-2">
                    <h4 className="text-sm font-semibold text-[#8BAE5A] mb-2">Trainingen</h4>
                    {notifications.filter(n => n.category === 'training').map(n => (
                      <Link href={n.link} key={n.id} className="flex items-center gap-4 py-3 hover:bg-[#232D1A] transition">
                        <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#232D1A]">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-sm">{n.title}</div>
                          <div className="text-xs text-[#8BAE5A]">{n.time}</div>
                        </div>
                        {n.unread ? <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span> : <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] ml-2" />}
                      </Link>
                    ))}
                  </div>
                  {/* Community Notificaties */}
                  <div className="px-6 py-2">
                    <h4 className="text-sm font-semibold text-[#8BAE5A] mb-2">Community</h4>
                    {notifications.filter(n => n.category === 'community').map(n => (
                      <Link href={n.link} key={n.id} className="flex items-center gap-4 py-3 hover:bg-[#232D1A] transition">
                        <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#232D1A]">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-sm">{n.title}</div>
                          <div className="text-xs text-[#8BAE5A]">{n.time}</div>
                        </div>
                        {n.unread ? <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span> : <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] ml-2" />}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="pt-3 px-6">
                  <a href="#" className="block text-center text-[#8BAE5A] hover:underline text-sm font-semibold">View All Activity</a>
                </div>
              </div>
            )}
          </div>
          {/* Inbox */}
          <div className="relative">
            <button className={`relative p-2 rounded-full bg-[#232D1A] hover:bg-[#8BAE5A]/10 transition w-12 h-12 ${dropdownOpen==='messages' ? 'ring-2 ring-[#8BAE5A]' : ''}`} onClick={() => setDropdownOpen(dropdownOpen==='messages'?null:'messages')}>
              <EnvelopeIcon className="w-7 h-7 text-white" />
            </button>
            {dropdownOpen==='messages' && (
              <div ref={dropdownRef} className="absolute right-0 mt-3 w-96 bg-[#181F17] border border-[#232D1A] rounded-2xl shadow-2xl py-4 px-0 text-white z-50">
                <div className="flex items-center justify-between px-6 mb-3">
                  <span className="text-xl font-bold">Messages</span>
                  <a href="/dashboard/inbox" className="text-[#8BAE5A] text-sm font-semibold hover:underline">View all</a>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {messages.map(m => (
                    <a href="/dashboard/inbox" key={m.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#232D1A] transition cursor-pointer">
                      <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{m.name}</div>
                        <div className="text-xs text-[#8BAE5A] truncate">{m.text}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-[#8BAE5A]">{m.time}</span>
                        {m.unread ? <span className="w-3 h-3 bg-blue-500 rounded-full mt-1"></span> : <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] mt-1" />}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Admin Dashboard Button - Only show for admin users */}
          {user?.role === 'admin' && (
            <Link 
              href="/dashboard-admin" 
              className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] text-sm font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition"
            >
              Admin Dashboard
            </Link>
          )}
          {/* Profielfoto + dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen((v) => !v)}
              className="focus:outline-none"
              aria-label="Open profielmenu"
            >
              <img
                src={user?.avatar_url || "/profielfoto.png"}
                alt="Profielfoto"
                className="w-10 h-10 rounded-full border-2 border-[#8BAE5A] object-cover cursor-pointer"
              />
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#232D1A] border border-[#3A4D23] rounded-xl shadow-lg z-50 py-2">
                <Link
                  href="/dashboard/mijn-profiel"
                  className="block px-4 py-2 text-white hover:bg-[#8BAE5A] hover:text-black rounded-t-xl transition"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  Account instellingen
                </Link>
                <button
                  onClick={async () => {
                    setProfileMenuOpen(false);
                    await handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-[#8BAE5A] hover:text-black rounded-b-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? 'Uitloggen...' : 'Log out'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main content section */}
        <main className={`flex-1 p-4 sm:p-6 md:p-12 bg-[#232D1A] font-figtree min-h-screen pb-12 ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Debug Panel for non-admin users */}
      <DebugPanel />
    </div>
  );
} 