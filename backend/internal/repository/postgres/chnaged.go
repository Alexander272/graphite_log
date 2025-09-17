package postgres

import (
	"context"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository/postgres/pq_models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type ChannelRepo struct {
	db *sqlx.DB
}

func NewChangedRepo(db *sqlx.DB) *ChannelRepo {
	return &ChannelRepo{
		db: db,
	}
}

type Changed interface {
	Create(ctx context.Context, dto *models.ChangedDTO) error
}

func (r *ChannelRepo) Create(ctx context.Context, dto *models.ChangedDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, realm_id, user_id, user_name, section, value_id, original, changed, changed_fields) VALUES 
		(:id, :realm_id, :user_id, :user_name, :section, :value_id, :original, :changed, :changed_fields)`,
		ChangedTable,
	)
	dto.Id = uuid.NewString()

	tmp := pq_models.ChangedDTO{
		Id:            dto.Id,
		RealmId:       dto.RealmId,
		UserId:        dto.UserId,
		UserName:      dto.UserName,
		Section:       dto.Section,
		ValueId:       dto.ValueId,
		Original:      dto.Original,
		Changed:       dto.Changed,
		ChangedFields: pq.StringArray(dto.ChangedFields),
	}

	if _, err := r.db.NamedExecContext(ctx, query, tmp); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
