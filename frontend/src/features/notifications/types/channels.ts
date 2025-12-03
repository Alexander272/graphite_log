export interface IChannel {
	id: string
	name: string
	type: string
	channelId: string
	created: string
	updated: string
}

export interface IChannelDTO {
	id?: string
	name: string
	type: string
	channelId: string
}
