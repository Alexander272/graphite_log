# Отчет по результатам полного аудита проекта GraphiteLog Backend

**Дата:** 2026-04-29  
**Проект:** `/home/martynov/Projects/graphite_log/backend`  
**Язык:** Go 1.23.7, фреймворк Gin  
**Статус:** Production-ready с критическими недоработками

---

## 🔴 КРИТИЧЕСКИЕ ПРОБЛЕМЫ (P0)

### 1. Безопасность: раскрытие внутренних ошибок клиенту
**Файлы:** Все хендлеры в `internal/transport/http/v1/*`

Ошибки базы данных и внутренние ошибки отдаются пользователю в открытом виде:
```go
response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
```

**Риски:** Раскрытие структуры БД, чувствительной информации, stack trace.

**Рекомендация:**
```go
logger.ErrorContext(c, "failed to get data", logger.ErrAttr(err))
response.NewErrorResponse(c, http.StatusInternalServerError, "", "Произошла ошибка")
```

---

### 2. Безопасность: CORS не настроен
**Файл:** `internal/transport/http/v1/handlers.go`

В проекте есть зависимость `github.com/rs/cors`, но она не используется. API открыт для любых запросов со стороны браузера.

**Рекомендация:** Добавить CORS middleware для Gin:
```go
import "github.com/gin-contrib/cors"

router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"https://yourdomain.com"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
    AllowHeaders:     []string{"Authorization", "Content-Type"},
    AllowCredentials: true,
}))
```

---

### 3. Импорт: нет транзакций — риск частичной загрузки данных
**Файл:** `internal/services/import.go:234-256`

При импорте данных:
1. Создаются записи graphite
2. Создаются записи extending  
3. Создаются записи issuance

Если на этапе 2 или 3 произойдет ошибка — записи graphite уже созданы, но отката не происходит.

**Рекомендация:** Обернуть импорт в транзакцию или реализовать cleanup при ошибке.

---

### 4. Импорт: регулярные выражения компилируются на каждой итерации
**Файл:** `internal/services/import.go:143-154`

```go
for _, part := range parts {
    re := regexp.MustCompile(`\d{1,2}.\d{1,2}.\d{2,4}`) // компилируется N раз!
    dateString := re.FindString(part)
}
```

**Рекомендация:** Вынести компиляцию regexp за пределы цикла:
```go
dateRe := regexp.MustCompile(`\d{1,2}.\d{1,2}.\d{2,4}`)
amountRe := regexp.MustCompile(`\d{1,} кг`)
for _, part := range parts {
    dateString := dateRe.FindString(part)
}
```

---

### 5. Импорт: хрупкая логика поиска пользователя
**Файл:** `internal/services/import.go:180-189`

```go
user := defUser  // может быть "" если "Шихова" не найдена
for _, u := range users {
    if strings.Contains(row[template.IssuanceForProd], u.LastName) {
        user = u.SsoId
        break  // нашел первое совпадение — может быть неверным
    }
}
if user == "" {
    return fmt.Errorf("failed to find user") // импорт упадет
}
```

**Проблемы:**
- `strings.Contains` может сработать неверно (например, "Иванов" и "Иванова")
- При нескольких выдачах в одной ячейке (через "+") пользователь определяется не для каждой записи
- Если "Шихова" не в системе — `defUser = ""`, и импорт упадет

**Рекомендация:** Использовать точное сопоставление или настроить маппинг пользователей.

---

### 6. SetPurpose: рассинхронизация индексов
**Файл:** `internal/services/graphite.go:129-148`

```go
cnd, _ := s.GetByIds(ctx, &models.GetGraphiteByIdsDTO{Ids: dto.Ids}) // ORDER BY id
slices.Sort(dto.Ids) // сортируем ID

for i, c := range cnd {
    changedDto := &models.NewChangeDTO{
        ValueId: dto.Ids[i], // предполагаем, что cnd[i].Id == dto.Ids[i]
    }
}
```

