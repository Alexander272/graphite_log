-- +goose Up
-- +goose StatementBegin
CREATE SEQUENCE IF NOT EXISTS public.graphite_row_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;
    
CREATE TABLE IF NOT EXISTS public.graphite
(
    id uuid NOT NULL,
    realm_id uuid NOT NULL,
    row_num integer NOT NULL DEFAULT nextval('graphite_row_seq'::regclass),
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
    is_overdue boolean DEFAULT false,
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

ALTER SEQUENCE public.graphite_row_seq
    OWNED BY public.graphite.row_num;

ALTER SEQUENCE public.graphite_row_seq
    OWNER TO postgres;

ALTER TABLE IF EXISTS public.graphite
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.graphite;
-- +goose StatementEnd
