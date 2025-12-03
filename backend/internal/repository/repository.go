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
type Extending interface {
	postgres.Extending
}
type IssuanceForProd interface {
	postgres.IssuanceForProd
}

type Notification interface {
	postgres.Notification
}
type Changes interface {
	postgres.Changes
}
type Channels interface {
	postgres.Channels
}

type Repository struct {
	Rule
	RuleItem
	Role
	Users

	Accesses
	Realm
	Graphite
	Extending
	IssuanceForProd

	Notification
	Changes
	Channels
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Rule:     postgres.NewRuleRepo(db),
		RuleItem: postgres.NewRuleItemRepo(db),
		Role:     postgres.NewRoleRepo(db),
		Users:    postgres.NewUserRepo(db),

		Accesses:        postgres.NewAccessesRepo(db),
		Realm:           postgres.NewRealmRepo(db),
		Graphite:        postgres.NewGraphiteRepo(db),
		Extending:       postgres.NewExtendingRepo(db),
		IssuanceForProd: postgres.NewIssuanceRepo(db),

		Notification: postgres.NewNotificationRepo(db),
		Changes:      postgres.NewChangesRepo(db),
		Channels:     postgres.NewChannelRepo(db),
	}
}
