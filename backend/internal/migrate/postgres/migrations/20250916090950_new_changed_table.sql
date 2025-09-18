-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.changed
(
    id uuid NOT NULL,
    realm_id uuid,
    user_id uuid,
    user_name text COLLATE pg_catalog."default",
    section text COLLATE pg_catalog."default" NOT NULL,
    value_id text COLLATE pg_catalog."default" NOT NULL,
    original text COLLATE pg_catalog."default" NOT NULL,
    changed text COLLATE pg_catalog."default" NOT NULL,
    changed_fields text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT changed_pkey PRIMARY KEY (id),
    CONSTRAINT changed_realm_id_fkey FOREIGN KEY (realm_id)
        REFERENCES public.realms (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.changed
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.changed;
-- +goose StatementEnd
