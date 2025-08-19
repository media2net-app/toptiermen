'use client';
import { HomeIcon, FireIcon, AcademicCapIcon, ChartBarIcon, CurrencyDollarIcon, UsersIcon, BookOpenIcon, StarIcon, UserCircleIcon, ChatBubbleLeftRightIcon, ChevronUpIcon, ChevronDownIcon, Bars3Icon, XMarkIcon, BellIcon, EnvelopeIcon, CheckCircleIcon, UserGroupIcon, TrophyIcon, CalendarDaysIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useDebug } from '@/contexts/DebugContext';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import DebugPanel from '@/components/DebugPanel';
import ForcedOnboardingModal from '@/components/ForcedOnboardingModal';
import TestUserFeedback from '@/components/TestUserFeedback';
import { useTestUser } from '@/hooks/useTestUser';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ErrorBoundary from '@/components/ErrorBoundary';

import Image from 'next/image';


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
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Mijn Missies', href: '/dashboard/mijn-missies' },
  { label: 'Mijn Challenges', href: '/dashboard/mijn-challenges' },
  { label: 'Trainingscentrum', href: '/dashboard/trainingscentrum' },
  { label: 'Mind & Focus', href: '/dashboard/mind-en-focus' },
  { label: 'Finance & Business', href: '/dashboard/finance-en-business' },
  {
    label: 'Brotherhood',
    href: '/dashboard/brotherhood',
    subItems: [
      { label: 'Dashboard', href: '/dashboard/brotherhood' },
      { label: 'Social Feed', href: '/dashboard/brotherhood/social-feed' },
      { label: 'Forum', href: '/dashboard/brotherhood/forum' },
      { label: 'Leden', href: '/dashboard/brotherhood/leden' },
      { label: 'Mijn Groepen & Evenementen', href: '/dashboard/brotherhood/mijn-groepen' },
    ],
  },
  { label: 'Boekenkamer', href: '/dashboard/boekenkamer' },
  { label: 'Badges & Rangen', href: '/dashboard/badges-en-rangen' },
  { label: 'Mijn Profiel', href: '/dashboard/mijn-profiel' },
  { label: 'Mentorship & Coaching', href: '/dashboard/mentorship-en-coaching' },
];

