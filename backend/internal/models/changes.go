package models

import "time"

type NewChangeDTO struct {
	RealmId  string
	UserId   string
	UserName string
	Section  string
	ValueId  string
	Original interface{}
	Changed  interface{}
}

type GetChangesDTO struct {
	ValueId string `json:"valueId" db:"value_id"`
	Section string `json:"section" db:"section"`
}

type Changes struct {
	Id            string    `json:"id" db:"id"`
	UserId        string    `json:"userId" db:"user_id"`
	UserName      string    `json:"userName" db:"user_name"`
	Section       string    `json:"section" db:"section"`
	ValueId       string    `json:"valueId" db:"value_id"`
	Original      string    `json:"original" db:"original"`
	Changed       string    `json:"changed" db:"changed"`
	ChangedFields []string  `json:"changedFields" db:"changed_fields"`
	Created       time.Time `json:"created" db:"created_at"`
}

type ChangesDTO struct {
	Id            string   `json:"id" db:"id"`
	RealmId       string   `json:"realmId" db:"realm_id"`
	UserId        string   `json:"userId" db:"user_id"`
	UserName      string   `json:"userName" db:"user_name"`
	Section       string   `json:"section" db:"section"`
	ValueId       string   `json:"valueId" db:"value_id"`
	Original      string   `json:"original" db:"original"`
	Changed       string   `json:"changed" db:"changed"`
	ChangedFields []string `json:"changedFields" db:"changed_fields"`
}