**Проблема:** Если какой-то ID не существует в БД, `cnd` будет короче `dto.Ids`, и индексы не совпадут. Записи об изменениях привяжутся к неверным объектам.

**Рекомендация:** Сопоставлять по ID, а не по индексу:
```go
cndMap := make(map[string]*models.Graphite)
for _, c := range cnd {
    cndMap[c.Id] = c
}
for _, id := range dto.Ids {
    c, ok := cndMap[id]
    if !ok { continue }
}
```

---

### 7. SQL-синтаксис: отсутствует запятая между колонками
**Файл:** `internal/repository/postgres/rule.go:30-31`

```go
query := fmt.Sprintf(`SELECT m.id, r.name, role_id, rule_item_id, i.name AS item_name i.method
    FROM ...`)
```

**Проблема:** Между `item_name` и `i.method` отсутствует запятая. SQL запрос всегда будет падать с синтаксической ошибкой.

**Рекомендация:** Исправить на `i.name AS item_name, i.method`

---

### 8. SQL-синтаксис: отсутствует запятая в rule_item.go
**Файл:** `internal/repository/postgres/rule_item.go:51`

```go
query := fmt.Sprintf(`UPDATE %s SET name=$1, method=$2 description=$3, is_show=$4 WHERE id=$5`,
```

**Проблема:** Между `$2` и `description` отсутствует запятая.

**Рекомендация:** Исправить на `method=$2, description=$3`

---

### 9. Изменения записываются ДО обновления данных
**Файл:** `internal/services/graphite.go:111-117`

```go
s.changes.AddChange(ctx, changedDto) // сначала пишем изменение
s.repo.Update(ctx, dto)              // потом обновляем
```

Если `Update` упадет — в таблице `changes` останется запись о несуществующем изменении. Аналогично в `issuance_for_prode.go:134` и `extending.go:88`.

**Рекомендация:** Делать в транзакции или менять порядок (сначала Update, потом AddChange).

---

### 10. Права доступа (Casbin) отключены
**Файл:** `internal/transport/http/middleware/permissions.go`

Весь код проверки прав доступа закомментирован. Middleware просто вызывает `c.Next()`:
```go
func (m *Middleware) CheckPermissions(rule, method string) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Весь код проверки закомментирован
        c.Next()
    }
}
```

**Риски:** Любой авторизованный пользователь может выполнять любые действия.

**Рекомендация:** Включить проверку прав доступа или удалить ненужный код.

---

### 11. Bulk-операции без транзакций
**Файлы:** `internal/repository/postgres/graphite.go`, `users.go`, `rule.go`, `extending.go`, `issuance_for_prod.go`

Методы `CreateSeveral`, `UpdateSeveral`, `DeleteSeveral` не используют транзакции. При ошибке на середине данные будут в неконсистентном состоянии.

**Рекомендация:** Использовать `db.BeginTxx()` для транзакций.

---

### 12. Отсутствует валидация UUID в GetByIds
**Файл:** `internal/transport/http/v1/graphite/graphite.go:106-112`

```go
ids := strings.Split(tmpIds, ",")
dto := &models.GetGraphiteByIdsDTO{Ids: ids}
// Нет валидации каждого ID
```

**Рекомендация:** Проверять каждый ID через `uuid.Validate()`.

---

## 🟡 ВАЖНЫЕ ПРОБЛЕМЫ (P1)

### 13. Проверка токена на каждый запрос к Keycloak
**Файл:** `internal/transport/http/middleware/indentity.go:16`

```go
result, err := m.keycloak.Client.RetrospectToken(c, token, ...)
```

Каждый запрос делает сетевой вызов к Keycloak. При росте трафика это создаст нагрузку.

**Рекомендация:** Реализовать локальную проверку JWT (в коде есть TODO об этом). Публичные ключи можно кешировать.

---

### 14. Настройки пула соединений БД отсутствуют
**Файл:** `pkg/database/postgres/postgres.go`

```go
db, err := sqlx.Open("postgres", connStr)
// Нет настройки пула соединений!
```

