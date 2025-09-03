package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository"
)

type ExtendingService struct {
	repo repository.Extending
}

func NewExtendingService(repo repository.Extending) *ExtendingService {
	return &ExtendingService{repo: repo}
}

type Extending interface {
	GetByGraphiteId(ctx context.Context, graphiteId string) ([]*models.Extending, error)
	Create(ctx context.Context, dto *models.ExtendingDTO) error
	Update(ctx context.Context, dto *models.ExtendingDTO) error
	Delete(ctx context.Context, dto *models.DeleteExtendingDTO) error
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

	return nil
}

func (s *ExtendingService) Update(ctx context.Context, dto *models.ExtendingDTO) error {
	if err := s.repo.Update(ctx, dto); err != nil {
		return fmt.Errorf("failed to update extending. error: %w", err)
	}
	return nil
}

func (s *ExtendingService) Delete(ctx context.Context, dto *models.DeleteExtendingDTO) error {
	if err := s.repo.Delete(ctx, dto); err != nil {
		return fmt.Errorf("failed to delete extending. error: %w", err)
	}
	return nil
}
