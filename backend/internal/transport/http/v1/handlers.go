package v1

import (
	"github.com/Alexander272/graphite_log/backend/internal/config"
	"github.com/Alexander272/graphite_log/backend/internal/services"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/middleware"
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
	// v1 := group.Group("/v1")

	// auth.Register(v1, auth.Deps{Service: h.services.Session, Middleware: h.middleware, Auth: h.conf.Auth})

	// secure := v1.Group("", h.middleware.VerifyToken)
}