**Рекомендация:**
```go
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(5)
db.SetConnMaxLifetime(5 * time.Minute)
```

---

### 15. Короткий таймаут graceful shutdown
**Файл:** `cmd/app/main.go:106`

```go
const timeout = 5 * time.Second
```

При активных долгих запросах сервер может принудительно оборвать соединения.

**Рекомендация:** Увеличить до 30-60 секунд.

---

### 16. Слабая валидация входных данных
**Файлы:** `internal/services/graphite.go`, `internal/models/graphite.go`

- Нет проверки `dto.Place` на допустимые значения
- Нет валидации `dto.Purpose`
- В `Create` не проверяется, что `RealmId` не пустой
- В `CreateSeveral` нет проверки данных перед вставкой

---

### 17. Логирование чувствительных данных
**Файл:** `internal/transport/http/v1/graphite/graphite.go:170`

```go
logger.Info("Данные созданы",
    logger.AnyAttr("dto", dto), // логируется весь DTO
)
```

**Рекомендация:** Логировать только ID и имя пользователя, без чувствительных данных.

---

### 18. Ошибки в GetByIds — возвращается nil вместо ошибки
**Файл:** `internal/repository/postgres/graphite.go:274-289`

```go
func (r *GraphiteRepo) GetByIds(ctx context.Context, req *models.GetGraphiteByIdsDTO) ([]*models.Graphite, error) {
    // ...
    if err := r.db.SelectContext(ctx, &data, query, pq.Array(req.Ids)); err != nil {
        return nil, fmt.Errorf("failed to execute query. error: %w", err)
    }
    return data, nil  // Возвращается nil вместо data!
}
```

**Исправление:** `return data, nil`

---

### 19. Error Bot отправляет сообщения синхронно
**Файл:** `pkg/error_bot/bot.go:71`

```go
_, err := http.Post(url, "application/json", &buf)
```

Блокирует выполнение запроса при отправке ошибки.

**Рекомендация:** Использовать горутину или очередь сообщений.

---

### 20. Scheduler не имеет контекста отмены
**Файл:** `internal/services/scheduler.go:78-92`

`job()` выполняется без возможности отмены при выключении сервера. Если задача выполняется долго, shutdown может быть заблокирован.

---

### 21. Notification: уведомления отправляются всем каналам
**Файл:** `internal/services/notification.go:74-100`

Цикл отправляет уведомления ВСЕМ каналам, даже если для конкретного realm нет просроченных данных (пустой `dataByRealm[u.RealmId]`).

**Рекомендация:** Проверять `len(dataByRealm[u.RealmId]) > 0` перед отправкой.

---

### 22. Mattermost WebSocket подключение не используется эффективно
**Файл:** `pkg/mattermost/client.go`

- WebSocket клиент создается, но `Listen()` закомментирован
- При ошибке подключения используется `log.Fatalf` — приложение упадет

---

### 23. Утечка ресурсов в лимитере
**Файл:** `pkg/limiter/limiter.go:59-71`

Функция `cleanupVisitors()` запускает бесконечный цикл без возможности остановки.

**Рекомендация:** Добавить context для graceful shutdown.

---

## 🟢 МИНОРНЫЕ ПРОБЛЕМЫ (P2)

### 24. Жестко закодированный пользователь
**Файл:** `internal/services/import.go:80-83`

```go
if u.LastName == "Шихова" {
    defUser = u.SsoId
}
```

Если пользователь сменит фамилию или уволится — импорт сломается.

**Рекомендация:** Вынести в конфигурацию или определять динамически.

---

### 25. Неиспользуемые зависимости
- `pkg/database/redis` — пакет существует, но закомментирован
- `LimiterConfig` — есть в конфиге, но не применяется в коде
- `config.AuthConfig.Key` — не используется
- `models.RoleWithApi` — пустая структура

---

### 26. Дублирование кода в хендлерах
**Файл:** `internal/transport/http/v1/graphite/graphite.go`

Получение пользователя из контекста повторяется во всех методах:
```go
u, exists := c.Get(constants.CtxUser)
if !exists {
    response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
    return
}
user := u.(models.User)
```

