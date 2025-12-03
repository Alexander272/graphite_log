package postgres

import (
	"context"
	"fmt"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type NotificationRepo struct {
	db *sqlx.DB
}

func NewNotificationRepo(db *sqlx.DB) *NotificationRepo {
	return &NotificationRepo{db: db}
}

type Notification interface {
	Get(ctx context.Context, req *models.GetNotificationDTO) ([]*models.Notification, error)
	GetByRealm(ctx context.Context, dto *models.GetNotificationByRealmDTO) ([]*models.Notification, error)
	Create(ctx context.Context, dto *models.NotificationDTO) error
	Update(ctx context.Context, dto *models.NotificationDTO) error
	Delete(ctx context.Context, dto *models.DeleteNotificationDTO) error
}

func (r *NotificationRepo) Get(ctx context.Context, req *models.GetNotificationDTO) ([]*models.Notification, error) {
	query := fmt.Sprintf(`SELECT id, realm_id, notification_type, most_id, channel_id FROM %s 
		WHERE notification_type=$1 ORDER BY realm_id`,
		NotificationTable,
	)
	data := []*models.Notification{}

	if err := r.db.SelectContext(ctx, &data, query, req.Type); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *NotificationRepo) GetByRealm(ctx context.Context, dto *models.GetNotificationByRealmDTO) ([]*models.Notification, error) {
	query := fmt.Sprintf(`SELECT id, notification_type, most_id, channel_id FROM %s WHERE realm_id=$1 ORDER BY notification_type, most_id`,
		NotificationTable,
	)
	data := []*models.Notification{}

	if err := r.db.SelectContext(ctx, &data, query, dto.RealmId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *NotificationRepo) Create(ctx context.Context, dto *models.NotificationDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, realm_id, notification_type, most_id, channel_id) 
		VALUES (:id, :realm_id, :notification_type, :most_id, :channel_id)`,
		NotificationTable,
	)
	dto.Id = uuid.NewString()

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *NotificationRepo) Update(ctx context.Context, dto *models.NotificationDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET notification_type=:notification_type, most_id=:most_id, 
		channel_id=:channel_id WHERE id=:id`,
		NotificationTable,
	)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *NotificationRepo) Delete(ctx context.Context, dto *models.DeleteNotificationDTO) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=:id`, NotificationTable)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
