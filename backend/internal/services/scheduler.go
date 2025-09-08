package services

import (
	"fmt"
	"log"
	"math"
	"time"

	"github.com/Alexander272/graphite_log/backend/internal/config"
	"github.com/Alexander272/graphite_log/backend/pkg/error_bot"
	"github.com/Alexander272/graphite_log/backend/pkg/logger"
	"github.com/go-co-op/gocron/v2"
)

type SchedulerService struct {
	cron         gocron.Scheduler
	notification Notification
}

type SchedulerDeps struct {
	Notification Notification
}

func NewSchedulerService(deps *SchedulerDeps) *SchedulerService {
	cron, err := gocron.NewScheduler()
	if err != nil {
		log.Fatalf("failed to create new scheduler. error: %s", err.Error())
	}

	return &SchedulerService{
		cron:         cron,
		notification: deps.Notification,
	}
}

type Scheduler interface {
	Start(conf *config.SchedulerConfig) error
	Stop() error
}

// запуск заданий в cron
func (s *SchedulerService) Start(conf *config.SchedulerConfig) error {
	now := time.Now()

	hours := int(conf.StartTime.Hours())
	minutes := int(math.Round(math.Mod(conf.StartTime.Hours(), 1) * 60))

	jobStart := time.Date(now.Year(), now.Month(), now.Day(), hours, minutes, 0, 0, now.Location())
	if now.Hour() > hours || (now.Hour() == hours && now.Minute() >= minutes) {
		jobStart = jobStart.Add(24 * time.Hour)
	}
	// // вернуть нормальное время запуска
	// jobStart := now.Add(1 * time.Minute)
	logger.Info("starting jobs time " + jobStart.Format("02.01.2006 15:04:05"))

	job := gocron.DurationJob(conf.Interval)
	task := gocron.NewTask(s.job)
	jobStartAt := gocron.WithStartAt(gocron.WithStartDateTime(jobStart))

	_, err := s.cron.NewJob(job, task, jobStartAt)
	if err != nil {
		return fmt.Errorf("failed to create new job. error: %w", err)
	}

	//? запуск крона через интервал (по умолчанию день)
	s.cron.Start()
	return nil
}

// остановка заданий в cron
func (s *SchedulerService) Stop() error {
	if err := s.cron.Shutdown(); err != nil {
		return fmt.Errorf("failed to shutdown cron scheduler. error: %w", err)
	}
	return nil
}

func (s *SchedulerService) job() {
	logger.Info("job was started")

	// Отправка списка графита у которого заканчивается срок годности
	if err := s.notification.SendOverdue(); err != nil {
		logger.Error("send overdue error:", logger.ErrAttr(err))
		error_bot.Send(nil, err.Error(), nil)
	}

	// // Удаление пустых папок
	// if err := s.documents.RemoveEmptyFolders(context.Background()); err != nil {
	// 	logger.Error("delete empty folders error:", logger.ErrAttr(err))
	// 	error_bot.Send(nil, err.Error(), nil)
	// 	return
	// }
}
