package extending

import (
	"net/http"

	"github.com/Alexander272/graphite_log/backend/internal/constants"
	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/models/response"
	"github.com/Alexander272/graphite_log/backend/internal/services"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/middleware"
	"github.com/Alexander272/graphite_log/backend/pkg/error_bot"
	"github.com/Alexander272/graphite_log/backend/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ExtendingHandlers struct {
	service services.Extending
}

func NewExtendingHandlers(service services.Extending) *ExtendingHandlers {
	return &ExtendingHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Extending, middleware *middleware.Middleware) {
	handlers := NewExtendingHandlers(service)

	extending := api.Group("/extending", middleware.CheckPermissions(constants.Extending, constants.Read))
	{
		extending.GET("", handlers.getByGraphiteId)

		write := extending.Group("", middleware.CheckPermissions(constants.Extending, constants.Write))
		{
			write.POST("", handlers.create)
			write.PUT("/:id", handlers.update)
			write.DELETE("/:id", handlers.delete)
		}
	}
}

func (h *ExtendingHandlers) getByGraphiteId(c *gin.Context) {
	graphiteId := c.Query("graphite")
	if graphiteId == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id реагента не задан")
		return
	}

	extending, err := h.service.GetByGraphiteId(c, graphiteId)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), nil)
		return
	}

	c.JSON(http.StatusOK, response.DataResponse{Data: extending})
}

func (h *ExtendingHandlers) create(c *gin.Context) {
	dto := &models.ExtendingDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	logger.Info("Добавлено продление срока", logger.AnyAttr("dto", dto))

	c.JSON(http.StatusCreated, response.IdResponse{Id: dto.Id, Message: "Продление срока годности создано"})
}

func (h *ExtendingHandlers) update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id не задан")
		return
	}

	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	dto := &models.ExtendingDTO{UserId: user.Id, UserName: user.Name}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	dto.Id = id

	if err := h.service.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	logger.Info("Обновлено продление срока", logger.AnyAttr("dto", dto))

	c.JSON(http.StatusOK, response.IdResponse{Message: "Продление срока годности обновлено"})
}

func (h *ExtendingHandlers) delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id не задан")
		return
	}
	realm := c.Query("realm")
	if err := uuid.Validate(realm); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Realm не корректен")
		return
	}

	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	dto := &models.DeleteExtendingDTO{Id: id, UserId: user.Id, UserName: user.Name, RealmId: realm}

	if err := h.service.Delete(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), id)
		return
	}
	logger.Info("Удалено продление срока", logger.StringAttr("id", dto.Id))

	c.JSON(http.StatusNoContent, response.IdResponse{})
}
