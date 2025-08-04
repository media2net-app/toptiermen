// Service Worker voor Top Tier Men PWA
const CACHE_NAME = 'ttm-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/mijn-missies',
  '/dashboard/brotherhood',
  '/dashboard/mind-en-focus',
  '/dashboard/finance-en-business',
  '/dashboard/academy',
  '/dashboard/trainingscentrum',
  '/dashboard/voedingsplannen',
  '/dashboard/boekenkamer',
  '/dashboard/badges-en-rangen',
  '/dashboard/challenges',
  '/dashboard/producten',
  '/dashboard/mentorship-en-coaching',
  '/dashboard/inbox',
  '/dashboard/mijn-challenges',
  '/dashboard/mijn-profiel',
  '/dashboard/mijn-trainingen',
  '/dashboard/onboarding',
  '/dashboard/onboarding-completion',
  '/globals.css',
  '/logo.svg',
  '/badge1.png',
  '/badge2.png',
  '/badge3.png',
  '/badge-no-excuses.png',
  '/whoosh-cinematic-sound-effect-376889.mp3'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  let notificationData = {
    title: 'Top Tier Men',
    body: 'Je hebt een nieuwe update!',
    icon: '/logo.svg',
    badge: '/badge1.png',
    tag: 'ttm-notification',
    data: {
      url: '/dashboard'
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.log('Error parsing push data:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Openen',
        icon: '/logo.svg'
      },
      {
        action: 'dismiss',
        title: 'Sluiten'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          const url = event.notification.data?.url || '/dashboard';
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync data when connection is restored
      syncData()
    );
  }
});

// Function to sync data
async function syncData() {
  try {
    // Sync user progress, completed missions, etc.
    console.log('📊 Syncing data...');
    
    // This would typically involve:
    // 1. Getting stored offline data
    // 2. Sending it to the server
    // 3. Updating local cache
    
  } catch (error) {
    console.log('Error syncing data:', error);
  }
}

// Message event for communication with main app
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
}); 