'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
// import { useV2State } from '@/contexts/V2StateContext';
// import { useV2Monitoring } from '@/lib/v2-monitoring';
// import { useV2ErrorRecovery } from '@/lib/v2-error-recovery';
// import { useV2Cache } from '@/lib/v2-cache-strategy';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { useDebug } from '@/contexts/DebugContext';
import { useTestUser } from '@/hooks/useTestUser';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HomeIcon, FireIcon, AcademicCapIcon, ChartBarIcon, CurrencyDollarIcon, 
  UsersIcon, BookOpenIcon, StarIcon, UserCircleIcon, ChatBubbleLeftRightIcon, 
  ChevronUpIcon, ChevronDownIcon, Bars3Icon, XMarkIcon, BellIcon, 
  EnvelopeIcon, CheckCircleIcon, UserGroupIcon, TrophyIcon, 
  CalendarDaysIcon, ShoppingBagIcon, ChevronLeftIcon, ChevronRightIcon 
} from '@heroicons/react/24/solid';
import DebugPanel from '@/components/DebugPanel';
import ForcedOnboardingModal from '@/components/ForcedOnboardingModal';
import TestUserVideoModal from '@/components/TestUserVideoModal';
import PlatformLoading from '@/components/PlatformLoading';
import TestUserFeedback from '@/components/TestUserFeedback';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import V2MonitoringDashboard from '@/components/V2MonitoringDashboard';
import V2PerformanceAlerts from '@/components/V2PerformanceAlerts';
import CacheIssueHelper from '@/components/CacheIssueHelper';

