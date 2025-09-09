-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.notification
(
    id uuid NOT NULL,
    realm_id uuid NOT NULL,
    -- user_id uuid,
    notification_type text COLLATE pg_catalog."default" NOT NULL,
    most_id text COLLATE pg_catalog."default" DEFAULT '',
    channel_id text COLLATE pg_catalog."default" DEFAULT '',
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notification_pkey PRIMARY KEY (id),
    CONSTRAINT notification_realm_id_fkey FOREIGN KEY (realm_id)
        REFERENCES public.realms (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
    -- CONSTRAINT notification_user_id_fkey FOREIGN KEY (user_id)
    --     REFERENCES public.users (id) MATCH SIMPLE
    --     ON UPDATE CASCADE
    --     ON DELETE CASCADE
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.notification
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.notification;
-- +goose StatementEnd
