// Offline (spec §18.2 "S24" "Device and storage"): the page and its icons are
// cached when the service worker installs, then served from the cache, so the
// form opens with no signal. A new build has a new CACHE name (the build
// writes the content hash), which replaces the old cache on activation.
const CACHE = "spw-measure-0.1.0+aa65a46299";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit ||
    fetch(e.request).catch(() => (e.request.mode === "navigate" ? caches.match("index.html") : Response.error()))));
});
