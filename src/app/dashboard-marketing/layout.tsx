'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { CampaignsProvider } from '@/contexts/CampaignsContext';
import { 
  ChartBarIcon,
  MegaphoneIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  AcademicCapIcon,
  StarIcon,
  RocketLaunchIcon,
  FlagIcon,
  MicrophoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

// Facebook SDK TypeScript declarations
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const navigation = [
  { name: 'Overzicht', href: '/dashboard-marketing', icon: ChartBarIcon },
  { name: 'Advertentie materiaal', href: '/dashboard-marketing/advertentie-materiaal', icon: VideoCameraIcon },
  { name: 'Advertenties', href: '/dashboard-marketing/advertenties', icon: MegaphoneIcon },
  { name: 'Campagnes', href: '/dashboard-marketing/campagnes', icon: PresentationChartLineIcon },
  { name: 'Analytics', href: '/dashboard-marketing/analytics', icon: DocumentChartBarIcon },
  { name: 'Conversies', href: '/dashboard-marketing/conversies', icon: CursorArrowRaysIcon },
  { name: 'Audience', href: '/dashboard-marketing/audience', icon: UserGroupIcon },
  { name: 'Budget', href: '/dashboard-marketing/budget', icon: CurrencyDollarIcon },
  { name: 'Target', href: '/dashboard-marketing/target', icon: FlagIcon },
  { name: 'Video Ideeën', href: '/video-ideen-malaga', icon: VideoCameraIcon, badge: 'MALAGA' },
  { name: 'Rapporten', href: '/dashboard-marketing/rapporten', icon: EyeIcon },
  { name: 'Concurentie', href: '/dashboard-marketing/concurentie', icon: BuildingStorefrontIcon },
  { name: 'Pre-launch', href: '/dashboard-marketing/pre-launch', icon: RocketLaunchIcon, badge: 'NEW' },
  { name: 'AI Insights', href: '/dashboard-marketing/ai-insights', icon: AcademicCapIcon, badge: 'AI' },
  { name: 'AI Voice', href: '/dashboard-marketing/ai-voice', icon: MicrophoneIcon, badge: 'BETA' },
  { name: 'Executive Dashboard', href: '/dashboard-marketing/executive-dashboard', icon: StarIcon },
  { name: 'Report Builder', href: '/dashboard-marketing/report-builder', icon: DocumentTextIcon },
  { name: 'Instellingen', href: '/dashboard-marketing/instellingen', icon: Cog6ToothIcon },
];

const developmentNavigation = [
  { name: 'Uitleg', href: '/dashboard-marketing/uitleg', icon: AcademicCapIcon },
  { name: 'Content', href: '/dashboard-marketing/content', icon: DocumentTextIcon },
  { name: 'Takenlijst', href: '/dashboard-marketing/takenlijst', icon: ClipboardDocumentListIcon },
  { name: 'Automatisering', href: '/dashboard-marketing/automatisering', icon: Cog6ToothIcon },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();

  // Temporarily disable authentication check for testing
  // const isMarketingUser = !!user;

  // Initialize Facebook SDK
  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      if (window.FB) return; // Already loaded
      
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: '1063013326038261',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        
        window.FB.AppEvents.logPageView();
        
        // Check login status after SDK is loaded
        checkFacebookLoginStatus();
      };

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        if (fjs.parentNode) {
          fjs.parentNode.insertBefore(js, fjs);
        }
      }(document, 'script', 'facebook-jssdk'));
    };

    // Check Facebook login status
    const checkFacebookLoginStatus = () => {
      if (!window.FB) return;
      
      window.FB.getLoginStatus(function(response) {
        console.log('Facebook login status:', response);
        
        if (response.status === 'connected') {
          // User is logged into Facebook and has authorized the app
          console.log('User is connected to Facebook');
          console.log('Access Token:', response.authResponse.accessToken);
          console.log('User ID:', response.authResponse.userID);
          
          // Store the access token and user ID
          localStorage.setItem('facebook_access_token', response.authResponse.accessToken);
          localStorage.setItem('facebook_user_id', response.authResponse.userID);
          localStorage.setItem('facebook_login_status', 'connected');
          
          // You can now make API calls to Facebook
          // For example, get user's ad accounts
          getFacebookAdAccounts(response.authResponse.accessToken);
          
        } else if (response.status === 'not_authorized') {
          // User is logged into Facebook but hasn't authorized the app
          console.log('User is logged into Facebook but not authorized');
          localStorage.setItem('facebook_login_status', 'not_authorized');
          
        } else {
          // User is not logged into Facebook
          console.log('User is not logged into Facebook');
          localStorage.setItem('facebook_login_status', 'unknown');
        }
      });
    };

    // Get user's Facebook ad accounts
    const getFacebookAdAccounts = (accessToken: string) => {
      if (!window.FB) return;
      
      window.FB.api('/me/adaccounts', function(response) {
        console.log('Ad accounts response:', response);
        
        if (response && response.data && response.data.length > 0) {
          // Store the first ad account ID (you might want to let user choose)
          const adAccountId = response.data[0].id;
          localStorage.setItem('facebook_ad_account_id', adAccountId);
          console.log('Stored ad account ID:', adAccountId);
        }
      });
    };

    loadFacebookSDK();
  }, []);

  // Temporarily disable authentication redirect
  // useEffect(() => {
  //   if (!loading && !isMarketingUser) {
  //     router.push('/login?redirect=/dashboard-marketing');
  //   }
  // }, [loading, isMarketingUser, router]);

  // Show loading while checking auth (temporarily disabled)
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
  //       <div className="text-white">Loading...</div>
  //     </div>
  //   );
  // }

  // Show access denied if not authenticated (temporarily disabled)
  // if (!isMarketingUser) {
  //   return (
  //     <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
  //       <div className="text-center">
  //         <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
  //         <h1 className="text-2xl font-bold text-white mb-2">Toegang Geweigerd</h1>
  //         <p className="text-gray-400 mb-4">Je moet ingelogd zijn om toegang te krijgen tot het Marketing Panel.</p>
  //         <Link 
  //           href="/login?redirect=/dashboard-marketing"
  //           className="bg-[#1E40AF] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg transition-colors"
  //         >
  //           Inloggen
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-[#0F1419]">
      {/* Top Navigation Bar */}
      <div className="bg-black border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-white"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center">
              <Image
                src="/logo-media2net.svg"
                alt="Media2Net Logo"
                width={500}
                height={40}
                className="min-w-[500px] h-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-white text-sm">
              {user?.email || 'Marketing'}
            </span>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 rounded-xl bg-[#3B82F6] text-white text-sm font-semibold border border-[#3B82F6] hover:bg-[#2563EB] transition"
            >
              Terug naar Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Mobile/Tablet Menu Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-sm w-full bg-black border-r border-gray-800 p-6">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-5 right-5 p-2 text-[#60A5FA]"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-6">Marketing Menu</h2>
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[#3B82F6] text-white border border-[#3B82F6]'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
                
                {/* Ontwikkeling Menu */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">Ontwikkeling</h2>
                  <nav className="space-y-2">
                    {developmentNavigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-[#3B82F6] text-white border border-[#3B82F6]'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 bg-black border-r border-gray-800 min-h-screen p-6">
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold text-white mb-6">Marketing Menu</h2>
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#3B82F6] text-white border border-[#3B82F6]'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            
            {/* Ontwikkeling Menu */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Ontwikkeling</h2>
              <nav className="space-y-2">
                {developmentNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#3B82F6] text-white border border-[#3B82F6]'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-gray-700">
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span>Terug naar Dashboard</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-12 overflow-x-auto bg-[#0F1419]">
          <CampaignsProvider>
            {children}
          </CampaignsProvider>
        </main>
      </div>
    </div>
  );
} 