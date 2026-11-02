--
-- PostgreSQL database dump
--

\restrict 2fmUHeAxHG79lZLg64tkbJlRhvnNxmxa4IaI3bh10vBP6qU6kihWr6U5vUwt8jK

-- Dumped from database version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: typeMessage; Type: TYPE; Schema: public; Owner: whaticket
--

CREATE TYPE public."typeMessage" AS ENUM (
    'text',
    'reaction',
    'audio',
    'document',
    'image',
    'sticker',
    'video',
    'location',
    'contacts',
    'interactive',
    'template'
);


ALTER TYPE public."typeMessage" OWNER TO whaticket;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO whaticket;

--
-- Name: company; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public.company (
    id integer NOT NULL,
    create_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    update_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone,
    name text NOT NULL,
    "idEmpresaMult100" integer NOT NULL,
    token text NOT NULL
);


ALTER TABLE public.company OWNER TO whaticket;

--
-- Name: company_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public.company_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_id_seq OWNER TO whaticket;

--
-- Name: company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public.company_id_seq OWNED BY public.company.id;


--
-- Name: sendMessageWhatsApp; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."sendMessageWhatsApp" (
    id integer NOT NULL,
    create_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    update_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone,
    type public."typeMessage" NOT NULL,
    "to" text NOT NULL,
    text jsonb,
    reaction jsonb,
    audio jsonb,
    document jsonb,
    image jsonb,
    sticker jsonb,
    video jsonb,
    location jsonb,
    contacts jsonb,
    interactive jsonb,
    template jsonb,
    enviada boolean DEFAULT false NOT NULL,
    "pathFile" text,
    "idFileMeta" text,
    "whatsappOficialId" integer NOT NULL,
    "idMessageWhatsApp" jsonb
);


ALTER TABLE public."sendMessageWhatsApp" OWNER TO whaticket;

--
-- Name: sendMessageWhatsApp_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."sendMessageWhatsApp_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."sendMessageWhatsApp_id_seq" OWNER TO whaticket;

--
-- Name: sendMessageWhatsApp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."sendMessageWhatsApp_id_seq" OWNED BY public."sendMessageWhatsApp".id;


--
-- Name: whatsappOficial; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."whatsappOficial" (
    id integer NOT NULL,
    phone_number_id text NOT NULL,
    waba_id text NOT NULL,
    send_token text NOT NULL,
    phone_number text NOT NULL,
    "companyId" integer NOT NULL,
    use_rabbitmq boolean DEFAULT false NOT NULL,
    token_mult100 text NOT NULL,
    create_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    update_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone,
    chatwoot_webhook_url text,
    auth_token_chatwoot text,
    n8n_webhook_url text,
    auth_token_n8n text,
    crm_webhook_url text,
    auth_token_crm text,
    typebot_webhook_url text,
    auth_token_typebot text,
    rabbitmq_exchange text,
    rabbitmq_queue text,
    rabbitmq_routing_key text,
    business_id text NOT NULL
);


ALTER TABLE public."whatsappOficial" OWNER TO whaticket;

--
-- Name: whatsappOficial_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."whatsappOficial_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."whatsappOficial_id_seq" OWNER TO whaticket;

--
-- Name: whatsappOficial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."whatsappOficial_id_seq" OWNED BY public."whatsappOficial".id;


--
-- Name: company id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public.company ALTER COLUMN id SET DEFAULT nextval('public.company_id_seq'::regclass);


--
-- Name: sendMessageWhatsApp id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."sendMessageWhatsApp" ALTER COLUMN id SET DEFAULT nextval('public."sendMessageWhatsApp_id_seq"'::regclass);


--
-- Name: whatsappOficial id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."whatsappOficial" ALTER COLUMN id SET DEFAULT nextval('public."whatsappOficial_id_seq"'::regclass);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- Name: sendMessageWhatsApp sendMessageWhatsApp_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."sendMessageWhatsApp"
    ADD CONSTRAINT "sendMessageWhatsApp_pkey" PRIMARY KEY (id);


--
-- Name: whatsappOficial whatsappOficial_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."whatsappOficial"
    ADD CONSTRAINT "whatsappOficial_pkey" PRIMARY KEY (id);


--
-- Name: company_idEmpresaMult100_key; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE UNIQUE INDEX "company_idEmpresaMult100_key" ON public.company USING btree ("idEmpresaMult100");


--
-- Name: whatsappOficial_token_mult100_key; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE UNIQUE INDEX "whatsappOficial_token_mult100_key" ON public."whatsappOficial" USING btree (token_mult100);


--
-- Name: sendMessageWhatsApp sendMessageWhatsApp_whatsappOficialId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."sendMessageWhatsApp"
    ADD CONSTRAINT "sendMessageWhatsApp_whatsappOficialId_fkey" FOREIGN KEY ("whatsappOficialId") REFERENCES public."whatsappOficial"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: whatsappOficial whatsappOficial_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."whatsappOficial"
    ADD CONSTRAINT "whatsappOficial_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 2fmUHeAxHG79lZLg64tkbJlRhvnNxmxa4IaI3bh10vBP6qU6kihWr6U5vUwt8jK

