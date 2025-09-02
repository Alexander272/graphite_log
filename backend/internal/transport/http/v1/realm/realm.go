package realm

import (
	"errors"
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

type Handlers struct {
	service services.Realm
}

func NewHandlers(service services.Realm) *Handlers {
	return &Handlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Realm, middleware *middleware.Middleware) {
	handlers := NewHandlers(service)

	realm := api.Group("/realms")
	{
		realm.GET("/user", handlers.getByUser)
		read := realm.Group("", middleware.CheckPermissions(constants.Realms, constants.Read))
		{
			read.GET("", handlers.get)
			read.GET("/:id", handlers.getById)
			// read.POST("/choose", handlers.choose)
		}

		write := realm.Group("", middleware.CheckPermissions(constants.Realms, constants.Write))
		{
			write.POST("", handlers.create)
			write.PUT("/:id", handlers.update)
			write.DELETE("/:id", handlers.delete)
		}
	}
}

func (h *Handlers) get(c *gin.Context) {
	all := c.Query("all")

	dto := &models.GetRealmsDTO{All: all == "true"}
	data, err := h.service.Get(c, dto)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data, Total: len(data)})
}

func (h *Handlers) getById(c *gin.Context) {
	id := c.Param("id")
	if err := uuid.Validate(id); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "invalid id param")
		return
	}

	dto := &models.GetRealmByIdDTO{Id: id}
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

func (h *Handlers) getByUser(c *gin.Context) {
	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	dto := &models.GetRealmByUserDTO{UserId: user.Id}
	data, err := h.service.GetByUser(c, dto)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data})
}

// func (h *Handlers) choose(c *gin.Context) {
// 	dto := &models.ChooseRealmDTO{}
// 	if err := c.BindJSON(dto); err != nil {
// 		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
// 		return
// 	}
// 	u, exists := c.Get(constants.CtxUser)
// 	if !exists {
// 		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
// 		return
// 	}
// 	dto.UserId = u.(models.User).Id

// 	identity, err := c.Cookie(constants.IdentityCookie)
// 	if err != nil || identity == "" {
// 		response.NewErrorResponse(c, http.StatusUnauthorized, err.Error(), "сессия не найдена")
// 		return
// 	}
// 	id := &models.Identity{}
// 	err = id.Parse(identity)
// 	if err != nil {
// 		response.NewErrorResponse(c, http.StatusUnauthorized, err.Error(), "сессия не найдена")
// 		return
// 	}

// 	for _, item := range id.Roles {
// 		if item.RealmId == dto.RealmId {
// 			dto.Role = item.Name
// 		}
// 	}

// 	user, err := h.service.Choose(c, dto)
// 	if err != nil {
// 		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
// 		error_bot.Send(c, err.Error(), dto)
// 		return
// 	}

// 	c.JSON(http.StatusOK, response.DataResponse{Data: user})
// }

func (h *Handlers) create(c *gin.Context) {
	dto := &models.RealmDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusCreated, response.IdResponse{Id: dto.Id, Message: "Область создана"})
}

func (h *Handlers) update(c *gin.Context) {
	id := c.Param("id")
	err := uuid.Validate(id)
	if err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "invalid id param")
		return
	}

	dto := &models.RealmDTO{}
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
	c.JSON(http.StatusOK, response.IdResponse{Message: "Область обновлена"})
}

func (h *Handlers) delete(c *gin.Context) {
	id := c.Param("id")
	err := uuid.Validate(id)
	if err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "invalid id param")
		return
	}

	dto := &models.DeleteRealmDTO{ID: id}
	if err := h.service.Delete(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusNoContent, response.IdResponse{})
}
