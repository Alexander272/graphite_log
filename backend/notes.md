goose -dir internal/migrate/postgres/migrations postgres "postgresql://postgres:postgres@127.0.0.1:5436/graphite_log?sslmode=disable" down
goose -dir internal/migrate/postgres/migrations create new_accepted_table sql
scp -r ./dist administrator@route:/home/administrator/apps/graphite_log
npx vite-bundle-visualizer
