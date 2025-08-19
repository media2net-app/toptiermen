'use client';

import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import AdminCard from '@/components/admin/AdminCard';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminButton from '@/components/admin/AdminButton';

interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
}

export default function PushTestPage() {
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedTest, setSelectedTest] = useState('welcome');

  const [testConfig, setTestConfig] = useState({
    title: '🧪 Test Notificatie',
    body: 'Dit is een test notificatie vanuit het admin dashboard!',
    icon: '/logo_white-full.svg',
    badge: '/badge-no-excuses.png',
    url: '/dashboard'
  });

  const testTemplates = [
    {
      id: 'welcome',
      name: 'Welkom Notificatie',
      title: '🎉 Welkom bij Top Tier Men!',
      body: 'Je push notificaties werken perfect!',
      icon: '/logo_white-full.svg',
      badge: '/badge-no-excuses.png'
    },
    {
      id: 'achievement',
      name: 'Prestatie Badge',
      title: '🏆 Nieuwe Badge Verdiend!',
      body: 'Je hebt de "No Excuses" badge verdiend!',
      icon: '/badge-no-excuses.png',
      badge: '/badge-no-excuses.png'
    },
    {
      id: 'reminder',
      name: 'Herinnering',
      title: '⏰ Tijd voor je Workout!',
      body: 'Vergeet niet om vandaag te trainen!',
      icon: '/logo_white-full.svg',
      badge: '/badge1.png'
    },
    {
      id: 'brotherhood',
      name: 'Brotherhood Update',
      title: '🤝 Nieuwe Brotherhood Activiteit',
      body: 'Er is een nieuwe activiteit gepland!',
      icon: '/logo_white-full.svg',
      badge: '/badge2.png'
    },
    {
      id: 'custom',
      name: 'Aangepaste Test',
      title: testConfig.title,
      body: testConfig.body,
      icon: testConfig.icon,
      badge: testConfig.badge
    }
  ];

  // Fetch push subscriptions
  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/push-subscriptions');
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      } else {
        console.log('Using mock data for subscriptions');
        // Mock data for testing
        setSubscriptions([
          {
            id: '1',
            user_id: 'test-user-1',
            endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-1',
            p256dh: 'test-p256dh-1',
            auth: 'test-auth-1',
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send test notification
  const sendTestNotification = async (template?: any) => {
    try {
      setIsSending(true);
      
      const selectedTemplate = template || testTemplates.find(t => t.id === selectedTest);
      if (!selectedTemplate) return;

      // Get all push subscriptions first
      const subscriptionsResponse = await fetch('/api/admin/push-subscriptions');
      const subscriptionsData = await subscriptionsResponse.json();
      
      if (!subscriptionsData.subscriptions || subscriptionsData.subscriptions.length === 0) {
        const testResult: TestResult = {
          success: false,
          message: 'Geen push abonnementen gevonden! Gebruikers moeten eerst push notificaties activeren.',
          timestamp: new Date().toLocaleTimeString()
        };
        setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
        return;
      }

      const testNotification = {
        userIds: subscriptionsData.subscriptions.map((sub: any) => sub.user_id),
        title: selectedTemplate.title,
        body: selectedTemplate.body,
        icon: selectedTemplate.icon,
        badge: selectedTemplate.badge,
        data: { 
          url: testConfig.url,
          timestamp: new Date().toISOString(),
          testType: selectedTest
        }
      };

      const response = await fetch('/api/push/send', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testNotification)
      });

      const result = await response.json();
      
      const testResult: TestResult = {
        success: result.success,
        message: result.success 
          ? `Notificatie succesvol verzonden naar ${subscriptionsData.subscriptions.length} abonnement(en)!` 
          : `Fout: ${result.error}`,
        timestamp: new Date().toLocaleTimeString()
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results

      if (result.success) {
        console.log('✅ Test notification sent successfully');
      } else {
        console.error('❌ Test notification failed:', result.error);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      const testResult: TestResult = {
        success: false,
        message: 'Fout bij verzenden van test notificatie',
        timestamp: new Date().toLocaleTimeString()
      };
      setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
    } finally {
      setIsSending(false);
    }
  };

  // Send to all subscriptions
  const sendToAll = async () => {
    if (subscriptions.length === 0) {
      alert('Geen push abonnementen gevonden!');
      return;
    }

    const confirmed = confirm(`Weet je zeker dat je een test notificatie wilt versturen naar alle ${subscriptions.length} abonnementen?`);
    if (!confirmed) return;

    await sendTestNotification();
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Push Notificatie Tests</h1>
          <p className="text-[#B6C948] mt-2">Test push notificaties en controleer de functionaliteit.</p>
        </div>
        <div className="flex gap-3">
          <AdminButton onClick={fetchSubscriptions} variant="secondary" disabled={isLoading}>
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            {isLoading ? 'Laden...' : 'Vernieuwen'}
          </AdminButton>
          <AdminButton onClick={sendToAll} variant="primary" disabled={isSending || subscriptions.length === 0}>
            <PlayIcon className="w-5 h-5 mr-2" />
            {isSending ? 'Verzenden...' : `Verstuur naar Alle (${subscriptions.length})`}
          </AdminButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard
          icon={<BellIcon className="w-6 h-6" />}
          value={subscriptions.length}
          title="Actieve Abonnementen"
          color="green"
        />
        <AdminStatsCard
          icon={<CheckCircleIcon className="w-6 h-6" />}
          value={testResults.filter(r => r.success).length}
          title="Succesvolle Tests"
          color="blue"
        />
        <AdminStatsCard
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          value={testResults.filter(r => !r.success).length}
          title="Mislukte Tests"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Configuration */}
        <AdminCard>
          <h2 className="text-xl font-bold text-[#8BAE5A] mb-6">Test Configuratie</h2>
          
          {/* Test Templates */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#B6C948]">
              Test Template
            </label>
            <div className="grid grid-cols-1 gap-2">
              {testTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTest(template.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedTest === template.id
                      ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                      : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                  }`}
                >
                  <div className="font-medium text-white">{template.name}</div>
                  <div className="text-sm text-[#B6C948]">{template.title}</div>
                  <div className="text-xs text-gray-400">{template.body}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Configuration */}
          {selectedTest === 'custom' && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Titel
                </label>
                <input
                  type="text"
                  value={testConfig.title}
                  onChange={(e) => setTestConfig(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-md text-white focus:border-[#8BAE5A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Bericht
                </label>
                <textarea
                  value={testConfig.body}
                  onChange={(e) => setTestConfig(prev => ({ ...prev, body: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-md text-white focus:border-[#8BAE5A] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Test Button */}
          <div className="mt-6">
            <AdminButton 
              onClick={() => sendTestNotification()} 
              variant="primary" 
              disabled={isSending}
              className="w-full"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              {isSending ? 'Verzenden...' : 'Test Notificatie Versturen'}
            </AdminButton>
          </div>
        </AdminCard>

        {/* Test Results */}
        <AdminCard>
          <h2 className="text-xl font-bold text-[#8BAE5A] mb-6">Test Resultaten</h2>
          
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-[#B6C948]">
              <BellIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nog geen tests uitgevoerd</p>
              <p className="text-sm text-gray-400">Klik op "Test Notificatie Versturen" om te beginnen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-red-500/50 bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {result.success ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                      ) : (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                      )}
                      <span className="text-white">{result.message}</span>
                    </div>
                    <span className="text-sm text-gray-400">{result.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>

      {/* Subscriptions List */}
      <AdminCard>
        <h2 className="text-xl font-bold text-[#8BAE5A] mb-6">Push Abonnementen</h2>
        
        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-[#B6C948]">
            <UserGroupIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Geen push abonnementen gevonden</p>
            <p className="text-sm text-gray-400">Gebruikers moeten eerst push notificaties activeren</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="p-4 bg-[#181F17] rounded-lg border border-[#3A4D23]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">User ID: {subscription.user_id}</div>
                    <div className="text-sm text-[#B6C948] truncate max-w-md">
                      {subscription.endpoint}
                    </div>
                    <div className="text-xs text-gray-400">
                      Aangemaakt: {new Date(subscription.created_at).toLocaleString()}
                    </div>
                  </div>
                  <AdminButton
                    onClick={() => sendTestNotification({
                      title: '🧪 Individuele Test',
                      body: `Test notificatie voor gebruiker ${subscription.user_id}`,
                      icon: '/logo_white-full.svg',
                      badge: '/badge-no-excuses.png'
                    })}
                    variant="secondary"
                    disabled={isSending}
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Test
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
} 