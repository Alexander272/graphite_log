package services

import (
	"github.com/Alexander272/graphite_log/backend/internal/repository"
	"github.com/Alexander272/graphite_log/backend/pkg/auth"
	"github.com/Alexander272/graphite_log/backend/pkg/mattermost"
)

type Services struct{}

type Deps struct {
	Repo       *repository.Repository
	Keycloak   *auth.KeycloakClient
	MostClient *mattermost.Client
	BotName    string
}

func NewServices(deps *Deps) *Services {
	return &Services{}
}
