'use client';

import { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  CogIcon, 
  CheckCircleIcon,
  InformationCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import FacebookConnectionModal from '@/components/marketing/FacebookConnectionModal';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';

interface FacebookUserInfo {
  id: string;
  name: string;
  email: string;
}

interface FacebookAdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
}

export default function MarketingDashboard() {
  const { user, loading, signOut } = useSupabaseAuth();
  const router = useRouter();
  
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<FacebookUserInfo | null>(null);
  const [adAccountInfo, setAdAccountInfo] = useState<FacebookAdAccount | null>(null);
  const [campaignsCount, setCampaignsCount] = useState<number>(0);
  const [totalSpend, setTotalSpend] = useState<number>(0);

  // Check authentication and Facebook connection on component mount
  useEffect(() => {
    console.log('🔍 Marketing Dashboard useEffect triggered:', { loading, user: user?.email, isAuthenticated: !!user });
    
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      console.error('❌ Supabase environment variables not configured');
      setError('Supabase configuratie ontbreekt. Neem contact op met de beheerder.');
      setIsLoading(false);
      return;
    }
    
    // Only run once when auth context is loaded and user is available
    if (loading) {
      console.log('🔍 Waiting for auth context to load...');
      return;
    }

    if (!user) {
      console.log('🔍 No user found, redirecting to login');
      // Add a small delay to prevent immediate redirect
      setTimeout(() => {
        router.push('/login?redirect=/dashboard-marketing');
      }, 100);
      return;
    }

    console.log('🔍 User authenticated:', user.email);
    
    // Start Facebook check only after user is confirmed
    checkFacebookConnection();
  }, [loading, user, router]);

  // Separate function for Facebook connection check
  const checkFacebookConnection = async () => {
    // Prevent multiple calls
    if (isLoading) {
      console.log('🔍 Facebook check already in progress, skipping...');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Wait for Facebook SDK to load with timeout
      let sdkLoaded = false;
      const maxWaitTime = 5000; // 5 seconds
      const startTime = Date.now();

      while (!sdkLoaded && (Date.now() - startTime) < maxWaitTime) {
        if (typeof window !== 'undefined' && window.FB) {
          sdkLoaded = true;
          console.log('🔍 Facebook SDK loaded after', Date.now() - startTime, 'ms');
        } else {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      if (!sdkLoaded) {
        console.log('🔍 Facebook SDK not loaded within timeout, showing modal');
        setShowFacebookModal(true);
        setIsLoading(false);
        return;
      }

      // Check Facebook login status
      window.FB.getLoginStatus((response: any) => {
        console.log('🔍 Facebook login status:', response);
        
        if (response.status === 'connected') {
          // Store Facebook login status persistently
          localStorage.setItem('facebook_login_status', 'connected');
          localStorage.setItem('facebook_access_token', response.authResponse.accessToken);
          localStorage.setItem('facebook_user_id', response.authResponse.userID);
          
          const adAccountId = localStorage.getItem('facebook_ad_account_id');
          if (adAccountId) {
            console.log('🔍 Facebook connected with ad account:', adAccountId);
            setIsFacebookConnected(true);
            
            // Get user info
            window.FB.api('/me', { fields: 'id,name,email' }, (userResponse: any) => {
              if (userResponse && !userResponse.error) {
                setUserInfo(userResponse);
                // Store user info persistently
                localStorage.setItem('facebook_user_info', JSON.stringify(userResponse));
              }
            });

            // Get ad account info
            fetchAdAccountInfo(adAccountId);
            
            // Get campaigns data
            fetchCampaignsData(adAccountId);
          } else {
            console.log('🔍 Facebook connected but no ad account found');
            setShowFacebookModal(true);
          }
        } else {
          console.log('🔍 Facebook not connected, showing modal');
          // Clear any stale Facebook data
          localStorage.removeItem('facebook_login_status');
          localStorage.removeItem('facebook_access_token');
          localStorage.removeItem('facebook_user_id');
          localStorage.removeItem('facebook_user_info');
          setShowFacebookModal(true);
        }
        setIsLoading(false);
      });

    } catch (error) {
      console.error('🔍 Error checking Facebook connection:', error);
      setError('Er is een fout opgetreden bij het controleren van de Facebook verbinding');
      setIsLoading(false);
    }
  };

  const fetchAdAccountInfo = async (adAccountId: string) => {
    try {
      const accessToken = localStorage.getItem('facebook_access_token');
      if (!accessToken) return;

      const response = await fetch(`/api/marketing/facebook-ad-manager?action=account&accessToken=${accessToken}`);
      const data = await response.json();
      
      if (data.success) {
        setAdAccountInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching ad account info:', error);
    }
  };

  const fetchCampaignsData = async (adAccountId: string) => {
    try {
      const accessToken = localStorage.getItem('facebook_access_token');
      if (!accessToken) return;

      const response = await fetch(`/api/marketing/facebook-ad-manager?action=campaigns&accessToken=${accessToken}&dateRange=30d`);
      const data = await response.json();
      
      if (data.success) {
        setCampaignsCount(data.data.length);
        
        // Calculate total spend
        const total = data.data.reduce((sum: number, campaign: any) => {
          return sum + (campaign.insights?.spend || 0);
        }, 0);
        setTotalSpend(total);
      }
    } catch (error) {
      console.error('Error fetching campaigns data:', error);
    }
  };

  const handleFacebookConnectionSuccess = () => {
    console.log('🔍 Facebook connection success');
    setIsFacebookConnected(true);
    setShowFacebookModal(false);
    
    // Store connection status
    localStorage.setItem('facebook_login_status', 'connected');
    
    // Reload the page to fetch fresh data
    window.location.reload();
  };

  const handleOpenFacebookModal = () => {
    setShowFacebookModal(true);
  };

  // Show loading state for Facebook check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#3B82F6] mx-auto mb-4">
            <CogIcon className="w-8 h-8 text-[#3B82F6] mx-auto mt-4" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Marketing Dashboard Laden...</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            Facebook verbinding wordt gecontroleerd...
          </p>
          <div className="text-xs text-gray-500 mt-4">
            Debug: user={user?.email || 'null'}, isLoading={isLoading.toString()}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Fout Opgetreden</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Pagina Herladen
          </button>
        </div>
      </div>
    );
  }

  // Show Facebook connection modal if not connected
  if (!isFacebookConnected) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Facebook Connectie Vereist</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            Je moet eerst verbinden met Facebook om het marketing dashboard te kunnen gebruiken.
          </p>
          <button
            onClick={handleOpenFacebookModal}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Facebook Verbinden
          </button>
        </div>
        
        <FacebookConnectionModal
          isOpen={showFacebookModal}
          onClose={() => setShowFacebookModal(false)}
          onConnectionSuccess={handleFacebookConnectionSuccess}
        />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Fout Opgetreden</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Pagina Herladen
          </button>
        </div>
      </div>
    );
  }

  // Show Facebook connection modal if not connected
  if (!isFacebookConnected) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Facebook Connectie Vereist</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            Je moet eerst verbinden met Facebook om het marketing dashboard te kunnen gebruiken.
          </p>
          <button
            onClick={handleOpenFacebookModal}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Facebook Verbinden
          </button>
        </div>
        
        <FacebookConnectionModal
          isOpen={showFacebookModal}
          onClose={() => setShowFacebookModal(false)}
          onConnectionSuccess={handleFacebookConnectionSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Marketing Dashboard</h1>
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircleIcon className="w-5 h-5" />
              <span>Facebook is verbonden!</span>
            </div>
          </div>
          
          {/* User Info and Logout */}
          {user && (
            <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155] min-w-[250px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Ingelogd als</span>
                </div>
                <button
                  onClick={signOut}
                  className="text-red-400 hover:text-red-300 text-sm underline"
                >
                  Uitloggen
                </button>
              </div>
              <p className="text-gray-300 text-sm">{user.email}</p>
              <p className="text-gray-400 text-xs">Gebruiker ID: {user.id}</p>
            </div>
          )}
        </div>

        {/* Connection Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* User Info */}
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <div className="flex items-center space-x-3 mb-4">
              <UserIcon className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Gebruiker</h3>
            </div>
            {userInfo && (
              <div className="space-y-2">
                <p className="text-gray-300 text-sm">Naam: <span className="text-white">{userInfo.name}</span></p>
                <p className="text-gray-300 text-sm">Email: <span className="text-white">{userInfo.email}</span></p>
                <p className="text-gray-300 text-sm">ID: <span className="text-white font-mono text-xs">{userInfo.id}</span></p>
              </div>
            )}
          </div>

          {/* Ad Account Info */}
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <div className="flex items-center space-x-3 mb-4">
              <BuildingOfficeIcon className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Ad Account</h3>
            </div>
            {adAccountInfo && (
              <div className="space-y-2">
                <p className="text-gray-300 text-sm">Naam: <span className="text-white">{adAccountInfo.name}</span></p>
                <p className="text-gray-300 text-sm">Status: <span className="text-green-400">Actief</span></p>
                <p className="text-gray-300 text-sm">Valuta: <span className="text-white">{adAccountInfo.currency}</span></p>
                <p className="text-gray-300 text-sm">ID: <span className="text-white font-mono text-xs">{adAccountInfo.id}</span></p>
              </div>
            )}
          </div>

          {/* Campaigns */}
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <div className="flex items-center space-x-3 mb-4">
              <ChartBarIcon className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Campagnes</h3>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Aantal: <span className="text-white text-xl font-bold">{campaignsCount}</span></p>
              <p className="text-gray-300 text-sm">Periode: <span className="text-white">30 dagen</span></p>
            </div>
          </div>

          {/* Total Spend */}
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <div className="flex items-center space-x-3 mb-4">
              <CurrencyEuroIcon className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Totaal Uitgegeven</h3>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Bedrag: <span className="text-white text-xl font-bold">€{totalSpend.toFixed(2)}</span></p>
              <p className="text-gray-300 text-sm">Periode: <span className="text-white">30 dagen</span></p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155] mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Snelle Acties</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleOpenFacebookModal}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <InformationCircleIcon className="w-5 h-5" />
              <span>Facebook Instellingen</span>
            </button>
            
            <button
              onClick={() => window.open('/test-facebook-marketing', '_blank')}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Test Marketing API</span>
            </button>
            
            <button
              onClick={() => window.open('/dashboard-marketing/facebook-setup', '_blank')}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <CogIcon className="w-5 h-5" />
              <span>Facebook Setup</span>
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-green-400 font-semibold">Facebook Verbinding Status</h3>
              <p className="text-green-300 text-sm">
                Alle Facebook Marketing API permissions zijn actief en het dashboard is klaar voor gebruik.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <FacebookConnectionModal
        isOpen={showFacebookModal}
        onClose={() => setShowFacebookModal(false)}
        onConnectionSuccess={handleFacebookConnectionSuccess}
      />
    </div>
  );
} 