const CACHE_NAME = 'israeli-tech-comp-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/calculator',
  '/manifest.json',
  '/favicon.ico',
  // Core CSS and JS will be handled by Next.js automatically
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    // Network first for API calls
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for short time
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache for API calls
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Fetch from network and cache
        return fetch(request)
          .then((response) => {
            // Only cache successful responses
            if (!response.ok) {
              return response;
            }

            const responseClone = response.clone();
            
            // Determine cache to use
            const cacheToUse = STATIC_ASSETS.includes(url.pathname) ? 
                              STATIC_CACHE : DYNAMIC_CACHE;

            caches.open(cacheToUse)
              .then((cache) => {
                cache.put(request, responseClone);
              });

            return response;
          })
          .catch(() => {
            // Network failed, check if we have a cached fallback
            if (url.pathname === '/' || url.pathname === '/calculator') {
              return caches.match('/');
            }
            
            // Return offline page or error
            return new Response(
              `
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Offline - Israeli Tech Compensation Calculator</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { 
                      font-family: system-ui, sans-serif; 
                      text-align: center; 
                      padding: 2rem;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      min-height: 100vh;
                      margin: 0;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-direction: column;
                    }
                    .container {
                      background: rgba(255,255,255,0.1);
                      padding: 2rem;
                      border-radius: 1rem;
                      backdrop-filter: blur(10px);
                    }
                    h1 { font-size: 2rem; margin-bottom: 1rem; }
                    p { font-size: 1.1rem; opacity: 0.9; }
                    .emoji { font-size: 3rem; margin-bottom: 1rem; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="emoji">🇮🇱</div>
                    <h1>You're Offline</h1>
                    <p>The Israeli Tech Compensation Calculator is not available right now.</p>
                    <p>Please check your internet connection and try again.</p>
                  </div>
                </body>
              </html>
              `,
              {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
              }
            );
          });
      })
  );
});

// Background sync for data when coming back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Here you could sync any pending data
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('Push message received:', data);
    
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-96x96.png',
      tag: 'compensation-update',
      renotify: true
    });
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('Service Worker loaded successfully'); 