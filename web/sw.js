const CACHE = "projectr-v0-38";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
  "./logo.jpeg",
  "./brain.svg",
  "./mind-dl.svg"
];
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const asset of ASSETS) {
      try {
        await cache.add(asset);
      } catch (e) {}
    }
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const res = await fetch(event.request);
      if (res.ok) {
        const copy = res.clone();
        const cache = await caches.open(CACHE);
        await cache.put(event.request, copy);
      }
      return res;
    } catch (e) {
      return (await caches.match("./index.html")) || Response.error();
    }
  })());
});
