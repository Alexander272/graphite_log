export interface IRealm {
	id: string
	name: string
	realm: string
	isActive: boolean
	expiresIn: number
	created: string
}

export interface IRealmDTO {
	id?: string
	name: string
	realm: string
	isActive: boolean
	expiresIn: number
}
