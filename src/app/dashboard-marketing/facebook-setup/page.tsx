'use client';

import { useState } from 'react';
import FacebookLoginButton from '@/components/marketing/FacebookLoginButton';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  DocumentTextIcon,
  KeyIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function FacebookSetupPage() {
  const [activeTab, setActiveTab] = useState('status');

  const tabs = [
    { id: 'login', name: 'Facebook Login', icon: CogIcon },
    { id: 'setup', name: 'Setup Guide', icon: DocumentTextIcon },
    { id: 'permissions', name: 'Permissions', icon: BuildingOfficeIcon }
  ];

  return (
    <div className="min-h-screen bg-[#0F1419]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Facebook Ad Manager Setup</h1>
          <p className="mt-2 text-gray-400">
            Configureer de verbinding met Rick's Facebook Ad Account
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#374151] mb-8">
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

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'login' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Facebook Login</h2>
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
                onLoginSuccess={(accessToken, userID) => {
                  console.log('Facebook login successful:', { accessToken, userID });
                }}
                onLoginError={(error) => {
                  console.error('Facebook login error:', error);
                }}
              />
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Setup Guide</h2>
              
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
              <h2 className="text-xl font-semibold text-white mb-4">Required Permissions</h2>
              
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
      </div>
    </div>
  );
}
