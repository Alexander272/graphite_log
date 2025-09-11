import type { IUserData } from '@/features/user/types/user'

export interface IAccesses {
	id: string
	realmId: string
	user: IUserData
	created: string
}

export interface IAccessesDTO {
	id?: string
	realmId: string
	userId: string
}
