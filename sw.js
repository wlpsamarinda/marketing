/* Service worker WMC. Naikkan VERSION setiap kali file aplikasi diubah. */
var VERSION = 'wmc-v2';
var SHELL = [
  './', './index.html', './public.html', './config.js', './gas-shim.js',
  './pwa.js', './pwa.css', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;                 // API (POST) selalu ke jaringan
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;       // GAS & CDN tidak di-cache
  if (url.pathname.indexOf('/config.js') >= 0) {    // config: jaringan dulu agar perubahan URL cepat terbaca
    e.respondWith(fetch(req).then(function (r) {
      var cp = r.clone(); caches.open(VERSION).then(function (c) { c.put(req, cp); }); return r;
    }).catch(function () { return caches.match(req); }));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(req).then(function (r) {
      if (r && r.ok) { var cp = r.clone(); caches.open(VERSION).then(function (c) { c.put(req, cp); }); }
      return r;
    }).catch(function () { return hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined); });
    return hit || net;                              // stale-while-revalidate
  }));
});
