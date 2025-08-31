'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/auth-systems/optimal/useAuth';
import { supabase } from '@/lib/supabase';

interface NotificationSettings {
  push_enabled: boolean;
  in_app_enabled: boolean;
  sound_enabled: boolean;
}

export default function ChatNotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    push_enabled: false,
    in_app_enabled: true,
    sound_enabled: true
  });
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
      checkPushPermission();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('notification_settings')
        .eq('user_id', user?.id)
        .single();

      if (data?.notification_settings) {
        setSettings(data.notification_settings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const checkPushPermission = () => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert('Push notificaties worden niet ondersteund door je browser');
      return;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, push_enabled: true }));
        await saveSettings({ ...settings, push_enabled: true });
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          notification_settings: newSettings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving settings:', error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Top Tier Men - Test Notificatie', {
        body: 'Dit is een test notificatie om te controleren of alles werkt!',
        icon: '/favicon.ico',
        badge: '/badge-no-excuses.png'
      });
    }
  };

  return (
    <div className="bg-[#232D1A]/80 rounded-2xl p-6 border border-[#3A4D23]/40">
      <h3 className="text-xl font-bold text-white mb-4">Notificatie Instellingen</h3>
      
      <div className="space-y-4">
        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white">Push Notificaties</h4>
            <p className="text-sm text-[#8BAE5A]">
              Ontvang notificaties op je apparaat
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pushPermission === 'granted' ? (
              <button
                onClick={() => handleSettingChange('push_enabled', !settings.push_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.push_enabled ? 'bg-[#8BAE5A]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.push_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            ) : (
              <button
                onClick={requestPushPermission}
                disabled={isLoading}
                className="px-3 py-1 bg-[#8BAE5A] text-[#181F17] rounded-lg text-sm font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Bezig...' : 'Toestemming'}
              </button>
            )}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white">In-App Notificaties</h4>
            <p className="text-sm text-[#8BAE5A]">
              Toon notificaties in de browser
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('in_app_enabled', !settings.in_app_enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.in_app_enabled ? 'bg-[#8BAE5A]' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.in_app_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Sound Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white">Geluid</h4>
            <p className="text-sm text-[#8BAE5A]">
              Speel geluid af bij nieuwe berichten
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('sound_enabled', !settings.sound_enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.sound_enabled ? 'bg-[#8BAE5A]' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.sound_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Test Button */}
        <div className="pt-4 border-t border-[#3A4D23]/40">
          <button
            onClick={testNotification}
            disabled={pushPermission !== 'granted'}
            className="w-full px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Notificatie
          </button>
        </div>
      </div>
    </div>
  );
}
