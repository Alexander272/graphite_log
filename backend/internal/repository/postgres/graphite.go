package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository/postgres/pq_models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type GraphiteRepo struct {
	db *sqlx.DB
}

func NewGraphiteRepo(db *sqlx.DB) *GraphiteRepo {
	return &GraphiteRepo{db: db}
}

type Graphite interface {
	Get(ctx context.Context, req *models.GetGraphiteDTO) ([]*models.Graphite, error)
	GetById(ctx context.Context, req *models.GetGraphiteByIdDTO) (*models.Graphite, error)
	GetUniqueData(ctx context.Context, req *models.GetUniqueDTO) ([]string, error)
	GetOverdue(ctx context.Context, req *models.GetOverdueDTO) ([]*models.Graphite, error)
	Create(ctx context.Context, dto *models.GraphiteDTO) error
	CreateSeveral(ctx context.Context, dto []*models.GraphiteDTO) error
	Update(ctx context.Context, dto *models.GraphiteDTO) error
	SetIssued(ctx context.Context, dto *models.SetGraphiteIssuedDTO) error
	SetPurpose(ctx context.Context, dto *models.SetGraphitePurposeDTO) error
	SetPlace(ctx context.Context, dto *models.SetGraphitePlaceDTO) error
	SetNotes(ctx context.Context, dto *models.SetGraphiteNotesDTO) error
	SetIsOverdue(ctx context.Context, idList []string) error
	ClearIsOverdue(ctx context.Context, id string) error
}

func (r *GraphiteRepo) getColumnName(field string) string {
	columns := map[string]string{
		"dateOfReceipt":   "date_of_receipt",
		"name":            "name",
		"erpName":         "erp_name",
		"supplierBatch":   "supplier_batch",
		"bigBagNumber":    "big_bag_number",
		"regNumber":       "registration_number",
		"document":        "document",
		"supplier":        "supplier",
		"supplierName":    "supplier_name",
		"issuanceForProd": "issuance_dates",
		"purpose":         "purpose",
		"number1c":        "number_1c",
		"act":             "act",
		"productionDate":  "production_date",
		"extendingMark":   "extending",
		"place":           "place",
		"notes":           "notes",
	}

	return columns[field]
}

func (r *GraphiteRepo) Get(ctx context.Context, req *models.GetGraphiteDTO) ([]*models.Graphite, error) {
	params := []interface{}{req.RealmId}
	count := 2

	order := " ORDER BY "
	for _, s := range req.Sort {
		order += fmt.Sprintf("%s %s, ", r.getColumnName(s.Field), s.Type)
	}
	order += "row_num DESC, g.id"

	filter := "WHERE realm_id=$1"
	if len(req.Filters) > 0 {
		filter += " AND "
		filters := []string{}

		for _, ns := range req.Filters {
			for _, sv := range ns.Values {
				filters = append(filters, getFilterLine(sv.CompareType, r.getColumnName(ns.Field), count))
				if sv.CompareType == "in" {
					params = append(params, pq.Array(strings.Split(sv.Value, "|")))
					count++
					// 	sv.Value = strings.ReplaceAll(sv.Value, ",", "|")
				}
				if sv.CompareType != "null" && sv.CompareType != "in" {
					params = append(params, sv.Value)
					count++
				}
			}
		}
		filter += strings.Join(filters, " AND ")
	}

	search := ""
	if req.Search != nil {
		search = " AND ("

		list := []string{}
		for _, f := range req.Search.Fields {
			list = append(list, fmt.Sprintf("%s ILIKE '%%'||$%d||'%%'", r.getColumnName(f), count))
		}
		params = append(params, req.Search.Value)
		count++
		search += strings.Join(list, " OR ") + ")"
	}

	params = append(params, req.Page.Limit, req.Page.Offset)

	query := fmt.Sprintf(`SELECT id, date_of_receipt, name, erp_name, supplier_batch, big_bag_number, registration_number, 
		document, supplier, supplier_name, purpose, number_1c, act, production_date, place, notes, is_overdue, is_all_issued,
		COALESCE(extending, '') AS extending, COALESCE(issuance, '') AS issuance, COALESCE(issuance_dates, '{}') as issuance_dates,
		COUNT(*) OVER() AS total 
		FROM %s AS g
		LEFT JOIN LATERAL (SELECT string_agg(act, '; ' ORDER BY date_of_extending DESC) AS extending FROM %s WHERE graphite_id=g.id) AS e ON true
		LEFT JOIN LATERAL (SELECT string_agg(CONCAT_WS(' ', CASE WHEN type='return' THEN 'Возвращен' ELSE 'Выдан' END ||
			CASE WHEN amount=0 THEN '' ELSE CONCAT_WS(' ', 'о',amount,'кг') END, 
			CASE WHEN issuance_date>'2000-01-01'::DATE THEN to_char(issuance_date AT TIME ZONE 'Asia/Yekaterinburg', 'DD.MM.YYYY') ELSE NULL END, 
			'('||last_name||')'), '; ' ORDER BY issuance_date DESC) AS issuance,
			array_agg(issuance_date ORDER BY issuance_date DESC) AS issuance_dates
			FROM %s AS i INNER JOIN %s AS u ON user_id::text=u.sso_id
			WHERE graphite_id=g.id) AS i ON true
		%s%s%s LIMIT $%d OFFSET $%d`,
		GraphiteTable, ExtendingTable, IssuanceTable, UserTable,
		filter, search, order, count, count+1,
	)
	// logger.Debug("get graphite", logger.StringAttr("query", query))

	tmp := []*pq_models.Graphite{}
	if err := r.db.SelectContext(ctx, &tmp, query, params...); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	data := []*models.Graphite{}
	for _, v := range tmp {
		data = append(data, v.ToModel())
	}
	return data, nil
}

