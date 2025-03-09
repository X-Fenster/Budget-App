const CACHE_NAME = "budget-app-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/dist/app.js", // Korrigiert von /app.js zu /dist/app.js
  "/manifest.json",
  "/icons/android-chrome-192x192.png", // Korrigiert zu vorhandenen Icons
  "/icons/android-chrome-512x512.png", // Korrigiert zu vorhandenen Icons
];

// Service Worker Installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache opened");
        // Wir verwenden addAll mit Fehlerbehandlung für jede einzelne Ressource
        return Promise.all(
          ASSETS_TO_CACHE.map((url) => {
            return fetch(url)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${url}`);
                }
                return cache.put(url, response);
              })
              .catch((error) => {
                console.warn(`Caching failed for ${url}:`, error);
                // Wir lassen den Fehler nicht die gesamte Installation scheitern
              });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Service Worker Activation
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Cache First, dann Network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Wenn im Cache gefunden, gib den Cache zurück
      if (cachedResponse) {
        return cachedResponse;
      }

      // Ansonsten versuche, von Netzwerk zu holen
      return fetch(event.request)
        .then((response) => {
          // Wenn keine gültige Antwort, gib sie einfach zurück
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Klone die Antwort, um sie im Cache zu speichern
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            // Nur Same-Origin-Anfragen cachen
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, responseToCache);
            }
          });

          return response;
        })
        .catch((error) => {
          console.log("Fetch failed:", error);
          // Hier könnten wir eine Offline-Fallback-Seite anzeigen
          // Für jetzt geben wir einfach den Fehler weiter
          throw error;
        });
    })
  );
});
