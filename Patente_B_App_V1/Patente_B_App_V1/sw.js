const CACHE='patente-b-v1';
const ASSETS=["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./data/quiz-001.json", "./assets/icon-192.png", "./assets/icon-512.png", "./assets/signs/parking.svg", "./assets/signs/shared.svg", "./assets/signs/snowplough.svg", "./assets/signs/priority.svg", "./assets/signs/children.svg", "./assets/signs/seven_t.svg", "./assets/signs/panel305.svg", "./assets/signs/tunnel.svg", "./assets/signs/cleaning.svg", "./assets/signs/intersection637.svg", "./assets/signs/highbeam.svg"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{let copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;}).catch(()=>caches.match('./index.html')))));
