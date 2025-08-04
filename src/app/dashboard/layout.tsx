'use client';
import { HomeIcon, FireIcon, AcademicCapIcon, ChartBarIcon, CurrencyDollarIcon, UsersIcon, BookOpenIcon, StarIcon, UserCircleIcon, ChatBubbleLeftRightIcon, ChevronUpIcon, ChevronDownIcon, Bars3Icon, XMarkIcon, BellIcon, EnvelopeIcon, CheckCircleIcon, UserGroupIcon, TrophyIcon, CalendarDaysIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useDebug } from '@/contexts/DebugContext';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import DebugPanel from '@/components/DebugPanel';
import ForcedOnboardingModal from '@/components/ForcedOnboardingModal';
import TestUserFeedback from '@/components/TestUserFeedback';
import { useTestUser } from '@/hooks/useTestUser';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

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

function getOnboardingTargetPath(currentStep: number): string {
  switch (currentStep) {
    case 0:
    case 1:
      return '/dashboard'; // Modal steps - stay on dashboard
    case 2:
      return '/dashboard/mijn-missies';
    case 3:
    case 4:
      return '/dashboard/trainingscentrum';
    case 5:
      return '/dashboard/brotherhood/forum';
    default:
      return '/dashboard';
  }
}

const menu = [
  { label: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
  { label: 'Onboarding', icon: CheckCircleIcon, href: '/dashboard/onboarding' },
  { label: 'Mijn Profiel', icon: UserCircleIcon, parent: 'Dashboard', href: '/dashboard/mijn-profiel', isSub: true },
  {
    label: 'Mijn Missies',
    icon: FireIcon,
    parent: 'Dashboard',
    href: '/dashboard/mijn-missies',
    isSub: true
  },
  {
    label: 'Challenges',
    icon: TrophyIcon,
    parent: 'Dashboard',
    href: '/dashboard/challenges',
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
  { label: 'Producten', icon: ShoppingBagIcon, href: '/dashboard/producten' },
  { label: 'Mentorship & Coaching', icon: ChatBubbleLeftRightIcon, href: '/dashboard/mentorship-en-coaching' },
];

const SidebarContent = ({ collapsed, onLinkClick, onboardingStatus }: { collapsed: boolean, onLinkClick?: () => void, onboardingStatus?: any }) => {
  const pathname = usePathname();
  const [openBrotherhood, setOpenBrotherhood] = useState(false);
  const [openDashboard, setOpenDashboard] = useState(false);
  const safePathname = pathname || '';
  const { isOnboarding, highlightedMenu, isTransitioning } = useOnboarding();

  const handleLinkClick = () => {
    if(onLinkClick) {
      onLinkClick();
    }
  }

  return (
    <nav className="flex-1 flex flex-col gap-2 mt-4">
      {menu.map((item) => {
        // Skip onboarding menu item if onboarding is completed
        if (item.label === 'Onboarding' && onboardingStatus?.onboarding_completed) {
          return null;
        }
        
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
                      {isOpen ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                {isOpen && !collapsed && (
                  <div className="ml-4 mt-2 space-y-1">
                    {menu
                      .filter(sub => sub.parent === item.label)
                      .map(sub => {
                        const isSubActive = safePathname === sub.href;
                        const isHighlighted = isOnboarding && highlightedMenu === sub.label;
                        return (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={handleLinkClick}
                            className={`block px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
                              isSubActive 
                                ? 'bg-[#8BAE5A] text-black font-semibold' 
                                : isHighlighted
                                ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30'
                                : 'text-gray-300 hover:text-[#8BAE5A] hover:bg-[#8BAE5A]/10'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          }

          const isHighlighted = isOnboarding && highlightedMenu === item.label;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleLinkClick}
              className={`grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-150 font-figtree ${isActive ? 'bg-[#8BAE5A] text-black shadow-lg' : isHighlighted ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30' : 'text-white hover:text-[#8BAE5A]'} ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : isHighlighted ? 'text-[#FFD700]' : 'text-[#8BAE5A]'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        }
        return null;
      })}
    </nav>
  );
};

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logoutAndRedirect } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const { showDebug } = useDebug();
  const { isOnboarding, currentStep, isTransitioning } = useOnboarding();
  const isTestUser = useTestUser();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [showForcedOnboarding, setShowForcedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Define checkOnboardingStatus function first (before useEffect hooks)
  const checkOnboardingStatus = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/onboarding?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setOnboardingStatus(data);
        // Redirect to appropriate onboarding step if not completed
        if (!data.onboarding_completed) {
          const currentPath = window.location.pathname;
          const targetPath = getOnboardingTargetPath(data.current_step);
          
          // Only redirect if we're not already on the target path and not on onboarding pages
          if (currentPath !== targetPath && 
              !currentPath.includes('/dashboard/onboarding') && 
              !currentPath.includes('/dashboard/mijn-missies') &&
              !currentPath.includes('/dashboard/trainingscentrum') &&
              !currentPath.includes('/dashboard/brotherhood/forum')) {
            router.push(targetPath);
          }
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  }, [user?.id, router]);

  // Check onboarding status on mount and when user changes
  useEffect(() => {
    if (user && !loading) {
      checkOnboardingStatus();
      setIsLoading(false);
    } else if (!user && !loading) {
      setIsLoading(false);
    }
  }, [user?.id, loading, checkOnboardingStatus]);

  // Show forced onboarding if user hasn't completed onboarding
  useEffect(() => {
    if (onboardingStatus && !onboardingStatus.onboarding_completed) {
      // Only show modal for steps 0 and 1 (welcome video and goal setting)
      // For other steps, let the user navigate to the specific pages
      if (onboardingStatus.current_step <= 1) {
        setShowForcedOnboarding(true);
      } else {
        setShowForcedOnboarding(false);
      }
    } else if (onboardingStatus?.onboarding_completed) {
      setShowForcedOnboarding(false);
    }
  }, [onboardingStatus]);

  // Mobile menu resize handler
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

  // Mobile menu click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Show loading state while authentication is in progress
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Laden...</p>
          {/* Add timeout indicator */}
          <div className="mt-4">
            <p className="text-[#B6C948] text-sm">Dashboard wordt geladen</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-[#8BAE5A] hover:text-[#B6C948] underline text-sm"
            >
              Pagina herladen als het te lang duurt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      console.log('Dashboard logout initiated...');
      setIsLoggingOut(true);
      await logoutAndRedirect();
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#0A0F0A] flex" suppressHydrationWarning>
      {/* Sidebar */}
      <div className={`bg-[#232D1A] border-r border-[#3A4D23] transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-16' : 'w-64 lg:w-72'
      } hidden lg:flex flex-col fixed h-full z-40`}>
        <div className="flex-1 flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-[#3A4D23]">
            <Link href="/dashboard" className="flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="Top Tier Men Logo"
                width={sidebarCollapsed ? 32 : 200}
                height={32}
                className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-full h-8'} object-contain hover:opacity-80 transition-opacity`}
              />
            </Link>
          </div>

          {/* Navigation */}
          <SidebarContent 
            collapsed={sidebarCollapsed} 
            onboardingStatus={onboardingStatus}
          />

          {/* User Profile */}
          <div className="p-4 border-t border-[#3A4D23]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                <span className="text-[#0A0F0A] font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user.email}
                  </p>
                  <p className="text-[#8BAE5A] text-xs">
                    {user.role?.toLowerCase() === 'admin' ? 'Admin' : 'Lid'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapse Button */}
        <div className="p-4 border-t border-[#3A4D23]">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full p-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors flex items-center justify-center"
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64 lg:ml-72'
      }`}>
        {/* Top Bar */}
        <div className="bg-[#232D1A] border-b border-[#3A4D23] p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile/Tablet Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
            >
              <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Page Title */}
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white">
              {menu.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Admin Dashboard Button */}
            {user.role?.toLowerCase() === 'admin' && (
              <Link
                href="/dashboard-admin"
                className="px-2 sm:px-3 md:px-4 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold flex items-center gap-1 md:gap-2 text-xs sm:text-sm md:text-base"
              >
                <UserGroupIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Admin Dashboard</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            )}

            {/* Notifications */}
            <button className="p-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors">
              <BellIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Messages */}
            <button className="p-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors">
              <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-2 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Uitloggen...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Uitloggen</span>
                  <span className="sm:hidden">x Uit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="bg-[#232D1A] w-[85%] max-w-[400px] h-full p-3 sm:p-4 mobile-menu">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-[#8BAE5A] font-bold text-base sm:text-lg">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <SidebarContent 
                collapsed={false} 
                onLinkClick={() => setIsMobileMenuOpen(false)}
                onboardingStatus={onboardingStatus}
              />
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Main Content */}
          <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            {children}
          </div>
        </div>
      </div>

      {/* Forced Onboarding Modal */}
      <ForcedOnboardingModal 
        isOpen={showForcedOnboarding}
        onComplete={() => {
          setShowForcedOnboarding(false);
          // Don't refresh status here as the modal handles navigation
        }}
      />

      {/* Debug Panel */}
      {showDebug && <DebugPanel />}

      {/* Test User Feedback */}
      <TestUserFeedback 
        isTestUser={isTestUser}
        currentPage={pathname || '/'}
        userRole={user?.role}
        onNoteCreated={(note) => {
          console.log('Test note created:', note);
          // In a real app, this would send the note to the server
        }}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <DashboardContent>{children}</DashboardContent>
    </OnboardingProvider>
  );
} 