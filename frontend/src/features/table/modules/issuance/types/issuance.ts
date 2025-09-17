export interface IIssuance {
	id: string
	graphiteId: string
	issuanceDate: string
	isFull: boolean
	amount: number
	type: 'issuance' | 'return'
}

export interface IIssuanceDTO {
	id: string
	realmId: string
	graphiteId: string
	issuanceDate: string
	isFull: boolean
	isNotFull?: boolean
	type: 'issuance' | 'return'
	amount: number
}

export interface IReturnDTO {
	id: string
	graphiteId: string
	issuanceDate: string
	isFull: boolean
	amount: number
	type: 'return'
	place: string
}
