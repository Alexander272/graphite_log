package services

import (
	"context"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/xuri/excelize/v2"
)

type ImportService struct {
	graphite  Graphite
	issuance  IssuanceForProd
	extending Extending
	user      User
}

type ImportDeps struct {
	Graphite  Graphite
	Issuance  IssuanceForProd
	Extending Extending
	User      User
}

func NewImportService(deps *ImportDeps) *ImportService {
	return &ImportService{
		graphite:  deps.Graphite,
		issuance:  deps.Issuance,
		extending: deps.Extending,
		user:      deps.User,
	}
}

var template models.Template = models.Template{
	DateOfReceipt:   0,
	Name:            1,
	ErpName:         2,
	SupplierBatch:   3,
	BigBagNumber:    4,
	RegNumber:       5,
	Document:        6,
	Supplier:        7,
	SupplierName:    8,
	IssuanceForProd: 9,
	Purpose:         10,
	Number1c:        11,
	Act:             12,
	ProductionDate:  13,
	MarkOfExtending: 14,
	Place:           15,
	Notes:           16,
}

type Import interface {
	Load(ctx context.Context, dto *models.ImportDTO) error
}

func (s *ImportService) Load(ctx context.Context, dto *models.ImportDTO) error {
	file, err := dto.File.Open()
	if err != nil {
		return fmt.Errorf("failed to open file. error: %w", err)
	}
	defer file.Close()

	excel, err := excelize.OpenReader(file)
	if err != nil {
		return fmt.Errorf("failed to open excel file. error: %w", err)
	}

	users, err := s.user.GetByRealm(ctx, &models.GetByRealmDTO{RealmId: dto.RealmId, Include: true})
	if err != nil {
		return fmt.Errorf("failed to get all users. error: %w", err)
	}
	defUser := ""
	for _, u := range users {
		if u.LastName == "Шихова" {
			defUser = u.SsoId
		}
	}

	sheet := excel.GetSheetName(excel.GetActiveSheetIndex())

	graphite := []*models.GraphiteDTO{}
	issuance := map[int][]*models.IssuanceForProdDTO{}
	extending := map[int]*models.ExtendingDTO{}
	index := 0

	rows, err := excel.Rows(sheet)
	if err != nil {
		return fmt.Errorf("failed to get rows. error: %w", err)
	}
	for rows.Next() {
		origRow, err := rows.Columns()
		if err != nil {
			return fmt.Errorf("failed to get columns. error: %w", err)
		}
		row := make([]string, 17)
		copy(row, origRow)

		if len(row) == 0 || row[0] == "" || row[0] == "Дата поступления" {
			continue
		}

		date, err := time.Parse("02/01/2006", row[template.DateOfReceipt])
		if err != nil {
			return fmt.Errorf("failed to parse date of receipt. error: %w", err)
		}
		dateOfReceipt := time.Date(date.Year(), date.Month(), date.Day(), date.Hour(), 0, 0, 0, time.Now().Location())

		date, err = time.Parse("02/01/2006", row[template.ProductionDate])
		if err != nil {
			return fmt.Errorf("failed to parse production date. error: %w", err)
		}
		dateOfProduce := time.Date(date.Year(), date.Month(), date.Day(), date.Hour(), 0, 0, 0, time.Now().Location())

		graphite = append(graphite, &models.GraphiteDTO{
			RealmId:        dto.RealmId,
			DateOfReceipt:  dateOfReceipt,
			Name:           row[template.Name],
			ErpName:        row[template.ErpName],
			SupplierBatch:  row[template.SupplierBatch],
			BigBagNumber:   row[template.BigBagNumber],
			RegNumber:      row[template.RegNumber],
			Document:       row[template.Document],
			Supplier:       row[template.Supplier],
			SupplierName:   row[template.SupplierName],
			Purpose:        row[template.Purpose],
			Number1c:       row[template.Number1c],
			Act:            row[template.Act],
			ProductionDate: dateOfProduce,
			Place:          row[template.Place],
			Notes:          row[template.Notes],
			IsAllIssued:    row[template.Place] == "",
		})

		if row[template.IssuanceForProd] != "" {
			parts := strings.Split(row[template.IssuanceForProd], "+")

			fullDate, err := regexp.Compile(`\d{2}.\d{2}.\d{4}`)
			if err != nil {
				return fmt.Errorf("failed to parse date. error: %w", err)
			}
			shortDate, err := regexp.Compile(`\d{2}.\d{2}.\d{2}`)
			if err != nil {
				return fmt.Errorf("failed to parse date. error: %w", err)
			}

			for _, part := range parts {
				re := regexp.MustCompile(`\d{1,2}.\d{1,2}.\d{2,4}`)
				dateString := re.FindString(part)

				issDate := time.Time{}
				if dateString != "" {
					if fullDate.MatchString(dateString) {
						date, err = time.Parse("02.01.2006", dateString)
					} else if shortDate.MatchString(dateString) {
						date, err = time.Parse("02.01.06", dateString)
					}

					if err != nil {
						return fmt.Errorf("failed to parse issuance date. error: %w", err)
					}
					issDate = time.Date(date.Year(), date.Month(), date.Day(), date.Hour(), 0, 0, 0, time.Now().Location())
				}

				re = regexp.MustCompile(`\d{1,} кг`)
				amountString := re.FindString(part)
				amount := 0.0
				if amountString != "" {
					amount, err = strconv.ParseFloat(strings.TrimSuffix(amountString, " кг"), 64)
					if err != nil {
						return fmt.Errorf("failed to parse amount. error: %w", err)
					}
				}

				user := defUser
				for _, u := range users {
					if strings.Contains(row[template.IssuanceForProd], u.LastName) {
						user = u.SsoId
						break
					}
				}
				if user == "" {
					return fmt.Errorf("failed to find user")
				}

				typeIss := "issuance"
				if strings.Contains(strings.ToLower(part), "возвращен") {
					typeIss = "return"
				}

				issuance[index] = append(issuance[index], &models.IssuanceForProdDTO{
					IssuanceDate: issDate,
					UserId:       user,
					IsFull:       row[template.Place] == "",
					Amount:       amount,
					Type:         typeIss,
				})
			}
		}

		if row[template.MarkOfExtending] != "" {

			re := regexp.MustCompile(`\d{2}.\d{2}.\d{4}`)
			dateString := re.FindString(row[template.MarkOfExtending])

			date, err := time.Parse("02.01.2006", dateString)
			if err != nil {
				return fmt.Errorf("failed to parse act date. error: %w", err)
			}
			actDate := time.Date(date.Year(), date.Month(), date.Day(), date.Hour(), 0, 0, 0, time.Now().Location())

			extending[index] = &models.ExtendingDTO{
				Act:    row[template.MarkOfExtending],
				Date:   actDate,
				Period: 24,
			}
		}

		index++
	}
	if err = rows.Close(); err != nil {
		return fmt.Errorf("failed to close rows. error: %w", err)
	}

	if err := s.graphite.CreateSeveral(ctx, graphite); err != nil {
		return err
	}

	extendingDTO := []*models.ExtendingDTO{}
	for key, value := range extending {
		value.GraphiteId = graphite[key].Id
		extendingDTO = append(extendingDTO, value)
	}
	if err := s.extending.CreateSeveral(ctx, extendingDTO); err != nil {
		return err
	}

	issuanceDTO := []*models.IssuanceForProdDTO{}
	for key, values := range issuance {
		for i := range values {
			values[i].GraphiteId = graphite[key].Id
		}
		issuanceDTO = append(issuanceDTO, values...)
	}
	if err := s.issuance.CreateSeveral(ctx, issuanceDTO); err != nil {
		return err
	}

	return nil
}
