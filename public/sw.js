/**
 * Service Worker for Peña Bética Escocesa
 * 
 * Handles caching, offline functionality, and push notifications for admin users
 */

const CACHE_NAME = 'betis-escocia-v1';
const BASE_URL = '/';

// Basic caching for offline functionality
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/logo_no_texto.jpg',
  '/images/real_betis_official.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'Peña Bética Escocesa',
    body: 'Nueva notificación',
    icon: '/images/logo_no_texto.jpg',
    badge: '/images/logo_no_texto.jpg',
    tag: 'default',
    data: {
      url: '/'
    }
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload
      };
    }
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver detalles',
        icon: '/images/logo_no_texto.jpg'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
      .then(() => {
        console.log('[SW] Notification displayed');
      })
      .catch((error) => {
        console.error('[SW] Error showing notification:', error);
      })
  );
});

// Notification click event - handle user interaction with notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  
  if (action === 'dismiss') {
    // User dismissed the notification, no action needed
    return;
  }

  // Handle 'view' action or notification body click
  let targetUrl = data.url || '/admin';
  
  // Determine target URL based on notification type
  if (data.type === 'rsvp') {
    targetUrl = '/admin'; // Admin dashboard
  } else if (data.type === 'contact') {
    targetUrl = '/admin'; // Admin dashboard with contacts view
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        const existingClient = clientList.find(client => client.url === targetUrl);
        
        if (existingClient && 'focus' in existingClient) {
          // Focus existing window/tab
          return existingClient.focus();
        }
        
        // Check if any client is on the same origin
        const sameOriginClient = clientList.find(client => 
          new URL(client.url).origin === new URL(targetUrl, self.location.origin).origin
        );
        
        if (sameOriginClient && 'navigate' in sameOriginClient) {
          // Navigate existing window/tab to target URL
          return sameOriginClient.navigate(targetUrl).then(client => client.focus());
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .catch((error) => {
        console.error('[SW] Error handling notification click:', error);
      })
  );
});

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker script loaded');