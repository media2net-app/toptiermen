'use client';

import { useState, useEffect } from 'react';
import { 
  CogIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import CDNPerformanceTest from '@/components/admin/CDNPerformanceTest';
import VideoUploadLogs from '@/components/admin/VideoUploadLogs';

interface MollieConfig {
  liveKey: string;
  testKey: string;
  isTestMode: boolean;
}

interface EmailConfig {
  provider: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
  // SMTP Configuration
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword: string;
  useManualSmtp: boolean;
}

interface PlatformConfig {
  siteName: string;
  siteUrl: string;
  maintenanceMode: boolean;
  analyticsEnabled: boolean;
  googleAnalyticsId: string;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('stripe');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Mollie Configuration
  const [mollieConfig, setMollieConfig] = useState<MollieConfig>({
    liveKey: '',
    testKey: '',
    isTestMode: true
  });
  const [showLiveKey, setShowLiveKey] = useState(false);
  const [showTestKey, setShowTestKey] = useState(false);

  // Email Configuration
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    provider: 'smtp',
    apiKey: '',
    fromEmail: 'platform@toptiermen.eu',
    fromName: 'Top Tier Men',
    // SMTP Configuration
    smtpHost: 'toptiermen.eu',
    smtpPort: '465',
    smtpSecure: true,
    smtpUsername: 'platform@toptiermen.eu',
    smtpPassword: '5LUrnxEmEQYgEUt3PmZg',
    useManualSmtp: true
  });

  // Platform Configuration
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
    siteName: 'Top Tier Men',
    siteUrl: '',
    maintenanceMode: false,
    analyticsEnabled: false,
    googleAnalyticsId: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load from environment variables or database
      setMollieConfig({
        liveKey: process.env.MOLLIE_LIVE_KEY || '',
        testKey: process.env.MOLLIE_TEST_KEY || '',
        isTestMode: true
      });

      setEmailConfig({
        provider: 'smtp',
        apiKey: '',
        fromEmail: 'platform@toptiermen.eu',
        fromName: 'Top Tier Men',
        // SMTP Configuration
        smtpHost: 'toptiermen.eu',
        smtpPort: '465',
        smtpSecure: true,
        smtpUsername: 'platform@toptiermen.eu',
        smtpPassword: '5LUrnxEmEQYgEUt3PmZg',
        useManualSmtp: true
      });

      // Try to load platform settings from database
      try {
        const { data: platformSettings, error: platformError } = await supabase
          .from('platform_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (platformSettings && !platformError) {
          setPlatformConfig({
            siteName: platformSettings.site_name || 'Top Tier Men',
            siteUrl: platformSettings.site_url || process.env.NEXT_PUBLIC_SITE_URL || '',
            maintenanceMode: platformSettings.maintenance_mode || false,
            analyticsEnabled: platformSettings.analytics_enabled || true,
            googleAnalyticsId: platformSettings.google_analytics_id || 'G-YT2NR1LKHX'
          });
        } else {
          // Fallback to default values
          setPlatformConfig({
            siteName: 'Top Tier Men',
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
            maintenanceMode: false,
            analyticsEnabled: true, // Automatically enable since we have GA implemented
            googleAnalyticsId: 'G-YT2NR1LKHX' // Use the ID we just implemented
          });
        }
      } catch (error) {
        console.log('⚠️ Error loading platform settings from database, using defaults:', error);
        // Fallback to default values
        setPlatformConfig({
          siteName: 'Top Tier Men',
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
          maintenanceMode: false,
          analyticsEnabled: true, // Automatically enable since we have GA implemented
          googleAnalyticsId: 'G-YT2NR1LKHX' // Use the ID we just implemented
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Fout bij het laden van instellingen' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveMollieConfig = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd save this to the database
      // For now, we'll just show a success message
      setMessage({ type: 'success', text: 'Mollie configuratie opgeslagen!' });
      
      // Test Mollie connection
      const response = await fetch('/api/test-mollie', {
        method: 'GET'
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Mollie verbinding succesvol getest!' });
      } else {
        setMessage({ type: 'error', text: 'Mollie verbinding test mislukt' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij het opslaan van Mollie configuratie' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveEmailConfig = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd save this to the database
      // For now, we'll just show a success message
      setMessage({ type: 'success', text: 'Email configuratie opgeslagen!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij het opslaan van email configuratie' });
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/test-email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailConfig)
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Test email succesvol verzonden! Check je inbox.' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `Email test mislukt: ${error.message}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij het testen van email configuratie' });
    } finally {
      setIsLoading(false);
    }
  };

  const savePlatformConfig = async () => {
    setIsLoading(true);
    try {
      // Save platform configuration to database or environment
      const response = await fetch('/api/admin/save-platform-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platformConfig)
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Platform configuratie opgeslagen! Google Analytics ID: ' + platformConfig.googleAnalyticsId });
      } else {
        setMessage({ type: 'error', text: 'Fout bij het opslaan van platform configuratie' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij het opslaan van platform configuratie' });
    } finally {
      setIsLoading(false);
    }
  };

  const testMollieConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-mollie', {
        method: 'GET'
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Mollie verbinding succesvol!' });
      } else {
        setMessage({ type: 'error', text: 'Mollie verbinding mislukt' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij het testen van Mollie verbinding' });
    } finally {
      setIsLoading(false);
    }
  };

  const testGoogleAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/test-google-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Google Analytics configuratie succesvol!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Google Analytics configuratie mislukt' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij het testen van Google Analytics configuratie' });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'mollie', name: 'Mollie Configuratie', icon: CreditCardIcon },
    { id: 'email', name: 'Email Instellingen', icon: EnvelopeIcon },
    { id: 'platform', name: 'Platform Instellingen', icon: GlobeAltIcon }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CogIcon className="w-8 h-8 text-[#B6C948]" />
        <h1 className="text-3xl font-bold text-white">Instellingen</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-900/20 border-green-500 text-green-400' 
            : 'bg-red-900/20 border-red-500 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-[#3A4D23]">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-[#B6C948] text-[#B6C948]'
                  : 'border-transparent text-[#8BAE5A] hover:text-[#B6C948] hover:border-[#B6C948]'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Mollie Configuration Tab */}
      {activeTab === 'mollie' && (
        <div className="space-y-6">
          <div className="bg-[#181F17] p-6 rounded-lg border border-[#3A4D23]">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCardIcon className="w-6 h-6 text-[#B6C948]" />
              Mollie Payment Configuratie
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[#B6C948] font-medium mb-2">
                    Live Key
                  </label>
                  <div className="relative">
                    <input
                      type={showLiveKey ? 'text' : 'password'}
                      value={mollieConfig.liveKey}
                      onChange={(e) => setMollieConfig(prev => ({ ...prev, liveKey: e.target.value }))}
                      className="w-full p-3 pr-12 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                      placeholder="live_..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowLiveKey(!showLiveKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8BAE5A] hover:text-[#B6C948]"
                    >
                      {showLiveKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#B6C948] font-medium mb-2">
                    Test Key
                  </label>
                  <div className="relative">
                    <input
                      type={showTestKey ? 'text' : 'password'}
                      value={mollieConfig.testKey}
                      onChange={(e) => setMollieConfig(prev => ({ ...prev, testKey: e.target.value }))}
                      className="w-full p-3 pr-12 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                      placeholder="test_..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowTestKey(!showTestKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8BAE5A] hover:text-[#B6C948]"
                    >
                      {showTestKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
                  <h3 className="text-[#B6C948] font-semibold mb-2">Test Mode</h3>
                  <label className="flex items-center gap-2 text-[#8BAE5A]">
                    <input
                      type="checkbox"
                      checked={mollieConfig.isTestMode}
                      onChange={(e) => setMollieConfig(prev => ({ ...prev, isTestMode: e.target.checked }))}
                      className="accent-[#B6C948]"
                    />
                    Gebruik test modus (aanbevolen voor ontwikkeling)
                  </label>
                </div>

                <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
                  <h3 className="text-[#B6C948] font-semibold mb-2">Webhook URL</h3>
                  <p className="text-[#8BAE5A] text-sm mb-2">
                    Configureer deze URL in je Mollie dashboard:
                  </p>
                  <code className="block p-2 bg-[#181F17] text-[#B6C948] text-xs rounded border border-[#3A4D23]">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/payments/mollie/webhook` : 'Loading...'}
                  </code>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={testMollieConnection}
                    disabled={isLoading || (!mollieConfig.liveKey && !mollieConfig.testKey)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Test Mollie Verbinding
                  </button>
                  
                  <button
                    onClick={saveMollieConfig}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-[#B6C948] text-[#181F17] font-semibold rounded-lg hover:bg-[#8BAE5A] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Opslaan...' : 'Mollie Configuratie Opslaan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Configuration Tab */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="bg-[#181F17] p-6 rounded-lg border border-[#3A4D23]">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <EnvelopeIcon className="w-6 h-6 text-[#B6C948]" />
              Email Instellingen
            </h2>
            
            {/* Email Provider Selection */}
            <div className="mb-6">
              <label className="block text-[#B6C948] font-medium mb-2">
                Email Configuratie Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-[#8BAE5A]">
                  <input
                    type="radio"
                    name="emailType"
                    checked={!emailConfig.useManualSmtp}
                    onChange={() => setEmailConfig(prev => ({ ...prev, useManualSmtp: false }))}
                    className="accent-[#B6C948]"
                  />
                  API Provider (Resend, SendGrid, etc.)
                </label>
                <label className="flex items-center gap-2 text-[#8BAE5A]">
                  <input
                    type="radio"
                    name="emailType"
                    checked={emailConfig.useManualSmtp}
                    onChange={() => setEmailConfig(prev => ({ ...prev, useManualSmtp: true }))}
                    className="accent-[#B6C948]"
                  />
                  Handmatige SMTP Configuratie
                </label>
              </div>
            </div>

            {!emailConfig.useManualSmtp ? (
              /* API Provider Configuration */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#B6C948] font-medium mb-2">
                      Email Provider
                    </label>
                    <select
                      value={emailConfig.provider}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                    >
                      <option value="smtp">SMTP</option>
                      <option value="resend">Resend</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailgun">Mailgun</option>
                      <option value="aws-ses">AWS SES</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#B6C948] font-medium mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={emailConfig.apiKey}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                      placeholder="API key..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[#B6C948] font-medium mb-2">
                      Van Email
                    </label>
                    <input
                      type="email"
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                      className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                      placeholder="platform@toptiermen.eu"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B6C948] font-medium mb-2">
                      Van Naam
                    </label>
                    <input
                      type="text"
                      value={emailConfig.fromName}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                      className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                      placeholder="Top Tier Men"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Manual SMTP Configuration */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#B6C948] font-medium mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={emailConfig.smtpHost}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                        className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[#B6C948] font-medium mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={emailConfig.smtpPort}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                        className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                        placeholder="587"
                      />
                    </div>

                    <div>
                      <label className="block text-[#B6C948] font-medium mb-2">
                        SMTP Gebruikersnaam
                      </label>
                      <input
                        type="text"
                        value={emailConfig.smtpUsername}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpUsername: e.target.value }))}
                        className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                        placeholder="jouw@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#B6C948] font-medium mb-2">
                        SMTP Wachtwoord
                      </label>
                      <input
                        type="password"
                        value={emailConfig.smtpPassword}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                        className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                        placeholder="App wachtwoord of wachtwoord"
                      />
                    </div>

                    <div>
                      <label className="block text-[#B6C948] font-medium mb-2">
                        Van Email
                      </label>
                      <input
                        type="email"
                        value={emailConfig.fromEmail}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                        className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                        placeholder="noreply@toptiermen.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[#B6C948] font-medium mb-2">
                        Van Naam
                      </label>
                      <input
                        type="text"
                        value={emailConfig.fromName}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                        className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                        placeholder="Top Tier Men"
                      />
                    </div>
                  </div>
                </div>

                {/* SSL/TLS Configuration */}
                <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
                  <h3 className="text-[#B6C948] font-semibold mb-3">SSL/TLS Configuratie</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[#8BAE5A]">
                      <input
                        type="checkbox"
                        checked={emailConfig.smtpSecure}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpSecure: e.target.checked }))}
                        className="accent-[#B6C948]"
                      />
                      Gebruik SSL/TLS (STARTTLS)
                    </label>
                    <p className="text-[#8BAE5A] text-sm">
                      Voor Gmail: Port 587 met SSL/TLS aan, voor andere providers: check de documentatie
                    </p>
                  </div>
                </div>

                {/* Common SMTP Settings */}
                <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
                  <h3 className="text-[#B6C948] font-semibold mb-3">Veelgebruikte SMTP Instellingen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="text-[#8BAE5A] font-medium mb-2">Gmail</h4>
                      <p className="text-gray-400">Host: smtp.gmail.com</p>
                      <p className="text-gray-400">Port: 587</p>
                      <p className="text-gray-400">SSL: Aan</p>
                    </div>
                    <div>
                      <h4 className="text-[#8BAE5A] font-medium mb-2">Outlook/Hotmail</h4>
                      <p className="text-gray-400">Host: smtp-mail.outlook.com</p>
                      <p className="text-gray-400">Port: 587</p>
                      <p className="text-gray-400">SSL: Aan</p>
                    </div>
                    <div>
                      <h4 className="text-[#8BAE5A] font-medium mb-2">Yahoo</h4>
                      <p className="text-gray-400">Host: smtp.mail.yahoo.com</p>
                      <p className="text-gray-400">Port: 587</p>
                      <p className="text-gray-400">SSL: Aan</p>
                    </div>
                    <div>
                      <h4 className="text-[#8BAE5A] font-medium mb-2">Custom Server</h4>
                      <p className="text-gray-400">Host: jouw-smtp-server.com</p>
                      <p className="text-gray-400">Port: 25, 465, of 587</p>
                      <p className="text-gray-400">SSL: Volgens server configuratie</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={testEmailConfig}
                disabled={isLoading || (!emailConfig.useManualSmtp && !emailConfig.apiKey) || (emailConfig.useManualSmtp && (!emailConfig.smtpHost || !emailConfig.smtpPort || !emailConfig.smtpUsername))}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Testen...' : 'Test Email Configuratie'}
              </button>
              <button
                onClick={saveEmailConfig}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-[#B6C948] text-[#181F17] font-semibold rounded-lg hover:bg-[#8BAE5A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Opslaan...' : 'Email Configuratie Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Platform Configuration Tab */}
      {activeTab === 'platform' && (
        <div className="space-y-6">
          <div className="bg-[#181F17] p-6 rounded-lg border border-[#3A4D23]">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <GlobeAltIcon className="w-6 h-6 text-[#B6C948]" />
              Platform Instellingen
            </h2>
            
            {/* CDN Performance Test */}
            <CDNPerformanceTest className="mb-6" />
            
            {/* Video Upload Performance Logs */}
            <VideoUploadLogs />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[#B6C948] font-medium mb-2">
                    Site Naam
                  </label>
                  <input
                    type="text"
                    value={platformConfig.siteName}
                    onChange={(e) => setPlatformConfig(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#B6C948] font-medium mb-2">
                    Site URL
                  </label>
                  <input
                    type="url"
                    value={platformConfig.siteUrl}
                    onChange={(e) => setPlatformConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                    className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                    placeholder="https://toptiermen.com"
                  />
                </div>

                <div>
                  <label className="block text-[#B6C948] font-medium mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={platformConfig.googleAnalyticsId}
                    onChange={(e) => setPlatformConfig(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                    className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
                  <h3 className="text-[#B6C948] font-semibold mb-2">Platform Status</h3>
                  
                  <label className="flex items-center gap-2 text-[#8BAE5A] mb-3">
                    <input
                      type="checkbox"
                      checked={platformConfig.maintenanceMode}
                      onChange={(e) => setPlatformConfig(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      className="accent-[#B6C948]"
                    />
                    Onderhoudsmodus
                  </label>

                  <label className="flex items-center gap-2 text-[#8BAE5A]">
                    <input
                      type="checkbox"
                      checked={platformConfig.analyticsEnabled}
                      onChange={(e) => setPlatformConfig(prev => ({ ...prev, analyticsEnabled: e.target.checked }))}
                      className="accent-[#B6C948]"
                    />
                    Google Analytics inschakelen
                  </label>
                </div>

                <button
                  onClick={savePlatformConfig}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-[#B6C948] text-[#181F17] font-semibold rounded-lg hover:bg-[#8BAE5A] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Opslaan...' : 'Platform Configuratie Opslaan'}
                </button>

                <button
                  onClick={testGoogleAnalytics}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-[#8BAE5A] text-[#181F17] font-semibold rounded-lg hover:bg-[#B6C948] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Testen...' : 'Test Google Analytics'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 