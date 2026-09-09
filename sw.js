const CACHE = "entreno-v1";
const ARCHIVOS = ["/", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (ev) => {
  const url = new URL(ev.request.url);
  // Nunca cachear las llamadas a la API: siempre tienen que ir a la red.
  if (url.pathname.startsWith("/api/")) return;
  if (ev.request.method !== "GET") return;

  ev.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cacheada = await cache.match(ev.request);
      const red = fetch(ev.request)
        .then((resp) => {
          if (resp && resp.ok) cache.put(ev.request, resp.clone());
          return resp;
        })
        .catch(() => null);
      return cacheada || (await red) || Response.error();
    })
  );
});
