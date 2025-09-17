package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository"
	"github.com/Alexander272/graphite_log/backend/internal/utils"
	"github.com/goccy/go-json"
)

type ChangedService struct {
	repo repository.Changed
}

func NewChangedService(repo repository.Changed) *ChangedService {
	return &ChangedService{
		repo: repo,
	}
}

type Changed interface {
	AddChange(ctx context.Context, dto *models.NewChangeDTO) error
	Create(ctx context.Context, dto *models.ChangedDTO) error
}

func (s *ChangedService) AddChange(ctx context.Context, dto *models.NewChangeDTO) error {
	equal := false
	fields := []string{}

	if dto.Changed != "" {
		var err error
		equal, fields, err = utils.IsEqualStructs(dto.Original, dto.Changed)
		if err != nil {
			return err
		}
	}

	if !equal {
		original, errOr := json.Marshal(dto.Original)
		changed, errCh := json.Marshal(dto.Changed)
		if errOr != nil || errCh != nil {
			return fmt.Errorf("failed to marshal json. errorOriginal: %w, errorChanged: %w", errOr, errCh)
		}

		changedDto := &models.ChangedDTO{
			RealmId:       dto.RealmId,
			UserId:        dto.UserId,
			UserName:      dto.UserName,
			Section:       dto.Section,
			ValueId:       dto.ValueId,
			Original:      string(original),
			Changed:       string(changed),
			ChangedFields: fields,
		}
		if err := s.Create(ctx, changedDto); err != nil {
			return err
		}
	}
	return nil
}

func (s *ChangedService) Create(ctx context.Context, dto *models.ChangedDTO) error {
	if err := s.repo.Create(ctx, dto); err != nil {
		return fmt.Errorf("failed to create changed. error: %w", err)
	}
	return nil
}
