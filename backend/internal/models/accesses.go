package models

import "time"

type Accesses struct {
	Id      string    `json:"id" db:"id"`
	RealmId string    `json:"realmId" db:"realm_id"`
	User    *UserData `json:"user"`
	Role    *Role     `json:"role"`
	Created time.Time `json:"created" db:"created_at"`
	// UserId  string `json:"userId" db:"user_id"`
	// RoleId  string `json:"roleId" db:"role_id"`
}

type GetAccessesDTO struct {
	RealmId string `json:"id"`
}

type AccessesDTO struct {
	Id      string `json:"id" db:"id"`
	RealmId string `json:"realmId" db:"realm_id" binding:"required"`
	UserId  string `json:"userId" db:"user_id" binding:"required"`
	RoleId  string `json:"roleId" db:"role_id" binding:"required"`
}

type DeleteAccessesDTO struct {
	Id string `json:"id" db:"id" binding:"required"`
}
