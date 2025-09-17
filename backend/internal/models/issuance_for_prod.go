package models

import "time"

type IssuanceForProd struct {
	Id           string    `json:"id" db:"id"`
	GraphiteId   string    `json:"graphiteId" db:"graphite_id"`
	IssuanceDate time.Time `json:"issuanceDate" db:"issuance_date"`
	UserId       string    `json:"userId" db:"user_id"`
	IsFull       bool      `json:"isFull" db:"is_full"`
	Amount       float64   `json:"amount" db:"amount"`
	Type         string    `json:"type" db:"type"`
}

type GetIssuanceForProdDTO struct {
	GraphiteId string `json:"graphiteId" db:"graphite_id"`
}

type GetIssuanceByIdDTO struct {
	Id string `json:"id" db:"id"`
}

type IssuanceForProdDTO struct {
	Id           string    `json:"id" db:"id"`
	RealmId      string    `json:"realmId" db:"realm_id"`
	GraphiteId   string    `json:"graphiteId" db:"graphite_id"`
	IssuanceDate time.Time `json:"issuanceDate" db:"issuance_date"`
	UserId       string    `json:"userId" db:"user_id"`
	UserName     string    `json:"userName" db:"user_name"`
	IsFull       bool      `json:"isFull" db:"is_full"`
	Amount       float64   `json:"amount" db:"amount"`
	Type         string    `json:"type" db:"type"`
	Place        string    `json:"place" db:"place"`
}

type DelIssuanceForProdDTO struct {
	Id         string `json:"id" db:"id"`
	RealmId    string `json:"realmId" db:"realm_id"`
	GraphiteId string `json:"graphiteId" db:"graphite_id"`
	UserId     string `json:"userId" db:"user_id"`
	UserName   string `json:"userName" db:"user_name"`
}
