const CACHE = "projectr-v0-53";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./senses.js",
  "./deadman.js",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
  "./logo.jpeg",
  "./brain.svg",
  "./mind-dl.svg",
  "./mind-ul.svg"
];

function bypassSw(url) {
  const s = String(url || "");
  let host = "";
  let path = "";
  try {
    const u = new URL(s);
    host = (u.hostname || "").toLowerCase();
    path = (u.pathname || "").toLowerCase();
  } catch (e) {}
  if (/\.gguf(\?|$)/i.test(s) || path.endsWith(".gguf")) return true;
  if (host === "huggingface.co" || host.endsWith(".huggingface.co") || host === "hf.co" || host.endsWith(".hf.co")) return true;
  if (host === "jsdelivr.net" || host.endsWith(".jsdelivr.net")) return true;
  if (/wllama/i.test(s) || /wllama/i.test(path)) return true;
  return false;
}

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
  if (bypassSw(event.request.url)) {
    event.respondWith(fetch(event.request));
    return;
  }
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
