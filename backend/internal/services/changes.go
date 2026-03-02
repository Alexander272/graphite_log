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
	AddChanges(ctx context.Context, dto []*models.NewChangeDTO) error
	Create(ctx context.Context, dto *models.ChangesDTO) error
}

func (s *ChangesService) Get(ctx context.Context, req *models.GetChangesDTO) ([]*models.Changes, error) {
	data, err := s.repo.Get(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get changes. error: %w", err)
	}
	return data, nil
}

// Вспомогательная функция, которая готовит данные, но не пишет в базу
func (s *ChangesService) prepareChangeModel(dto *models.NewChangeDTO) (*models.ChangesDTO, error) {
	var (
		equal  bool
		fields []string
		err    error
	)

	orStr, orIsStr := dto.Original.(string)
	chStr, chIsStr := dto.Changed.(string)

	if orIsStr && chIsStr {
		equal = orStr == chStr
		if !equal {
			dto.Original = map[string]string{dto.Section: orStr}
			dto.Changed = map[string]string{dto.Section: chStr}
		}
	} else if dto.Changed != nil && dto.Changed != "" {
		equal, fields, err = utils.IsEqualStructs(dto.Original, dto.Changed)
		if err != nil {
			return nil, err
		}
	}

	if equal {
		return nil, nil // Изменений нет
	}

	originalJSON, errOr := json.Marshal(dto.Original)
	changedJSON, errCh := json.Marshal(dto.Changed)
	if errOr != nil || errCh != nil {
		return nil, fmt.Errorf("failed to marshal json: %v %v", errOr, errCh)
	}

	return &models.ChangesDTO{
		RealmId:       dto.RealmId,
		UserId:        dto.UserId,
		UserName:      dto.UserName,
		Section:       dto.Section,
		ValueId:       dto.ValueId,
		Original:      string(originalJSON),
		Changed:       string(changedJSON),
		ChangedFields: fields,
	}, nil
}
func (s *ChangesService) AddChange(ctx context.Context, dto *models.NewChangeDTO) error {
	changeModel, err := s.prepareChangeModel(dto)
	if err != nil {
		return err
	}

	if changeModel != nil {
		if err := s.Create(ctx, changeModel); err != nil {
			return fmt.Errorf("failed to save change: %w", err)
		}
	}
	return nil
}

func (s *ChangesService) AddChanges(ctx context.Context, dto []*models.NewChangeDTO) error {
	if len(dto) == 0 {
		return nil
	}
	changesToCreate := make([]*models.ChangesDTO, 0, len(dto))

	for _, dto := range dto {
		changeModel, err := s.prepareChangeModel(dto)
		if err != nil {
			return err
		}

		if changeModel != nil {
			changesToCreate = append(changesToCreate, changeModel)
		}
	}

	if len(changesToCreate) > 0 {
		if err := s.CreateSeveral(ctx, changesToCreate); err != nil {
			return fmt.Errorf("failed to bulk create changes: %w", err)
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

func (s *ChangesService) CreateSeveral(ctx context.Context, dto []*models.ChangesDTO) error {
	if err := s.repo.CreateSeveral(ctx, dto); err != nil {
		return fmt.Errorf("failed to create several Changes. error: %w", err)
	}
	return nil
}
