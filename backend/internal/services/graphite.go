package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository"
)

type GraphiteService struct {
	repo repository.Graphite
}

func NewGraphiteService(repo repository.Graphite) *GraphiteService {
	return &GraphiteService{repo: repo}
}

type Graphite interface {
	Get(ctx context.Context, req *models.GetGraphiteDTO) ([]*models.Graphite, error)
	GetById(ctx context.Context, req *models.GetGraphiteByIdDTO) (*models.Graphite, error)
	GetUniqueData(ctx context.Context, req *models.GetUniqueDTO) ([]string, error)
	GetOverdue(ctx context.Context, req *models.GetOverdueDTO) ([]*models.Graphite, error)
	Create(ctx context.Context, dto *models.GraphiteDTO) error
	CreateSeveral(ctx context.Context, dto []*models.GraphiteDTO) error
	Update(ctx context.Context, dto *models.GraphiteDTO) error
	SetIssued(ctx context.Context, dto *models.SetGraphiteIssuedDTO) error
	SetPurpose(ctx context.Context, dto *models.SetGraphitePurposeDTO) error
	SetPlace(ctx context.Context, dto *models.SetGraphitePlaceDTO) error
	SetNotes(ctx context.Context, dto *models.SetGraphiteNotesDTO) error
	SetIsOverdue(ctx context.Context, idList []string) error
	ClearIsOverdue(ctx context.Context, id string) error
}

func (s *GraphiteService) Get(ctx context.Context, req *models.GetGraphiteDTO) ([]*models.Graphite, error) {
	data, err := s.repo.Get(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get graphites. error: %w", err)
	}
	return data, nil
}

func (s *GraphiteService) GetById(ctx context.Context, req *models.GetGraphiteByIdDTO) (*models.Graphite, error) {
	data, err := s.repo.GetById(ctx, req)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get graphite by id. error: %w", err)
	}
	return data, nil
}

func (s *GraphiteService) GetUniqueData(ctx context.Context, req *models.GetUniqueDTO) ([]string, error) {
	data, err := s.repo.GetUniqueData(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get unique data. error: %w", err)
	}
	return data, nil
}

func (s *GraphiteService) GetOverdue(ctx context.Context, req *models.GetOverdueDTO) ([]*models.Graphite, error) {
	data, err := s.repo.GetOverdue(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get overdue graphites. error: %w", err)
	}
	return data, nil
}

func (s *GraphiteService) Create(ctx context.Context, dto *models.GraphiteDTO) error {
	if err := s.repo.Create(ctx, dto); err != nil {
		return fmt.Errorf("failed to create graphite. error: %w", err)
	}
	return nil
}

func (s *GraphiteService) CreateSeveral(ctx context.Context, dto []*models.GraphiteDTO) error {
	if err := s.repo.CreateSeveral(ctx, dto); err != nil {
		return fmt.Errorf("failed to create several graphites. error: %w", err)
	}
	return nil
}

func (s *GraphiteService) Update(ctx context.Context, dto *models.GraphiteDTO) error {
	if err := s.repo.Update(ctx, dto); err != nil {
		return fmt.Errorf("failed to update graphite. error: %w", err)
	}
	return nil
}

func (s *GraphiteService) SetIssued(ctx context.Context, dto *models.SetGraphiteIssuedDTO) error {
	if err := s.repo.SetIssued(ctx, dto); err != nil {
		return fmt.Errorf("failed to set graphite issued. error: %w", err)
	}
	return nil
}

func (s *GraphiteService) SetPurpose(ctx context.Context, dto *models.SetGraphitePurposeDTO) error {
	if err := s.repo.SetPurpose(ctx, dto); err != nil {
		return fmt.Errorf("failed to set graphite purpose. error: %w", err)
	}
	return nil
}

func (s *GraphiteService) SetPlace(ctx context.Context, dto *models.SetGraphitePlaceDTO) error {
	if err := s.repo.SetPlace(ctx, dto); err != nil {
		return fmt.Errorf("failed to set graphite place. error: %w", err)
	}
	return nil
}

func (s *GraphiteService) SetNotes(ctx context.Context, dto *models.SetGraphiteNotesDTO) error {
	if err := s.repo.SetNotes(ctx, dto); err != nil {
		return fmt.Errorf("failed to set graphite notes. error: %w", err)
	}
	return nil
}

func (s *GraphiteService) SetIsOverdue(ctx context.Context, idList []string) error {
	if err := s.repo.SetIsOverdue(ctx, idList); err != nil {
		return fmt.Errorf("failed to set is overdue. error: %w", err)
	}
	return nil
}
func (s *GraphiteService) ClearIsOverdue(ctx context.Context, id string) error {
	if err := s.repo.ClearIsOverdue(ctx, id); err != nil {
		return fmt.Errorf("failed to clear is overdue. error: %w", err)
	}
	return nil
}
