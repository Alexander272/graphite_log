-- +goose Up
-- +goose StatementBegin
ALTER TABLE public.graphite ADD COLUMN expires_in integer NOT NULL DEFAULT 0;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE public.graphite DROP COLUMN expires_in;
-- +goose StatementEnd
