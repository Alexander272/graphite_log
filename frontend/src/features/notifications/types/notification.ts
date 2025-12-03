export interface INotification {
	id: string
	realmId: string
	type: string
	mostId: string
	channelId: string
}

export interface INotificationDTO {
	id?: string
	realmId: string
	type: string
	mostId: string
	channelId: string
}
