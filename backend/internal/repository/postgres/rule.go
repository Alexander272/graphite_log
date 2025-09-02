package postgres

import (
	"context"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type RuleRepo struct {
	db *sqlx.DB
}

func NewRuleRepo(db *sqlx.DB) *RuleRepo {
	return &RuleRepo{
		db: db,
	}
}

type Rule interface {
	GetAll(context.Context) ([]*models.Rule, error)
	Create(context.Context, *models.RuleDTO) error
	Update(context.Context, *models.RuleDTO) error
	Delete(context.Context, string) error
}

func (r *RuleRepo) GetAll(ctx context.Context) ([]*models.Rule, error) {
	query := fmt.Sprintf(`SELECT m.id, r.name, role_id, rule_item_id, i.name AS item_name, i.method
		FROM %s AS m INNER JOIN %s AS r ON role_id=r.id INNER JOIN %s AS i ON i.id=rule_item_id ORDER BY level`,
		RuleTable, RoleTable, RuleItemTable,
	)

	var Rule []*models.Rule
	if err := r.db.SelectContext(ctx, &Rule, query); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return Rule, nil
}

func (r *RuleRepo) Create(ctx context.Context, Rule *models.RuleDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, role_id, rule_item_id) VALUES ($1, $2, $3)`, RuleTable)
	id := uuid.New()

	_, err := r.db.ExecContext(ctx, query, id, Rule.RoleId, Rule.RuleItemId)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *RuleRepo) Update(ctx context.Context, Rule *models.RuleDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET role_id=$1, rule_item_id=$2 WHERE id=$3`, RuleTable)

	_, err := r.db.ExecContext(ctx, query, Rule.RoleId, Rule.RuleItemId, Rule.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *RuleRepo) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=$1`, RuleTable)

	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
