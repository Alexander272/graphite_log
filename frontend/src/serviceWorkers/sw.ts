import { registerRoute, Route, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, NetworkOnly } from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.skipWaiting()

// cache static assets
const imageRoute = new Route(
	({ request, sameOrigin }) => {
		return sameOrigin && request.destination === 'image'
	},
	new NetworkFirst({
		networkTimeoutSeconds: 10,
		cacheName: 'images',
	})
)
registerRoute(imageRoute)

// cache api calls
const fetchGraphiteRoute = new Route(
	({ request }) => {
		return request.url.startsWith('/')
	},
	new NetworkFirst({
		networkTimeoutSeconds: 10,
		cacheName: 'api/graphite',
	}),
	'GET'
)
registerRoute(fetchGraphiteRoute)

// cache navigation
const navigationRoute = new NavigationRoute(
	new NetworkFirst({
		networkTimeoutSeconds: 5,
		cacheName: 'navigation',
	})
)
registerRoute(navigationRoute)

// background sync
const syncPlugin = new BackgroundSyncPlugin('syncQueue', {
	maxRetentionTime: 24 * 60,
})
const backgroundSyncRoute = new Route(
	({ request }) => {
		return request.url.startsWith('/')
	},
	new NetworkOnly({
		plugins: [syncPlugin],
	}),
	'POST'
)
registerRoute(backgroundSyncRoute)
