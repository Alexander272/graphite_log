package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository"
)

type IssuanceService struct {
	repo     repository.IssuanceForProd
	graphite Graphite
	changes  Changes
}

func NewIssuanceService(repo repository.IssuanceForProd, graphite Graphite, changes Changes) *IssuanceService {
	return &IssuanceService{
		repo:     repo,
		graphite: graphite,
		changes:  changes,
	}
}

type IssuanceForProd interface {
	Get(ctx context.Context, req *models.GetIssuanceForProdDTO) ([]*models.IssuanceForProd, error)
	GetLast(ctx context.Context, req *models.GetIssuanceForProdDTO) (*models.IssuanceForProd, error)
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

func (s *IssuanceService) GetLast(ctx context.Context, req *models.GetIssuanceForProdDTO) (*models.IssuanceForProd, error) {
	data, err := s.repo.GetLast(ctx, req)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get last issuances. error: %w", err)
	}
	return data, nil
}

func (s *IssuanceService) GetById(ctx context.Context, req *models.GetIssuanceByIdDTO) (*models.IssuanceForProd, error) {
	data, err := s.repo.GetById(ctx, req)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get issuance by id. error: %w", err)
	}
	return data, nil
}

func (s *IssuanceService) Create(ctx context.Context, dto *models.IssuanceForProdDTO) error {
	cnd, err := s.GetLast(ctx, &models.GetIssuanceForProdDTO{GraphiteId: dto.GraphiteId})
	if err != nil && !errors.Is(err, models.ErrNoRows) {
		return err
	}

	if cnd != nil && cnd.IsFull && dto.Type != "return" {
		return models.ErrWasIssued
	}

	if err := s.repo.Create(ctx, dto); err != nil {
		return fmt.Errorf("failed to create issuances. error: %w", err)
	}

	if dto.IsFull || dto.Type == "return" {
		if err := s.graphite.SetIssued(ctx, &models.SetGraphiteIssuedDTO{Id: dto.GraphiteId, Place: dto.Place}); err != nil {
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
	cnd, err := s.GetById(ctx, &models.GetIssuanceByIdDTO{Id: dto.Id})
	if err != nil {
		return err
	}

	changedDto := &models.NewChangeDTO{
		UserId:   dto.UserId,
		UserName: dto.UserName,
		Section:  "issuance",
		ValueId:  dto.GraphiteId,
		Original: cnd,
		Changed:  dto,
	}
	if err := s.changes.AddChange(ctx, changedDto); err != nil {
		return err
	}

	if err := s.repo.Update(ctx, dto); err != nil {
		return fmt.Errorf("failed to update issuances. error: %w", err)
	}
	return nil
}

func (s *IssuanceService) Delete(ctx context.Context, dto *models.DelIssuanceForProdDTO) error {
	cnd, err := s.GetById(ctx, &models.GetIssuanceByIdDTO{Id: dto.Id})
	if err != nil {
		return err
	}

	changedDto := &models.NewChangeDTO{
		UserId:   dto.UserId,
		UserName: dto.UserName,
		Section:  "issuance",
		ValueId:  dto.GraphiteId,
		Original: cnd,
		Changed:  "",
	}
	if err := s.changes.AddChange(ctx, changedDto); err != nil {
		return err
	}

	if err := s.repo.Delete(ctx, dto); err != nil {
		return fmt.Errorf("failed to delete issuances. error: %w", err)
	}
	return nil
}
