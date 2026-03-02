package models

import "time"

type IssuanceBase struct {
	IssuanceDate time.Time `json:"issuanceDate" db:"issuance_date"`
	UserId       string    `json:"userId" db:"user_id"`
	IsFull       bool      `json:"isFull" db:"is_full"`
	Amount       float64   `json:"amount" db:"amount"`
	Type         string    `json:"type" db:"type"`
}

type IssuanceForProd struct {
	Id         string `json:"id" db:"id"`
	GraphiteId string `json:"graphiteId" db:"graphite_id"`
	IssuanceBase
}

type GetIssuanceForProdDTO struct {
	GraphiteId string `json:"graphiteId" db:"graphite_id"`
}

type GetIssuanceByIdDTO struct {
	Id string `json:"id" db:"id"`
}

type IssuanceForProdDTO struct {
	Id string `json:"id" db:"id"`
	// RealmId      string    `json:"realmId" db:"realm_id"`
	GraphiteId string `json:"graphiteId" db:"graphite_id"`
	UserName   string `json:"userName" db:"user_name"`
	Place      string `json:"place" db:"place"`
	IssuanceBase
}

type DelIssuanceForProdDTO struct {
	Id         string `json:"id" db:"id"`
	RealmId    string `json:"realmId" db:"realm_id"`
	GraphiteId string `json:"graphiteId" db:"graphite_id"`
	UserId     string `json:"userId" db:"user_id"`
	UserName   string `json:"userName" db:"user_name"`
}

func (i *IssuanceForProd) ToBase() IssuanceBase {
	return i.IssuanceBase
}

func (i *IssuanceForProdDTO) ToBase() IssuanceBase {
	return i.IssuanceBase
}
