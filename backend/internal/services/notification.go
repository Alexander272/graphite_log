package services

import (
	"context"
	"fmt"
	"strings"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository"
	"github.com/Alexander272/graphite_log/backend/internal/services/most"
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
}

func (s *NotificationService) SendOverdue() error {
	data, err := s.graphite.GetOverdue(context.Background(), &models.GetOverdueDTO{})
	if err != nil {
		return err
	}
	users, err := s.repo.GetAll(context.Background())
	if err != nil {
		return err
	}

	if len(data) == 0 || len(users) == 0 {
		return nil
	}

	dataByRealm := map[string][]*models.Graphite{}
	for _, g := range data {
		if _, ok := dataByRealm[g.RealmId]; !ok {
			dataByRealm[g.RealmId] = []*models.Graphite{}
		}
		dataByRealm[g.RealmId] = append(dataByRealm[g.RealmId], g)
	}

	title := "#### У графита истекает срок годности\n"
	tableHead := "| Наименование в 1С | Партия поставщика | № б/б поставщика | Регистрационный № | Дата окончания |"

	for _, u := range users {
		dto := &models.CreatePostDTO{
			UserId:    u.MostId,
			ChannelId: u.ChannelId,
		}

		table := []string{tableHead}

		for _, g := range dataByRealm[u.RealmId] {
			table = append(table, fmt.Sprintf("| %s | %s | %s | %s | %s |\n",
				g.Name,
				g.SupplierBatch,
				g.BigBagNumber,
				g.RegNumber,
				g.ProductionDate.AddDate(2, 0, 0).Format("02.01.2006"),
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