func (r *GraphiteRepo) GetById(ctx context.Context, req *models.GetGraphiteByIdDTO) (*models.Graphite, error) {
	query := fmt.Sprintf(`SELECT id, realm_id, date_of_receipt, name, erp_name, supplier_batch, big_bag_number, registration_number, 
		document, supplier, supplier_name, purpose, number_1c, act, production_date, place, notes, is_overdue, is_all_issued, 
		COALESCE(issuance, '') AS issuance 
		FROM %s AS g
		LEFT JOIN LATERAL (SELECT COALESCE(issuance_date::text, '') AS issuance FROM %s WHERE graphite_id=g.id ORDER BY issuance_date DESC LIMIT 1) AS i ON TRUE
		WHERE id=$1`,
		GraphiteTable, IssuanceTable,
	)
	data := &models.Graphite{}

	if err := r.db.GetContext(ctx, data, query, req.Id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *GraphiteRepo) GetUniqueData(ctx context.Context, req *models.GetUniqueDTO) ([]string, error) {
	reg := regexp.MustCompile("([a-z0-9])([0-9A-Z])")
	snake := reg.ReplaceAllString(req.Field, "${1}_${2}")
	req.Field = strings.ToLower(snake)

	allowedFields := map[string]struct{}{
		"name": {}, "erp_name": {}, "supplier": {}, "supplier_batch": {}, "supplier_name": {}, "document": {},
		"purpose": {}, "place": {}, "number_1c": {}, "act": {},
	}

	if _, exist := allowedFields[req.Field]; !exist {
		return nil, fmt.Errorf("field is not allowed")
	}

	query := fmt.Sprintf(`SELECT DISTINCT(%s) AS item FROM %s WHERE %s!='' AND %s IS NOT NULL AND realm_id=$1`,
		req.Field, GraphiteTable, req.Field, req.Field,
	)
	tmp := []pq_models.UniqueData{}

	if err := r.db.SelectContext(ctx, &tmp, query, req.RealmId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	data := []string{}
	for _, v := range tmp {
		data = append(data, v.Item)
	}
	return data, nil
}

func (r *GraphiteRepo) GetOverdue(ctx context.Context, req *models.GetOverdueDTO) ([]*models.Graphite, error) {
	query := fmt.Sprintf(`SELECT id, realm_id, date_of_receipt, name, erp_name, supplier_batch, big_bag_number, registration_number, document, 
		supplier, supplier_name, is_all_issued, purpose, number_1c, act, production_date, place, notes, 
		COALESCE(date_of_extending, '1900-01-01'::DATE) AS date_of_extending, COALESCE(period_of_extending, 0) AS period_of_extending,
		COALESCE(NULLIF(g.expires_in,0), r.expires_in) AS expires_in
		FROM %s AS g
		LEFT JOIN LATERAL (SELECT expires_in FROM %s WHERE id=g.realm_id) AS r ON TRUE
		LEFT JOIN LATERAL (SELECT date_of_extending, period_of_extending FROM %s WHERE graphite_id=g.id ORDER BY date_of_extending DESC LIMIT 1) AS e ON TRUE 
		WHERE production_date + COALESCE(NULLIF(g.expires_in,0), r.expires_in) * INTERVAL '1 month' - INTERVAL '14 days' <= $1
		AND CASE WHEN date_of_extending IS NOT NULL THEN date_of_extending + (period_of_extending * INTERVAL '1 month') - INTERVAL '14 days'<=$1 ELSE TRUE END 
		AND is_all_issued IS FALSE AND is_overdue IS FALSE
		ORDER BY realm_id`,
		GraphiteTable, RealmTable, ExtendingTable,
	)
	data := []*models.Graphite{}

	if err := r.db.SelectContext(ctx, &data, query, time.Now()); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *GraphiteRepo) Create(ctx context.Context, dto *models.GraphiteDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, realm_id, date_of_receipt, name, erp_name, supplier_batch, big_bag_number, registration_number, 
		document, supplier, supplier_name, number_1c, act, production_date, expires_in, place, notes)
		VALUES (:id, :realm_id, :date_of_receipt, :name, :erp_name, :supplier_batch, :big_bag_number, :registration_number, 
		:document, :supplier, :supplier_name, :number_1c, :act, :production_date, :expires_in, :place, :notes)`,
		GraphiteTable,
	)
	dto.Id = uuid.NewString()

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *GraphiteRepo) CreateSeveral(ctx context.Context, dto []*models.GraphiteDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, realm_id, date_of_receipt, name, erp_name, supplier_batch, big_bag_number, registration_number, 
		document, supplier, supplier_name, number_1c, act, production_date, place, notes, is_all_issued, purpose)
		VALUES (:id, :realm_id, :date_of_receipt, :name, :erp_name, :supplier_batch, :big_bag_number, :registration_number, 
		:document, :supplier, :supplier_name, :number_1c, :act, :production_date, :place, :notes, :is_all_issued, :purpose)`,
		GraphiteTable,
	)
	for i := range dto {
		dto[i].Id = uuid.NewString()
	}

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *GraphiteRepo) Update(ctx context.Context, dto *models.GraphiteDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET date_of_receipt=:date_of_receipt, name=:name, erp_name=:erp_name, supplier_batch=:supplier_batch, 
		big_bag_number=:big_bag_number, registration_number=:registration_number, document=:document, supplier=:supplier, supplier_name=:supplier_name, 
		number_1c=:number_1c, act=:act, production_date=:production_date, expires_in=:expires_in, notes=:notes WHERE id=:id`,
		GraphiteTable,
	)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *GraphiteRepo) SetIssued(ctx context.Context, dto *models.SetGraphiteIssuedDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET is_all_issued=true, place='' WHERE id=:id`,
		GraphiteTable,
	)
	if dto.Place != "" {
		query = fmt.Sprintf(`UPDATE %s SET is_all_issued=false, place=:place WHERE id=:id`,
			GraphiteTable,
		)
	}

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *GraphiteRepo) SetPurpose(ctx context.Context, dto *models.SetGraphitePurposeDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET purpose=:purpose WHERE id=:id`,
		GraphiteTable,
	)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *GraphiteRepo) SetPlace(ctx context.Context, dto *models.SetGraphitePlaceDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET place=:place WHERE id=:id`,
		GraphiteTable,
	)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *GraphiteRepo) SetNotes(ctx context.Context, dto *models.SetGraphiteNotesDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET notes=:notes WHERE id=:id`,
		GraphiteTable,
	)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *GraphiteRepo) SetIsOverdue(ctx context.Context, idList []string) error {
	query := fmt.Sprintf(`UPDATE %s SET is_overdue=true WHERE id=ANY($1::uuid[])`, GraphiteTable)

	if _, err := r.db.ExecContext(ctx, query, pq.Array(idList)); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
func (r *GraphiteRepo) ClearIsOverdue(ctx context.Context, id string) error {
	query := fmt.Sprintf(`UPDATE %s SET is_overdue=false WHERE id=$1`, GraphiteTable)

	if _, err := r.db.ExecContext(ctx, query, id); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
