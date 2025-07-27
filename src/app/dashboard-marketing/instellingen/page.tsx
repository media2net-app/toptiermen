'use client';

import { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  UserIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

// Types
interface MarketingSettings {
  notifications: {
    emailReports: boolean;
    budgetAlerts: boolean;
    performanceAlerts: boolean;
    conversionAlerts: boolean;
  };
  integrations: {
    googleAnalytics: boolean;
    facebookPixel: boolean;
    googleAds: boolean;
    linkedinInsights: boolean;
  };
  privacy: {
    dataRetention: number;
    anonymizeData: boolean;
    gdprCompliant: boolean;
  };
  display: {
    currency: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };
  api: {
    apiKey: string;
    webhookUrl: string;
    rateLimit: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<MarketingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Mock data
  useEffect(() => {
    const mockSettings: MarketingSettings = {
      notifications: {
        emailReports: true,
        budgetAlerts: true,
        performanceAlerts: true,
        conversionAlerts: false
      },
      integrations: {
        googleAnalytics: true,
        facebookPixel: true,
        googleAds: true,
        linkedinInsights: false
      },
      privacy: {
        dataRetention: 90,
        anonymizeData: true,
        gdprCompliant: true
      },
      display: {
        currency: "EUR",
        timezone: "Europe/Amsterdam",
        dateFormat: "DD/MM/YYYY",
        language: "nl"
      },
      api: {
        apiKey: "mk_live_1234567890abcdef",
        webhookUrl: "https://api.toptiermen.com/webhooks/marketing",
        rateLimit: 1000
      }
    };

    setSettings(mockSettings);
    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    // Show success message
  };

  const updateSetting = (category: keyof MarketingSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Instellingen</h1>
          <p className="text-gray-400 mt-1">Marketing panel configuratie</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#3A4D23] hover:bg-[#4A5D33] disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? 'Opslaan...' : 'Instellingen Opslaan'}
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BellIcon className="w-6 h-6 text-[#8BAE5A]" />
          <h2 className="text-lg font-semibold text-white">Notificaties</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Rapporten</p>
              <p className="text-gray-400 text-sm">Ontvang automatische rapporten per email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.notifications.emailReports}
                onChange={(e) => updateSetting('notifications', 'emailReports', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2D3748] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Budget Waarschuwingen</p>
              <p className="text-gray-400 text-sm">Krijg alerts wanneer budget bijna op is</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.notifications.budgetAlerts}
                onChange={(e) => updateSetting('notifications', 'budgetAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2D3748] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Performance Alerts</p>
              <p className="text-gray-400 text-sm">Notificaties bij significante performance veranderingen</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.notifications.performanceAlerts}
                onChange={(e) => updateSetting('notifications', 'performanceAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2D3748] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Conversie Alerts</p>
              <p className="text-gray-400 text-sm">Notificaties bij conversie dalingen</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.notifications.conversionAlerts}
                onChange={(e) => updateSetting('notifications', 'conversionAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2D3748] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <GlobeAltIcon className="w-6 h-6 text-[#8BAE5A]" />
          <h2 className="text-lg font-semibold text-white">Integraties</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 border border-[#2D3748] rounded-lg">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-5 h-5 text-[#8BAE5A]" />
              <div>
                <p className="text-white font-medium">Google Analytics</p>
                <p className="text-gray-400 text-sm">Website analytics</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.integrations.googleAnalytics}
                onChange={(e) => updateSetting('integrations', 'googleAnalytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2D3748] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-[#2D3748] rounded-lg">
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="w-5 h-5 text-[#8BAE5A]" />
              <div>
                <p className="text-white font-medium">Facebook Pixel</p>
                <p className="text-gray-400 text-sm">Conversion tracking</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.integrations.facebookPixel}
                onChange={(e) => updateSetting('integrations', 'facebookPixel', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2D3748] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-[#2D3748] rounded-lg">
            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-5 h-5 text-[#8BAE5A]" />
              <div>
                <p className="text-white font-medium">Google Ads</p>
                <p className="text-gray-400 text-sm">Ad performance data</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.integrations.googleAds}
                onChange={(e) => updateSetting('integrations', 'googleAds', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2D3748] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-[#2D3748] rounded-lg">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-[#8BAE5A]" />
              <div>
                <p className="text-white font-medium">LinkedIn Insights</p>
                <p className="text-gray-400 text-sm">Professional audience data</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.integrations.linkedinInsights}
                onChange={(e) => updateSetting('integrations', 'linkedinInsights', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2D3748] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheckIcon className="w-6 h-6 text-[#8BAE5A]" />
          <h2 className="text-lg font-semibold text-white">Privacy & Beveiliging</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Data Retentie (dagen)</label>
            <input
              type="number"
              value={settings?.privacy.dataRetention}
              onChange={(e) => updateSetting('privacy', 'dataRetention', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
              min="1"
              max="365"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Data Anonimiseren</p>
              <p className="text-gray-400 text-sm">Anonimiseer persoonlijke data voor analytics</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.privacy.anonymizeData}
                onChange={(e) => updateSetting('privacy', 'anonymizeData', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2D3748] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">GDPR Compliant</p>
              <p className="text-gray-400 text-sm">Voldoe aan GDPR privacy wetgeving</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.privacy.gdprCompliant}
                onChange={(e) => updateSetting('privacy', 'gdprCompliant', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2D3748] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Cog6ToothIcon className="w-6 h-6 text-[#8BAE5A]" />
          <h2 className="text-lg font-semibold text-white">Weergave Instellingen</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Valuta</label>
            <select
              value={settings?.display.currency}
              onChange={(e) => updateSetting('display', 'currency', e.target.value)}
              className="w-full px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Tijdzone</label>
            <select
              value={settings?.display.timezone}
              onChange={(e) => updateSetting('display', 'timezone', e.target.value)}
              className="w-full px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
            >
              <option value="Europe/Amsterdam">Europe/Amsterdam</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Datum Formaat</label>
            <select
              value={settings?.display.dateFormat}
              onChange={(e) => updateSetting('display', 'dateFormat', e.target.value)}
              className="w-full px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Taal</label>
            <select
              value={settings?.display.language}
              onChange={(e) => updateSetting('display', 'language', e.target.value)}
              className="w-full px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
            >
              <option value="nl">Nederlands</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <KeyIcon className="w-6 h-6 text-[#8BAE5A]" />
          <h2 className="text-lg font-semibold text-white">API Instellingen</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={settings?.api.apiKey}
                readOnly
                className="w-full px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A] pr-12"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showApiKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Webhook URL</label>
            <input
              type="url"
              value={settings?.api.webhookUrl}
              onChange={(e) => updateSetting('api', 'webhookUrl', e.target.value)}
              className="w-full px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Rate Limit (requests/min)</label>
            <input
              type="number"
              value={settings?.api.rateLimit}
              onChange={(e) => updateSetting('api', 'rateLimit', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
              min="1"
              max="10000"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 