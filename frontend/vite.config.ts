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
			// devOptions: {
			// 	enabled: true,
			// },
			// strategies: 'injectManifest',
			// srcDir: 'src/serviceWorkers',
			// filename: 'sw.ts',
			registerType: 'autoUpdate',
			manifest: {
				id: 'graphite_log',
				name: 'ГрафитЛог',
				short_name: 'ГрафитЛог',
				description: 'Журнал прихода графита',
				lang: 'ru',
				theme_color: '#fafafa',
				background_color: '#fafafa',
				icons: [
					{
						src: 'favicon.ico',
						type: 'image/x-icon',
						sizes: '100x97',
					},
					{
						src: 'logo192.webp',
						type: 'image/webp',
						sizes: '192x192',
					},
				],
				screenshots: [
					{
						src: 'wide.png',
						sizes: '1920x854',
						type: 'image/png',
					},
				],
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
