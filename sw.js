// 画面一式を端末に置き、電波がなくても起動できるようにする。
// API（script.google.com）は別オリジンなので触らない。
// 画面を更新したら VERSION を上げる（新しい画面は次に開いたときに反映される）。
const VERSION = 'v2-step1-2';
const SHELL = [
  './',
  './index.html',
  './config.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // 画面は端末の控えを先に返し、裏で新しいものを取っておく
  e.respondWith(
    caches.open(VERSION).then((c) =>
      c.match(e.request, { ignoreSearch: true }).then((hit) => {
        const net = fetch(e.request)
          .then((res) => { if (res.ok) c.put(e.request, res.clone()); return res; })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
