// =========================================================
// Cherry Blossom Cafe — sw.js (the "service worker")
// This makes the game work OFFLINE, like a real app.
//
// The first time you open the game (online), the browser saves a copy
// of every file listed below on your phone. After that, the game loads
// from that copy, so it works with no internet at all.
//
// When you're online the game always loads the newest files (and saves
// them); the saved copy is only used offline. Bump VERSION (v3 -> v4)
// when you add or remove files in the list below.
// =========================================================

const VERSION = "cherry-blossom-cafe-v3";

const FILES = [
  "./",
  "index.html",
  "style.css",
  "manifest.webmanifest",
  "sound.js", "paint.js", "street.js", "room.js", "menu.js", "customers.js", "decor.js",
  "matcha.js", "desserts.js", "bakery.js", "drinks.js", "game.js", "sparkles.js",
  "assets/fonts/mochiy-pop-one-latin.woff2",
  "assets/fonts/nunito-latin.woff2",
  "assets/fonts/great-vibes-latin.woff2",
  "assets/icons/icon.svg", "assets/icons/apple-touch-icon.png",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/icon-maskable-512.png",
  "assets/icons/favicon-32.png", "assets/icons/favicon-64.png",
  ...["arm_L", "arm_R", "blush", "body", "bow", "eye_L", "eye_R", "hair_back_L", "hair_back_R",
      "hair_front", "hands", "head", "headband", "neck", "nose", "ribbon_L", "ribbon_R"]
    .map((name) => "assets/bloom/" + name + ".png"),
];

// 1. Install: save every file
self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();                       // start working straight away
});

// 2. Activate: throw away copies from older versions
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

// 3. Every time the game asks for a file: get the newest one from the
//    internet (and save it), so updates show up straight away.
//    No internet? Use the saved copy instead.
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.open(VERSION).then(function (cache) {
      return fetch(event.request)
        .then(function (response) {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => cache.match(event.request, { ignoreSearch: true }));   // offline
    })
  );
});
