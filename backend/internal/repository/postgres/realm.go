package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type RealmRepo struct {
	db *sqlx.DB
}

func NewRealmRepo(db *sqlx.DB) *RealmRepo {
	return &RealmRepo{db: db}
}

type Realm interface {
	Get(ctx context.Context, req *models.GetRealmsDTO) ([]*models.Realm, error)
	GetById(ctx context.Context, req *models.GetRealmByIdDTO) (*models.Realm, error)
	GetByUser(ctx context.Context, req *models.GetRealmByUserDTO) ([]*models.Realm, error)
	Create(ctx context.Context, dto *models.RealmDTO) error
	Update(ctx context.Context, dto *models.RealmDTO) error
	Delete(ctx context.Context, dto *models.DeleteRealmDTO) error
}

func (r *RealmRepo) Get(ctx context.Context, req *models.GetRealmsDTO) ([]*models.Realm, error) {
	condition := "WHERE is_active=true"
	if req.All {
		condition = ""
	}

	query := fmt.Sprintf(`SELECT id, name, realm, is_active, created_at	FROM %s %s ORDER BY created_at`,
		RealmTable, condition,
	)
	data := []*models.Realm{}

	if err := r.db.SelectContext(ctx, &data, query); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *RealmRepo) GetByUser(ctx context.Context, req *models.GetRealmByUserDTO) ([]*models.Realm, error) {
	query := fmt.Sprintf(`SELECT r.id, name, realm, is_active, created_at FROM %s AS r
		LEFT JOIN LATERAL (SELECT a.id FROM %s AS a INNER JOIN %s AS u ON a.user_id=u.id WHERE sso_id=$1 AND realm_id=r.id) AS a ON true
		WHERE a.id IS NOT NULL ORDER BY created_at`,
		RealmTable, AccessTable, UserTable,
	)
	data := []*models.Realm{}

	if err := r.db.SelectContext(ctx, &data, query, req.UserId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *RealmRepo) GetById(ctx context.Context, req *models.GetRealmByIdDTO) (*models.Realm, error) {
	query := fmt.Sprintf(`SELECT id, name, realm, is_active, created_at FROM %s WHERE id=$1`,
		RealmTable,
	)
	data := &models.Realm{}

	if err := r.db.GetContext(ctx, data, query, req.Id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *RealmRepo) Create(ctx context.Context, dto *models.RealmDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, name, realm, is_active)
		VALUES (:id, :name, :realm, :is_active)`,
		RealmTable,
	)
	dto.Id = uuid.NewString()

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *RealmRepo) Update(ctx context.Context, dto *models.RealmDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET name=:name, is_active=:is_active WHERE id=:id`,
		RealmTable,
	)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *RealmRepo) Delete(ctx context.Context, dto *models.DeleteRealmDTO) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=:id`, RealmTable)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
