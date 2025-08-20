'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FacebookLoginButton from './FacebookLoginButton';
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Facebook SDK TypeScript declarations
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionSuccess: () => void;
}

export default function FacebookConnectionModal({ 
  isOpen, 
  onClose, 
  onConnectionSuccess 
}: FacebookConnectionModalProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [isConnected, setIsConnected] = useState(false);
  const [loginStatus, setLoginStatus] = useState<string>('unknown');

  const tabs = [
    { id: 'login', name: 'Facebook Login', icon: CogIcon },
    { id: 'setup', name: 'Setup Guide', icon: DocumentTextIcon },
    { id: 'permissions', name: 'Permissions', icon: BuildingOfficeIcon }
  ];

  // Check Facebook login status
  const checkFacebookLoginStatus = () => {
    if (!window.FB) return;
    
    window.FB.getLoginStatus(function(response) {
      console.log('Modal Facebook login status:', response);
      setLoginStatus(response.status);
      
      if (response.status === 'connected') {
        setIsConnected(true);
        onConnectionSuccess();
      }
    });
  };

  // Check if Facebook is connected
  useEffect(() => {
    const checkConnection = () => {
      const adAccountId = localStorage.getItem('facebook_ad_account_id');
      const loginStatus = localStorage.getItem('facebook_login_status');
      
      if (adAccountId && loginStatus === 'connected') {
        setIsConnected(true);
        onConnectionSuccess();
      } else {
        // Check Facebook login status if SDK is available
        if (window.FB) {
          checkFacebookLoginStatus();
        }
      }
    };

    checkConnection();
    
    // Listen for storage changes
    window.addEventListener('storage', checkConnection);
    return () => window.removeEventListener('storage', checkConnection);
  }, [onConnectionSuccess]);

  // Check login status when modal opens
  useEffect(() => {
    if (isOpen && window.FB) {
      checkFacebookLoginStatus();
    }
  }, [isOpen]);

  const handleLoginSuccess = (accessToken: string, userID: string) => {
    console.log('Facebook login successful:', { accessToken, userID });
    setIsConnected(true);
    onConnectionSuccess();
  };

  const handleLoginError = (error: string) => {
    console.error('Facebook login error:', error);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#0F1419] border border-[#374151] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#374151]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CogIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Facebook Ad Manager Setup</h2>
                <p className="text-sm text-gray-400">
                  {isConnected ? 'Verbonden met Facebook' : 'Configureer de verbinding met Rick\'s Facebook Ad Account'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Warning Banner */}
          {!isConnected && (
            <div className="bg-red-900/20 border-b border-red-500/50 p-4">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-red-400 font-semibold">Facebook Connectie Vereist</h3>
                  <p className="text-red-300 text-sm">
                    Je moet eerst verbinden met Facebook om het marketing dashboard te kunnen gebruiken.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isConnected && (
            <div className="bg-green-900/20 border-b border-green-500/50 p-4">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="text-green-400 font-semibold">Facebook Verbonden!</h3>
                  <p className="text-green-300 text-sm">
                    Je kunt nu het marketing dashboard gebruiken. Klik op "Sluiten" om door te gaan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {!isConnected ? (
              <>
                {/* Tab Navigation */}
                <div className="border-b border-[#374151] mb-6">
                  <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'border-[#3B82F6] text-[#3B82F6]'
                            : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === 'login' && (
                    <div>
                      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6 mb-6">
                        <div className="flex items-start space-x-3">
                          <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div className="text-blue-200">
                            <h3 className="font-semibold mb-2">Eenvoudige Facebook Integratie</h3>
                            <p className="text-sm">
                              Klik op de knop hieronder om je Facebook account te verbinden. 
                              Dit is veel eenvoudiger dan handmatig credentials invoeren!
                            </p>
                          </div>
                        </div>
                      </div>
                      <FacebookLoginButton 
                        onLoginSuccess={handleLoginSuccess}
                        onLoginError={handleLoginError}
                      />
                    </div>
                  )}

                  {activeTab === 'setup' && (
                    <div className="space-y-6">
                      {/* Step 1 */}
                      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-[#3B82F6] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            1
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">Facebook App Aanmaken</h3>
                            <div className="text-gray-300 space-y-3">
                              <p>Ga naar Facebook Developers en maak een nieuwe app aan:</p>
                              <ol className="list-decimal list-inside space-y-2 ml-4">
                                <li>Bezoek <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">Facebook Developers</a></li>
                                <li>Klik op "Create App"</li>
                                <li>Selecteer "Business" als app type</li>
                                <li>Vul de app details in (naam, contact email)</li>
                                <li>Klik op "Create App"</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-[#3B82F6] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            2
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">Facebook Login Toevoegen</h3>
                            <div className="text-gray-300 space-y-3">
                              <p>Voeg Facebook Login toe aan je app:</p>
                              <ol className="list-decimal list-inside space-y-2 ml-4">
                                <li>Ga naar je app dashboard</li>
                                <li>Klik op "Add Product"</li>
                                <li>Zoek naar "Facebook Login"</li>
                                <li>Klik op "Set Up"</li>
                                <li>Selecteer "Web" als platform</li>
                                <li>Voeg je website URL toe: <code className="bg-gray-700 px-2 py-1 rounded">http://localhost:3000</code></li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-[#3B82F6] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            3
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">App ID Toevoegen</h3>
                            <div className="text-gray-300 space-y-3">
                              <p>Voeg je App ID toe aan de environment variables:</p>
                              <ol className="list-decimal list-inside space-y-2 ml-4">
                                <li>Ga naar "Settings" → "Basic"</li>
                                <li>Kopieer de "App ID"</li>
                                <li>Voeg toe aan je <code className="bg-gray-700 px-2 py-1 rounded">.env.local</code> bestand:</li>
                                <li><code className="bg-gray-700 px-2 py-1 rounded">NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id_here</code></li>
                                <li>Herstart je development server</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-[#3B82F6] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            4
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">Klaar! Facebook Login Gebruiken</h3>
                            <div className="text-gray-300 space-y-3">
                              <p>Nu kun je de Facebook Login knop gebruiken:</p>
                              <ol className="list-decimal list-inside space-y-2 ml-4">
                                <li>Ga naar de "Facebook Login" tab</li>
                                <li>Klik op "Verbinden met Facebook"</li>
                                <li>Log in met je Facebook account</li>
                                <li>Geef toestemming voor de benodigde permissions</li>
                                <li>Je bent nu verbonden! 🎉</li>
                              </ol>
                              <div className="mt-4 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                                <p className="text-green-300 text-sm">
                                  <strong>Voordeel:</strong> Geen handmatige tokens meer nodig! 
                                  Facebook Login regelt alles automatisch.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'permissions' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Marketing API Permissions</h3>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              <span className="text-gray-300">ads_management</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              <span className="text-gray-300">ads_read</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              <span className="text-gray-300">business_management</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              <span className="text-gray-300">read_insights</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Page Permissions</h3>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              <span className="text-gray-300">pages_read_engagement</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              <span className="text-gray-300">pages_show_list</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6">
                        <div className="flex items-start space-x-3">
                          <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div className="text-blue-200">
                            <h3 className="font-semibold mb-2">Permission Uitleg</h3>
                            <ul className="space-y-2 text-sm">
                              <li><strong>ads_management:</strong> Campagnes aanmaken en beheren</li>
                              <li><strong>ads_read:</strong> Advertentie data lezen</li>
                              <li><strong>business_management:</strong> Business Manager toegang</li>
                              <li><strong>read_insights:</strong> Performance data lezen</li>
                              <li><strong>pages_read_engagement:</strong> Page engagement data</li>
                              <li><strong>pages_show_list:</strong> Pages lijst bekijken</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Facebook Verbonden!</h3>
                <p className="text-gray-300 mb-6">
                  Je kunt nu het marketing dashboard gebruiken met echte Facebook data.
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Dashboard Gebruiken
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
