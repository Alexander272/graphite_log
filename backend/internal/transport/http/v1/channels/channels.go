package channels

import (
	"net/http"

	"github.com/Alexander272/graphite_log/backend/internal/constants"
	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/models/response"
	"github.com/Alexander272/graphite_log/backend/internal/services"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/middleware"
	"github.com/Alexander272/graphite_log/backend/pkg/error_bot"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	services services.Channels
}

func NewHandler(service services.Channels) *Handler {
	return &Handler{
		services: service,
	}
}

func Register(api *gin.RouterGroup, service services.Channels, middleware *middleware.Middleware) {
	handler := NewHandler(service)

	channels := api.Group("/channels", middleware.CheckPermissions(constants.Realms, constants.Write))
	{
		channels.GET("", handler.get)
		channels.POST("", handler.create)
		channels.PUT("/:id", handler.update)
		channels.DELETE("/:id", handler.delete)
	}
}

func (h *Handler) get(c *gin.Context) {
	channelType := c.Query("type")
	dto := &models.GetChannelsDTO{Type: channelType}

	data, err := h.services.Get(c, dto)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data})
}

func (h *Handler) create(c *gin.Context) {
	dto := &models.ChannelDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Произошла ошибка: "+err.Error())
		return
	}

	err := h.services.Create(c, dto)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Id: dto.Id, Message: "Канал успешно создан"})
}

func (h *Handler) update(c *gin.Context) {
	id := c.Param("id")
	if err := uuid.Validate(id); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id не корректен")
		return
	}

	dto := &models.ChannelDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	if dto.Id != id {
		response.NewErrorResponse(c, http.StatusBadRequest, "id mismatch", "Id не совпадает")
		return
	}
	dto.Id = id

	if err := h.services.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные обновлены"})
}

func (h *Handler) delete(c *gin.Context) {
	id := c.Param("id")
	if err := uuid.Validate(id); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id не корректен")
		return
	}

	dto := &models.ChannelDTO{Id: id}
	if err := h.services.Delete(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusNoContent, response.IdResponse{})
}