// 2.0.1: Dashboard menu configuration
const menu = [
  { label: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
  { label: 'Onboarding', icon: CheckCircleIcon, href: '/dashboard/onboarding' },
  { label: 'Mijn Profiel', icon: UserCircleIcon, parent: 'Dashboard', href: '/dashboard/mijn-profiel', isSub: true },
  { label: 'Inbox', icon: EnvelopeIcon, parent: 'Dashboard', href: '/dashboard/inbox', isSub: true },
  { label: 'Mijn Missies', icon: FireIcon, parent: 'Dashboard', href: '/dashboard/mijn-missies', isSub: true },
  { label: 'Challenges', icon: TrophyIcon, parent: 'Dashboard', href: '/dashboard/challenges', isSub: true },
  { label: 'Mijn Trainingen', icon: AcademicCapIcon, parent: 'Dashboard', href: '/dashboard/mijn-trainingen', isSub: true },
  { label: 'Finance & Business', icon: CurrencyDollarIcon, href: '/dashboard/finance-en-business' },
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

// 2.0.1: Sidebar component with enhanced monitoring
const SidebarContent = ({ collapsed, onLinkClick, onboardingStatus }: { 
  collapsed: boolean, 
  onLinkClick?: () => void, 
  onboardingStatus?: any 
}) => {
  const pathname = usePathname();
  const [openBrotherhood, setOpenBrotherhood] = useState(false);
  const [openDashboard, setOpenDashboard] = useState(false);
  const { isOnboarding, highlightedMenu } = useOnboarding();
  // const { trackFeatureUsage } = useV2Monitoring();
  const { user } = useSupabaseAuth();
  
  const safePathname = pathname || '';

  const handleLinkClick = (href: string, label: string, e?: React.MouseEvent) => {
    // Don't prevent default - let the Link component handle navigation
    // if (e) {
    //   e.preventDefault();
    //   e.stopPropagation();
    // }
    
    // Close mobile menu if it's open (but don't block navigation)
    if (onLinkClick) {
      onLinkClick();
    }
    
    // 2.0.1: Track navigation (disabled in development to prevent errors)
    // if (process.env.NODE_ENV === 'production') {
    //   trackFeatureUsage(`nav-${label.toLowerCase().replace(/\s+/g, '-')}`, user?.id);
    // }
  };

  // Auto-open submenu if current page is a submenu item
  useEffect(() => {
    const currentItem = menu.find(item => item.href === safePathname);
    if (currentItem?.parent === 'Dashboard') {
      setOpenDashboard(true);
    } else if (currentItem?.parent === 'Brotherhood') {
      setOpenBrotherhood(true);
    }
  }, [safePathname]);

  return (
    <nav className="flex flex-col gap-2">
      {menu.map((item) => {
        // Skip onboarding menu item if onboarding is completed or user is not in onboarding mode
        if (item.label === 'Onboarding' && (onboardingStatus?.onboarding_completed || !isOnboarding || onboardingStatus?.onboarding_completed)) {
          return null;
        }
        
        if (!item.parent) {
          const isActive = safePathname === item.href;
          const hasSubmenu = menu.some(sub => sub.parent === item.label);

          if (hasSubmenu) {
            const isOpen = item.label === 'Dashboard' ? openDashboard : openBrotherhood;
            const setIsOpen = item.label === 'Dashboard' ? setOpenDashboard : setOpenBrotherhood;
            const subItems = menu.filter(sub => sub.parent === item.label);
            const hasActiveSubItem = subItems.some(sub => sub.href === safePathname);
            
            return (
              <div key={item.label} className="group">
                <button
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-150 font-figtree w-full text-left ${
                    isActive || hasActiveSubItem 
                      ? 'bg-[#8BAE5A] text-black shadow-lg' 
                      : 'text-white hover:text-[#8BAE5A] hover:bg-[#3A4D23]/50'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                  onClick={(e) => {
                    // Only prevent default for submenu toggles, not for navigation
                    if (!collapsed) {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOpen(v => !v);
                    }
                  }}
                >
                  <item.icon className={`w-6 h-6 ${isActive || hasActiveSubItem ? 'text-white' : 'text-[#8BAE5A]'}`} />
                  {!collapsed && (
                    <span className="truncate col-start-2">{item.label}</span>
                  )}
                  {!collapsed && (
                    <ChevronDownIcon 
                      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>
                {isOpen && !collapsed && (
                  <motion.div 
                    className="ml-4 mt-2 space-y-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {subItems.map(sub => {
                      const isSubActive = safePathname === sub.href;
                      const isHighlighted = isOnboarding && highlightedMenu === sub.label;
                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
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
                  </motion.div>
                )}
              </div>
            );
          }

          const isHighlighted = isOnboarding && highlightedMenu === item.label;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-150 font-figtree ${
                isActive 
                  ? 'bg-[#8BAE5A] text-black shadow-lg' 
                  : isHighlighted 
                    ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30' 
                      : 'text-white hover:text-[#8BAE5A] hover:bg-[#3A4D23]/50'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : isHighlighted ? 'text-[#FFD700]' : 'text-[#8BAE5A]'}`} />
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{item.label}</span>
                </div>
              )}
            </Link>
          );
        }
        return null;
      })}
    </nav>
  );
};

// 2.0.1: Main dashboard content component
function DashboardContentInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logoutAndRedirect } = useSupabaseAuth();
  const { showDebug, toggleDebug } = useDebug();
  const { isOnboarding, isTransitioning } = useOnboarding();
  const isTestUser = useTestUser();
  // const { addNotification, setLoadingState } = useV2State();
  // const { trackFeatureUsage } = useV2Monitoring();
  // const { handleError } = useV2ErrorRecovery();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [showForcedOnboarding, setShowForcedOnboarding] = useState(false);
  const [showTestUserVideo, setShowTestUserVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 2.0.1: Cache busting for existing users
  useEffect(() => {
    // Check if this is an existing user with potential cache issues
    const lastVersion = localStorage.getItem('ttm-app-version');
    const currentVersion = '2.0.1'; // Increment this when making breaking changes
    
    if (lastVersion && lastVersion !== currentVersion) {
      console.log('🔄 Cache busting: Version mismatch detected');
      console.log(`   - Previous version: ${lastVersion}`);
      console.log(`   - Current version: ${currentVersion}`);
      
      // Clear all cached data
      localStorage.clear();
      sessionStorage.clear();
      
      // Force a hard refresh to clear all caches
      window.location.reload();
      return;
    }
    
    // Store current version
    localStorage.setItem('ttm-app-version', currentVersion);
    
    // Additional cache busting for specific issues
    const cacheBustKey = localStorage.getItem('ttm-cache-bust');
    if (!cacheBustKey) {
      console.log('🔄 Cache busting: First time user or cache reset');
      localStorage.setItem('ttm-cache-bust', Date.now().toString());
      
      // Clear any potentially problematic cached data
      if (typeof window !== 'undefined') {
        // Clear service worker cache if exists
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
              registration.unregister();
            });
          });
        }
        
        // Clear fetch cache
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
      }
    }
  }, []);

  // 2.0.1: Enhanced onboarding status check with error recovery
  const checkOnboardingStatus = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🔍 Checking onboarding status for user:', user.email);
      
      const response = await fetch(`/api/onboarding?userId=${user.id}&t=${Date.now()}&v=2.0.1`, {
        cache: 'no-cache', // Prevent caching of onboarding status
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();

      if (response.ok) {
        console.log('✅ Onboarding status received:', data);
        setOnboardingStatus(data);
      } else {
        throw new Error('Failed to fetch onboarding status');
      }
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
    }
  }, [user?.id]);

  // Check onboarding status on mount
  useEffect(() => {
    if (user) {
      // Set loading to false immediately when user is available
      setIsLoading(false);
      checkOnboardingStatus();
    }
  }, [user?.id, checkOnboardingStatus]);

  // Show forced onboarding if user hasn't completed onboarding
  useEffect(() => {
    if (onboardingStatus && !onboardingStatus.onboarding_completed) {
      // Check if user is a test user (email contains @toptiermen.test or @toptiermen.eu)
      const isTestUser = user?.email?.includes('@toptiermen.test') || 
                        user?.email?.includes('@toptiermen.eu') || false;
      
      console.log('🔍 Onboarding logic check:', {
        userEmail: user?.email,
        isTestUser,
        onboardingCompleted: onboardingStatus.onboarding_completed,
        currentStep: onboardingStatus.current_step,
        welcomeVideoWatched: onboardingStatus.welcome_video_watched
      });
      
      if (isTestUser && !onboardingStatus.onboarding_completed) {
        // Show test video first for test users who haven't completed onboarding
        console.log('🎬 Showing test video modal for test user');
        setShowTestUserVideo(true);
        setShowForcedOnboarding(false);
      } else if (onboardingStatus.current_step <= 1) {
        // Show normal onboarding for regular users or test users who watched the video
        console.log('📋 Showing normal onboarding modal');
        setShowForcedOnboarding(true);
        setShowTestUserVideo(false);
      } else {
        console.log('✅ User is in progress with onboarding, no modals needed');
        setShowForcedOnboarding(false);
        setShowTestUserVideo(false);
      }
    } else if (onboardingStatus?.onboarding_completed) {
      console.log('🎉 Onboarding completed, no modals needed');
      setShowForcedOnboarding(false);
      setShowTestUserVideo(false);
    }
  }, [onboardingStatus, user?.email]);

  // 2.0.1: Enhanced logout with error recovery
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double click
    
    try {
      console.log('2.0.1: Dashboard logout initiated...');
      setIsLoggingOut(true);
      
      // Show loading state
      const logoutButton = document.querySelector('[data-logout-button]');
      if (logoutButton) {
        logoutButton.setAttribute('disabled', 'true');
      }
      
      // Perform logout
      await logoutAndRedirect('/login');
      
    } catch (error) {
      console.error('2.0.1: Dashboard logout error:', error);
      
      // Show error message
      if (typeof window !== 'undefined') {
        alert('Er is een fout opgetreden bij het uitloggen. Probeer het opnieuw of ververs de pagina.');
      }
      
      // Reset loading state
      setIsLoggingOut(false);
      
      // Re-enable button
      const logoutButton = document.querySelector('[data-logout-button]');
      if (logoutButton) {
        logoutButton.removeAttribute('disabled');
      }
    }
  };

  // Mobile menu handlers
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Show loading state for dashboard content
  if (isLoading) {
    return <PlatformLoading message="Dashboard laden..." />;
  }

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
          {/* Logo */}
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

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
            <div className="p-4">
              <SidebarContent 
                collapsed={sidebarCollapsed} 
                onboardingStatus={onboardingStatus}
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-[#3A4D23] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                <span className="text-[#0A0F0A] font-bold text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user?.email}
                  </p>
                  <p className="text-[#8BAE5A] text-xs">
                    {user?.role?.toLowerCase() === 'admin' ? 'Admin' : 
                     user?.role?.toLowerCase() === 'test' ? 'Test' :
                     user?.email?.toLowerCase().includes('test') ? 'Test' : 'Lid'}
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

          {/* Collapse Button */}
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
              {/* Mobile Menu Button */}
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
              {user?.role?.toLowerCase() === 'admin' && (
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
                data-logout-button
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

          {/* Mobile Menu */}
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
                  onClick={(e) => e.stopPropagation()}
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
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              {children}
            </div>
          </div>
        </div>

        {/* Modals and Components */}
        <ForcedOnboardingModal 
          isOpen={showForcedOnboarding}
          onComplete={() => {
            setShowForcedOnboarding(false);
          }}
        />

        <TestUserVideoModal 
          isOpen={showTestUserVideo}
          onComplete={() => {
            setShowTestUserVideo(false);
            // After test video is watched, show normal onboarding
            if (onboardingStatus && !onboardingStatus.onboarding_completed) {
              setShowForcedOnboarding(true);
            }
          }}
        />

        {showDebug && <DebugPanel />}

        <TestUserFeedback 
          isTestUser={isTestUser}
          currentPage={pathname || '/'}
          userRole={user?.role}
          onNoteCreated={(note) => {
            console.log('Test note created:', note);
          }}
        />

        <PWAInstallPrompt />
        
        {/* 2.0.1: Monitoring Dashboard */}
        <V2MonitoringDashboard />
        
        {/* 2.0.1: Performance Alerts */}
        <V2PerformanceAlerts />
        
        {/* 2.0.1: Cache issue helper */}
        <CacheIssueHelper />
      </div>
    </>
  );
}

// 2.0.1: Wrapper component with providers
export default function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <DashboardContentInner>
        {children}
      </DashboardContentInner>
    </OnboardingProvider>
  );
}
