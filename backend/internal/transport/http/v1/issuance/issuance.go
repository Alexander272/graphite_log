package issuance

import (
	"errors"
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

type Handler struct {
	service services.IssuanceForProd
}

func NewHandler(service services.IssuanceForProd) *Handler {
	return &Handler{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.IssuanceForProd, middleware *middleware.Middleware) {
	handler := NewHandler(service)

	issuance := api.Group("/issuance", middleware.CheckPermissions(constants.Issuance, constants.Read))
	{
		issuance.GET("", handler.get)

		write := issuance.Group("", middleware.CheckPermissions(constants.Issuance, constants.Write))
		{
			write.POST("", handler.create)
			write.PUT("/:id", handler.update)
			write.DELETE("/:id", handler.delete)
		}
	}
}

func (h *Handler) get(c *gin.Context) {
	graphite := c.Query("graphite")
	if err := uuid.Validate(graphite); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Отправлены некорректные данные")
		return
	}
	dto := &models.GetIssuanceForProdDTO{GraphiteId: graphite}

	data, err := h.service.Get(c, dto)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data, Total: len(data)})
}

func (h *Handler) create(c *gin.Context) {
	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	dto := &models.IssuanceForProdDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	dto.UserId = user.Id

	if err := h.service.Create(c, dto); err != nil {
		if errors.Is(err, models.ErrWasIssued) {
			response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Весь графит уже выдан в производство")
			return
		}

		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	logger.Info("Выдача в производство добавлена", logger.AnyAttr("dto", dto))

	c.JSON(http.StatusCreated, response.IdResponse{Message: "Выдача в производство добавлена"})
}

func (h *Handler) update(c *gin.Context) {
	id := c.Param("id")
	if err := uuid.Validate(id); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id не корректен")
		return
	}

	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	dto := &models.IssuanceForProdDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	dto.Id = id
	dto.UserId = user.Id

	if err := h.service.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	logger.Info("Выдача в производство обновлена", logger.AnyAttr("dto", dto))

	c.JSON(http.StatusOK, response.IdResponse{Message: "Выдача в производство обновлена"})
}

func (h *Handler) delete(c *gin.Context) {
	id := c.Param("id")
	if err := uuid.Validate(id); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id не корректен")
		return
	}
	dto := &models.DelIssuanceForProdDTO{Id: id}

	if err := h.service.Delete(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	logger.Info("Выдача в производство удалена", logger.AnyAttr("dto", dto))

	c.JSON(http.StatusOK, response.IdResponse{Message: "Выдача в производство удалена"})
}
