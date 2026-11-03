const CACHE_NAME = 'devsphere-cache-v2';
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Install Event: pre-cache ONLY public static assets (never authenticated pages)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clean up obsolete cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for messages (e.g. logout cache purge)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_AUTHENTICATED_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      // Re-populate basic static icons
      return caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS));
    });
  }
});

// Fetch Event: secure caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension or other non-http(s) schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. Static UI Assets & Icons: Cache-first with network fallback
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 2. Sensitive API & Navigation Requests: NEVER store authenticated HTML shells or private data
  if (url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/api/ai')) {
    // Pass directly to network
    event.respondWith(fetch(request));
    return;
  }

  // 3. Navigation / HTML pages: Always Network-First.
  // Never persist authenticated pages into long-term cache storage to protect user privacy.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        // When completely offline, serve an offline message rather than stale private data
        return new Response(
          `<!DOCTYPE html>
          <html lang="en" class="dark">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>DevSphere — Offline</title>
            <style>
              body { background: #080c14; color: #94a3b8; font-family: ui-sans-serif, system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
              .card { max-width: 400px; padding: 2rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; background: #0f172a; }
              h1 { color: #f8fafc; font-size: 1.25rem; margin-bottom: 0.5rem; }
              p { font-size: 0.875rem; line-height: 1.5; }
              button { margin-top: 1rem; background: #06b6d4; color: #080c14; border: none; padding: 0.5rem 1rem; font-weight: bold; border-radius: 0.5rem; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Offline Mode</h1>
              <p>You are currently offline. Please reconnect to the internet to access your private DevSphere discovery dashboard.</p>
              <button onclick="window.location.reload()">Retry Connection</button>
            </div>
          </body>
          </html>`,
          {
            headers: { 'Content-Type': 'text/html' },
            status: 503,
          }
        );
      })
    );
    return;
  }

  // Default: Network with fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
