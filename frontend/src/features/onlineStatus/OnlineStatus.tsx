import { useEffect } from 'react'
import { toast } from 'react-toastify'

export function OnlineStatus() {
	useEffect(() => {
		const handleSetOnlineStatus = () => {
			toast.success('Соединение восстановлено')
		}

		const handleRemoveOnlineStatus = () => {
			//TODO надо бы еще какой-нибудь значок где-нибудь показывать, чтобы пользователь понимал что он оффлайн
			toast.warn('Соединение c сетью интернет оборвано')
		}

		window.addEventListener('online', handleSetOnlineStatus)
		window.addEventListener('offline', handleRemoveOnlineStatus)

		return () => {
			window.removeEventListener('online', handleSetOnlineStatus)
			window.removeEventListener('offline', handleRemoveOnlineStatus)
		}
	}, [])

	return null
}
