package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/internal/repository/postgres/pq_models"
	"github.com/Alexander272/graphite_log/backend/pkg/logger"
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
	Create(ctx context.Context, dto *models.GraphiteDTO) error
	Update(ctx context.Context, dto *models.GraphiteDTO) error
	SetIssued(ctx context.Context, dto *models.SetGraphiteIssuedDTO) error
	SetPurpose(ctx context.Context, dto *models.SetGraphitePurposeDTO) error
	SetPlace(ctx context.Context, dto *models.SetGraphitePlaceDTO) error
	SetNotes(ctx context.Context, dto *models.SetGraphiteNotesDTO) error
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
		"issuanceForProd": "issuance",
		"purpose":         "purpose",
		"number1c":        "number_1c",
		"act":             "act",
		"productionDate":  "production_date",
		"markOfExtending": "mark_of_extending",
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
	order += "g.created_at DESC, g.id"

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
	logger.Debug("get graphite", logger.StringAttr("filter", filter))

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

	logger.Debug("get graphite", logger.AnyAttr("params", params))

	params = append(params, req.Page.Limit, req.Page.Offset)

	query := fmt.Sprintf(`SELECT id, date_of_receipt, name, erp_name, supplier_batch, big_bag_number, registration_number, 
		document, supplier, supplier_name, purpose, number_1c, act, production_date, place, notes,
		COALESCE(ext, '') AS extending, COALESCE(issuance, '') AS issuance,
		COUNT(*) OVER() AS total 
		FROM %s AS g
		LEFT JOIN LATERAL (SELECT act AS ext FROM %s WHERE graphite_id=g.id ORDER BY date_of_extending DESC LIMIT 1) AS e ON true
		LEFT JOIN LATERAL (SELECT string_agg(CONCAT_WS(' ', CASE WHEN amount=0 THEN 'Выдан' ELSE 'Выдано '||amount||' кг' END, 
			to_char(issuance_date, 'DD.MM.YYYY'), '('||last_name||')'), '; ' ORDER BY issuance_date DESC) AS issuance
			FROM %s AS i INNER JOIN %s AS u ON user_id::text=u.sso_id
			WHERE graphite_id=g.id) AS i ON true
		%s%s%s LIMIT $%d OFFSET $%d`,
		GraphiteTable, ExtendingTable, IssuanceTable, UserTable,
		filter, search, order, count, count+1,
	)
	data := []*models.Graphite{}

	if err := r.db.SelectContext(ctx, &data, query, params...); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *GraphiteRepo) GetById(ctx context.Context, req *models.GetGraphiteByIdDTO) (*models.Graphite, error) {
	query := fmt.Sprintf(`SELECT id, date_of_receipt, name, erp_name, supplier_batch, big_bag_number, registration_number, 
		document, supplier, supplier_name, purpose, number_1c, act, production_date, place, notes 
		FROM %s WHERE id=$1`,
		GraphiteTable,
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
	reg := regexp.MustCompile("([a-z0-9])([A-Z])")
	snake := reg.ReplaceAllString(req.Field, "${1}_${2}")
	req.Field = strings.ToLower(snake)

	allowedFields := map[string]struct{}{
		"name": {}, "erp_name": {}, "supplier": {}, "supplier_name": {}, "purpose": {}, "place": {},
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

func (r *GraphiteRepo) Create(ctx context.Context, dto *models.GraphiteDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, realm_id, date_of_receipt, name, erp_name, supplier_batch, big_bag_number, registration_number, 
		document, supplier, supplier_name, number_1c, act, production_date, notes)
		VALUES (:id, :realm_id, :date_of_receipt, :name, :erp_name, :supplier_batch, :big_bag_number, :registration_number, 
		:document, :supplier, :supplier_name, :number_1c, :act, :production_date, :notes)`,
		GraphiteTable,
	)
	dto.Id = uuid.NewString()

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *GraphiteRepo) Update(ctx context.Context, dto *models.GraphiteDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET date_of_receipt=:date_of_receipt, name=:name, erp_name=:erp_name, supplier_batch=:supplier_batch, 
		big_bag_number=:big_bag_number, registration_number=:registration_number, document=:document, supplier=:supplier, supplier_name=:supplier_name, 
		number_1c=:number_1c, act=:act, production_date=:production_date, notes=:notes WHERE id=:id`,
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
