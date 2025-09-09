package models

import "time"

type GetGraphiteDTO struct {
	RealmId string `json:"realmId" db:"realm_id" binding:"required"`
	Params
}

type GetGraphiteByIdDTO struct {
	Id string `json:"id" db:"id" binding:"required"`
}

type GetOverdueDTO struct {
}

type Graphite struct {
	Id                string    `json:"id" db:"id"`
	RealmId           string    `json:"realmId" db:"realm_id"`
	DateOfReceipt     time.Time `json:"dateOfReceipt" db:"date_of_receipt"`
	Name              string    `json:"name" db:"name"`
	ErpName           string    `json:"erpName" db:"erp_name"`
	SupplierBatch     string    `json:"supplierBatch" db:"supplier_batch"`
	BigBagNumber      string    `json:"bigBagNumber" db:"big_bag_number"`
	RegNumber         string    `json:"regNumber" db:"registration_number"`
	Document          string    `json:"document" db:"document"`
	Supplier          string    `json:"supplier" db:"supplier"`
	SupplierName      string    `json:"supplierName" db:"supplier_name"`
	IssuanceForProd   string    `json:"issuanceForProd" db:"issuance"`
	IsIssued          bool      `json:"isIssued" db:"is_all_issued"`
	Purpose           string    `json:"purpose" db:"purpose"`
	Number1c          string    `json:"number1c" db:"number_1c"`
	Act               string    `json:"act" db:"act"`
	ProductionDate    time.Time `json:"productionDate" db:"production_date"`
	MarkOfExtending   string    `json:"extendingMark" db:"extending"`
	DateOfExtending   time.Time `json:"extendingDate" db:"date_of_extending"`
	PeriodOfExtending int       `json:"extendingPeriod" db:"period_of_extending"`
	IsOverdue         bool      `json:"isOverdue" db:"is_overdue"`
	Place             string    `json:"place" db:"place"`
	Notes             string    `json:"notes" db:"notes"`
	Total             int       `json:"-" db:"total"`
	// DateOfExtending int    `json:"extendingDate" db:"date_of_extending"`
}

type GraphiteDTO struct {
	Id             string    `json:"id" db:"id"`
	RealmId        string    `json:"realmId" db:"realm_id" binding:"required"`
	DateOfReceipt  time.Time `json:"dateOfReceipt" db:"date_of_receipt" binding:"required"`
	Name           string    `json:"name" db:"name" binding:"required"`
	ErpName        string    `json:"erpName" db:"erp_name" binding:"required"`
	SupplierBatch  string    `json:"supplierBatch" db:"supplier_batch"`
	BigBagNumber   string    `json:"bigBagNumber" db:"big_bag_number"`
	RegNumber      string    `json:"regNumber" db:"registration_number"`
	Document       string    `json:"document" db:"document" binding:"required"`
	Supplier       string    `json:"supplier" db:"supplier" binding:"required"`
	SupplierName   string    `json:"supplierName" db:"supplier_name"`
	Number1c       string    `json:"number1c" db:"number_1c"`
	Purpose        string    `json:"purpose" db:"purpose"`
	Act            string    `json:"act" db:"act"`
	ProductionDate time.Time `json:"productionDate" db:"production_date" binding:"required"`
	Place          string    `json:"place" db:"place"`
	Notes          string    `json:"notes" db:"notes"`
	IsAllIssued    bool      `json:"isAllIssued" db:"is_all_issued"`
}

type GetUniqueDTO struct {
	Field   string `json:"field"`
	RealmId string `json:"realmId" db:"realm_id"`
}

type SetGraphiteIssuedDTO struct {
	Id string `json:"id" db:"id" binding:"required"`
}

type SetGraphitePurposeDTO struct {
	Id      string `json:"id" db:"id" binding:"required"`
	Purpose string `json:"purpose" db:"purpose" binding:"required"`
}
type SetGraphitePlaceDTO struct {
	Id    string `json:"id" db:"id" binding:"required"`
	Place string `json:"place" db:"place" binding:"required"`
}
type SetGraphiteNotesDTO struct {
	Id    string `json:"id" db:"id" binding:"required"`
	Notes string `json:"notes" db:"notes" binding:"required"`
}
