'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import FacebookConnectionModal from '@/components/marketing/FacebookConnectionModal';

export default function MarketingDashboard() {
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);

  // Check Facebook connection on component mount
  useEffect(() => {
    const adAccountId = localStorage.getItem('facebook_ad_account_id');
    if (adAccountId) {
      setIsFacebookConnected(true);
    } else {
      setShowFacebookModal(true);
    }
  }, []);

  const handleFacebookConnectionSuccess = () => {
    setIsFacebookConnected(true);
    setShowFacebookModal(false);
  };

  const handleOpenFacebookModal = () => {
    setShowFacebookModal(true);
  };

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