if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/sw.js')
			.then(registration => {
				console.log('Service Worker зарегистрирован успешно.', registration.scope)
			})
			.catch(error => {
				console.log('Ошибка регистрации Service Worker.', error)
			})
	})
}
