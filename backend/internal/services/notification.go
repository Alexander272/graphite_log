package services

import (
	"context"
	"fmt"
	"strings"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository"
	"github.com/Alexander272/graphite_log/backend/internal/services/most"
	"github.com/Alexander272/graphite_log/backend/pkg/logger"
)

type NotificationService struct {
	repo     repository.Notification
	most     *most.MostService
	graphite Graphite
}

type NotificationDeps struct {
	Repo     repository.Notification
	Most     *most.MostService
	Graphite Graphite
}

func NewNotificationService(deps *NotificationDeps) *NotificationService {
	return &NotificationService{
		repo:     deps.Repo,
		most:     deps.Most,
		graphite: deps.Graphite,
	}
}

type Notification interface {
	SendOverdue() error
	GetByRealm(ctx context.Context, req *models.GetNotificationByRealmDTO) ([]*models.Notification, error)
	Create(ctx context.Context, dto *models.NotificationDTO) error
	Update(ctx context.Context, dto *models.NotificationDTO) error
	Delete(ctx context.Context, dto *models.DeleteNotificationDTO) error
}

func (s *NotificationService) SendOverdue() error {
	logger.Info("SendOverdue was started")

	data, err := s.graphite.GetOverdue(context.Background(), &models.GetOverdueDTO{})
	if err != nil {
		return err
	}
	nots, err := s.repo.Get(context.Background(), &models.GetNotificationDTO{Type: "overdue"})
	if err != nil {
		return err
	}

	if len(data) == 0 || len(nots) == 0 {
		return nil
	}

	dataByRealm := map[string][]*models.Graphite{}
	for _, g := range data {
		if _, ok := dataByRealm[g.RealmId]; !ok {
			dataByRealm[g.RealmId] = []*models.Graphite{}
		}
		dataByRealm[g.RealmId] = append(dataByRealm[g.RealmId], g)
	}

	if len(dataByRealm) == 0 {
		return nil
	}

	title := "У графита истекает срок годности"
	tableHead := "| Наименование в 1С | Регистрационный № | Дата производства | Дата истечения срока годности |"
	tableAlign := "|:--|:--|:--|:--|"

	for _, u := range nots {
		dto := &models.CreatePostDTO{
			UserId:    u.MostId,
			ChannelId: u.ChannelId,
		}

		table := []string{tableHead, tableAlign}

		for _, g := range dataByRealm[u.RealmId] {
			expiryDate := g.ProductionDate.AddDate(0, g.ExpiresIn, 0)
			if g.DateOfExtending.Year() > 2000 {
				expiryDate = g.DateOfExtending.AddDate(0, g.PeriodOfExtending, 0)
			}

			table = append(table, fmt.Sprintf("| %s | %s | %s | %s |",
				g.Name,
				g.RegNumber,
				g.ProductionDate.Format("02.01.2006"),
				expiryDate.Format("02.01.2006"),
			))
		}
		dto.Message = fmt.Sprintf("#### %s\n%s", title, strings.Join(table, "\n"))

		if err := s.most.Post.Create(context.Background(), dto); err != nil {
			return err
		}
	}

	ids := []string{}
	for _, g := range data {
		ids = append(ids, g.Id)
	}
	if err := s.graphite.SetIsOverdue(context.Background(), ids); err != nil {
		return err
	}

	return nil
}

func (s *NotificationService) GetByRealm(ctx context.Context, req *models.GetNotificationByRealmDTO) ([]*models.Notification, error) {
	data, err := s.repo.GetByRealm(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications by realm. error: %w", err)
	}
	return data, nil
}

func (s *NotificationService) Create(ctx context.Context, dto *models.NotificationDTO) error {
	if err := s.repo.Create(ctx, dto); err != nil {
		return fmt.Errorf("failed to create notification. error: %w", err)
	}
	return nil
}

func (s *NotificationService) Update(ctx context.Context, dto *models.NotificationDTO) error {
	if err := s.repo.Update(ctx, dto); err != nil {
		return fmt.Errorf("failed to update notification. error: %w", err)
	}
	return nil
}

func (s *NotificationService) Delete(ctx context.Context, dto *models.DeleteNotificationDTO) error {
	if err := s.repo.Delete(ctx, dto); err != nil {
		return fmt.Errorf("failed to delete notification. error: %w", err)
	}
	return nil
}