**Рекомендация:** Вынести в промежуточный middleware.

---

### 27. Dockerfile: отсутствует обработка сигналов
**Файл:** `Dockerfile`

При остановке контейнера процесс может быть принудительно завершен без graceful shutdown.

**Рекомендация:** Использовать `tini` или правильно обрабатывать сигналы в Go.

---

### 28. Валидация входных данных в SignIn
**Файл:** `internal/transport/http/v1/auth/auth.go:50-54`

```go
dto := &models.SignInDTO{}
if err := c.BindJSON(dto); err != nil {
    response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
    return
}
```

**Проблема:** Нет проверки, что username и password не пустые.

---

### 29. Использование устаревшего логгера
**Файл:** `pkg/error_bot/bot.go:6`

```go
import "log/slog"  // используется вместе с slog, но в некоторых местах используется старый log
```

---

### 30. Хеширование паролей (SHA256) — не используется
**Файл:** `pkg/hasher/password.go`

Функция `GenerateSalt()` закомментирована, соль не используется при хешировании. Но сам хешер нигде не используется в проекте (т.к. используется Keycloak).

---

### 31. В SQL-запросах используется LOWER вместо ILIKE
**Файл:** `internal/repository/postgres/utils.go:10-16`

```go
case "con":
    return fmt.Sprintf("LOWER(%s) LIKE LOWER('%%'||$%d||'%%')", fieldName, count)
```

**Проблема:** Для PostgreSQL лучше использовать `ILIKE` вместо `LOWER(...)` для регистронезависимого поиска.

---

### 32. Несогласованность в возвращаемых значениях
**Файл:** `internal/repository/postgres/rule.go:36-39`

```go
var Rule []*models.Rule
if err := r.db.SelectContext(ctx, &Rule, query); err != nil {
    return nil, fmt.Errorf("failed to execute query. error: %w", err)
}
return Rule, nil  // Несогласованность имен (Rule vs rules)
```

---

### 33. В импорте не проверяется успешность создания записей
**Файл:** `internal/services/import.go:234-256`

После создания graphite, extending и issuance нет проверки, что записи действительно создались (получение ID созданных записей для связи).

---

### 34. Session service: декодирование токена может упасть
**Файл:** `internal/services/session.go:87-92`

```go
_, claims, err := s.keycloak.Client.DecodeAccessToken(ctx, token, s.keycloak.Realm)
if err != nil {
    return nil, fmt.Errorf("failed to decode access token. error: %w", err)
}
```

**Проблема:** Нет проверки, что claims не nil.

---

### 35. Casbin PolicyAdapter: SavePolicy и другие методы возвращают nil
**Файл:** `internal/services/permission.go:138-157`

Методы `SavePolicy`, `AddPolicy`, `RemovePolicy` всегда возвращают nil. Это означает, что изменения политик не сохраняются.

---

## 📋 ЧЕК-ЛИСТ ДЛЯ ИСПРАВЛЕНИЯ

