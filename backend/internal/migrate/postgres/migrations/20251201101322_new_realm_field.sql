-- +goose Up
-- +goose StatementBegin
ALTER TABLE public.realms ADD COLUMN expires_in integer NOT NULL DEFAULT 24, 
    ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE public.realms DROP COLUMN expires_in, 
    DROP COLUMN updated_at;
-- +goose StatementEnd
