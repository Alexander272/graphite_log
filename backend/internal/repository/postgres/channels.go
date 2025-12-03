package postgres

import (
	"context"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type ChannelRepo struct {
	db *sqlx.DB
}

func NewChannelRepo(db *sqlx.DB) *ChannelRepo {
	return &ChannelRepo{db: db}
}

type Channels interface {
	Get(ctx context.Context, req *models.GetChannelsDTO) ([]*models.Channel, error)
	Create(ctx context.Context, dto *models.ChannelDTO) error
	Update(ctx context.Context, dto *models.ChannelDTO) error
	Delete(ctx context.Context, dto *models.ChannelDTO) error
}

func (r *ChannelRepo) Get(ctx context.Context, req *models.GetChannelsDTO) ([]*models.Channel, error) {
	condition := ""
	params := []interface{}{}
	if req.Type != "" {
		condition = "WHERE type=$1"
		params = append(params, req.Type)
	}

	query := fmt.Sprintf(`SELECT id, name, type, channel_id FROM %s %s ORDER BY type, name`,
		ChannelsTable, condition,
	)
	data := []*models.Channel{}

	if err := r.db.SelectContext(ctx, &data, query, params...); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *ChannelRepo) Create(ctx context.Context, dto *models.ChannelDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, name, type, channel_id) 
		VALUES (:id, :name, :type, :channel_id)`,
		ChannelsTable,
	)
	dto.Id = uuid.NewString()

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ChannelRepo) Update(ctx context.Context, dto *models.ChannelDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET name=:name, type=:type, channel_id=:channel_id, updated_at=now() 
		WHERE id=:id`,
		ChannelsTable,
	)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ChannelRepo) Delete(ctx context.Context, dto *models.ChannelDTO) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=:id`, ChannelsTable)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
