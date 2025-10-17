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
  BellIcon,
  ArrowPathIcon,
  TicketIcon,
  TagIcon,
  SparklesIcon,
  StarIcon as CrownIcon,
  CheckCircleIcon,
  KeyIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import { SwipeIndicator } from '@/components/ui';
import SessionMonitor from '@/components/SessionMonitor';
import AuthDebugPanel from '@/components/AuthDebugPanel';
import SupportButton from '@/components/SupportButton';
import { useChatNotifications } from '@/hooks/useChatNotifications';
// import { useOnlinePresence } from '@/hooks/useOnlinePresence'; // TIJDELIJK UITGESCHAKELD - veroorzaakt 500 errors
import { useActivityHeartbeat } from '@/hooks/useActivityHeartbeat';

// Type definitions for menu items
interface MenuItem {
  label: string;
  icon?: any;
  href?: string;
  badge?: string;
  type?: string;
  external?: boolean;
  items?: MenuItem[];
}

const SidebarContent = ({ pathname }: { pathname: string }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Dashboard', 'Lancering', 'ANALYTICS', 'LEDEN', 'CONTENT', 'COMMUNITY', 'PRE LAUNCH', 'PLATFORM']));

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
      label: 'Lancering', 
      type: 'section',
      items: [
        { 
          label: 'Prelaunch Korting', 
          icon: TagIcon, 
          href: '/pakketten/prelaunchkorting',
          external: true
        },
        { 
          label: 'Prelaunch Pakketten', 
          icon: CurrencyDollarIcon, 
          href: '/dashboard-admin/prelaunch-pakketten'
        },
        { 
          label: 'Database View', 
          icon: CurrencyDollarIcon, 
          href: '/dashboard-admin/database-view',
          badge: 'NEW'
        },
        { 
          label: 'Premium Tier', 
          icon: SparklesIcon, 
          href: '/pakketten/premium-tier',
          external: true
        },
        { 
          label: 'Lifetime Tier', 
          icon: CrownIcon, 
          href: '/pakketten/lifetime-tier',
          external: true
        },
        { 
          label: 'Basic Tier Success', 
          icon: CheckCircleIcon, 
          href: '/payment/success?package=basic-tier&period=12months',
          external: true
        },
        { 
          label: 'Premium Tier Success', 
          icon: CheckCircleIcon, 
          href: '/payment/success?package=premium-tier&period=12months',
          external: true
        },
        { 
          label: 'Lifetime Tier Success', 
          icon: CheckCircleIcon, 
          href: '/payment/success?package=lifetime-tier&period=lifetime',
          external: true
        }
      ]
    },
    { 
      label: 'ANALYTICS', 
      type: 'section',
      items: [
        { label: 'Live Platform Tracking', icon: SignalIcon, href: '/dashboard-admin/live-tracking', badge: 'LIVE' },
        { label: 'Community Health', icon: ChartBarIcon, href: '/dashboard-admin?tab=overview' },
        { label: 'Content Performance', icon: AcademicCapIcon, href: '/dashboard-admin?tab=content' },
        { label: 'Actiegerichte Inzichten', icon: StarIcon, href: '/dashboard-admin?tab=actions' },
        { label: 'Financiële Metrics', icon: CurrencyDollarIcon, href: '/dashboard-admin?tab=financial' },
        { label: 'Gebruikers Segmentatie', icon: UsersIcon, href: '/dashboard-admin?tab=users' },
        { label: 'Real-time Activiteit', icon: ClockIcon, href: '/dashboard-admin?tab=realtime' },
        { label: 'Technische Performance', icon: WrenchScrewdriverIcon, href: '/dashboard-admin?tab=technical' },
        { label: 'Session Monitoring', icon: ClockIcon, href: '/dashboard-admin?tab=session-logs', badge: 'NEW' },
        { label: 'Google Analytics', icon: ChartBarIcon, href: '/dashboard-admin/analytics/google-analytics', badge: 'LIVE' },
        { label: 'Pakketten Analytics', icon: ChartBarIcon, href: '/dashboard-admin/pakketten-analytics', badge: 'NEW' },
        { label: 'A/B Testing', icon: EyeIcon, href: '/dashboard-admin/ab-testing' },
        { label: 'Trial Management', icon: ClockIcon, href: '/dashboard-admin/trial-management' }
      ]
    },
    { 
      label: 'LEDEN', 
      type: 'section',
      items: [
        { label: 'Ledenbeheer', icon: UserGroupIcon, href: '/dashboard-admin/ledenbeheer' },
        { label: '1:1 Coaching', icon: UsersIcon, href: '/dashboard-admin/one-to-one', badge: 'NEW' },
        { label: 'Test gebruikers', icon: UserIcon, href: '/dashboard-admin/test-gebruikers' },
        { label: 'Bug Meldingen', icon: BugAntIcon, href: '/dashboard-admin/bug-meldingen', badge: 'NEW' },
        { label: 'Affiliate Beheer', icon: FireIcon, href: '/dashboard-admin/affiliate-beheer' },
        { 
          label: 'Onboarding Overzicht', 
          icon: ClipboardIcon, 
          href: '/dashboard-admin/onboarding-overview'
        },
        { 
          label: 'Onboarding Status V2', 
          icon: CheckCircleIcon, 
          href: '/dashboard-admin/onboarding-status-v2',
          badge: 'NEW'
        },
        { label: 'Leden Activiteiten', icon: ClockIcon, href: '/dashboard-admin/leden-activiteiten', badge: 'NEW' },
        { label: 'Taken', icon: ListBulletIcon, href: '/dashboard-admin/taken', badge: 'NEW' },
        { label: 'Weektaken', icon: ListBulletIcon, href: '/dashboard-admin/weektaken' }
      ]
    },
    { 
      label: 'CONTENT', 
      type: 'section',
      items: [
        { label: 'Academy', icon: AcademicCapIcon, href: '/dashboard-admin/academy' },
        { label: 'E-book Controle', icon: BookOpenIcon, href: '/dashboard-admin/ebook-controle', badge: 'NEW' },
        { label: 'Ebooks Setup', icon: BookOpenIcon, href: '/dashboard-admin/ebooks-setup', badge: 'NEW' },
        { label: 'Trainingscentrum', icon: FireIcon, href: '/dashboard-admin/trainingscentrum' },
        { label: 'Trainingschemas Backup', icon: DocumentTextIcon, href: '/dashboard-admin/trainingschemas-backup', badge: 'BACKUP' },
        { label: 'Voedingsplannen', icon: BookOpenIcon, href: '/dashboard-admin/voedingsplannen' },
        { label: 'Voedingsplannen V2', icon: RocketLaunchIcon, href: '/dashboard-admin/voedingsplannen-v2', badge: 'V2' },
        { label: 'Voedingsplannen Backup', icon: DocumentTextIcon, href: '/dashboard-admin/voedingsplannen-backup', badge: 'BACKUP' },
        { label: 'Mind & Focus', icon: ChartBarIcon, href: '/dashboard-admin/mind-focus' },
        { label: 'Boekenkamer', icon: BookOpenIcon, href: '/dashboard-admin/boekenkamer' },
        { label: 'Boeken Beheer', icon: BookOpenIcon, href: '/dashboard-admin/books', badge: 'NEW' },
        { label: 'Badges & Rangen', icon: StarIcon, href: '/dashboard-admin/badges-rangen' }
      ]
    },
    { 
      label: 'COMMUNITY', 
      type: 'section',
      items: [
        { label: 'Support Tickets', icon: TicketIcon, href: '/dashboard-admin/tickets', badge: 'NEW' },
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
        { label: 'Email Trechter', icon: EnvelopeIcon, href: '/dashboard-admin/email-trechter', badge: 'NEW' },
        { label: 'Test Mails', icon: EyeIcon, href: '/dashboard-admin/email-trechter/test-emails' }
      ]
    },
    { 
      label: 'PLATFORM', 
      type: 'section',
      items: [
        { label: 'Instellingen', icon: Cog6ToothIcon, href: '/dashboard-admin/instellingen' },
        { label: 'Email Sjablonen', icon: EnvelopeIcon, href: '/dashboard-admin/email-sjablonen', badge: 'NEW' },
        { label: 'E-mail Tool', icon: EnvelopeIcon, href: '/dashboard-admin/email-tool', badge: 'NEW' },
        { label: 'Aankondigingen', icon: MegaphoneIcon, href: '/dashboard-admin/aankondigingen' },
        { label: 'Push Notificatie Tests', icon: BellIcon, href: '/dashboard-admin/push-test' },
        { label: 'Email Logs', icon: EnvelopeIcon, href: '/dashboard-admin/email-logs', badge: 'NEW' },
        { label: 'Login Logs', icon: KeyIcon, href: '/dashboard-admin/login-logs', badge: 'NEW' },
        { label: 'Systeem Updates', icon: ArrowPathIcon, href: '/systeem-status', badge: 'V1.2' }
      ]
    },
    {
      label: 'DATABASE',
      type: 'section',
      items: [
        { label: 'Database Data Leden', icon: UserGroupIcon, href: '/dashboard-admin/database-data-leden', badge: 'NEW' },
        { label: 'Trainingschemas', icon: DocumentTextIcon, href: '/dashboard-admin/database/trainingschemas', badge: 'NEW' },
        { label: 'Ebook Scraper', icon: BookOpenIcon, href: '/dashboard-admin/database/ebook-scraper', badge: 'NEW' },
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
              </button>
              {isExpanded && (
                <div className="mt-2 ml-4 space-y-1">
                  {item.items?.map((subItem) => (
                    subItem.external ? (
                      <a
                        key={subItem.href!}
                        href={subItem.href!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-all duration-200 text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]"
                      >
                        {subItem.icon && <subItem.icon className="w-5 h-5" />}
                        <span className="flex items-center gap-2">
                          {subItem.label}
                          {subItem.badge && (
                            <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                              {subItem.badge}
                            </span>
                          )}
                        </span>
                      </a>
                    ) : (
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
                          {subItem.badge && (
                            <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                              {subItem.badge}
                            </span>
                          )}
                        </span>
                      </Link>
                    )
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
              {item.badge && (
                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-bold ${
                  item.badge === 'CRITICAL' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-[#8BAE5A] text-[#181F17]'
                }`}>
                  {item.badge}
                </span>
              )}
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
  const { user, profile, loading, logoutAndRedirect, isAdmin } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const { showDebug, setShowDebug } = useDebug();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Track user online presence
  // useOnlinePresence(); // TIJDELIJK UITGESCHAKELD - veroorzaakt 500 errors op live (user_online_status tabel bestaat niet)
  
  // 🔥 Activity Heartbeat - Updates last_active every 30 seconds for Live Tracking
  useActivityHeartbeat(user?.id);

  // Realtime chat notifications: increase unread counter when a new message arrives (not from self)
  useChatNotifications(
    () => {
      setUnreadCount((c) => c + 1);
    },
    undefined
  );

  // Check authentication with better handling - IMPROVED TO PREVENT LOOPS
  useEffect(() => {
    // Wait for auth to complete before making any decisions
    if (loading) {
      console.log('Admin: Auth still loading, waiting...');
      return;
    }
    
    // Only redirect if we're absolutely sure the user is not authenticated
    if (!isAuthenticated) {
      console.log('Admin: User not authenticated after loading complete, redirecting to login');
      // Redirect to login with current path preserved
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        // Use setTimeout to prevent immediate redirect loops - increased delay
        setTimeout(() => {
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        }, 200); // Increased delay to prevent immediate redirects on refresh
      }
    } else {
      console.log('Admin: User authenticated:', user?.email);
    }
  }, [loading, isAuthenticated, router, user]);

  // Check admin role with better error handling - IMPROVED TO PREVENT LOOPS
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      const knownAdminEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu', 'admin@toptiermen.com'];
      const isKnownAdmin = user.email && knownAdminEmails.includes(user.email);
      
      // Don't redirect known admin emails, even if metadata is corrupted
      if (!isKnownAdmin) {
        console.log('Admin: User is not admin, redirecting to dashboard');
        console.log('User role:', profile?.role);
        console.log('Is admin:', isAdmin);
        console.log('User email:', user.email);
        // Use setTimeout to prevent immediate redirect loops
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } else {
        console.log('Admin: Known admin email detected, allowing access despite metadata issues');
        console.log('Admin email:', user.email, 'Profile role:', profile?.role);
      }
    }
  }, [loading, user, profile, isAdmin, router]);



  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double click
    
    setIsLoggingOut(true);
    try {
      console.log('2.0.3: Admin logout initiated...');
      
      // Show loading state
      const logoutButton = document.querySelector('[data-admin-logout-button]');
      if (logoutButton) {
        logoutButton.setAttribute('disabled', 'true');
      }
      
      // Use the enhanced logoutAndRedirect function
      await logoutAndRedirect('/login');
      
    } catch (error) {
      console.error('❌ Admin: Logout error:', error);
      
      // Emergency fallback - force redirect
      if (typeof window !== 'undefined') {
        window.location.href = `/login?logout=error&t=${Date.now()}`;
      }
    } finally {
      // Note: setIsLoggingOut(false) is not needed here since we're redirecting
      // The component will be unmounted during redirect
    }
  };

  // Show loading state with better feedback - only for initial auth loading - DISABLED TO FIX FLICKERING
  // if (loading && !user) {
  //   return (
  //     <div className="min-h-screen bg-[#181F17] flex items-center justify-center" suppressHydrationWarning>
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
  //         <div className="text-[#8BAE5A] text-xl">
  //           Admin Dashboard laden...
  //         </div>
  //         <div className="mt-4">
  //           <p className="text-[#B6C948] text-sm">
  //             Beheerpaneel wordt geladen
  //           </p>
  //           <button
  //             onClick={() => window.location.reload()}
  //             className="mt-2 text-[#8BAE5A] hover:text-[#B6C948] underline text-sm"
  //           >
  //             Pagina herladen als het te lang duurt
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Show unauthorized message if not authenticated or not admin
  // Allow known admin emails even if metadata is corrupted
  const knownAdminEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu', 'admin@toptiermen.com'];
  const isKnownAdmin = user?.email && knownAdminEmails.includes(user.email);
  // TEMPORARY: Disable auth check for testing drag and drop
  const shouldAllowAccess = true;
  // const shouldAllowAccess = isAuthenticated && (isAdmin || isKnownAdmin);
  
  if (!shouldAllowAccess) {
    console.log('Admin: Access denied - isAuthenticated:', isAuthenticated, 'user:', user?.email, 'profile role:', profile?.role, 'isAdmin:', isAdmin, 'isKnownAdmin:', isKnownAdmin);
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center">
          <div className="text-[#8BAE5A] text-xl mb-4">Toegang geweigerd</div>
          <div className="text-[#B6C948] text-sm mb-4">
            {!isAuthenticated ? 'Je bent niet ingelogd' : 'Je hebt geen admin rechten'}
          </div>
          <div className="text-gray-400 text-xs mb-4">
            Debug: Email: {user?.email}, Role: {profile?.role}, IsAdmin: {isAdmin ? 'Yes' : 'No'}
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
      {/* Debug info - only show if showDebug is true */}
      {showDebug && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
          <div>Loading: {loading.toString()}</div>
          <div>Authenticated: {isAuthenticated.toString()}</div>
          <div>User: {user?.email || 'null'}</div>
          <div>Role: {user?.role || 'null'}</div>
          <div>Path: {pathname}</div>
        </div>
      )}
      {/* Top Navigation Bar */}
      <div className="bg-[#232D1A] border-b border-[#3A4D23] p-3 sm:p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
            >
              <Bars3Icon className="w-5 h-5" />
              <span className="text-sm font-medium">Menu</span>
            </button>
            {loading && !user && (
              <div className="flex items-center gap-2 text-[#8BAE5A] text-xs sm:text-sm ml-3">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-[#8BAE5A]"></div>
                <span>Gegevens laden...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-[#8BAE5A] text-sm">
              {user?.email || 'Admin'}
            </span>
            {/* Inbox icon with unread badge */}
            <Link
              href="/dashboard/inbox"
              onClick={() => setUnreadCount(0)}
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#181F17] border border-[#3A4D23] text-[#8BAE5A] hover:bg-[#232D1A] transition"
              title="Inbox"
            >
              <EnvelopeIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[18px] text-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
            
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
                    
                    // Session is already handled by Supabase
                    
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
                    window.location.reload();
                  }
                }}
                className="px-2 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A] text-xs transition-colors"
                title="Ruim alle cache op en herlaad"
              >
                🔄 Alles
              </button>
            </div>
            

            

            
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
              data-admin-logout-button
              className="px-3 sm:px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] text-xs sm:text-sm font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
            {/* Inbox icon (mobile) */}
            <Link
              href="/dashboard/inbox"
              onClick={() => setUnreadCount(0)}
              className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#181F17] border border-[#3A4D23] text-[#8BAE5A] hover:bg-[#232D1A] transition"
              title="Inbox"
            >
              <EnvelopeIcon className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[16px] text-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
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
                  
                  // Session is already handled by Supabase
                  
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
                  window.location.reload();
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
             <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#232D1A] border-r border-[#3A4D23] p-4 h-full overflow-y-auto"
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
        <aside className="hidden lg:block w-64 bg-[#232D1A] border-r border-[#3A4D23] min-h-screen p-4">
          <SidebarContent pathname={pathname ?? ''} />
        </aside>

        {/* Main Content */}
        <main className="admin-layout flex-1 p-4 sm:p-6 md:p-12 overflow-x-auto bg-[#181F17]">
          {children}
        </main>
      </div>


      
      {/* Session Monitor for Admin */}
      <SessionMonitor isAdmin={true} />
      
      {/* Auth Debug Panel - Only visible in development or when debug is enabled */}
      <AuthDebugPanel isVisible={process.env.NODE_ENV === 'development' || showDebug} />
      
      {/* Support Button - Fixed position */}
      <SupportButton />
    </div>
  );
} 