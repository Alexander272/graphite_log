-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.issuance_for_production
(
    id uuid NOT NULL,
    graphite_id uuid NOT NULL,
    issuance_date timestamp with time zone NOT NULL,
    user_id uuid NOT NULL,
    is_full boolean DEFAULT true,
    amount real DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT issuance_for_production_pkey PRIMARY KEY (id),
    CONSTRAINT issuance_for_production_graphite_id_fkey FOREIGN KEY (graphite_id)
        REFERENCES public.graphite (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.issuance_for_production
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.issuance_for_production;
-- +goose StatementEnd
