const CACHE_NAME = "google-define-v1";

const CACHEABLE_ROUTES = [
    "/_next/static/",
    "/favicon.ico",
    "/manifest.json",
    "/file.svg",
    "/globe.svg",
    "/next.svg",
    "/vercel.svg",
    "/window.svg",
];

const shouldCache = (url) => {
    return CACHEABLE_ROUTES.some((route) => url.includes(route));
};

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    }),
                );
            })
            .then(() => {
                return self.clients.claim();
            }),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (!shouldCache(request.url) || request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cachedResponse = await cache.match(request);

            if (cachedResponse) {
                return cachedResponse;
            }

            try {
                const networkResponse = await fetch(request);

                if (networkResponse.ok) {
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                }
            } catch (error) {
                console.log("Network fetch failed:", error);
            }

            return fetch(request);
        }),
    );
});
