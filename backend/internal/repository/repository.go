package repository

import (
	"github.com/Alexander272/graphite_log/backend/internal/repository/postgres"
	"github.com/jmoiron/sqlx"
)

type Rule interface {
	postgres.Rule
}
type RuleItem interface {
	postgres.RuleItem
}
type Role interface {
	postgres.Role
}
type Users interface {
	postgres.User
}

type Accesses interface {
	postgres.Accesses
}
type Realm interface {
	postgres.Realm
}
type Graphite interface {
	postgres.Graphite
}

type Repository struct {
	Rule
	RuleItem
	Role
	Users

	Accesses
	Realm
	Graphite
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Rule:     postgres.NewRuleRepo(db),
		RuleItem: postgres.NewRuleItemRepo(db),
		Role:     postgres.NewRoleRepo(db),
		Users:    postgres.NewUserRepo(db),

		Accesses: postgres.NewAccessesRepo(db),
		Realm:    postgres.NewRealmRepo(db),
		Graphite: postgres.NewGraphiteRepo(db),
	}
}
