'use client';

import { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import { 
  DevicePhoneMobileIcon, 
  BellIcon, 
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function PWAInstallPrompt() {
  const [isClient, setIsClient] = useState(false);

  // Client-side safety check
  if (typeof window === 'undefined') {
    return null;
  }

  const {
    isInstalled,
    canInstall,
    isOnline,
    hasPushPermission,
    isServiceWorkerRegistered,
    installApp,
    requestPushPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  } = usePWA();

  const [showPrompt, setShowPrompt] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Don't show if already installed or can't install
  if (isInstalled || !canInstall || !showPrompt) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await installApp();
    } catch (error) {
      console.error('Install failed:', error);
    }
  };

  const handleSubscribeToPush = async () => {
    setIsSubscribing(true);
    try {
      // This would typically get the user ID from your auth context
      const userId = 'current-user-id'; // Replace with actual user ID
      await subscribeToPush(userId);
    } catch (error) {
      console.error('Push subscription failed:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-gradient-to-r from-[#181F17] to-[#232D1A] border border-[#3A4D23] rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <DevicePhoneMobileIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#8BAE5A] mb-1">
                Installeer Top Tier Men App
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Voeg toe aan je beginscherm voor de beste ervaring en push notificaties
              </p>
              
              {/* Status indicators */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-xs text-gray-400">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isServiceWorkerRegistered ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-xs text-gray-400">
                    {isServiceWorkerRegistered ? 'Service Worker actief' : 'Service Worker laden...'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <BellIcon className={`w-3 h-3 ${hasPushPermission ? 'text-green-400' : 'text-yellow-400'}`} />
                  <span className="text-xs text-gray-400">
                    {hasPushPermission ? 'Push notificaties toegestaan' : 'Push notificaties niet toegestaan'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleInstall}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-black text-xs font-semibold rounded-md hover:from-[#7A9D4A] hover:to-[#A5B847] transition-all duration-200"
                >
                  📱 App Installeren
                </button>
                
                {!hasPushPermission && (
                  <button
                    onClick={requestPushPermission}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-black text-xs font-semibold rounded-md hover:from-[#A5B847] hover:to-[#7A9D4A] transition-all duration-200"
                  >
                    🔔 Notificaties Toestaan
                  </button>
                )}
                
                {hasPushPermission && (
                  <button
                    onClick={handleSubscribeToPush}
                    disabled={isSubscribing}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#3A4D23] to-[#232D1A] text-[#8BAE5A] text-xs font-semibold rounded-md hover:from-[#4A5D33] hover:to-[#333D2A] transition-all duration-200 disabled:opacity-50"
                  >
                    {isSubscribing ? 'Abonneren...' : '📧 Push Abonnement'}
                  </button>
                )}
                
                {hasPushPermission && (
                  <button
                    onClick={handleTestNotification}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#C49C48] to-[#B6C948] text-black text-xs font-semibold rounded-md hover:from-[#B38B37] hover:to-[#A5B847] transition-all duration-200"
                  >
                    🧪 Test Notificatie
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowPrompt(false)}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 