| Приоритет | Проблема | Где | Трудоемкость | Статус |
|-----------|----------|-----|---------------|--------|
| 🔴 P0 | SQL синтаксис (отсутствует запятая) | `rule.go:30`, `rule_item.go:51` | Низкая | ⚠️ Баг |
| 🔴 P0 | Раскрытие ошибок клиенту | Все хендлеры | Низкая | ⚠️ Секурити |
| 🔴 P0 | Транзакции при импорте | `import.go:234` | Средняя | ⚠️ Данные |
| 🔴 P0 | SetPurpose: рассинхронизация ID | `graphite.go:129` | Средняя | ⚠️ Баг |
| 🔴 P0 | Regexp в цикле | `import.go:143` | Низкая | ⚠️ Перфоманс |
| 🔴 P0 | Изменения ДО обновления | `graphite.go:111`, `issuance_for_prode.go:134` | Низкая | ⚠️ Логика |
| 🔴 P0 | Права доступа отключены | `permissions.go` | Средняя | ⚠️ Секурити |
| 🔴 P0 | Bulk-операции без транзакций | `postgres/*` | Средняя | ⚠️ Данные |
| 🔴 P0 | GetByIds возвращает nil | `graphite.go:289` | Низкая | ⚠️ Баг |
| 🟡 P1 | CORS не настроен | `handlers.go` | Низкая | ⚠️ Секурити |
| 🟡 P1 | Токен: проверка через Keycloak | `indentity.go:16` | Высокая | ⚠️ Перфоманс |
| 🟡 P1 | Пул соединений БД | `postgres.go` | Низкая | ⚠️ Надежность |
| 🟡 P1 | Таймаут shutdown | `main.go:106` | Низкая | ⚠️ Надежность |
| 🟡 P1 | Валидация UUID | `graphite.go:106` | Низкая | ⚠️ Баг |
| 🟡 P1 | Error Bot синхронный | `bot.go:71` | Низкая | ⚠️ Перфоманс |
| 🟡 P1 | Notification: пустые данные | `notification.go:74` | Низкая | ⚠️ Логика |
| 🟢 P2 | Хардкод "Шихова" | `import.go:80` | Низкая | ⚠️ Логика |
| 🟢 P2 | Логирование DTO | `graphite.go:170` | Низкая | ⚠️ Секурити |
| 🟢 P2 | Неиспользуемые зависимости | Проект | Низкая | ⚠️ Чистка |
| 🟢 P2 | Дублирование кода | `graphite.go` | Низкая | ⚠️ Чистка |
| 🟢 P2 | Dockerfile сигналы | `Dockerfile` | Низкая | ⚠️ Надежность |

---

## 🛠 РЕКОМЕНДАЦИИ ПО УЛУЧШЕНИЮ АРХИТЕКТУРЫ

1. **Внедрить транзакции** для всех операций, изменяющих несколько таблиц
2. **Добавить валидацию** входных DTO (использовать `github.com/go-playground/validator`)
3. **Настроить метрики и трейсинг** (Prometheus/OpenTelemetry)
4. **Покрыть критичные места тестами** (импорт, обновление, права доступа)
5. **Использовать миграции** для изменения структуры БД (уже есть goose)
6. **Добавить health-check endpoint** для мониторинга
7. **Настроить structured logging** (уже есть slog, нужно использовать повсеместно)
8. **Реализовать graceful shutdown** с корректным завершением фоновых задач
9. **Включить права доступа** (Casbin) или удалить неиспользуемый код
10. **Настроить CORS** для безопасной работы с фронтендом

---

## 📊 СТАТИСТИКА

- **Всего найдено проблем:** 35
- **Критических (🔴 P0):** 12
- **Важных (🟡 P1):** 11
- **Минорных (🟢 P2):** 12
- **Потенциальных багов:** 5 (SQL синтаксис, SetPurpose, GetByIds, changes до update, Casbin adapter)
- **Проблемы безопасности:** 4 (раскрытие ошибок, CORS, права доступа, логирование)
- **Проблемы производительности:** 4 (regexp в цикле, Keycloak проверки, sync error bot, нет пула БД)

---

## 🎯 ПЛАН ДЕЙСТВИЙ (ПРИОРИТЕТЫ)

### Немедленно (в продакшене):
1. Исправить SQL синтаксис в `rule.go` и `rule_item.go`
2. Перестать раскрывать внутренние ошибки клиенту
3. Включить проверку прав доступа или отключить маршруты
4. Исправить `GetByIds` (возврат nil вместо data)

### В ближайшее время:
5. Добавить CORS middleware
6. Настроить пул соединений БД
7. Обернуть импорт в транзакцию
8. Исправить логику SetPurpose

### Желательно:
9. Увеличить таймаут shutdown
10. Вынести regexp из циклов
11. Внедрить транзакции для bulk-операций
12. Настроить валидацию входных данных

---

**Примечание:** Проект имеет хорошую архитектуру (Clean Architecture), но требует доработки в части обработки ошибок, безопасности и целостности данных.