const SidebarContent = ({ collapsed, onLinkClick, onboardingStatus }: { collapsed: boolean, onLinkClick?: () => void, onboardingStatus?: any }) => {
  const pathname = usePathname();
  const [openBrotherhood, setOpenBrotherhood] = useState(false);
  const safePathname = pathname || '';

  const handleLinkClick = () => {
    if(onLinkClick) {
      onLinkClick();
    }
  }

  // Auto-open submenu if current page is a submenu item
  useEffect(() => {
    const currentItem = menu.find(item => item.subItems?.some(sub => sub.href === safePathname));
    if (currentItem) {
      setOpenBrotherhood(true);
    }
  }, [safePathname]);

  // Get current item for highlighting
  const getCurrentItem = () => {
    return menu.find(item => item.href === safePathname) || 
           menu.find(item => item.subItems?.some(sub => sub.href === safePathname));
  };

  const currentItem = getCurrentItem();

  return (
    <nav className="flex flex-col gap-1">
      {menu.map((item) => {
        const isActive = currentItem?.href === item.href || 
                        (currentItem?.subItems && item.subItems?.some(sub => sub.href === safePathname));
        const isParentActive = item.subItems?.some(sub => sub.href === safePathname);
        
        if (item.subItems) {
          return (
            <div key={item.label} className="mb-1">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Stop event bubbling
                  if (!collapsed) {
                    setOpenBrotherhood(v => !v);
                  }
                }}
                className={`flex items-center justify-between w-full text-[#8BAE5A] hover:text-white active:bg-[#3A4D23]/20 text-lg font-medium py-3 px-4 rounded-xl transition-all touch-manipulation ${
                  isParentActive ? 'bg-[#3A4D23]/20 text-white' : ''
                }`}
                aria-expanded={openBrotherhood}
              >
                <span>{item.label}</span>
                {!collapsed && (
                  openBrotherhood ? 
                    <ChevronUpIcon className="w-5 h-5 transition-transform duration-200" /> : 
                    <ChevronDownIcon className="w-5 h-5 transition-transform duration-200" />
                )}
              </button>
              <div
                className={`pl-4 flex flex-col gap-1 overflow-hidden transition-all duration-300 ${
                  openBrotherhood && !collapsed ? 'max-h-[400px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                }`}
              >
                {item.subItems.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={`text-[#8BAE5A] hover:text-white active:bg-[#3A4D23]/20 text-base font-normal py-3 px-4 rounded-xl transition-all touch-manipulation ${
                      sub.href === safePathname ? 'bg-[#3A4D23]/20 text-white' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation(); // Stop event bubbling
                      if (handleLinkClick) { // Null check
                        handleLinkClick();
                      }
                    }}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`text-[#8BAE5A] hover:text-white active:bg-[#3A4D23]/20 text-lg font-medium py-3 px-4 rounded-xl transition-all touch-manipulation ${
              isActive ? 'bg-[#3A4D23]/20 text-white' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation(); // Stop event bubbling
              if (handleLinkClick) { // Null check
                handleLinkClick();
              }
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logoutAndRedirect } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const { showDebug, toggleDebug } = useDebug();
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
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`/api/onboarding?userId=${user.id}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
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
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Onboarding check timed out, continuing without onboarding data');
      }
    }
  }, [user?.id, router]);

  // Check onboarding status on mount and when user changes
  useEffect(() => {
    if (user && !loading) {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Onboarding check timeout, forcing loading to false');
        setIsLoading(false);
      }, 10000); // 10 second timeout

      checkOnboardingStatus().finally(() => {
        clearTimeout(timeoutId);
        setIsLoading(false);
      });
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
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => window.location.reload()}
                className="text-[#8BAE5A] hover:text-[#B6C948] underline text-sm"
              >
                Pagina herladen als het te lang duurt
              </button>
              <button
                onClick={() => {
                  console.warn('Force loading state to false');
                  setIsLoading(false);
                }}
                className="text-[#B6C948] hover:text-[#8BAE5A] underline text-sm"
              >
                Forceer doorladen (als er problemen zijn)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    // Preserve current URL for redirect back after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      router.push('/login');
    }
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
    <>
      <style jsx>{`
        .sidebar-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-track {
          background: #181F17;
          border-radius: 4px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: #3A4D23;
          border-radius: 4px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4A5D33;
        }
        .sidebar-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3A4D23 #181F17;
        }
        
        /* Mobile specific scrollbar */
        @media (max-width: 1024px) {
          .sidebar-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .sidebar-scrollbar::-webkit-scrollbar-thumb {
            background: #8BAE5A;
          }
          .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #B6C948;
          }
        }
      `}</style>
      <div className="min-h-screen bg-[#0A0F0A] flex" suppressHydrationWarning>
      {/* Sidebar */}
      <div className={`bg-[#232D1A] border-r border-[#3A4D23] transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-16' : 'w-64 lg:w-72'
      } hidden lg:flex flex-col fixed h-full z-40`}>
        {/* Logo - Fixed at top */}
        <div className="p-4 border-b border-[#3A4D23] flex-shrink-0">
          <Link href="/dashboard" className="flex items-center justify-center">
            <Image
              src="/logo_white-full.svg"
              alt="Top Tier Men Logo"
              width={sidebarCollapsed ? 40 : 240}
              height={40}
              className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-full h-10'} object-contain hover:opacity-80 transition-opacity`}
            />
          </Link>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
          <div className="p-4">
            <SidebarContent 
              collapsed={sidebarCollapsed} 
              onboardingStatus={onboardingStatus}
            />
          </div>
        </div>

        {/* User Profile - Fixed at bottom */}
        <div className="p-4 border-t border-[#3A4D23] flex-shrink-0">
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
                  {user.role?.toLowerCase() === 'admin' ? 'Admin' : 
                   user.role?.toLowerCase() === 'test' ? 'Test' :
                   user.email?.toLowerCase().includes('test') ? 'Test' : 'Lid'}
                </p>
              </div>
            )}
          </div>
          
          {/* Debug Toggle for Test Users */}
          {(isTestUser || user?.role?.toLowerCase() === 'admin' || user?.email?.toLowerCase().includes('test')) && (
            <div className="mt-3 pt-3 border-t border-[#3A4D23]">
              <button
                onClick={toggleDebug}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  showDebug 
                    ? 'bg-[#8BAE5A] text-black' 
                    : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#4A5D33]'
                }`}
              >
                {!sidebarCollapsed ? 'Debug Mode' : 'D'}
                {showDebug && !sidebarCollapsed && ' ✓'}
              </button>
            </div>
          )}
        </div>

        {/* Collapse Button - Fixed at bottom */}
        <div className="p-4 border-t border-[#3A4D23] flex-shrink-0">
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
        <div className="bg-[#232D1A] border-b border-[#3A4D23] p-4 flex items-center justify-between">
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
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              className="lg:hidden fixed inset-0 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Backdrop */}
              <motion.div 
                className="absolute inset-0 bg-black bg-opacity-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              {/* Sidebar */}
              <motion.div 
                className="absolute left-0 top-0 h-full w-[85%] max-w-[400px] bg-[#232D1A] flex flex-col shadow-2xl"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 200,
                  duration: 0.3
                }}
              >
                {/* Header */}
                <div className="p-4 border-b border-[#3A4D23] flex-shrink-0 bg-[#232D1A] z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/logo_white-full.svg"
                        alt="Top Tier Men Logo"
                        width={120}
                        height={30}
                        className="h-8 w-auto object-contain"
                      />
                    </div>
                    <motion.button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.button>
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar" style={{ height: 'calc(100vh - 80px)', maxHeight: 'calc(100vh - 80px)' }}>
                  <div className="p-4 pb-8">
                    <SidebarContent 
                      collapsed={false} 
                      onLinkClick={() => setIsMobileMenuOpen(false)}
                      onboardingStatus={onboardingStatus}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
              {/* {showDebug && <DebugPanel />} */}

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
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <OnboardingProvider>
        <DashboardContent>{children}</DashboardContent>
      </OnboardingProvider>
    </ErrorBoundary>
  );
} 