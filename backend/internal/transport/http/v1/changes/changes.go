package changes

import (
	"net/http"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/models/response"
	"github.com/Alexander272/graphite_log/backend/internal/services"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/middleware"
	"github.com/Alexander272/graphite_log/backend/pkg/error_bot"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service services.Changes
}

func NewHandler(service services.Changes) *Handler {
	return &Handler{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Changes, middleware *middleware.Middleware) {
	handler := NewHandler(service)

	changes := api.Group("/changes")
	{
		changes.GET("/:graphite/:section", handler.get)
	}
}

func (h *Handler) get(c *gin.Context) {
	graphite := c.Param("graphite")
	if err := uuid.Validate(graphite); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	section := c.Param("section")
	if section == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Отправлены некорректные данные")
		return
	}
	dto := &models.GetChangesDTO{ValueId: graphite, Section: section}

	data, err := h.service.Get(c, dto)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), nil)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data, Total: len(data)})
}
