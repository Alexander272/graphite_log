package postgres

import (
	"context"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type ExtendingRepo struct {
	db *sqlx.DB
}

func NewExtendingRepo(db *sqlx.DB) *ExtendingRepo {
	return &ExtendingRepo{db: db}
}

type Extending interface {
	GetByGraphiteId(ctx context.Context, graphiteId string) ([]*models.Extending, error)
	Create(ctx context.Context, dto *models.ExtendingDTO) error
	Update(ctx context.Context, dto *models.ExtendingDTO) error
	Delete(ctx context.Context, dto *models.DeleteExtendingDTO) error
}

func (r *ExtendingRepo) GetByGraphiteId(ctx context.Context, graphiteId string) ([]*models.Extending, error) {
	query := fmt.Sprintf(`SELECT id, act, date_of_extending, period_of_extending FROM %s WHERE graphite_id=$1 
		ORDER BY date_of_extending DESC`,
		ExtendingTable,
	)
	extending := []*models.Extending{}

	if err := r.db.SelectContext(ctx, &extending, query, graphiteId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return extending, nil
}

func (r *ExtendingRepo) Create(ctx context.Context, dto *models.ExtendingDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, graphite_id, act, date_of_extending, period_of_extending) VALUES 
		(:id, :graphite_id, :act, :date_of_extending, :period_of_extending)`, ExtendingTable,
	)
	dto.Id = uuid.NewString()

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ExtendingRepo) Update(ctx context.Context, dto *models.ExtendingDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET act=:act, date_of_extending=:date_of_extending, 
		period_of_extending=:period_of_extending WHERE id=:id`,
		ExtendingTable,
	)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ExtendingRepo) Delete(ctx context.Context, dto *models.DeleteExtendingDTO) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=:id`, ExtendingTable)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
