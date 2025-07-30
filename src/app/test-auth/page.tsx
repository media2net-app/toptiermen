'use client';
import { useState, useEffect } from 'react';
import { 
  WrenchScrewdriverIcon, 
  Cog6ToothIcon, 
  CircleStackIcon, 
  UserIcon,
  ShieldCheckIcon,
  BeakerIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function TestAuthPage() {
  const [loginResult, setLoginResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('chiel@media2net.nl');
  const [password, setPassword] = useState('W4t3rk0k3r^');
  const [setupStatus, setSetupStatus] = useState<{
    prelaunch: 'pending' | 'completed' | 'error';
    emailCampaign: 'pending' | 'completed' | 'error';
    bulkImport: 'pending' | 'completed' | 'error';
  }>({
    prelaunch: 'pending',
    emailCampaign: 'pending',
    bulkImport: 'pending'
  });

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      setLoginResult(result);
    } catch (error) {
      setLoginResult({ success: false, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironment = () => {
    const envInfo = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    };
    
    setLoginResult({ 
      success: true, 
      message: 'Environment check',
      environment: envInfo 
    });
  };

  const getStatusIcon = (status: 'pending' | 'completed' | 'error') => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: 'pending' | 'completed' | 'error') => {
    switch (status) {
      case 'completed':
        return 'Voltooid';
      case 'error':
        return 'Fout';
      default:
        return 'In afwachting';
    }
  };

  // Check setup status on page load
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        // Check prelaunch emails
        const prelaunchResponse = await fetch('/api/admin/prelaunch-emails');
        const prelaunchData = await prelaunchResponse.json();
        if (prelaunchData.success && prelaunchData.emails && prelaunchData.emails.length > 0) {
          setSetupStatus(prev => ({ ...prev, prelaunch: 'completed' }));
        }

        // Check email campaign
        const campaignResponse = await fetch('/api/admin/email-campaign');
        const campaignData = await campaignResponse.json();
        if (campaignData.success && campaignData.steps && campaignData.steps.length > 0) {
          setSetupStatus(prev => ({ ...prev, emailCampaign: 'completed' }));
        }

        // Check if bulk emails are already imported (look for specific emails)
        if (prelaunchData.success && prelaunchData.emails) {
          const targetEmails = [
            'dominiqueboot@outlook.com',
            'Stefan-kolk@hotmail.com', 
            'info@vdweide-enterprise.com',
            'fvanhouten1986@gmail.com',
            'hortulanusglobalservices@gmail.com'
          ];
          
          const foundEmails = targetEmails.filter(targetEmail => 
            prelaunchData.emails.some((email: any) => email.email === targetEmail)
          );
          
          if (foundEmails.length >= 3) { // At least 3 of the 5 emails found
            setSetupStatus(prev => ({ ...prev, bulkImport: 'completed' }));
          }
        }
      } catch (error) {
        console.log('Setup status check failed:', error);
      }
    };

    checkSetupStatus();
  }, []);

  const addBulkEmails = async () => {
    setLoading(true);
    try {
      const emails = [
        { email: 'dominiqueboot@outlook.com', name: 'Dominique Boot', source: 'Manual', status: 'active', interestLevel: 'BASIC', notes: 'Added via bulk import' },
        { email: 'Stefan-kolk@hotmail.com', name: 'Stefan Kolk', source: 'Manual', status: 'active', interestLevel: 'BASIC', notes: 'Added via bulk import' },
        { email: 'info@vdweide-enterprise.com', name: 'Van der Weide Enterprise', source: 'Manual', status: 'active', interestLevel: 'PREMIUM', notes: 'Enterprise client - added via bulk import' },
        { email: 'fvanhouten1986@gmail.com', name: 'F. van Houten', source: 'Manual', status: 'active', interestLevel: 'BASIC', notes: 'Added via bulk import' },
        { email: 'hortulanusglobalservices@gmail.com', name: 'Hortulanus Global Services', source: 'Manual', status: 'active', interestLevel: 'BASIC', notes: 'Added via bulk import' }
      ];

      let addedCount = 0;
      let skippedCount = 0;
      const results = [];

      for (const emailData of emails) {
        try {
          const response = await fetch('/api/admin/prelaunch-emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
          });
          
          const result = await response.json();
          
          if (result.success) {
            addedCount++;
            results.push(`✅ ${emailData.email} - Toegevoegd`);
          } else if (result.error && result.error.includes('already exists')) {
            skippedCount++;
            results.push(`⏭️ ${emailData.email} - Bestond al`);
          } else {
            results.push(`❌ ${emailData.email} - Fout: ${result.error}`);
          }
        } catch (error) {
          results.push(`❌ ${emailData.email} - Fout: ${error}`);
        }
      }

      setLoginResult({
        success: true,
        message: `Bulk email import voltooid`,
        details: {
          added: addedCount,
          skipped: skippedCount,
          total: emails.length
        },
        results: results
      });

      // Update status based on results
      if (addedCount > 0 || skippedCount > 0) {
        setSetupStatus(prev => ({ ...prev, bulkImport: 'completed' }));
      } else {
        setSetupStatus(prev => ({ ...prev, bulkImport: 'error' }));
      }

    } catch (error) {
      console.error('Bulk email import error:', error);
      setLoginResult({ success: false, error: `Bulk import failed: ${error}` });
      setSetupStatus(prev => ({ ...prev, bulkImport: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const checkChiel = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check-chiel');
      const result = await response.json();
      setLoginResult(result);
    } catch (error) {
      setLoginResult({ success: false, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  // Video upload testing functions removed - clean slate for new implementation

  return (
    <div className="min-h-screen bg-[#181F17]">
      {/* Top Navigation Bar */}
      <div className="bg-[#232D1A] border-b border-[#3A4D23] px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <WrenchScrewdriverIcon className="w-8 h-8 text-[#8BAE5A]" />
            <h1 className="text-xl font-bold text-[#8BAE5A]">Admin Tools</h1>
          </div>
          <div className="flex items-center gap-4 text-[#B6C948] text-sm">
            <span>Development Tools</span>
            <span>•</span>
            <span>Database Management</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#232D1A] min-h-screen p-6">
          <nav className="space-y-6">
            <div>
              <h3 className="text-[#8BAE5A] font-semibold mb-3">🔧 Development</h3>
              <div className="space-y-2">
                <button
                  onClick={checkEnvironment}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A] transition-colors"
                >
                                     <CircleStackIcon className="w-4 h-4 inline mr-2" />
                  Environment Check
                </button>
                <button
                  onClick={checkChiel}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A] transition-colors disabled:opacity-50"
                >
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  Check Chiel Account
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[#8BAE5A] font-semibold mb-3 flex items-center gap-2">
                🗄️ Database
                {setupStatus.prelaunch === 'completed' && setupStatus.emailCampaign === 'completed' && setupStatus.bulkImport === 'completed' && (
                  <span className="text-green-400 text-sm">✓ Alle tabellen klaar</span>
                )}
              </h3>
              <div className="space-y-2">
                                                   <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const response = await fetch('/api/admin/direct-setup-prelaunch', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({})
                        });
                        const result = await response.json();
                        console.log('Direct setup prelaunch emails result:', result);
                        setLoginResult(result);
                        
                        if (result.success) {
                          setSetupStatus(prev => ({ ...prev, prelaunch: 'completed' }));
                        } else {
                          setSetupStatus(prev => ({ ...prev, prelaunch: 'error' }));
                        }
                      } catch (error) {
                        console.error('Direct setup error:', error);
                        setLoginResult({ success: false, error: `Direct setup failed: ${error}` });
                        setSetupStatus(prev => ({ ...prev, prelaunch: 'error' }));
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                      setupStatus.prelaunch === 'completed' 
                        ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                        : setupStatus.prelaunch === 'error'
                        ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                        : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                    }`}
                  >
                    <div className="flex items-center">
                      <Cog6ToothIcon className="w-4 h-4 mr-2" />
                      Setup Prelaunch Emails
                    </div>
                    <span>
                      {getStatusIcon(setupStatus.prelaunch)}
                    </span>
                  </button>
                                   <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const response = await fetch('/api/admin/setup-email-campaign', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({})
                        });
                        const result = await response.json();
                        console.log('Setup email campaign result:', result);
                        setLoginResult(result);
                        
                        if (result.success) {
                          setSetupStatus(prev => ({ ...prev, emailCampaign: 'completed' }));
                        } else {
                          setSetupStatus(prev => ({ ...prev, emailCampaign: 'error' }));
                        }
                      } catch (error) {
                        console.error('Setup email campaign error:', error);
                        setLoginResult({ success: false, error: `Setup failed: ${error}` });
                        setSetupStatus(prev => ({ ...prev, emailCampaign: 'error' }));
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                      setupStatus.emailCampaign === 'completed' 
                        ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                        : setupStatus.emailCampaign === 'error'
                        ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                        : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                    }`}
                  >
                    <div className="flex items-center">
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      Setup Email Campaign
                    </div>
                                        <span>
                      {getStatusIcon(setupStatus.emailCampaign)}
                    </span>
                  </button>
                  
                  <button
                    onClick={addBulkEmails}
                    disabled={loading}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                      setupStatus.bulkImport === 'completed' 
                        ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                        : setupStatus.bulkImport === 'error'
                        ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                        : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                    }`}
                  >
                    <div className="flex items-center">
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      Bulk Email Import
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8BAE5A]">
                        +5 emails
                      </span>
                      {getStatusIcon(setupStatus.bulkImport)}
                    </div>
                  </button>
                </div>
              </div>

            <div>
              <h3 className="text-[#8BAE5A] font-semibold mb-3">🔐 Authentication</h3>
              <div className="space-y-2">
                <button
                  onClick={testLogin}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A] transition-colors disabled:opacity-50"
                >
                  <ShieldCheckIcon className="w-4 h-4 inline mr-2" />
                  Test Login
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[#8BAE5A] font-semibold mb-3">🧪 Testing</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setLoginResult({ success: true, message: 'Test function ready for implementation' })}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A] transition-colors"
                >
                  <BeakerIcon className="w-4 h-4 inline mr-2" />
                  Test Function
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Admin Development Tools</h1>
              <p className="text-[#B6C948]">Database management, authentication testing, and development utilities</p>
            </div>

            {/* Login Test Section */}
            <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] mb-6">
              <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">🔐 Authentication Test</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#B6C948] mb-2">Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#B6C948] mb-2">Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>
              </div>
              
              <button
                onClick={testLogin}
                disabled={loading}
                className="w-full px-4 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors disabled:opacity-50 font-semibold"
              >
                {loading ? 'Testing...' : 'Test Login'}
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
                                 <div className="flex items-center mb-4">
                   <CircleStackIcon className="w-8 h-8 text-[#8BAE5A] mr-3" />
                   <h3 className="text-lg font-semibold text-[#8BAE5A]">Environment</h3>
                 </div>
                <p className="text-[#B6C948] text-sm mb-4">Check environment variables and configuration</p>
                <button
                  onClick={checkEnvironment}
                  className="w-full px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors"
                >
                  Check Environment
                </button>
              </div>

              <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
                <div className="flex items-center mb-4">
                  <UserIcon className="w-8 h-8 text-[#8BAE5A] mr-3" />
                  <h3 className="text-lg font-semibold text-[#8BAE5A]">User Management</h3>
                </div>
                <p className="text-[#B6C948] text-sm mb-4">Check and manage user accounts</p>
                <button
                  onClick={checkChiel}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Checking...' : 'Check Chiel'}
                </button>
              </div>

              <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
                <div className="flex items-center mb-4">
                  <Cog6ToothIcon className="w-8 h-8 text-[#8BAE5A] mr-3" />
                  <h3 className="text-lg font-semibold text-[#8BAE5A]">Database Setup</h3>
                </div>
                <p className="text-[#B6C948] text-sm mb-4">Setup and manage database tables</p>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const response = await fetch('/api/admin/direct-setup-prelaunch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                      });
                      const result = await response.json();
                      setLoginResult(result);
                    } catch (error) {
                      setLoginResult({ success: false, error: `Setup failed: ${error}` });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Setup Tables'}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {loginResult && (
              <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
                <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">📊 Results</h2>
                <div className={`p-4 rounded-lg ${
                  loginResult.success 
                    ? 'bg-[#1A2D17] border border-[#4A5D33]' 
                    : 'bg-[#2D1A1A] border border-[#5D3333]'
                }`}>
                  {/* Bulk import results */}
                  {loginResult.details && loginResult.details.added !== undefined && (
                    <div className="text-sm mb-4 space-y-2">
                      <div className="flex gap-4 text-[#8BAE5A]">
                        <span>✅ Toegevoegd: {loginResult.details.added}</span>
                        <span>⏭️ Overgeslagen: {loginResult.details.skipped}</span>
                        <span>📊 Totaal: {loginResult.details.total}</span>
                      </div>
                      {loginResult.results && (
                        <div className="mt-3 space-y-1">
                          <h5 className="font-semibold text-[#8BAE5A]">Details:</h5>
                          {loginResult.results.map((result: string, index: number) => (
                            <div key={index} className="text-xs text-[#B6C948]">{result}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <pre className="text-sm overflow-auto text-[#B6C948]">
                    {JSON.stringify(loginResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] mt-6">
              <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">🔗 Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a 
                  href="/login" 
                  className="block p-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors text-center"
                >
                  → Login Page
                </a>
                <a 
                  href="/dashboard-admin" 
                  className="block p-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors text-center"
                >
                  → Admin Dashboard
                </a>
                <a 
                  href="/dashboard" 
                  className="block p-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors text-center"
                >
                  → User Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 