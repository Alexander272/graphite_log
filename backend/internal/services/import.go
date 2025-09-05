package services

import "fmt"

type ImportService struct {
	graphite Graphite
	issuance IssuanceForProd
}

type ImportDeps struct {
	Graphite Graphite
	Issuance IssuanceForProd
}

func NewImportService(deps *ImportDeps) *ImportService {
	return &ImportService{
		graphite: deps.Graphite,
		issuance: deps.Issuance,
	}
}

type Import interface{}

func (s *ImportService) Load() error {
	return fmt.Errorf("not implemented")
}
