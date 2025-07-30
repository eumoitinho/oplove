// Service Worker for OpenLove PWA
const CACHE_NAME = 'openlove-v1';
const urlsToCache = [
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Error caching resources:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests, Supabase requests, and external requests
  const url = new URL(event.request.url);
  if (
    url.pathname.includes('/api/') ||
    url.hostname.includes('supabase') ||
    url.hostname !== self.location.hostname ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Only cache specific static assets
          const shouldCache = 
            event.request.url.includes('/icons/') ||
            event.request.url.includes('/screenshots/') ||
            event.request.url.endsWith('.png') ||
            event.request.url.endsWith('.jpg') ||
            event.request.url.endsWith('.ico');

          if (shouldCache) {
            // Clone the response
            const responseToCache = response.clone();

            // Add to cache
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync for posts
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
      },
      {
        action: 'close',
        title: 'Fechar',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Helper function to sync posts
async function syncPosts() {
  try {
    // Get pending posts from IndexedDB
    const pendingPosts = await getPendingPosts();
    
    // Send each post to the server
    for (const post of pendingPosts) {
      await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });
      
      // Remove from pending after successful sync
      await removePendingPost(post.id);
    }
  } catch (error) {
    console.error('Error syncing posts:', error);
  }
}

// IndexedDB functions would go here
async function getPendingPosts() {
  // Implementation for getting pending posts from IndexedDB
  return [];
}

async function removePendingPost(id) {
  // Implementation for removing synced post from IndexedDB
}