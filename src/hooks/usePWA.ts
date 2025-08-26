import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  hasPushPermission: boolean;
  isServiceWorkerRegistered: boolean;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    canInstall: false,
    isOnline: navigator.onLine,
    hasPushPermission: false,
    isServiceWorkerRegistered: false,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if app is installed
  useEffect(() => {
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
      
      setPwaState(prev => ({ ...prev, isInstalled }));
    };

    checkInstallation();
    window.addEventListener('appinstalled', checkInstallation);
    
    return () => window.removeEventListener('appinstalled', checkInstallation);
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaState(prev => ({ ...prev, canInstall: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker - DISABLED to prevent navigation issues
  // useEffect(() => {
  //   const registerServiceWorker = async () => {
  //     if ('serviceWorker' in navigator) {
  //       try {
  //         const reg = await navigator.serviceWorker.register('/sw.js');
  //         setRegistration(reg);
  //         setPwaState(prev => ({ ...prev, isServiceWorkerRegistered: true }));
          
  //         console.log('✅ Service Worker registered:', reg);
          
  //         // Check for updates
  //         reg.addEventListener('updatefound', () => {
  //           const newWorker = reg.installing;
  //           if (newWorker) {
  //             newWorker.addEventListener('statechange', () => {
  //               if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
  //                 // New version available
  //                 console.log('🔄 New version available');
  //               }
  //             });
  //           }
  //         });
          
  //       } catch (error) {
  //         console.error('❌ Service Worker registration failed:', error);
  //       }
  //     }
  //   };

  //   registerServiceWorker();
  // }, []);

  // Check push permission
  useEffect(() => {
    const checkPushPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setPwaState(prev => ({ 
          ...prev, 
          hasPushPermission: permission === 'granted' 
        }));
      }
    };

    checkPushPermission();
  }, []);

  // Install app
  const installApp = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ App installed');
        setPwaState(prev => ({ ...prev, isInstalled: true, canInstall: false }));
      }
      
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // Request push permission
  const requestPushPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPwaState(prev => ({ 
        ...prev, 
        hasPushPermission: permission === 'granted' 
      }));
      return permission;
    }
    return 'denied';
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (userId: string) => {
    if (!registration || !('PushManager' in window)) {
      console.log('❌ Push notifications not supported');
      return null;
    }

    try {
      // Request permission first
      const permission = await requestPushPermission();
      if (permission !== 'granted') {
        console.log('❌ Push permission denied');
        return null;
      }

      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON(),
        }),
      });

      console.log('✅ Push subscription created');
      return subscription;

    } catch (error) {
      console.error('❌ Push subscription failed:', error);
      return null;
    }
  }, [registration, requestPushPermission]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    if (!registration) return;

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ Push subscription removed');
      }
    } catch (error) {
      console.error('❌ Push unsubscription failed:', error);
    }
  }, [registration]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    if (!registration || !pwaState.hasPushPermission) {
      console.log('❌ Cannot send notification');
      return;
    }

    try {
      await registration.showNotification('Top Tier Men', {
        body: 'Dit is een test notificatie! 🏆',
        icon: '/logo_white-full.svg',
        badge: '/badge1.png',
        tag: 'test-notification',
        requireInteraction: false,
        silent: false,
        actions: [
          {
            action: 'open',
            title: 'Openen',
            icon: '/logo_white-full.svg'
          }
        ]
      } as any);
    } catch (error) {
      console.error('❌ Test notification failed:', error);
    }
  }, [registration, pwaState.hasPushPermission]);

  return {
    ...pwaState,
    installApp,
    requestPushPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
    registration,
  };
}; 