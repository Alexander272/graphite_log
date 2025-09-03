-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.graphite
(
    id uuid NOT NULL,
    realm_id uuid NOT NULL,
    date_of_receipt timestamp with time zone NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    erp_name text COLLATE pg_catalog."default" NOT NULL,
    supplier_batch text NOT NULL,
    big_bag_number text COLLATE pg_catalog."default" DEFAULT ''::text,
    registration_number text COLLATE pg_catalog."default" DEFAULT ''::text,
    document text COLLATE pg_catalog."default" NOT NULL,
    supplier text COLLATE pg_catalog."default" NOT NULL,
    supplier_name text COLLATE pg_catalog."default" NOT NULL,
    is_all_issued boolean DEFAULT false,
    purpose text COLLATE pg_catalog."default" DEFAULT ''::text,
    number_1c text COLLATE pg_catalog."default" DEFAULT ''::text,
    act text COLLATE pg_catalog."default" DEFAULT ''::text,
    production_date timestamp with time zone,
    place text COLLATE pg_catalog."default" DEFAULT ''::text,
    notes text COLLATE pg_catalog."default" DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(), 
    CONSTRAINT graphite_pkey PRIMARY KEY (id),
     CONSTRAINT graphite_realms_id_fkey FOREIGN KEY (realm_id)
        REFERENCES public.realms (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.graphite
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.graphite;
-- +goose StatementEnd
