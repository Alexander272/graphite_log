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

type IssuanceRepo struct {
	db *sqlx.DB
}

func NewIssuanceRepo(db *sqlx.DB) *IssuanceRepo {
	return &IssuanceRepo{db: db}
}

type IssuanceForProd interface {
	Get(ctx context.Context, req *models.GetIssuanceForProdDTO) ([]*models.IssuanceForProd, error)
	GetLast(ctx context.Context, req *models.GetIssuanceForProdDTO) (*models.IssuanceForProd, error)
	GetById(ctx context.Context, req *models.GetIssuanceByIdDTO) (*models.IssuanceForProd, error)
	Create(ctx context.Context, dto *models.IssuanceForProdDTO) error
	CreateSeveral(ctx context.Context, dto []*models.IssuanceForProdDTO) error
	Update(ctx context.Context, dto *models.IssuanceForProdDTO) error
	Delete(ctx context.Context, dto *models.DelIssuanceForProdDTO) error
}

func (r *IssuanceRepo) Get(ctx context.Context, req *models.GetIssuanceForProdDTO) ([]*models.IssuanceForProd, error) {
	query := fmt.Sprintf(`SELECT id, graphite_id, issuance_date, user_id, is_full, amount, type FROM %s 
		WHERE graphite_id=$1 ORDER BY issuance_date DESC`,
		IssuanceTable,
	)
	data := []*models.IssuanceForProd{}

	if err := r.db.SelectContext(ctx, &data, query, req.GraphiteId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *IssuanceRepo) GetLast(ctx context.Context, req *models.GetIssuanceForProdDTO) (*models.IssuanceForProd, error) {
	query := fmt.Sprintf(`SELECT id, graphite_id, issuance_date, user_id, is_full, amount, type FROM %s 
		WHERE graphite_id=$1 ORDER BY issuance_date DESC LIMIT 1`,
		IssuanceTable,
	)
	data := &models.IssuanceForProd{}

	if err := r.db.GetContext(ctx, data, query, req.GraphiteId); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *IssuanceRepo) GetById(ctx context.Context, req *models.GetIssuanceByIdDTO) (*models.IssuanceForProd, error) {
	query := fmt.Sprintf(`SELECT id, graphite_id, issuance_date, user_id, is_full, amount, type FROM %s 
		WHERE id=$1`,
		IssuanceTable,
	)
	data := &models.IssuanceForProd{}

	if err := r.db.GetContext(ctx, data, query, req.Id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *IssuanceRepo) Create(ctx context.Context, dto *models.IssuanceForProdDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, graphite_id, issuance_date, user_id, is_full, amount, type) VALUES 
		(:id, :graphite_id, :issuance_date, :user_id, :is_full, :amount, :type)`,
		IssuanceTable,
	)
	dto.Id = uuid.NewString()

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *IssuanceRepo) CreateSeveral(ctx context.Context, dto []*models.IssuanceForProdDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, graphite_id, issuance_date, user_id, is_full, amount, type) VALUES 
		(:id, :graphite_id, :issuance_date, :user_id, :is_full, :amount, :type)`,
		IssuanceTable,
	)
	for i := range dto {
		dto[i].Id = uuid.NewString()
	}

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *IssuanceRepo) Update(ctx context.Context, dto *models.IssuanceForProdDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET graphite_id=:graphite_id, issuance_date=:issuance_date, 
		user_id=:user_id, is_full=:is_full, amount=:amount, type=:type WHERE id=:id`,
		IssuanceTable,
	)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *IssuanceRepo) Delete(ctx context.Context, dto *models.DelIssuanceForProdDTO) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=:id`, IssuanceTable)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
