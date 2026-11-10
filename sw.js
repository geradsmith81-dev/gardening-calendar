// Keeps a copy of this small launcher page so the home-screen icon opens even on a weak connection.
// It never touches the calendar app itself (a different web address).
var CACHE = "gardening-calendar-launcher-v1";
var FILES = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png",
             "./icons/apple-touch-icon.png", "./icons/favicon-32.png"];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// newest copy from the internet first (so changes show up), the saved copy if offline
self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) { return; }
  event.respondWith(fetch(req).then(function (res) {
    var copy = res.clone();
    caches.open(CACHE).then(function (c) { c.put(req, copy); });
    return res;
  }).catch(function () {
    return caches.match(req, {ignoreSearch: true}).then(function (r) { return r || caches.match("./index.html"); });
  }));
});
