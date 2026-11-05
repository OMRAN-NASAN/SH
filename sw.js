// Service worker بسيط: يجعل الصفحة قابلة للتثبيت ويحفظ نسخة منها للفتح السريع.
// لا يتدخل أبداً في طلبات الأجهزة (http://192.168.x.x) لأنها من أصل مختلف.
const CACHE = 'home-control-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'icon-192.png', 'manifest.webmanifest'])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // الأجهزة والـ CDN: مباشرة
  // الشبكة أولاً (لتصلك آخر نسخة من الصفحة)، وإذا فشلت نستخدم المحفوظة
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('./')))
  );
});
