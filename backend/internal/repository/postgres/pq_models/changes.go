package pq_models

import "github.com/lib/pq"

type ChangesDTO struct {
	Id            string         `json:"id" db:"id"`
	RealmId       string         `json:"realmId" db:"realm_id"`
	UserId        string         `json:"userId" db:"user_id"`
	UserName      string         `json:"userName" db:"user_name"`
	Section       string         `json:"section" db:"section"`
	ValueId       string         `json:"valueId" db:"value_id"`
	Original      string         `json:"original" db:"original"`
	Changed       string         `json:"changed" db:"changed"`
	ChangedFields pq.StringArray `json:"changedFields" db:"changed_fields"`
	Created       pq.NullTime    `json:"created" db:"created_at"`
}
