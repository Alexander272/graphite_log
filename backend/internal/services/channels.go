package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository"
)

type ChannelsService struct {
	repo repository.Channels
}

func NewChannelsService(repo repository.Channels) *ChannelsService {
	return &ChannelsService{repo: repo}
}

type Channels interface {
	Get(ctx context.Context, req *models.GetChannelsDTO) ([]*models.Channel, error)
	Create(ctx context.Context, dto *models.ChannelDTO) error
	Update(ctx context.Context, dto *models.ChannelDTO) error
	Delete(ctx context.Context, dto *models.ChannelDTO) error
}

func (s *ChannelsService) Get(ctx context.Context, req *models.GetChannelsDTO) ([]*models.Channel, error) {
	data, err := s.repo.Get(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get channels. error: %w", err)
	}
	return data, nil
}

func (s *ChannelsService) Create(ctx context.Context, dto *models.ChannelDTO) error {
	if err := s.repo.Create(ctx, dto); err != nil {
		return fmt.Errorf("failed to create channel. error: %w", err)
	}
	return nil
}

func (s *ChannelsService) Update(ctx context.Context, dto *models.ChannelDTO) error {
	if err := s.repo.Update(ctx, dto); err != nil {
		return fmt.Errorf("failed to update channel. error: %w", err)
	}
	return nil
}

func (s *ChannelsService) Delete(ctx context.Context, dto *models.ChannelDTO) error {
	if err := s.repo.Delete(ctx, dto); err != nil {
		return fmt.Errorf("failed to delete channel. error: %w", err)
	}
	return nil
}
