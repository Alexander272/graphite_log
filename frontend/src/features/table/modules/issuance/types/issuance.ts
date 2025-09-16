export interface IIssuance {
	id: string
	issuanceDate: string
	isFull: boolean
	amount: number
	type: 'issuance' | 'return'
}

export interface IIssuanceDTO {
	id: string
	graphiteId: string
	issuanceDate: string
	isFull: boolean
	isNotFull?: boolean
	type: 'issuance'
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
