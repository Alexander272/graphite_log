package pq_models

import (
	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/lib/pq"
)

type Graphite struct {
	models.Graphite
	IssuanceDates pq.StringArray `db:"issuance_dates"`
}

func (g *Graphite) ToModel() *models.Graphite {
	return &models.Graphite{
		Id:                g.Id,
		RealmId:           g.RealmId,
		DateOfReceipt:     g.DateOfReceipt,
		Name:              g.Name,
		ErpName:           g.ErpName,
		SupplierBatch:     g.SupplierBatch,
		BigBagNumber:      g.BigBagNumber,
		RegNumber:         g.RegNumber,
		Document:          g.Document,
		Supplier:          g.Supplier,
		SupplierName:      g.SupplierName,
		IssuanceForProd:   g.IssuanceForProd,
		IsIssued:          g.IsIssued,
		Purpose:           g.Purpose,
		Number1c:          g.Number1c,
		Act:               g.Act,
		ProductionDate:    g.ProductionDate,
		MarkOfExtending:   g.MarkOfExtending,
		DateOfExtending:   g.DateOfExtending,
		PeriodOfExtending: g.PeriodOfExtending,
		IsOverdue:         g.IsOverdue,
		Place:             g.Place,
		Notes:             g.Notes,
		Total:             g.Total,
	}
}
