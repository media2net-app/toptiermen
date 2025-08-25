'use client';

import { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

interface PushNotificationPromptProps {
  onClose?: () => void;
}

export default function PushNotificationPrompt({ onClose }: PushNotificationPromptProps) {
  const { user } = useSupabaseAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [hasPermission, setHasPermission] = useState<NotificationPermission>('default');
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  useEffect(() => {
    // Check if PWA is installed
    const checkPWAInstallation = () => {
      if (typeof window !== 'undefined') {
        // Check if running in standalone mode (PWA installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        // Check if running in fullscreen mode (iOS PWA)
        const isFullscreen = window.navigator.standalone === true;
        
        setIsPWAInstalled(isStandalone || isFullscreen);
      }
    };

    // Check notification permission
    const checkPermission = () => {
      if ('Notification' in window) {
        setHasPermission(Notification.permission);
      }
    };

    checkPWAInstallation();
    checkPermission();

    // Show prompt if PWA is installed and permission not granted
    if (isPWAInstalled && hasPermission !== 'granted') {
      setShowPrompt(true);
    }
  }, [isPWAInstalled, hasPermission]);

  const subscribeToPushNotifications = async () => {
    if (!user) {
      toast.error('Je moet ingelogd zijn om push notificaties te activeren');
      return;
    }

    try {
      setIsSubscribing(true);

      // Check if service worker and push manager are supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('Push notificaties worden niet ondersteund door je browser');
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      setHasPermission(permission);

      if (permission !== 'granted') {
        toast.error('Toestemming voor push notificaties is vereist');
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Save subscription to database
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh_key: btoa(String.fromCharCode.apply(null, 
            new Uint8Array(subscription.getKey('p256dh')!)
          )),
          auth_key: btoa(String.fromCharCode.apply(null, 
            new Uint8Array(subscription.getKey('auth')!)
          ))
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving subscription:', error);
        toast.error('Fout bij het opslaan van push notificatie instellingen');
        return;
      }

      toast.success('Push notificaties succesvol geactiveerd!');
      setShowPrompt(false);
      
      // Send test notification
      setTimeout(() => {
        sendTestNotification();
      }, 1000);

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Fout bij het activeren van push notificaties');
    } finally {
      setIsSubscribing(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          title: '🎉 Push Notificaties Geactiveerd!',
          body: 'Je push notificaties werken perfect!',
          icon: '/logo_white-full.svg',
          badge: '/badge-no-excuses.png',
          data: { url: '/dashboard' }
        })
      });

      if (response.ok) {
        console.log('✅ Test notification sent');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    onClose?.();
  };

  if (!showPrompt || !isPWAInstalled || hasPermission === 'granted') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-gradient-to-r from-[#232D1A] to-[#181F17] border border-[#3A4D23] rounded-2xl p-6 shadow-2xl backdrop-blur-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Push Notificaties</h3>
              <p className="text-[#8BAE5A] text-sm">Blijf op de hoogte van je voortgang</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#8BAE5A] hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A]" />
              <span className="text-[#B6C948] text-sm font-medium">Voordelen:</span>
            </div>
            <ul className="text-[#8BAE5A] text-sm space-y-1">
              <li>• Herinneringen voor workouts en challenges</li>
              <li>• Nieuwe badges en prestaties</li>
              <li>• Brotherhood updates en activiteiten</li>
              <li>• Belangrijke aankondigingen</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={subscribeToPushNotifications}
              disabled={isSubscribing}
              className="flex-1 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-semibold py-3 px-4 rounded-xl hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubscribing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17] mr-2"></div>
                  <span>Activeren...</span>
                </div>
              ) : (
                'Activeren'
              )}
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-3 text-[#8BAE5A] hover:text-white transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
