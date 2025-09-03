package models

import "time"

type IssuanceForProd struct {
	Id           string    `json:"id" db:"id"`
	GraphiteId   string    `json:"graphiteId" db:"graphite_id"`
	IssuanceDate time.Time `json:"issuanceDate" db:"issuance_date"`
	UserId       string    `json:"userId" db:"user_id"`
	IsFull       bool      `json:"isFull" db:"is_full"`
	Amount       float64   `json:"amount" db:"amount"`
}

type GetIssuanceForProdDTO struct {
	GraphiteId string `json:"graphiteId" db:"graphite_id"`
}

type IssuanceForProdDTO struct {
	Id           string    `json:"id" db:"id"`
	GraphiteId   string    `json:"graphiteId" db:"graphite_id"`
	IssuanceDate time.Time `json:"issuanceDate" db:"issuance_date"`
	UserId       string    `json:"userId" db:"user_id"`
	IsFull       bool      `json:"isFull" db:"is_full"`
	Amount       float64   `json:"amount" db:"amount"`
}

type DelIssuanceForProdDTO struct {
	Id string `json:"id" db:"id"`
}
