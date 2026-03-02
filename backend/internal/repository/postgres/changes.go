package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository/postgres/pq_models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type ChangesRepo struct {
	db *sqlx.DB
}

func NewChangesRepo(db *sqlx.DB) *ChangesRepo {
	return &ChangesRepo{
		db: db,
	}
}

type Changes interface {
	Get(ctx context.Context, req *models.GetChangesDTO) ([]*models.Changes, error)
	Create(ctx context.Context, dto *models.ChangesDTO) error
	CreateSeveral(ctx context.Context, dto []*models.ChangesDTO) error
}

func (r *ChangesRepo) Get(ctx context.Context, req *models.GetChangesDTO) ([]*models.Changes, error) {
	query := fmt.Sprintf(`SELECT id, user_id, section, value_id, original, changed, changed_fields, created_at,
		CASE WHEN u.last_name IS NOT NULL THEN CONCAT_WS(' ', u.last_name, u.first_name) ELSE user_name END AS user_name
		FROM %s LEFT JOIN LATERAL (SELECT first_name, last_name FROM %s WHERE sso_id=user_id::text) AS u ON true
		WHERE value_id=$1 AND section=$2 ORDER BY created_at DESC`,
		ChangedTable, UserTable,
	)

	var tmp []*pq_models.ChangesDTO
	if err := r.db.SelectContext(ctx, &tmp, query, req.ValueId, req.Section); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	var data []*models.Changes
	for _, v := range tmp {
		data = append(data, &models.Changes{
			Id:            v.Id,
			UserId:        v.UserId,
			UserName:      v.UserName,
			Section:       v.Section,
			ValueId:       v.ValueId,
			Original:      v.Original,
			Changed:       v.Changed,
			ChangedFields: v.ChangedFields,
			Created:       v.Created.Time,
		})
	}
	return data, nil
}

func (r *ChangesRepo) Create(ctx context.Context, dto *models.ChangesDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, user_id, user_name, section, value_id, original, changed, changed_fields) VALUES 
		(:id, :user_id, :user_name, :section, :value_id, :original, :changed, :changed_fields)`,
		ChangedTable,
	)
	dto.Id = uuid.NewString()

	tmp := pq_models.ChangesDTO{
		Id:            dto.Id,
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

func (r *ChangesRepo) CreateSeveral(ctx context.Context, dto []*models.ChangesDTO) error {
	if len(dto) == 0 {
		return nil
	}

	numFields := 8
	args := make([]interface{}, 0, len(dto)*numFields)
	values := make([]string, 0, len(dto))

	for i, item := range dto {
		if item.Id == "" {
			item.Id = uuid.NewString()
		}

		offset := i * numFields
		values = append(values, fmt.Sprintf("($%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d)",
			offset+1, offset+2, offset+3, offset+4, offset+5, offset+6, offset+7, offset+8))

		args = append(args,
			item.Id,
			item.UserId,
			item.UserName,
			item.Section,
			item.ValueId,
			item.Original,
			item.Changed,
			pq.Array(item.ChangedFields),
		)
	}

	// 3. Собираем запрос
	query := fmt.Sprintf(
		"INSERT INTO %s (id, user_id, user_name, section, value_id, original, changed, changed_fields) VALUES %s",
		ChangedTable,
		strings.Join(values, ","),
	)

	if _, err := r.db.ExecContext(ctx, query, args...); err != nil {
		return fmt.Errorf("bulk insert failed: %w", err)
	}
	return nil
}
