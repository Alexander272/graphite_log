package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository"
)

type ExtendingService struct {
	repo     repository.Extending
	graphite Graphite
	changed  Changed
}

func NewExtendingService(repo repository.Extending, graphite Graphite, changed Changed) *ExtendingService {
	return &ExtendingService{
		repo:     repo,
		graphite: graphite,
		changed:  changed,
	}
}

type Extending interface {
	GetById(ctx context.Context, req *models.GetExtendingByIdDTO) (*models.Extending, error)
	GetByGraphiteId(ctx context.Context, graphiteId string) ([]*models.Extending, error)
	Create(ctx context.Context, dto *models.ExtendingDTO) error
	CreateSeveral(ctx context.Context, dto []*models.ExtendingDTO) error
	Update(ctx context.Context, dto *models.ExtendingDTO) error
	Delete(ctx context.Context, dto *models.DeleteExtendingDTO) error
}

func (s *ExtendingService) GetById(ctx context.Context, req *models.GetExtendingByIdDTO) (*models.Extending, error) {
	extending, err := s.repo.GetById(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get extending by id. error: %w", err)
	}
	return extending, nil
}

func (s *ExtendingService) GetByGraphiteId(ctx context.Context, graphiteId string) ([]*models.Extending, error) {
	extending, err := s.repo.GetByGraphiteId(ctx, graphiteId)
	if err != nil {
		return nil, fmt.Errorf("failed to get extending by graphite id. error: %w", err)
	}
	return extending, nil
}

func (s *ExtendingService) Create(ctx context.Context, dto *models.ExtendingDTO) error {
	if err := s.repo.Create(ctx, dto); err != nil {
		return fmt.Errorf("failed to create extending. error: %w", err)
	}

	if err := s.graphite.ClearIsOverdue(ctx, dto.GraphiteId); err != nil {
		return fmt.Errorf("failed to set is overdue. error: %w", err)
	}

	return nil
}

func (s *ExtendingService) CreateSeveral(ctx context.Context, dto []*models.ExtendingDTO) error {
	if len(dto) == 0 {
		return nil
	}

	if err := s.repo.CreateSeveral(ctx, dto); err != nil {
		return fmt.Errorf("failed to create several extending. error: %w", err)
	}
	return nil
}

func (s *ExtendingService) Update(ctx context.Context, dto *models.ExtendingDTO) error {
	cnd, err := s.GetById(ctx, &models.GetExtendingByIdDTO{Id: dto.Id})
	if err != nil {
		return err
	}

	changedDto := &models.NewChangeDTO{
		RealmId:  dto.RealmId,
		UserId:   dto.UserId,
		UserName: dto.UserName,
		Section:  "extending",
		ValueId:  dto.Id,
		Original: cnd,
		Changed:  dto,
	}
	if err := s.changed.AddChange(ctx, changedDto); err != nil {
		return err
	}

	if err := s.repo.Update(ctx, dto); err != nil {
		return fmt.Errorf("failed to update extending. error: %w", err)
	}
	return nil
}

func (s *ExtendingService) Delete(ctx context.Context, dto *models.DeleteExtendingDTO) error {
	cnd, err := s.GetById(ctx, &models.GetExtendingByIdDTO{Id: dto.Id})
	if err != nil {
		return err
	}

	changedDto := &models.NewChangeDTO{
		RealmId:  dto.RealmId,
		UserId:   dto.UserId,
		UserName: dto.UserName,
		Section:  "extending",
		ValueId:  dto.Id,
		Original: cnd,
		Changed:  "",
	}
	if err := s.changed.AddChange(ctx, changedDto); err != nil {
		return err
	}

	if err := s.repo.Delete(ctx, dto); err != nil {
		return fmt.Errorf("failed to delete extending. error: %w", err)
	}
	return nil
}
