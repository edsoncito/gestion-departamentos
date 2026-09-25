const CACHE_NAME = 'gestion-alquileres-v1'
const APP_BASE = '/gestion-departamentos/'
const APP_SHELL = [
  APP_BASE,
  `${APP_BASE}index.html`,
  `${APP_BASE}manifest.webmanifest`,
  `${APP_BASE}favicon.svg`,
  `${APP_BASE}apple-touch-icon.png`,
  `${APP_BASE}pwa-192x192.png`,
  `${APP_BASE}pwa-512x512.png`,
  `${APP_BASE}pwa-maskable-512x512.png`,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      )),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (
    request.method !== 'GET'
    || url.origin !== self.location.origin
    || !url.pathname.startsWith(APP_BASE)
  ) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(async () => (
          (await caches.match(request))
          || (await caches.match(APP_BASE))
        )),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })

      return cached || network
    }),
  )
})
