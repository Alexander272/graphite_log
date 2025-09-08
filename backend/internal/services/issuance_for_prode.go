package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository"
)

type IssuanceService struct {
	repo     repository.IssuanceForProd
	graphite Graphite
}

func NewIssuanceService(repo repository.IssuanceForProd, graphite Graphite) *IssuanceService {
	return &IssuanceService{
		repo:     repo,
		graphite: graphite,
	}
}

type IssuanceForProd interface {
	Get(ctx context.Context, req *models.GetIssuanceForProdDTO) ([]*models.IssuanceForProd, error)
	Create(ctx context.Context, dto *models.IssuanceForProdDTO) error
	CreateSeveral(ctx context.Context, dto []*models.IssuanceForProdDTO) error
	Update(ctx context.Context, dto *models.IssuanceForProdDTO) error
	Delete(ctx context.Context, dto *models.DelIssuanceForProdDTO) error
}

func (s *IssuanceService) Get(ctx context.Context, req *models.GetIssuanceForProdDTO) ([]*models.IssuanceForProd, error) {
	data, err := s.repo.Get(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get issuances. error: %w", err)
	}
	return data, nil
}

func (s *IssuanceService) Create(ctx context.Context, dto *models.IssuanceForProdDTO) error {
	if err := s.repo.Create(ctx, dto); err != nil {
		return fmt.Errorf("failed to create issuances. error: %w", err)
	}

	if dto.IsFull {
		if err := s.graphite.SetIssued(ctx, &models.SetGraphiteIssuedDTO{Id: dto.GraphiteId}); err != nil {
			return err
		}
	}
	return nil
}

func (s *IssuanceService) CreateSeveral(ctx context.Context, dto []*models.IssuanceForProdDTO) error {
	if len(dto) == 0 {
		return nil
	}

	if err := s.repo.CreateSeveral(ctx, dto); err != nil {
		return fmt.Errorf("failed to create several issuances. error: %w", err)
	}
	return nil
}

func (s *IssuanceService) Update(ctx context.Context, dto *models.IssuanceForProdDTO) error {
	if err := s.repo.Update(ctx, dto); err != nil {
		return fmt.Errorf("failed to update issuances. error: %w", err)
	}
	return nil
}

func (s *IssuanceService) Delete(ctx context.Context, dto *models.DelIssuanceForProdDTO) error {
	if err := s.repo.Delete(ctx, dto); err != nil {
		return fmt.Errorf("failed to delete issuances. error: %w", err)
	}
	return nil
}
