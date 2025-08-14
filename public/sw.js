// Service Worker for Real Betis Peña Bética Website
// Handles push notifications for admin users

const CACHE_NAME = 'betis-pena-v1';
const urlsToCache = [
  '/',
  '/admin',
  '/images/logo_no_texto.jpg'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting(); // Activate worker immediately
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim(); // Take control of all pages immediately
    })
  );
});

// Handle push events
self.addEventListener('push', event => {
  console.log('Service Worker: Push event received');
  
  let notificationData = {
    title: '🎉 Nueva Actividad - Peña Bética',
    body: 'Hay nueva actividad en la comunidad',
    icon: '/images/logo_no_texto.jpg',
    badge: '/images/logo_no_texto.jpg',
    tag: 'betis-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver Dashboard',
        icon: '/images/logo_no_texto.jpg'
      },
      {
        action: 'dismiss',
        title: 'Cerrar'
      }
    ]
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.error('Service Worker: Error parsing push data:', error);
      // Use default notification data
    }
  }

  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: {
        url: notificationData.url || '/admin',
        timestamp: Date.now()
      }
    }
  );

  event.waitUntil(notificationPromise);
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};
  
  if (action === 'dismiss') {
    // Just close the notification
    return;
  }

  // Default action or 'view' action - open the admin dashboard
  const urlToOpen = notificationData.url || '/admin';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Check if admin dashboard is already open
      const adminClient = clientList.find(client => 
        client.url.includes('/admin') && 'focus' in client
      );
      
      if (adminClient) {
        // Focus existing admin tab
        return adminClient.focus();
      }
      
      // Check if any client is available to navigate
      const anyClient = clientList.find(client => 'navigate' in client);
      if (anyClient) {
        return anyClient.navigate(urlToOpen).then(client => client.focus());
      }
      
      // Open new window
      return clients.openWindow(urlToOpen);
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Service Worker: Notification closed');
  // Could track analytics here if needed
});

// Basic fetch handler for offline support
self.addEventListener('fetch', event => {
  // Only handle GET requests to same origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Handle background sync (for future use)
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync event:', event.tag);
  
  if (event.tag === 'background-notifications-check') {
    event.waitUntil(
      // Could implement background checking for notifications here
      Promise.resolve()
    );
  }
});

console.log('Service Worker: Script loaded');