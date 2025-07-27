'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DebugProvider, useDebug } from '@/contexts/DebugContext';
import { clearAllCache, clearAppSpecificCache, checkForCacheIssues } from '@/lib/cache-utils';
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
  ClipboardIcon
} from '@heroicons/react/24/outline';



const SidebarContent = ({ pathname }: { pathname: string }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ANALYTICS', 'LEDEN', 'CONTENT', 'COMMUNITY', 'PLATFORM']));

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

  const adminMenu = [
    { 
      label: 'Dashboard', 
      icon: HomeIcon, 
      href: '/dashboard-admin',
      items: [
        { label: 'Project Logs', icon: DocumentTextIcon, href: '/dashboard-admin/project-logs' }
      ]
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
        { label: 'Technische Performance', icon: WrenchScrewdriverIcon, href: '/dashboard-admin?tab=technical' }
      ]
    },
    { 
      label: 'LEDEN', 
      type: 'section',
      items: [
        { label: 'Ledenbeheer', icon: UserGroupIcon, href: '/dashboard-admin/ledenbeheer' },
              { 
        label: 'Onboarding Overzicht', 
        icon: ClipboardIcon, 
        href: '/dashboard-admin/onboarding-overview'
      }
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
      label: 'PLATFORM', 
      type: 'section',
      items: [
        { label: 'Instellingen', icon: Cog6ToothIcon, href: '/dashboard-admin/instellingen' },
        { label: 'Aankondigingen', icon: MegaphoneIcon, href: '/dashboard-admin/aankondigingen' }
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
                        {/* Live Data Pages */}
                        {subItem.label === 'Community Health' ||
               subItem.label === 'Real-time Activiteit' ||
               subItem.label === 'Academy' ||
               subItem.label === 'Trainingscentrum' ||
               subItem.label === 'Content Performance' ||
               subItem.label === 'Actiegerichte Inzichten' ||
               subItem.label === 'Financiële Metrics' ||
               subItem.label === 'Gebruikers Segmentatie' ||
               subItem.label === 'Technische Performance' ||
               subItem.label === 'Onboarding Overzicht' ||
               subItem.label === 'Badges & Rangen' ||
               subItem.label === 'Boekenkamer' ||
               subItem.label === 'Aankondigingen' ||
               subItem.label === 'Forum Moderatie' ||
               subItem.label === 'Evenementenbeheer' ||
               subItem.label === 'Voedingsplannen' ||
               subItem.label === 'Ledenbeheer' ||
               subItem.label === 'Social Feed' ||
               subItem.label === 'Instellingen' ||
               subItem.label === 'Project Logs' ? (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-green-700 text-green-200">Live</span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-700 text-red-200">Dummy</span>
                        )}
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DebugProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </DebugProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { showDebug, setShowDebug } = useDebug();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Check admin role
  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double click
    
    setIsLoggingOut(true);
    try {
      console.log('Admin logout initiated...');
      await signOut();
      
      // Force redirect after a short delay to ensure cleanup
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
      
      // Show user feedback
      alert('Er is een fout opgetreden bij het uitloggen. Probeer het opnieuw.');
      
      // Fallback: force redirect even if signOut fails
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-[#8BAE5A] text-xl">Laden...</div>
      </div>
    );
  }

  // Show unauthorized message if not authenticated or not admin
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null; // Will redirect to appropriate page
  }

  return (
    <div className="min-h-screen bg-[#181F17]">
      {/* Top Navigation Bar */}
      <div className="bg-[#232D1A] border-b border-[#3A4D23] px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#8BAE5A]"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-[#8BAE5A]">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[#8BAE5A] text-sm">
              {user?.email || 'Admin'}
            </span>
            
            {/* Cache Management - Only for Admin */}
            <div className="flex items-center gap-2">
              <span className="text-[#B6C948] text-xs font-medium">Cache:</span>
              <button
                onClick={() => {
                  clearAppSpecificCache();
                  alert('App cache opgeruimd!');
                }}
                className="px-2 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A] text-xs transition-colors"
                title="Ruim app cache op"
              >
                🧹 App
              </button>
              <button
                onClick={() => {
                  if (confirm('Weet je zeker dat je ALLE cache wilt opruimen? Dit zal de pagina herladen.')) {
                    clearAllCache();
                  }
                }}
                className="px-2 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A] text-xs transition-colors"
                title="Ruim alle cache op en herlaad"
              >
                🔄 Alles
              </button>
            </div>
            
            {/* Debug Toggle */}
            <div className="flex items-center gap-2">
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
            <Link 
              href="/dashboard" 
              className="px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] text-sm font-semibold border border-[#8BAE5A] hover:bg-[#A6C97B] transition"
            >
              Ga naar Platform
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] text-sm font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Uitloggen...' : 'Uitloggen'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
             <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}></div>
             <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#232D1A] border-r border-[#3A4D23] p-6">
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
        <aside className="hidden md:block w-72 bg-[#232D1A] border-r border-[#3A4D23] min-h-screen p-6">
          <SidebarContent pathname={pathname ?? ''} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 overflow-x-auto bg-[#181F17]">
          {children}
        </main>
      </div>
    </div>
  );
} 