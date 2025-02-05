self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("pwa-cache").then((cache) => {
            return cache.addAll([
                "/my-pwa/",
                "/my-pwa/index.html",
                "/my-pwa/styles.css",
                "/my-pwa/app.js",
                "/my-pwa/icon-192.png",
                "/my-pwa/icon-512.png"
            ]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
