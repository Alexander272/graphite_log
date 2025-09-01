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
	markOnRelease: string
	purpose: string
	number1c: string
	act: string
	productionDate: string
	markOfExtending: string
	place: string
	notes: string
}

export interface ITableItemDTO {
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
