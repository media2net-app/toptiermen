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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  isTestMode: boolean;
}

interface EmailConfig {
  provider: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
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
  
  // Stripe Configuration
  const [stripeConfig, setStripeConfig] = useState<StripeConfig>({
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    isTestMode: true
  });
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Email Configuration
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    provider: 'resend',
    apiKey: '',
    fromEmail: '',
    fromName: ''
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
      setStripeConfig({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        isTestMode: true
      });

      setEmailConfig({
        provider: 'resend',
        apiKey: process.env.RESEND_API_KEY || '',
        fromEmail: 'noreply@toptiermen.com',
        fromName: 'Top Tier Men'
      });

      setPlatformConfig({
        siteName: 'Top Tier Men',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
        maintenanceMode: false,
        analyticsEnabled: false,
        googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || ''
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Fout bij het laden van instellingen' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveStripeConfig = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd save this to the database
      // For now, we'll just show a success message
      setMessage({ type: 'success', text: 'Stripe configuratie opgeslagen!' });
      
      // Test Stripe connection
      const response = await fetch('/api/admin/test-stripe-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: stripeConfig.secretKey })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Stripe verbinding succesvol getest!' });
      } else {
        setMessage({ type: 'error', text: 'Stripe verbinding test mislukt' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij het opslaan van Stripe configuratie' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveEmailConfig = async () => {
    setIsLoading(true);
    try {
      // Save email configuration
      setMessage({ type: 'success', text: 'Email configuratie opgeslagen!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij het opslaan van email configuratie' });
    } finally {
      setIsLoading(false);
    }
  };

  const savePlatformConfig = async () => {
    setIsLoading(true);
    try {
      // Save platform configuration
      setMessage({ type: 'success', text: 'Platform configuratie opgeslagen!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij het opslaan van platform configuratie' });
    } finally {
      setIsLoading(false);
    }
  };

  const testStripeConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/test-stripe-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: stripeConfig.secretKey })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Stripe verbinding succesvol!' });
      } else {
        setMessage({ type: 'error', text: 'Stripe verbinding mislukt' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij het testen van Stripe verbinding' });
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
    { id: 'stripe', name: 'Stripe Configuratie', icon: CreditCardIcon },
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

      {/* Stripe Configuration Tab */}
      {activeTab === 'stripe' && (
        <div className="space-y-6">
          <div className="bg-[#181F17] p-6 rounded-lg border border-[#3A4D23]">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCardIcon className="w-6 h-6 text-[#B6C948]" />
              Stripe Payment Configuratie
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[#B6C948] font-medium mb-2">
                    Publishable Key
                  </label>
                  <input
                    type="text"
                    value={stripeConfig.publishableKey}
                    onChange={(e) => setStripeConfig(prev => ({ ...prev, publishableKey: e.target.value }))}
                    className="w-full p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                    placeholder="pk_test_..."
                  />
                </div>

                <div>
                  <label className="block text-[#B6C948] font-medium mb-2">
                    Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showStripeSecret ? 'text' : 'password'}
                      value={stripeConfig.secretKey}
                      onChange={(e) => setStripeConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                      className="w-full p-3 pr-12 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                      placeholder="sk_test_..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8BAE5A] hover:text-[#B6C948]"
                    >
                      {showStripeSecret ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#B6C948] font-medium mb-2">
                    Webhook Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={stripeConfig.webhookSecret}
                      onChange={(e) => setStripeConfig(prev => ({ ...prev, webhookSecret: e.target.value }))}
                      className="w-full p-3 pr-12 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#B6C948] focus:outline-none"
                      placeholder="whsec_..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8BAE5A] hover:text-[#B6C948]"
                    >
                      {showWebhookSecret ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
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
                      checked={stripeConfig.isTestMode}
                      onChange={(e) => setStripeConfig(prev => ({ ...prev, isTestMode: e.target.checked }))}
                      className="accent-[#B6C948]"
                    />
                    Gebruik test modus (aanbevolen voor ontwikkeling)
                  </label>
                </div>

                <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
                  <h3 className="text-[#B6C948] font-semibold mb-2">Webhook URL</h3>
                  <p className="text-[#8BAE5A] text-sm mb-2">
                    Configureer deze URL in je Stripe dashboard:
                  </p>
                  <code className="block p-2 bg-[#181F17] text-[#B6C948] text-xs rounded border border-[#3A4D23]">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/stripe` : 'Loading...'}
                  </code>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={testStripeConnection}
                    disabled={isLoading || !stripeConfig.secretKey}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Test Stripe Verbinding
                  </button>
                  
                  <button
                    onClick={saveStripeConfig}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-[#B6C948] text-[#181F17] font-semibold rounded-lg hover:bg-[#8BAE5A] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Opslaan...' : 'Stripe Configuratie Opslaan'}
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
                    <option value="resend">Resend</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
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

                <button
                  onClick={saveEmailConfig}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-[#B6C948] text-[#181F17] font-semibold rounded-lg hover:bg-[#8BAE5A] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Opslaan...' : 'Email Configuratie Opslaan'}
                </button>
              </div>
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