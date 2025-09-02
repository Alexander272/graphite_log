-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.realms
(
    id uuid NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    realm text COLLATE pg_catalog."default" NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT realms_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.realms
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.realms;
-- +goose StatementEnd