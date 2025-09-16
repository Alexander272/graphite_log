import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			plugins: [['@swc/plugin-emotion', {}]],
		}),
		VitePWA({
			registerType: 'autoUpdate', // Automatically update the service worker
			// Other PWA options like manifest, workbox configuration, etc.
			manifest: {
				name: 'ГрафитЛог',
				short_name: 'ГрафитЛог',
				lang: 'ru',
			},
		}),
	],
	resolve: {
		alias: [
			{
				find: '@',
				replacement: path.resolve(__dirname, 'src'),
			},
		],
	},
	server: {
		proxy: {
			'/api': 'http://localhost:9000',
		},
	},
	build: {
		target: 'es2021',
	},
})
