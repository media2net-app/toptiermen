'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface FacebookStatusProps {
  onStatusChange?: (connected: boolean) => void;
}

export default function FacebookAdManagerStatus({ onStatusChange }: FacebookStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/marketing/facebook-ad-manager?action=test-connection');
      const data = await response.json();
      
      setIsConnected(data.connected);
      onStatusChange?.(data.connected);
      
      if (!data.connected) {
        setError('Facebook Ad Manager niet verbonden. Controleer je environment variables.');
      }
    } catch (error) {
      console.error('Error checking Facebook connection:', error);
      setIsConnected(false);
      setError('Fout bij het controleren van Facebook Ad Manager connectie');
      onStatusChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CogIcon className="w-5 h-5 animate-spin text-[#3B82F6]" />
          <span className="text-white">Facebook Ad Manager verbinding controleren...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className={`border rounded-lg p-4 ${
        isConnected 
          ? 'bg-green-900/20 border-green-500/50' 
          : 'bg-red-900/20 border-red-500/50'
      }`}>
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-red-400" />
          )}
          <div>
            <h3 className={`font-semibold ${
              isConnected ? 'text-green-400' : 'text-red-400'
            }`}>
              Facebook Ad Manager Status
            </h3>
            <p className="text-gray-300 text-sm">
              {isConnected 
                ? 'Verbonden met Rick\'s Facebook Ad Account' 
                : 'Niet verbonden'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      {!isConnected && (
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="space-y-3">
              <h3 className="text-blue-400 font-semibold">Facebook Ad Manager Setup</h3>
              <div className="text-blue-200 text-sm space-y-2">
                <p>Om Rick's Facebook Ad Manager te verbinden, voeg de volgende environment variables toe:</p>
                <div className="bg-[#1A1F2E] rounded p-3 space-y-1">
                  <code className="text-green-400">FACEBOOK_APP_ID=your_facebook_app_id_here</code><br/>
                  <code className="text-green-400">FACEBOOK_APP_SECRET=your_facebook_app_secret_here</code><br/>
                  <code className="text-green-400">FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here</code><br/>
                  <code className="text-green-400">FACEBOOK_AD_ACCOUNT_ID=act_your_ad_account_id_here</code>
                </div>
                <p className="mt-2">
                  <strong>Stappen:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Ga naar <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Facebook Developers</a></li>
                  <li>Maak een nieuwe app aan (Business type)</li>
                  <li>Voeg Facebook Login en Marketing API toe</li>
                  <li>Ga naar App Settings → Basic voor App ID en App Secret</li>
                  <li>Ga naar Tools → Graph API Explorer voor Access Token</li>
                  <li>Ga naar Business Manager → Ad Accounts voor Ad Account ID</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Connection Button */}
      <div className="flex justify-end">
        <button
          onClick={checkConnection}
          disabled={isLoading}
          className="bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <CogIcon className="w-4 h-4" />
          <span>Verbinding Testen</span>
        </button>
      </div>
    </div>
  );
}
