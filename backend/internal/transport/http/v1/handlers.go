package v1

import (
	"github.com/Alexander272/graphite_log/backend/internal/config"
	"github.com/Alexander272/graphite_log/backend/internal/services"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/middleware"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/v1/accesses"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/v1/auth"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/v1/extending"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/v1/graphite"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/v1/issuance"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/v1/realm"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/v1/roles"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/v1/user"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	services   *services.Services
	conf       *config.Config
	middleware *middleware.Middleware
}

type Deps struct {
	Services   *services.Services
	Conf       *config.Config
	Middleware *middleware.Middleware
}

func NewHandler(deps Deps) *Handler {
	return &Handler{
		services:   deps.Services,
		conf:       deps.Conf,
		middleware: deps.Middleware,
	}
}

func (h *Handler) Init(group *gin.RouterGroup) {
	v1 := group.Group("/v1")

	auth.Register(v1, auth.Deps{Service: h.services.Session, Middleware: h.middleware, Auth: h.conf.Auth})

	secure := v1.Group("", h.middleware.VerifyToken)
	roles.Register(secure, h.services.Role, h.middleware)
	user.Register(secure, h.services.User, h.middleware)
	realm.Register(secure, h.services.Realm, h.middleware)
	accesses.Register(secure, h.services.Accesses, h.middleware)
	graphite.Register(secure, h.services.Graphite, h.middleware)
	extending.Register(secure, h.services.Extending, h.middleware)
	issuance.Register(secure, h.services.IssuanceForProd, h.middleware)
}
