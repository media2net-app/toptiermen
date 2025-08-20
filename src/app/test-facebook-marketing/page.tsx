'use client';

import { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

export default function TestFacebookMarketing() {
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!accessToken.trim()) {
      setError('Voer een access token in');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch(`/api/test-facebook-marketing?token=${encodeURIComponent(accessToken)}`);
      const data = await response.json();

      if (response.ok) {
        setTestResult(data);
      } else {
        setError(data.error || 'Test mislukt');
      }
    } catch (err) {
      setError('Netwerk fout bij testen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDefaultToken = () => {
    setAccessToken('EAAPGzhOwpPUBPIDN6kp2Aarhwu8HgZCULT49TkFuwSmE2RGLSTZByQ5kzZCVaav801vZASERZCZBEWECZA7wKAcut0TYeko7aErEextZATtrWl8qYjWtqhcgWqdB4ocvxWLAJ1cnyDwl1xakS5aVGeF6ZBk19dzYjpviTw5ZAJ3BX9bjR6dWBfLCPHNwXZC53kmhrlnJLZCZCanET');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-400 mb-2">
            Facebook Marketing API Test
          </h1>
          <p className="text-gray-300">
            Test de Facebook Marketing API met je access token
          </p>
        </div>

        {/* Access Token Input */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            Access Token
          </h2>
          
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleUseDefaultToken}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Gebruik Standaard Token
            </button>
            <span className="text-gray-400 text-sm">
              (Token uit Facebook Developer Console)
            </span>
          </div>

          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Plak je Facebook Marketing API access token hier..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showToken ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          <div className="mt-4">
            <button
              onClick={handleTest}
              disabled={isLoading || !accessToken.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <CogIcon className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircleIcon className="w-5 h-5" />
              )}
              <span>
                {isLoading ? 'Testen...' : 'Test Marketing API'}
              </span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <XCircleIcon className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResult && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-green-400 font-semibold">Test Succesvol!</h3>
                  <p className="text-green-300 text-sm">{testResult.message}</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            {testResult.user && (
              <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                <h3 className="text-blue-400 font-semibold mb-3">Gebruiker Informatie</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">ID:</span>
                    <div className="text-white font-mono">{testResult.user.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Naam:</span>
                    <div className="text-white">{testResult.user.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <div className="text-white">{testResult.user.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Ad Accounts */}
            {testResult.adAccounts && (
              <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                <h3 className="text-purple-400 font-semibold mb-3">
                  Advertentie Accounts ({testResult.adAccounts.count})
                </h3>
                {testResult.adAccounts.accounts.length > 0 ? (
                  <div className="space-y-3">
                    {testResult.adAccounts.accounts.map((account: any, index: number) => (
                      <div key={account.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">ID:</span>
                            <div className="text-white font-mono">{account.id}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Naam:</span>
                            <div className="text-white">{account.name}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <div className="text-white">{account.account_status}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Valuta:</span>
                            <div className="text-white">{account.currency}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300">Geen advertentie accounts gevonden</p>
                )}
              </div>
            )}

            {/* Campaigns */}
            {testResult.campaigns && (
              <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                <h3 className="text-orange-400 font-semibold mb-3">
                  Campagnes ({testResult.campaigns.count})
                </h3>
                {testResult.campaigns.campaigns.length > 0 ? (
                  <div className="space-y-3">
                    {testResult.campaigns.campaigns.map((campaign: any, index: number) => (
                      <div key={campaign.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">ID:</span>
                            <div className="text-white font-mono">{campaign.id}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Naam:</span>
                            <div className="text-white">{campaign.name}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <div className="text-white">{campaign.status}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Doel:</span>
                            <div className="text-white">{campaign.objective}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300">Geen campagnes gevonden</p>
                )}
              </div>
            )}

            {/* Insights */}
            {testResult.insights && testResult.insights.length > 0 && (
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                <h3 className="text-green-400 font-semibold mb-3">
                  Insights (Laatste 30 dagen)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-2 text-gray-400">Impressies</th>
                        <th className="text-left py-2 text-gray-400">Clicks</th>
                        <th className="text-left py-2 text-gray-400">Spend</th>
                        <th className="text-left py-2 text-gray-400">Reach</th>
                        <th className="text-left py-2 text-gray-400">CTR</th>
                        <th className="text-left py-2 text-gray-400">CPM</th>
                        <th className="text-left py-2 text-gray-400">CPC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResult.insights.map((insight: any, index: number) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-2">{insight.impressions || '-'}</td>
                          <td className="py-2">{insight.clicks || '-'}</td>
                          <td className="py-2">{insight.spend ? `€${insight.spend}` : '-'}</td>
                          <td className="py-2">{insight.reach || '-'}</td>
                          <td className="py-2">{insight.ctr ? `${insight.ctr}%` : '-'}</td>
                          <td className="py-2">{insight.cpm ? `€${insight.cpm}` : '-'}</td>
                          <td className="py-2">{insight.cpc ? `€${insight.cpc}` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Permissions */}
            {testResult.permissions && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-gray-300 font-semibold mb-3">Toegestane Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(testResult.permissions).map(([permission, granted]) => (
                    <div key={permission} className="flex items-center space-x-2">
                      {granted ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm text-gray-300">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-400">
            Hoe te gebruiken:
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>1. <strong>Kopieer je access token</strong> uit de Facebook Developer Console</p>
            <p>2. <strong>Plak de token</strong> in het invoerveld hierboven</p>
            <p>3. <strong>Klik op "Test Marketing API"</strong> om de verbinding te testen</p>
            <p>4. <strong>Bekijk de resultaten</strong> - gebruikersinfo, ad accounts, campagnes en insights</p>
            <p>5. <strong>Gebruik de token</strong> in het marketing dashboard voor live data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
