const CACHE_VERSION = 'v2.8.0';
const CACHE_NAME = `fuel-tracker-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/utils.js',
    './js/app.js',
    './js/data.js',
    './js/logger.js',
    './js/sync.js',
    './js/vendor/chart.min.js',
    './manifest.webmanifest',
    './icons/icon-128.png',
    './icons/icon-512.png'
];

// Install event - cache assets.
// The new version does NOT activate itself (no skipWaiting here): the page shows
// an "Aktualizovat" banner and the user decides, so a half-filled form is not lost.
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing version:', CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // cache: 'reload' bypasses the browser HTTP cache, so a new version
                // never stores stale files
                return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, { cache: 'reload' })));
            })
            .catch(error => {
                console.error('[Service Worker] Installation failed:', error);
                throw error;
            })
    );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating version:', CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('fuel-tracker-') && name !== CACHE_NAME)
                        .map(name => {
                            console.log('[Service Worker] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
            .catch(error => {
                console.error('[Service Worker] Activation failed:', error);
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Only our own files (skips extensions, fonts and other origins)
    if (new URL(event.request.url).origin !== self.location.origin) {
        return;
    }

    // Let Google Fonts requests pass through to network directly
    // Google CDN handles caching efficiently, no need to interfere
    if (event.request.url.includes('fonts.googleapis.com') ||
        event.request.url.includes('fonts.gstatic.com')) {
        return;
    }

    // Let API requests pass through to network directly (for cloud sync)
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request, { ignoreSearch: event.request.mode === 'navigate' })
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(networkResponse => {
                        // Cache successful responses
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            // Clone the response before caching
                            const responseToCache = networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                })
                                .catch(error => {
                                    console.error('[Service Worker] Caching failed:', error);
                                });
                        }

                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('[Service Worker] Fetch failed:', error);

                        // Offline navigation -> app shell
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }

                        // Return offline page or error response
                        return new Response('Offline - Network unavailable', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Message event - for manual cache updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[Service Worker] Received SKIP_WAITING message');
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('[Service Worker] Clearing all caches');
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(name => caches.delete(name))
                );
            })
        );
    }
});

// Error handling
self.addEventListener('error', event => {
    console.error('[Service Worker] Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('[Service Worker] Unhandled promise rejection:', event.reason);
});
