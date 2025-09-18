package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository"
	"github.com/Alexander272/graphite_log/backend/internal/utils"
	"github.com/goccy/go-json"
)

type ChangesService struct {
	repo repository.Changes
}

func NewChangesService(repo repository.Changes) *ChangesService {
	return &ChangesService{
		repo: repo,
	}
}

type Changes interface {
	Get(ctx context.Context, req *models.GetChangesDTO) ([]*models.Changes, error)
	AddChange(ctx context.Context, dto *models.NewChangeDTO) error
	Create(ctx context.Context, dto *models.ChangesDTO) error
}

func (s *ChangesService) Get(ctx context.Context, req *models.GetChangesDTO) ([]*models.Changes, error) {
	data, err := s.repo.Get(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get changes. error: %w", err)
	}
	return data, nil
}

func (s *ChangesService) AddChange(ctx context.Context, dto *models.NewChangeDTO) error {
	equal := false
	fields := []string{}

	or, ok := dto.Original.(string)
	if ok {
		ch, ok := dto.Changed.(string)
		if ok {
			equal = or == ch
		}
	}

	if dto.Changed != "" && !ok {
		var err error
		equal, fields, err = utils.IsEqualStructs(dto.Original, dto.Changed)
		if err != nil {
			return err
		}
	}

	if !equal {
		if ok {
			dto.Original = map[string]string{dto.Section: dto.Original.(string)}
			dto.Changed = map[string]string{dto.Section: dto.Changed.(string)}
		}
		original, errOr := json.Marshal(dto.Original)
		changed, errCh := json.Marshal(dto.Changed)
		if errOr != nil || errCh != nil {
			return fmt.Errorf("failed to marshal json. errorOriginal: %w, errorChanges: %w", errOr, errCh)
		}

		ChangesDto := &models.ChangesDTO{
			RealmId:       dto.RealmId,
			UserId:        dto.UserId,
			UserName:      dto.UserName,
			Section:       dto.Section,
			ValueId:       dto.ValueId,
			Original:      string(original),
			Changed:       string(changed),
			ChangedFields: fields,
		}
		if err := s.Create(ctx, ChangesDto); err != nil {
			return err
		}
	}
	return nil
}

func (s *ChangesService) Create(ctx context.Context, dto *models.ChangesDTO) error {
	if err := s.repo.Create(ctx, dto); err != nil {
		return fmt.Errorf("failed to create Changes. error: %w", err)
	}
	return nil
}
