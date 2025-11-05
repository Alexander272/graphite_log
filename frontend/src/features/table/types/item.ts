import type { IFilter, ISearch, ISort } from './params'

export interface IGetTableItemDTO {
	realmId: string
	page?: number
	size?: number
	sort?: ISort
	search?: ISearch
	filters?: IFilter[]
}

export interface ITableItem {
	id: string
	dateOfReceipt: string
	name: string
	erpName: string
	supplierBatch: string
	bigBagNumber: string
	regNumber: string
	document: string
	supplier: string
	supplierName: string
	// markOnRelease: string
	issuanceForProd: string
	isIssued: boolean
	purpose: string
	number1c: string
	act: string
	productionDate: string
	markOfExtending: string
	isOverdue: boolean
	place: string
	notes: string
}

export interface ITableItemDTO {
	id?: string
	realmId?: string
	dateOfReceipt: string
	name: string
	erpName: string
	supplierBatch: string
	bigBagNumber: string
	regNumber: string
	document: string
	supplier: string
	supplierName: string
	number1c: string
	act: string
	productionDate: string
	notes: string
}

export interface ISetPurposeDTO {
	id: string
	purpose: string
}

export interface ISetPlaceDTO {
	id: string
	place: string
}

export interface ISetNotesDTO {
	id: string
	notes: string
}
