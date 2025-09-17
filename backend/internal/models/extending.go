package models

import "time"

type Extending struct {
	Id         string    `json:"id" db:"id"`
	GraphiteId string    `json:"graphiteId,omitempty" db:"graphite_id"`
	Act        string    `json:"act" db:"act"`
	Date       time.Time `json:"date" db:"date_of_extending"`
	Period     int       `json:"period" db:"period_of_extending"`
}

type GetExtendingByIdDTO struct {
	Id string `json:"id" db:"id"`
}

type ExtendingDTO struct {
	Id         string    `json:"id" db:"id"`
	RealmId    string    `json:"realmId" db:"realm_id"`
	UserId     string    `json:"userId" db:"user_id"`
	UserName   string    `json:"userName" db:"user_name"`
	GraphiteId string    `json:"graphiteId" db:"graphite_id"`
	Act        string    `json:"act" db:"act"`
	Date       time.Time `json:"date" db:"date_of_extending"`
	Period     int       `json:"period" db:"period_of_extending"`
}

type DeleteExtendingDTO struct {
	Id         string `json:"id" db:"id"`
	RealmId    string `json:"realmId" db:"realm_id"`
	GraphiteId string `json:"graphiteId" db:"graphite_id"`
	UserId     string `json:"userId" db:"user_id"`
	UserName   string `json:"userName" db:"user_name"`
}
