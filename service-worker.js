const cacheVerison = "0.0.1"

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(cacheVerison)
      .then(cache => 
        cache.addAll([
          "./",
          "./index.html",
          "./index.css",
          "./src/store.mjs",
          "./src/util.mjs",
          "./src/elements/app.mjs",
          "./src/elements/build-context-list.mjs",
          "./src/elements/context-card.mjs",
          "./src/elements/edit-context-card.mjs"
        ])
      )
  )

  event.waitUntil(self.skipWaiting())
})

if (location.hostname !== "localhost")
  self.addEventListener("fetch", event =>
    event.respondWith(
      caches
        .match(event.request)
        .then(response => response || fetch(event.request))
    )
  )

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keyList =>
        Promise.all(
          keyList.map(key => {
            if (key != cacheVerison)
              return caches.delete(key)
          })
        )
      )
  )

  event.waitUntil(self.clients.claim())
})
