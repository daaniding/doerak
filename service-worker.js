/* DOERAK service worker — cache-first for offline play after first load. */
const CACHE = 'doerak-v1';
const ASSETS = [
  './',
  'index.html',
  'css/main.css',
  'css/screens.css',
  'css/games.css',
  'js/storage.js',
  'js/utils.js',
  'js/audio.js',
  'js/games.js',
  'js/app.js',
  'data/questions.js',
  'js/games/tijdsbom.js',
  'js/games/reactietest.js',
  'js/games/most-likely-to.js',
  'js/games/most-likely-bomb.js',
  'js/games/imposter.js',
  'js/games/paranoia.js',
  'js/games/drunkocracy.js',
  'js/games/hot-seat.js',
  'js/games/twentyone.js',
  'js/games/buzz.js',
  'js/games/categorie-timer.js',
  'js/games/waterval.js',
  'js/games/blinde-keuze.js',
  'js/games/regel-roulette.js',
  'js/games/buddy.js',
  'js/games/saboteur.js',
  'js/games/sociale.js',
  'js/games/dubbel-pech.js',
  'js/games/uitdelen.js',
  'js/games/guess-in-five.js'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
