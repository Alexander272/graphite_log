package models

import "github.com/lib/pq"

type Role struct {
	Id    string   `json:"id" db:"id"`
	Name  string   `json:"name" db:"name"`
	Rules []string `json:"rules"`
}
type RoleWithRuleDTO struct {
	Id      string         `json:"id" db:"id"`
	Name    string         `json:"name" db:"name"`
	Extends pq.StringArray `db:"extends"`
	Rules   pq.StringArray `db:"rules"`
	// Menu    string         `db:"menu"`
}

type RoleFull struct {
	Id          string   `json:"id" db:"id"`
	Name        string   `json:"name" db:"name"`
	Level       int      `json:"level" db:"level"`
	Extends     []string `json:"extends" db:"extends"`
	Description string   `json:"description" db:"description"`
}
type RoleFullDTO struct {
	Id          string         `json:"id" db:"id"`
	Name        string         `json:"name" db:"name"`
	Level       int            `json:"level" db:"level"`
	Extends     pq.StringArray `json:"extends" db:"extends"`
	Description string         `json:"description" db:"description"`
}

type RoleWithRealm struct {
	Id          string `json:"id" db:"id"`
	Name        string `json:"name" db:"name"`
	Level       int    `json:"level" db:"level"`
	Description string `json:"description" db:"description"`
	RealmId     string `json:"realmId" db:"realm_id"`
}

type RoleWithApi struct{}

type GetRolesDTO struct{}

type GetRoleByRealmDTO struct {
	RealmId string `json:"realmId" binding:"required"`
	UserId  string `json:"userId"`
}

type RoleDTO struct {
	Id          string   `json:"id" db:"id"`
	Name        string   `json:"name" db:"name" binding:"required"`
	Level       int      `json:"level" db:"level" binding:"required"`
	Extends     []string `json:"extends" db:"extends"`
	Description string   `json:"description" db:"description"`
}
