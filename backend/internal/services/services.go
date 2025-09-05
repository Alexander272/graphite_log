package services

import (
	"github.com/Alexander272/graphite_log/backend/internal/repository"
	"github.com/Alexander272/graphite_log/backend/internal/services/most"
	"github.com/Alexander272/graphite_log/backend/pkg/auth"
	"github.com/Alexander272/graphite_log/backend/pkg/mattermost"
)

type Services struct {
	RuleItem
	Rule
	Role
	User
	Permission
	Session

	Realm
	Accesses
	Graphite
	Extending
	IssuanceForProd

	Notification
	Scheduler
}

type Deps struct {
	Repo       *repository.Repository
	Keycloak   *auth.KeycloakClient
	MostClient *mattermost.Client
	BotName    string
}

func NewServices(deps *Deps) *Services {
	ruleItem := NewRuleItemService(deps.Repo.RuleItem)
	rule := NewRuleService(deps.Repo.Rule, ruleItem)
	role := NewRoleService(deps.Repo.Role)

	permission := NewPermissionService("configs/privacy.conf", rule, role)
	user := NewUserService(&UsersDeps{Repo: deps.Repo.Users, Keycloak: deps.Keycloak, Role: role})
	session := NewSessionService(deps.Keycloak, user)

	realm := NewRealmService(deps.Repo.Realm, user)
	accesses := NewAccessesService(deps.Repo.Accesses)

	graphite := NewGraphiteService(deps.Repo.Graphite)
	extending := NewExtendingService(deps.Repo.Extending, graphite)
	issuance := NewIssuanceService(deps.Repo.IssuanceForProd, graphite)

	most := most.NewMostService(most.MostDeps{Client: deps.MostClient})
	notification := NewNotificationService(&NotificationDeps{Repo: deps.Repo.Notification, Most: most, Graphite: graphite})
	scheduler := NewSchedulerService(&SchedulerDeps{Notification: notification})

	return &Services{
		RuleItem:   ruleItem,
		Rule:       rule,
		Role:       role,
		User:       user,
		Permission: permission,
		Session:    session,

		Realm:           realm,
		Accesses:        accesses,
		Graphite:        graphite,
		Extending:       extending,
		IssuanceForProd: issuance,

		Notification: notification,
		Scheduler:    scheduler,
	}
}
