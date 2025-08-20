'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useDebug } from '@/contexts/DebugContext';

import { 
  HomeIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  FireIcon, 
  BookOpenIcon, 
  StarIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarIcon, 
  Cog6ToothIcon, 
  MegaphoneIcon,
  ChevronDownIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  Bars3Icon,
  XMarkIcon,
  BugAntIcon,
  DocumentTextIcon,
  ClipboardIcon,
  ListBulletIcon,
  RocketLaunchIcon,
  EnvelopeIcon,
  EyeIcon,
  UserIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { SwipeIndicator } from '@/components/ui';
import SessionMonitor from '@/components/SessionMonitor';

// Type definitions for menu items
interface MenuItem {
  label: string;
  icon?: any;
  href?: string;
  badge?: string;
  type?: string;
  items?: MenuItem[];
}

const SidebarContent = ({ pathname }: { pathname: string }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Dashboard', 'ANALYTICS', 'LEDEN', 'CONTENT', 'COMMUNITY', 'PRE LAUNCH', 'PLATFORM']));

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionLabel)) {
        newSet.delete(sectionLabel);
      } else {
        newSet.add(sectionLabel);
      }
      return newSet;
    });
  };

  const adminMenu: MenuItem[] = [
    { 
      label: 'Dashboard', 
      icon: HomeIcon, 
      href: '/dashboard-admin'
    },
    { 
      label: 'ANALYTICS', 
      type: 'section',
      items: [
        { label: 'Community Health', icon: ChartBarIcon, href: '/dashboard-admin?tab=overview' },
        { label: 'Content Performance', icon: AcademicCapIcon, href: '/dashboard-admin?tab=content' },
        { label: 'Actiegerichte Inzichten', icon: StarIcon, href: '/dashboard-admin?tab=actions' },
        { label: 'Financiële Metrics', icon: CurrencyDollarIcon, href: '/dashboard-admin?tab=financial' },
        { label: 'Gebruikers Segmentatie', icon: UsersIcon, href: '/dashboard-admin?tab=users' },
        { label: 'Real-time Activiteit', icon: ClockIcon, href: '/dashboard-admin?tab=realtime' },
        { label: 'Technische Performance', icon: WrenchScrewdriverIcon, href: '/dashboard-admin?tab=technical' },
        { label: 'Session Monitoring', icon: ClockIcon, href: '/dashboard-admin?tab=session-logs', badge: 'NEW' },
        { label: 'Google Analytics', icon: ChartBarIcon, href: '/dashboard-admin/analytics/google-analytics', badge: 'LIVE' },
        { label: 'A/B Testing', icon: EyeIcon, href: '/dashboard-admin/ab-testing' },
        { label: 'Trial Management', icon: ClockIcon, href: '/dashboard-admin/trial-management' }
      ]
    },
    { 
      label: 'LEDEN', 
      type: 'section',
      items: [
        { label: 'Ledenbeheer', icon: UserGroupIcon, href: '/dashboard-admin/ledenbeheer' },
        { label: 'Test gebruikers', icon: UserIcon, href: '/dashboard-admin/test-gebruikers' },
        { label: 'Bug Meldingen', icon: BugAntIcon, href: '/dashboard-admin/bug-meldingen', badge: 'NEW' },
        { label: 'Affiliate Beheer', icon: FireIcon, href: '/dashboard-admin/affiliate-beheer' },
        { 
          label: 'Onboarding Overzicht', 
          icon: ClipboardIcon, 
          href: '/dashboard-admin/onboarding-overview'
        },
        { label: 'Taken', icon: ListBulletIcon, href: '/dashboard-admin/taken', badge: 'NEW' }
      ]
    },
    { 
      label: 'CONTENT', 
      type: 'section',
      items: [
        { label: 'Academy', icon: AcademicCapIcon, href: '/dashboard-admin/academy' },
        { label: 'Trainingscentrum', icon: FireIcon, href: '/dashboard-admin/trainingscentrum' },
        { label: 'Voedingsplannen', icon: BookOpenIcon, href: '/dashboard-admin/voedingsplannen' },
        { label: 'Boekenkamer', icon: BookOpenIcon, href: '/dashboard-admin/boekenkamer' },
        { label: 'Badges & Rangen', icon: StarIcon, href: '/dashboard-admin/badges-rangen' }
      ]
    },
    { 
      label: 'COMMUNITY', 
      type: 'section',
      items: [
        { label: 'Forum Moderatie', icon: ChatBubbleLeftRightIcon, href: '/dashboard-admin/forum-moderatie' },
        { label: 'Social Feed', icon: ChatBubbleLeftRightIcon, href: '/dashboard-admin/social-feed' },
        { label: 'Evenementenbeheer', icon: CalendarIcon, href: '/dashboard-admin/evenementenbeheer' },
      ]
    },
    { 
      label: 'PRE LAUNCH', 
      type: 'section',
      items: [
        { label: 'Pre-launch E-mails', icon: DocumentTextIcon, href: '/dashboard-admin/pre-launch-emails', badge: 'NEW' },
        { label: 'Email Trechter', icon: EnvelopeIcon, href: '/dashboard-admin/email-trechter', badge: 'NEW' }
      ]
    },
    { 
      label: 'PLATFORM', 
      type: 'section',
      items: [
        { label: 'Instellingen', icon: Cog6ToothIcon, href: '/dashboard-admin/instellingen' },
        { label: 'Aankondigingen', icon: MegaphoneIcon, href: '/dashboard-admin/aankondigingen' },
        { label: 'Push Notificatie Tests', icon: BellIcon, href: '/dashboard-admin/push-test' }
      ]
    },
  ];

  return (
    <nav className="space-y-6">
      {adminMenu.map((item) => {
        if (item.type === 'section' || item.items) {
          const isExpanded = expandedSections.has(item.label);
          return (
            <div key={item.label}>
              <button
                onClick={() => toggleSection(item.label)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-[#8BAE5A] font-semibold hover:bg-[#181F17] transition-all duration-200"
              >
                <span>{item.label}</span>
                <ChevronDownIcon 
                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </button>
              {isExpanded && (
                <div className="mt-2 ml-4 space-y-1">
                  {item.items?.map((subItem) => (
                    <Link
                      key={subItem.href!}
                      href={subItem.href!}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        pathname === subItem.href 
                          ? 'bg-[#8BAE5A] text-[#181F17] shadow-lg' 
                          : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                      }`}
                    >
                      {subItem.icon && <subItem.icon className="w-5 h-5" />}
                      <span className="flex items-center gap-2">
                        {subItem.label}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        } else {
          return (
            <Link
              key={item.href!}
              href={item.href!}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                pathname === item.href 
                  ? 'bg-[#8BAE5A] text-[#181F17] shadow-lg' 
                  : 'text-[#8BAE5A] hover:bg-[#181F17]'
              }`}
            >
              {item.icon && <item.icon className="w-6 h-6" />}
              <span>{item.label}</span>
            </Link>
          );
        }
      })}
    </nav>
  )
};

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logoutAndRedirect, refreshSession } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const { showDebug, setShowDebug } = useDebug();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [authCheckAttempts, setAuthCheckAttempts] = useState(0);
  const [isSessionRefreshing, setIsSessionRefreshing] = useState(false);

  // Check authentication with retry logic
  useEffect(() => {
    if (!loading && !isAuthenticated && authCheckAttempts < 3) {
      console.log(`Auth check attempt ${authCheckAttempts + 1}/3`);
      setAuthCheckAttempts(prev => prev + 1);
      
      // Try to refresh session before redirecting
      const attemptSessionRefresh = async () => {
        setIsSessionRefreshing(true);
        try {
          const refreshed = await refreshSession();
          if (!refreshed) {
            // Only redirect if session refresh fails
            setTimeout(() => {
              // Preserve current URL for redirect back after login
              const currentPath = window.location.pathname;
              if (currentPath !== '/login') {
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
              } else {
                router.push('/login');
              }
            }, 1000);
          }
        } catch (error) {
          console.error('Session refresh failed:', error);
          setTimeout(() => {
            // Preserve current URL for redirect back after login
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
              router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            } else {
              router.push('/login');
            }
          }, 1000);
        } finally {
          setIsSessionRefreshing(false);
        }
      };

      attemptSessionRefresh();
    } else if (!loading && !isAuthenticated && authCheckAttempts >= 3) {
      // After 3 failed attempts, redirect to login with current path preserved
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        router.push('/login');
      }
    }
  }, [loading, isAuthenticated, router, authCheckAttempts, refreshSession]);

  // Check admin role with better error handling
  useEffect(() => {
    if (!loading && user && user.role?.toLowerCase() !== 'admin') {
      console.log('User is not admin, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [loading, user, router]);



  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double click
    
    setIsLoggingOut(true);
    try {
      console.log('Admin logout initiated...');
      await logoutAndRedirect();
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
    }
  };

  // Show loading state with better feedback - only for initial auth loading
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <div className="text-[#8BAE5A] text-xl">
            {isSessionRefreshing ? 'Sessie vernieuwen...' : 'Admin Dashboard laden...'}
          </div>
          <div className="mt-4">
            <p className="text-[#B6C948] text-sm">
              {isSessionRefreshing ? 'Bezig met sessie vernieuwen' : 'Beheerpaneel wordt geladen'}
            </p>
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

  // Show unauthorized message if not authenticated or not admin
  if (!isAuthenticated || (user && user.role?.toLowerCase() !== 'admin')) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center">
          <div className="text-[#8BAE5A] text-xl mb-4">Toegang geweigerd</div>
          <div className="text-[#B6C948] text-sm mb-4">
            {!isAuthenticated ? 'Je bent niet ingelogd' : 'Je hebt geen admin rechten'}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#A6C97B] transition"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17]" suppressHydrationWarning>
      {/* Top Navigation Bar */}
      <div className="bg-[#232D1A] border-b border-[#3A4D23] px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#8BAE5A]"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-[#8BAE5A]">Admin Panel</h1>
            {loading && !user && (
              <div className="flex items-center gap-2 text-[#8BAE5A] text-sm">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-[#8BAE5A]"></div>
                Gegevens laden...
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-[#8BAE5A] text-sm">
              {user?.email || 'Admin'}
            </span>
            
            {/* Cache Management - Only for Admin */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#B6C948] text-xs font-medium">Cache:</span>
              <button
                onClick={async () => {
                  try {
                    // Preserve auth session before clearing cache
                    const authKey = 'toptiermen-auth';
                    const authData = localStorage.getItem(authKey);
                    
                    // Clear cache but preserve auth
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    // Restore auth session
                    if (authData) {
                      localStorage.setItem(authKey, authData);
                    }
                    
                    // Refresh session to ensure it's still valid
                    await refreshSession();
                    
                    alert('App cache opgeruimd! Sessie behouden.');
                  } catch (error) {
                    console.error('Error clearing cache:', error);
                    alert('Fout bij opruimen cache. Probeer opnieuw.');
                  }
                }}
                className="px-2 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A] text-xs transition-colors"
                title="Ruim app cache op (behoud sessie)"
              >
                🧹 App
              </button>
              <button
                onClick={async () => {
                  if (confirm('Weet je zeker dat je ALLE cache wilt opruimen? Dit zal de pagina herladen.')) {
                    try {
                      // Attempt to refresh session before reload
                      await refreshSession();
                      window.location.reload();
                    } catch (error) {
                      console.error('Error before reload:', error);
                      window.location.reload();
                    }
                  }
                }}
                className="px-2 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A] text-xs transition-colors"
                title="Ruim alle cache op en herlaad"
              >
                🔄 Alles
              </button>
            </div>
            

            
            {/* Debug Toggle */}
            <div className="hidden sm:flex items-center gap-2">
              <BugAntIcon className="w-4 h-4 text-[#B6C948]" />
              <select
                value={showDebug ? 'true' : 'false'}
                onChange={(e) => setShowDebug(e.target.value === 'true')}
                className="px-2 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A] text-xs"
              >
                <option value="false">Debug OFF</option>
                <option value="true">Debug ON</option>
              </select>
            </div>
            
            {/* Session Recovery Button */}
            <button
              onClick={async () => {
                try {
                  setIsSessionRefreshing(true);
                  const refreshed = await refreshSession();
                  if (refreshed) {
                    alert('Sessie succesvol vernieuwd!');
                  } else {
                    alert('Sessie vernieuwen mislukt. Probeer opnieuw in te loggen.');
                  }
                } catch (error) {
                  console.error('Session recovery failed:', error);
                  alert('Fout bij sessie herstel. Probeer opnieuw in te loggen.');
                } finally {
                  setIsSessionRefreshing(false);
                }
              }}
              disabled={isSessionRefreshing}
              className="hidden sm:block px-3 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A] text-xs transition-colors disabled:opacity-50"
              title="Herstel sessie"
            >
              {isSessionRefreshing ? '🔄' : '🔧'}
            </button>
            
            <Link 
              href="/dashboard" 
              className="hidden sm:block px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] text-sm font-semibold border border-[#8BAE5A] hover:bg-[#A6C97B] transition"
            >
              Ga naar Platform
            </Link>
            {/* Marketing button - visible for all admins */}
            <Link 
              href="/dashboard-marketing" 
              className="hidden sm:flex px-4 py-2 rounded-xl bg-[#1E40AF] text-white text-sm font-semibold border border-[#1E40AF] hover:bg-[#1D4ED8] transition items-center gap-2"
            >
              <MegaphoneIcon className="w-4 h-4" />
              Marketing
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 sm:px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] text-sm font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Uitloggen...' : 'Uitloggen'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Subheader for overflow buttons */}
      <div className="lg:hidden bg-[#1A2318] border-b border-[#3A4D23] px-4 py-3">
        <SwipeIndicator className="flex items-center justify-between gap-2" showFadeIndicators={false}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[#8BAE5A] text-sm truncate">
              {user?.email || 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Cache Management for mobile */}
            <button
              onClick={async () => {
                try {
                  // Preserve auth session before clearing cache
                  const authKey = 'toptiermen-auth';
                  const authData = localStorage.getItem(authKey);
                  
                  // Clear cache but preserve auth
                  localStorage.clear();
                  sessionStorage.clear();
                  
                  // Restore auth session
                  if (authData) {
                    localStorage.setItem(authKey, authData);
                  }
                  
                  // Refresh session to ensure it's still valid
                  await refreshSession();
                  
                  alert('App cache opgeruimd! Sessie behouden.');
                } catch (error) {
                  console.error('Error clearing cache:', error);
                  alert('Fout bij opruimen cache. Probeer opnieuw.');
                }
              }}
              className="px-2 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A] text-xs transition-colors"
              title="Ruim app cache op (behoud sessie)"
            >
              🧹
            </button>
            <button
              onClick={async () => {
                if (confirm('Weet je zeker dat je ALLE cache wilt opruimen? Dit zal de pagina herladen.')) {
                  try {
                    // Attempt to refresh session before reload
                    await refreshSession();
                    window.location.reload();
                  } catch (error) {
                    console.error('Error before reload:', error);
                    window.location.reload();
                  }
                }
              }}
              className="px-2 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A] text-xs transition-colors"
            >
              🔄
            </button>

            {/* Debug Toggle */}
            <select
              value={showDebug ? 'true' : 'false'}
              onChange={(e) => setShowDebug(e.target.value === 'true')}
              className="px-2 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A] text-xs"
            >
              <option value="false">Debug OFF</option>
              <option value="true">Debug ON</option>
            </select>
            
            {/* Session Recovery Button for mobile */}
            <button
              onClick={async () => {
                try {
                  setIsSessionRefreshing(true);
                  const refreshed = await refreshSession();
                  if (refreshed) {
                    alert('Sessie succesvol vernieuwd!');
                  } else {
                    alert('Sessie vernieuwen mislukt. Probeer opnieuw in te loggen.');
                  }
                } catch (error) {
                  console.error('Session recovery failed:', error);
                  alert('Fout bij sessie herstel. Probeer opnieuw in te loggen.');
                } finally {
                  setIsSessionRefreshing(false);
                }
              }}
              disabled={isSessionRefreshing}
              className="px-2 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A] text-xs transition-colors disabled:opacity-50"
              title="Herstel sessie"
            >
              {isSessionRefreshing ? '🔄' : '🔧'}
            </button>
            <Link 
              href="/dashboard" 
              className="px-3 py-1 rounded-lg bg-[#8BAE5A] text-[#181F17] text-xs font-semibold border border-[#8BAE5A] hover:bg-[#A6C97B] transition"
            >
              Platform
            </Link>
            <Link 
              href="/dashboard-marketing" 
              className="px-3 py-1 rounded-lg bg-[#1E40AF] text-white text-xs font-semibold border border-[#1E40AF] hover:bg-[#1D4ED8] transition"
            >
              Marketing
            </Link>
          </div>
        </SwipeIndicator>
      </div>

      <div className="flex">
        {/* Mobile/Tablet Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
             <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}></div>
             <div className="relative flex-1 flex flex-col max-w-sm w-full bg-[#232D1A] border-r border-[#3A4D23] p-6 h-full overflow-y-auto"
                  style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-5 right-5 p-2 text-[#8BAE5A]"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <SidebarContent pathname={pathname ?? ''} />
             </div>
          </div>
        )}
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 bg-[#232D1A] border-r border-[#3A4D23] min-h-screen p-6">
          <SidebarContent pathname={pathname ?? ''} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-12 overflow-x-auto bg-[#181F17]">
          {children}
        </main>
      </div>


      
      {/* Session Monitor for Admin */}
      <SessionMonitor isAdmin={true} />
    </div>
  );
} 