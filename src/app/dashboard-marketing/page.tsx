'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CogIcon } from '@heroicons/react/24/outline';
import FacebookConnectionModal from '@/components/marketing/FacebookConnectionModal';

export default function MarketingDashboard() {
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check Facebook connection on component mount
  useEffect(() => {
    const checkFacebookConnection = async () => {
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

        // Check login status
        window.FB.getLoginStatus((response: any) => {
          console.log('🔍 Facebook login status:', response);
          
          if (response.status === 'connected') {
            const adAccountId = localStorage.getItem('facebook_ad_account_id');
            if (adAccountId) {
              console.log('🔍 Facebook connected with ad account:', adAccountId);
              setIsFacebookConnected(true);
            } else {
              console.log('🔍 Facebook connected but no ad account found');
              setShowFacebookModal(true);
            }
          } else {
            console.log('🔍 Facebook not connected, showing modal');
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

    checkFacebookConnection();
  }, []);

  const handleFacebookConnectionSuccess = () => {
    console.log('🔍 Facebook connection success');
    setIsFacebookConnected(true);
    setShowFacebookModal(false);
  };

  const handleOpenFacebookModal = () => {
    setShowFacebookModal(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#3B82F6] mx-auto mb-4">
            <CogIcon className="w-8 h-8 text-[#3B82F6] mx-auto mt-4" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Marketing Dashboard Laden...</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            Facebook verbinding wordt gecontroleerd
          </p>
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

  return (
    <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Marketing Dashboard</h1>
        <p className="text-gray-400 mb-6">
          Facebook is verbonden! Het dashboard is klaar voor gebruik.
        </p>
        <button
          onClick={handleOpenFacebookModal}
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-lg transition-colors"
        >
          Facebook Instellingen
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