package models

import "mime/multipart"

type ImportDTO struct {
	RealmId string
	File    *multipart.FileHeader
}

type Template struct {
	DateOfReceipt   int
	Name            int
	ErpName         int
	SupplierBatch   int
	BigBagNumber    int
	RegNumber       int
	Document        int
	Supplier        int
	SupplierName    int
	IssuanceForProd int
	Purpose         int
	Number1c        int
	Act             int
	ProductionDate  int
	MarkOfExtending int
	Place           int
	Notes           int
}
