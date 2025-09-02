package graphite

import (
	"errors"
	"net/http"

	"github.com/Alexander272/graphite_log/backend/internal/constants"
	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/models/response"
	"github.com/Alexander272/graphite_log/backend/internal/services"
	"github.com/Alexander272/graphite_log/backend/internal/transport/http/middleware"
	"github.com/Alexander272/graphite_log/backend/internal/utils"
	"github.com/Alexander272/graphite_log/backend/pkg/error_bot"
	"github.com/Alexander272/graphite_log/backend/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service services.Graphite
}

func NewHandler(service services.Graphite) *Handler {
	return &Handler{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Graphite, middleware *middleware.Middleware) {
	handler := NewHandler(service)

	graphite := api.Group("/graphite")
	{
		graphite.GET("", handler.get)
		graphite.GET("/:id", handler.getById)
		graphite.GET("/unique/:field", handler.getUniqueData)

		// write := graphite.Group("", middleware.CheckPermissions(constants.Graphite, constants.Write))
		{
			graphite.POST("", handler.create)
			graphite.PUT("/:id", handler.update)
			// TODO надо это как-то разделить тк эти функции для разных пользователей с разными правами
			graphite.PUT("/:id/purpose", handler.setPurpose)
			graphite.PUT("/:id/place", handler.setPlace)
			graphite.PUT("/:id/notes", handler.setNotes)
		}
	}
}

func (h *Handler) get(c *gin.Context) {
	realm := c.Query("realm")
	if err := uuid.Validate(realm); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Отправлены некорректные данные")
		return
	}
	params := utils.GetFilterParams(c)
	dto := &models.GetGraphiteDTO{RealmId: realm, Params: *params}

	data, err := h.service.Get(c, dto)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), nil)
		return
	}

	total := 0
	if len(data) > 0 {
		total = data[0].Total
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data, Total: total})
}

func (h *Handler) getById(c *gin.Context) {
	id := c.Param("id")
	if err := uuid.Validate(id); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Отправлены некорректные данные")
		return
	}
	dto := &models.GetGraphiteByIdDTO{Id: id}

	data, err := h.service.GetById(c, dto)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			response.NewErrorResponse(c, http.StatusNotFound, err.Error(), err.Error())
			return
		}

		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data})
}

func (h *Handler) getUniqueData(c *gin.Context) {
	field := c.Param("field")
	if field == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "field is empty", "Отправлены некорректные данные")
		return
	}
	realm := c.Query("realm")
	if err := uuid.Validate(realm); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Отправлены некорректные данные")
		return
	}

	req := &models.GetUniqueDTO{Field: field, RealmId: realm}

	data, err := h.service.GetUniqueData(c, req)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), req)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data, Total: len(data)})
}

func (h *Handler) create(c *gin.Context) {
	dto := &models.GraphiteDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	logger.Info("Данные созданы",
		logger.StringAttr("user_id", user.Id),
		logger.StringAttr("username", user.Name),
		logger.AnyAttr("dto", dto),
	)

	c.JSON(http.StatusCreated, response.IdResponse{Message: "Данные созданы"})
}

func (h *Handler) update(c *gin.Context) {
	id := c.Param("id")
	if err := uuid.Validate(id); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id не корректен")
		return
	}

	dto := &models.GraphiteDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	dto.Id = id

	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	if err := h.service.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	logger.Info("Данные обновлены",
		logger.StringAttr("user_id", user.Id),
		logger.StringAttr("username", user.Name),
		logger.AnyAttr("dto", dto),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные обновлены"})
}

func (h *Handler) setPurpose(c *gin.Context) {
	dto := &models.SetGraphitePurposeDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	if err := h.service.SetPurpose(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	logger.Info("Назначение обновлено",
		logger.StringAttr("user_id", user.Id),
		logger.StringAttr("username", user.Name),
		logger.AnyAttr("dto", dto),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные обновлены"})
}

func (h *Handler) setPlace(c *gin.Context) {
	dto := &models.SetGraphitePlaceDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	if err := h.service.SetPlace(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	logger.Info("Место хранения обновлено",
		logger.StringAttr("user_id", user.Id),
		logger.StringAttr("username", user.Name),
		logger.AnyAttr("dto", dto),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные обновлены"})
}

func (h *Handler) setNotes(c *gin.Context) {
	dto := &models.SetGraphiteNotesDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	if err := h.service.SetNotes(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	logger.Info("Заметки обновлены",
		logger.StringAttr("user_id", user.Id),
		logger.StringAttr("username", user.Name),
		logger.AnyAttr("dto", dto),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные обновлены"})
}
