--
-- PostgreSQL database dump
--

\restrict rItp041ip3XtfVxB6OdOf7kHnPz52w6SUfJ2llu5H6gjVaMy49OdJhkYO77O1si

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
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: enum_Announcements_type; Type: TYPE; Schema: public; Owner: whaticket
--

CREATE TYPE public."enum_Announcements_type" AS ENUM (
    'general',
    'birthday',
    'system'
);


ALTER TYPE public."enum_Announcements_type" OWNER TO whaticket;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AIAgentKnowledges; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."AIAgentKnowledges" (
    id integer NOT NULL,
    type character varying(255) NOT NULL,
    title text,
    content text,
    "filePath" character varying(255),
    "mimeType" character varying(255),
    "agentId" integer NOT NULL,
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."AIAgentKnowledges" OWNER TO whaticket;

--
-- Name: AIAgentKnowledges_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."AIAgentKnowledges_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AIAgentKnowledges_id_seq" OWNER TO whaticket;

--
-- Name: AIAgentKnowledges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."AIAgentKnowledges_id_seq" OWNED BY public."AIAgentKnowledges".id;


--
-- Name: AIAgents; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."AIAgents" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(255) DEFAULT 'general'::character varying,
    "voiceTone" character varying(255) DEFAULT 'friendly'::character varying,
    model character varying(255) DEFAULT 'gpt-4o-mini'::character varying,
    "apiKey" character varying(255) NOT NULL,
    languages text,
    personality text,
    "isActive" boolean DEFAULT true,
    "initialMessage" text,
    "responseRules" text,
    "allowTransfer" boolean DEFAULT true,
    "transferKeywords" text,
    "transferMessage" text,
    "responseDelay" integer DEFAULT 1,
    "maxChars" integer DEFAULT 2000,
    "humanizeConversation" boolean DEFAULT true,
    "audioEnabled" boolean DEFAULT false,
    temperature double precision DEFAULT '1'::double precision,
    "maxTokens" integer DEFAULT 2000,
    "maxMessages" integer DEFAULT 10,
    "promptTokens" integer DEFAULT 0,
    "completionTokens" integer DEFAULT 0,
    "totalTokens" integer DEFAULT 0,
    "queueId" integer,
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "transferUserIds" text,
    "transferUserMode" character varying(255) DEFAULT 'random'::character varying,
    "replyMode" character varying(255) DEFAULT 'all'::character varying NOT NULL,
    "replyContactIds" text,
    "replyTagIds" text,
    "returnMenuEnabled" boolean DEFAULT false NOT NULL,
    "returnMenuKeywords" text,
    "returnMenuMessage" text,
    "closeTicketEnabled" boolean DEFAULT false NOT NULL,
    "closeTicketKeywords" text,
    "closeTicketMessage" text
);


ALTER TABLE public."AIAgents" OWNER TO whaticket;

--
-- Name: COLUMN "AIAgents"."transferUserIds"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."AIAgents"."transferUserIds" IS 'JSON array of user IDs to transfer to when shouldTransfer=true';


--
-- Name: COLUMN "AIAgents"."transferUserMode"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."AIAgents"."transferUserMode" IS 'random | sequence | specific';


--
-- Name: AIAgents_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."AIAgents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AIAgents_id_seq" OWNER TO whaticket;

--
-- Name: AIAgents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."AIAgents_id_seq" OWNED BY public."AIAgents".id;


--
-- Name: Announcements; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Announcements" (
    id integer NOT NULL,
    priority integer,
    title character varying(255) NOT NULL,
    text text NOT NULL,
    "mediaPath" text,
    "mediaName" text,
    "companyId" integer NOT NULL,
    status boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "targetCompanyId" integer,
    type public."enum_Announcements_type" DEFAULT 'general'::public."enum_Announcements_type" NOT NULL,
    "isAutoGenerated" boolean DEFAULT false NOT NULL,
    "expiresAt" timestamp with time zone
);


ALTER TABLE public."Announcements" OWNER TO whaticket;

--
-- Name: COLUMN "Announcements"."targetCompanyId"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."Announcements"."targetCompanyId" IS 'ID da empresa alvo. NULL = todas as empresas';


--
-- Name: COLUMN "Announcements".type; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."Announcements".type IS 'Tipo do informativo';


--
-- Name: COLUMN "Announcements"."isAutoGenerated"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."Announcements"."isAutoGenerated" IS 'Informativo gerado automaticamente pelo sistema';


--
-- Name: COLUMN "Announcements"."expiresAt"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."Announcements"."expiresAt" IS 'Data de expiração do informativo';


--
-- Name: Announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Announcements_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Announcements_id_seq" OWNER TO whaticket;

--
-- Name: Announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Announcements_id_seq" OWNED BY public."Announcements".id;


--
-- Name: ApiUsages; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."ApiUsages" (
    id integer NOT NULL,
    "companyId" integer DEFAULT 0,
    "dateUsed" text NOT NULL,
    "UsedOnDay" integer DEFAULT 0,
    "usedText" integer DEFAULT 0,
    "usedPDF" integer DEFAULT 0,
    "usedImage" integer DEFAULT 0,
    "usedVideo" integer DEFAULT 0,
    "usedOther" integer DEFAULT 0,
    "usedCheckNumber" integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ApiUsages" OWNER TO whaticket;

--
-- Name: ApiUsages_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."ApiUsages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ApiUsages_id_seq" OWNER TO whaticket;

--
-- Name: ApiUsages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."ApiUsages_id_seq" OWNED BY public."ApiUsages".id;


--
-- Name: Baileys; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Baileys" (
    id integer NOT NULL,
    "whatsappId" integer NOT NULL,
    contacts jsonb,
    chats jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Baileys" OWNER TO whaticket;

--
-- Name: Baileys_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Baileys_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Baileys_id_seq" OWNER TO whaticket;

--
-- Name: Baileys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Baileys_id_seq" OWNED BY public."Baileys".id;


--
-- Name: BirthdaySettings; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."BirthdaySettings" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userBirthdayEnabled" boolean DEFAULT true NOT NULL,
    "contactBirthdayEnabled" boolean DEFAULT true NOT NULL,
    "userBirthdayMessage" text DEFAULT '🎉 Parabéns, {nome}! Hoje é seu dia especial! Desejamos muito sucesso e felicidade! '::text,
    "contactBirthdayMessage" text DEFAULT '🎉 Parabéns, {nome}! Hoje é seu aniversário! Desejamos muito sucesso, saúde e felicidade! ✨'::text,
    "sendBirthdayTime" time without time zone DEFAULT '09:00:00'::time without time zone NOT NULL,
    "createAnnouncementForUsers" boolean DEFAULT true NOT NULL,
    "whatsappId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."BirthdaySettings" OWNER TO whaticket;

--
-- Name: COLUMN "BirthdaySettings"."userBirthdayEnabled"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."BirthdaySettings"."userBirthdayEnabled" IS 'Habilitar notificações de aniversário de usuários';


--
-- Name: COLUMN "BirthdaySettings"."contactBirthdayEnabled"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."BirthdaySettings"."contactBirthdayEnabled" IS 'Habilitar envio automático de mensagens de aniversário para contatos';


--
-- Name: COLUMN "BirthdaySettings"."userBirthdayMessage"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."BirthdaySettings"."userBirthdayMessage" IS 'Mensagem de aniversário para usuários (interno)';


--
-- Name: COLUMN "BirthdaySettings"."contactBirthdayMessage"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."BirthdaySettings"."contactBirthdayMessage" IS 'Mensagem de aniversário para contatos (WhatsApp)';


--
-- Name: COLUMN "BirthdaySettings"."sendBirthdayTime"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."BirthdaySettings"."sendBirthdayTime" IS 'Horário para envio das mensagens de aniversário';


--
-- Name: COLUMN "BirthdaySettings"."createAnnouncementForUsers"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."BirthdaySettings"."createAnnouncementForUsers" IS 'Criar informativo quando usuário faz aniversário';


--
-- Name: COLUMN "BirthdaySettings"."whatsappId"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."BirthdaySettings"."whatsappId" IS 'ID da conexão WhatsApp para envio de mensagens de aniversário';


--
-- Name: BirthdaySettings_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."BirthdaySettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."BirthdaySettings_id_seq" OWNER TO whaticket;

--
-- Name: BirthdaySettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."BirthdaySettings_id_seq" OWNED BY public."BirthdaySettings".id;


--
-- Name: CallHistory; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."CallHistory" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_wavoip character varying(255) NOT NULL,
    whatsapp_id integer NOT NULL,
    contact_id integer NOT NULL,
    company_id integer NOT NULL,
    phone_to character varying(255) NOT NULL,
    name character varying(255),
    url character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CallHistory" OWNER TO whaticket;

--
-- Name: CallHistory_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."CallHistory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CallHistory_id_seq" OWNER TO whaticket;

--
-- Name: CallHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."CallHistory_id_seq" OWNED BY public."CallHistory".id;


--
-- Name: CampaignSettings; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."CampaignSettings" (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value text,
    "companyId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CampaignSettings" OWNER TO whaticket;

--
-- Name: CampaignSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."CampaignSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CampaignSettings_id_seq" OWNER TO whaticket;

--
-- Name: CampaignSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."CampaignSettings_id_seq" OWNED BY public."CampaignSettings".id;


--
-- Name: CampaignShipping; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."CampaignShipping" (
    id integer NOT NULL,
    "jobId" character varying(255),
    number character varying(255) NOT NULL,
    message text NOT NULL,
    "confirmationMessage" text,
    confirmation boolean,
    "contactId" integer,
    "campaignId" integer NOT NULL,
    "confirmationRequestedAt" timestamp with time zone,
    "confirmedAt" timestamp with time zone,
    "deliveredAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CampaignShipping" OWNER TO whaticket;

--
-- Name: CampaignShipping_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."CampaignShipping_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CampaignShipping_id_seq" OWNER TO whaticket;

--
-- Name: CampaignShipping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."CampaignShipping_id_seq" OWNED BY public."CampaignShipping".id;


--
-- Name: Campaigns; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Campaigns" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    message1 text DEFAULT ''::text,
    message2 text DEFAULT ''::text,
    message3 text DEFAULT ''::text,
    message4 text DEFAULT ''::text,
    message5 text DEFAULT ''::text,
    "confirmationMessage1" text DEFAULT ''::text,
    "confirmationMessage2" text DEFAULT ''::text,
    "confirmationMessage3" text DEFAULT ''::text,
    "confirmationMessage4" text DEFAULT ''::text,
    "confirmationMessage5" text DEFAULT ''::text,
    status character varying(255),
    confirmation boolean DEFAULT false,
    "mediaPath" text,
    "mediaName" text,
    "companyId" integer NOT NULL,
    "contactListId" integer,
    "whatsappId" integer,
    "scheduledAt" timestamp with time zone,
    "completedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer,
    "statusTicket" character varying(255) DEFAULT 'closed'::character varying,
    "queueId" integer,
    "openTicket" character varying(255) DEFAULT 'disabled'::character varying,
    "tagListId" character varying(255),
    "templateVariables" text,
    "templateId" integer,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurrenceType" character varying(255),
    "recurrenceInterval" integer DEFAULT 1,
    "recurrenceDaysOfWeek" text,
    "recurrenceDayOfMonth" integer,
    "recurrenceEndDate" timestamp with time zone,
    "maxExecutions" integer,
    "executionCount" integer DEFAULT 0 NOT NULL,
    "nextScheduledAt" timestamp with time zone,
    "lastExecutedAt" timestamp with time zone
);


ALTER TABLE public."Campaigns" OWNER TO whaticket;

--
-- Name: COLUMN "Campaigns"."tagListId"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."Campaigns"."tagListId" IS 'ID da tag para seleção de contatos';


--
-- Name: Campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Campaigns_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Campaigns_id_seq" OWNER TO whaticket;

--
-- Name: Campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Campaigns_id_seq" OWNED BY public."Campaigns".id;


--
-- Name: ChatMessages; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."ChatMessages" (
    id integer NOT NULL,
    "chatId" integer NOT NULL,
    "senderId" integer NOT NULL,
    message text DEFAULT ''::text,
    "mediaPath" text,
    "mediaName" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isEdited" boolean DEFAULT false,
    "isDeleted" boolean DEFAULT false,
    "forwardedFromId" integer,
    "replyToId" integer,
    "companyId" integer,
    "mediaType" character varying(255)
);


ALTER TABLE public."ChatMessages" OWNER TO whaticket;

--
-- Name: ChatMessages_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."ChatMessages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChatMessages_id_seq" OWNER TO whaticket;

--
-- Name: ChatMessages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."ChatMessages_id_seq" OWNED BY public."ChatMessages".id;


--
-- Name: ChatUsers; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."ChatUsers" (
    id integer NOT NULL,
    "chatId" integer NOT NULL,
    "userId" integer NOT NULL,
    unreads integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ChatUsers" OWNER TO whaticket;

--
-- Name: ChatUsers_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."ChatUsers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChatUsers_id_seq" OWNER TO whaticket;

--
-- Name: ChatUsers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."ChatUsers_id_seq" OWNED BY public."ChatUsers".id;


--
-- Name: Chatbots; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Chatbots" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "queueId" integer,
    "chatbotId" integer,
    "greetingMessage" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isAgent" boolean DEFAULT false,
    "optQueueId" integer,
    "optUserId" integer,
    "queueType" character varying(255) DEFAULT 'text'::character varying NOT NULL,
    "optIntegrationId" integer,
    "optFileId" integer,
    "closeTicket" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Chatbots" OWNER TO whaticket;

--
-- Name: Chatbots_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Chatbots_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Chatbots_id_seq" OWNER TO whaticket;

--
-- Name: Chatbots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Chatbots_id_seq" OWNED BY public."Chatbots".id;


--
-- Name: Chats; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Chats" (
    id integer NOT NULL,
    title text DEFAULT ''::text,
    uuid character varying(255) DEFAULT ''::character varying,
    "ownerId" integer NOT NULL,
    "lastMessage" text,
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isGroup" boolean DEFAULT false,
    "groupName" character varying(255),
    "groupAdminId" integer,
    description character varying(255) DEFAULT ''::character varying NOT NULL,
    "groupImage" character varying(255) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public."Chats" OWNER TO whaticket;

--
-- Name: Chats_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Chats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Chats_id_seq" OWNER TO whaticket;

--
-- Name: Chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Chats_id_seq" OWNED BY public."Chats".id;


--
-- Name: Companies; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Companies" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    email character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "planId" integer,
    status boolean DEFAULT true,
    schedules jsonb DEFAULT '[]'::jsonb,
    "dueDate" timestamp with time zone,
    recurrence character varying(255) DEFAULT ''::character varying,
    document character varying(255) DEFAULT ''::character varying,
    "paymentMethod" character varying(255) DEFAULT ''::character varying,
    "lastLogin" timestamp with time zone,
    "folderSize" character varying(255),
    "updatedAtFolder" character varying(255),
    "numberFileFolder" character varying(255),
    "generateInvoice" boolean DEFAULT true
);


ALTER TABLE public."Companies" OWNER TO whaticket;

--
-- Name: CompaniesSettings; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."CompaniesSettings" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "hoursCloseTicketsAuto" character varying(255) NOT NULL,
    "chatBotType" character varying(255) NOT NULL,
    "acceptCallWhatsapp" character varying(255) NOT NULL,
    "userRandom" character varying(255) NOT NULL,
    "sendGreetingMessageOneQueues" character varying(255) NOT NULL,
    "sendSignMessage" character varying(255) NOT NULL,
    "sendFarewellWaitingTicket" character varying(255) NOT NULL,
    "userRating" character varying(255) NOT NULL,
    "sendGreetingAccepted" character varying(255) NOT NULL,
    "CheckMsgIsGroup" character varying(255) NOT NULL,
    "sendQueuePosition" character varying(255) NOT NULL,
    "scheduleType" character varying(255) NOT NULL,
    "acceptAudioMessageContact" character varying(255) NOT NULL,
    "enableLGPD" character varying(255) NOT NULL,
    "sendMsgTransfTicket" character varying(255) NOT NULL,
    "requiredTag" character varying(255) NOT NULL,
    "lgpdDeleteMessage" character varying(255) NOT NULL,
    "lgpdHideNumber" character varying(255) NOT NULL,
    "lgpdConsent" character varying(255) NOT NULL,
    "lgpdLink" character varying(255),
    "lgpdMessage" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "DirectTicketsToWallets" boolean DEFAULT false,
    "closeTicketOnTransfer" boolean DEFAULT false,
    "transferMessage" text DEFAULT ''::text,
    "greetingAcceptedMessage" text DEFAULT ''::text,
    "AcceptCallWhatsappMessage" text DEFAULT ''::text,
    "sendQueuePositionMessage" text DEFAULT ''::text,
    "showNotificationPending" boolean DEFAULT false NOT NULL,
    "informarValorVenda" boolean DEFAULT false NOT NULL,
    "motivosFinalizacao" text,
    "transferredTicketStatus" character varying(255) DEFAULT 'open'::character varying NOT NULL,
    "aiAutoSummary" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "aiSuggestResponse" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "copyContactPrefix" character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public."CompaniesSettings" OWNER TO whaticket;

--
-- Name: CompaniesSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."CompaniesSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CompaniesSettings_id_seq" OWNER TO whaticket;

--
-- Name: CompaniesSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."CompaniesSettings_id_seq" OWNED BY public."CompaniesSettings".id;


--
-- Name: Companies_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Companies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Companies_id_seq" OWNER TO whaticket;

--
-- Name: Companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Companies_id_seq" OWNED BY public."Companies".id;


--
-- Name: CompanyKanbanConfigs; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."CompanyKanbanConfigs" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "laneOrder" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CompanyKanbanConfigs" OWNER TO whaticket;

--
-- Name: COLUMN "CompanyKanbanConfigs"."laneOrder"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."CompanyKanbanConfigs"."laneOrder" IS 'JSON array with lane IDs in order';


--
-- Name: CompanyKanbanConfigs_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."CompanyKanbanConfigs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CompanyKanbanConfigs_id_seq" OWNER TO whaticket;

--
-- Name: CompanyKanbanConfigs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."CompanyKanbanConfigs_id_seq" OWNED BY public."CompanyKanbanConfigs".id;


--
-- Name: ContactCustomFields; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."ContactCustomFields" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255) NOT NULL,
    "contactId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ContactCustomFields" OWNER TO whaticket;

--
-- Name: ContactCustomFields_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."ContactCustomFields_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ContactCustomFields_id_seq" OWNER TO whaticket;

--
-- Name: ContactCustomFields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."ContactCustomFields_id_seq" OWNED BY public."ContactCustomFields".id;


--
-- Name: ContactGroups; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."ContactGroups" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "contactId" integer,
    "companyId" integer,
    "userId" integer
);


ALTER TABLE public."ContactGroups" OWNER TO whaticket;

--
-- Name: ContactGroups_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."ContactGroups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ContactGroups_id_seq" OWNER TO whaticket;

--
-- Name: ContactGroups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."ContactGroups_id_seq" OWNED BY public."ContactGroups".id;


--
-- Name: ContactListItems; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."ContactListItems" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255) NOT NULL,
    email character varying(255),
    "contactListId" integer NOT NULL,
    "isWhatsappValid" boolean DEFAULT false,
    "companyId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isGroup" boolean DEFAULT false
);


ALTER TABLE public."ContactListItems" OWNER TO whaticket;

--
-- Name: ContactListItems_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."ContactListItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ContactListItems_id_seq" OWNER TO whaticket;

--
-- Name: ContactListItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."ContactListItems_id_seq" OWNED BY public."ContactListItems".id;


--
-- Name: ContactLists; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."ContactLists" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "companyId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ContactLists" OWNER TO whaticket;

--
-- Name: ContactLists_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."ContactLists_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ContactLists_id_seq" OWNER TO whaticket;

--
-- Name: ContactLists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."ContactLists_id_seq" OWNED BY public."ContactLists".id;


--
-- Name: ContactTags; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."ContactTags" (
    "contactId" integer NOT NULL,
    "tagId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ContactTags" OWNER TO whaticket;

--
-- Name: ContactWallets; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."ContactWallets" (
    id integer NOT NULL,
    "walletId" integer NOT NULL,
    "contactId" integer NOT NULL,
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "queueId" integer NOT NULL
);


ALTER TABLE public."ContactWallets" OWNER TO whaticket;

--
-- Name: ContactWallets_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."ContactWallets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ContactWallets_id_seq" OWNER TO whaticket;

--
-- Name: ContactWallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."ContactWallets_id_seq" OWNED BY public."ContactWallets".id;


--
-- Name: Contacts; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Contacts" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255) NOT NULL,
    "profilePicUrl" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    email character varying(255) DEFAULT ''::character varying NOT NULL,
    "isGroup" boolean DEFAULT false NOT NULL,
    "companyId" integer,
    "acceptAudioMessage" boolean DEFAULT true NOT NULL,
    channel text DEFAULT 'whatsapp'::text,
    active boolean DEFAULT true,
    "disableBot" boolean DEFAULT false NOT NULL,
    "remoteJid" character varying(255) DEFAULT NULL::character varying,
    "lgpdAcceptedAt" timestamp with time zone,
    "urlPicture" text,
    "pictureUpdated" boolean DEFAULT false NOT NULL,
    "whatsappId" integer,
    lid character varying(255),
    "birthDate" date,
    "lastInteractionClient" timestamp with time zone
);


ALTER TABLE public."Contacts" OWNER TO whaticket;

--
-- Name: COLUMN "Contacts".lid; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."Contacts".lid IS 'Linked Device ID para unificar contatos multi-dispositivo';


--
-- Name: COLUMN "Contacts"."birthDate"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."Contacts"."birthDate" IS 'Data de nascimento do contato';


--
-- Name: COLUMN "Contacts"."lastInteractionClient"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."Contacts"."lastInteractionClient" IS 'Última interação do cliente - para janela de 24h WhatsApp Oficial';


--
-- Name: Contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Contacts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Contacts_id_seq" OWNER TO whaticket;

--
-- Name: Contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Contacts_id_seq" OWNED BY public."Contacts".id;


--
-- Name: DialogChatBots; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."DialogChatBots" (
    id integer NOT NULL,
    awaiting integer DEFAULT 0 NOT NULL,
    "contactId" integer,
    "chatbotId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "queueId" integer
);


ALTER TABLE public."DialogChatBots" OWNER TO whaticket;

--
-- Name: DialogChatBots_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."DialogChatBots_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DialogChatBots_id_seq" OWNER TO whaticket;

--
-- Name: DialogChatBots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."DialogChatBots_id_seq" OWNED BY public."DialogChatBots".id;


--
-- Name: Files; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Files" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    name character varying(255) NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Files" OWNER TO whaticket;

--
-- Name: FilesOptions; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."FilesOptions" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    path character varying(255) NOT NULL,
    "fileId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "mediaType" character varying(255) DEFAULT ''::character varying
);


ALTER TABLE public."FilesOptions" OWNER TO whaticket;

--
-- Name: FilesOptions_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."FilesOptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FilesOptions_id_seq" OWNER TO whaticket;

--
-- Name: FilesOptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."FilesOptions_id_seq" OWNED BY public."FilesOptions".id;


--
-- Name: Files_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Files_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Files_id_seq" OWNER TO whaticket;

--
-- Name: Files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Files_id_seq" OWNED BY public."Files".id;


--
-- Name: FloupSchedules; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."FloupSchedules" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "ticketId" integer,
    "contactId" integer,
    "floupId" integer NOT NULL,
    "currentStepIndex" integer DEFAULT 0 NOT NULL,
    "nextRunAt" timestamp with time zone NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    "stepOrder" integer,
    "stepData" jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."FloupSchedules" OWNER TO whaticket;

--
-- Name: FloupSchedules_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."FloupSchedules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FloupSchedules_id_seq" OWNER TO whaticket;

--
-- Name: FloupSchedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."FloupSchedules_id_seq" OWNED BY public."FloupSchedules".id;


--
-- Name: Floups; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Floups" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "templateType" character varying(255),
    steps jsonb,
    "stopConditions" jsonb,
    "pauseConditions" jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    condition character varying(255) DEFAULT 'queue'::character varying,
    "conditionValue" text DEFAULT ''::text
);


ALTER TABLE public."Floups" OWNER TO whaticket;

--
-- Name: Floups_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Floups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Floups_id_seq" OWNER TO whaticket;

--
-- Name: Floups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Floups_id_seq" OWNED BY public."Floups".id;


--
-- Name: FlowAudios; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."FlowAudios" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."FlowAudios" OWNER TO whaticket;

--
-- Name: FlowAudios_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."FlowAudios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FlowAudios_id_seq" OWNER TO whaticket;

--
-- Name: FlowAudios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."FlowAudios_id_seq" OWNED BY public."FlowAudios".id;


--
-- Name: FlowBuilders; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."FlowBuilders" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    active boolean DEFAULT true,
    flow json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."FlowBuilders" OWNER TO whaticket;

--
-- Name: FlowBuilders_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."FlowBuilders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FlowBuilders_id_seq" OWNER TO whaticket;

--
-- Name: FlowBuilders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."FlowBuilders_id_seq" OWNED BY public."FlowBuilders".id;


--
-- Name: FlowCampaigns; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."FlowCampaigns" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "flowId" integer NOT NULL,
    phrase text NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "whatsappId" integer,
    "whatsappIds" text DEFAULT '[]'::text NOT NULL,
    "tagIds" text
);


ALTER TABLE public."FlowCampaigns" OWNER TO whaticket;

--
-- Name: COLUMN "FlowCampaigns"."tagIds"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."FlowCampaigns"."tagIds" IS 'JSON array of tag IDs that filter which contacts this campaign applies to';


--
-- Name: FlowCampaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."FlowCampaigns_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FlowCampaigns_id_seq" OWNER TO whaticket;

--
-- Name: FlowCampaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."FlowCampaigns_id_seq" OWNED BY public."FlowCampaigns".id;


--
-- Name: FlowDefaults; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."FlowDefaults" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer NOT NULL,
    "flowIdWelcome" integer,
    "flowIdNotPhrase" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "flowIdInactiveTime" integer
);


ALTER TABLE public."FlowDefaults" OWNER TO whaticket;

--
-- Name: FlowDefaults_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."FlowDefaults_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FlowDefaults_id_seq" OWNER TO whaticket;

--
-- Name: FlowDefaults_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."FlowDefaults_id_seq" OWNED BY public."FlowDefaults".id;


--
-- Name: FlowDocs; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."FlowDocs" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."FlowDocs" OWNER TO whaticket;

--
-- Name: FlowDocs_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."FlowDocs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FlowDocs_id_seq" OWNER TO whaticket;

--
-- Name: FlowDocs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."FlowDocs_id_seq" OWNED BY public."FlowDocs".id;


--
-- Name: FlowImgs; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."FlowImgs" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."FlowImgs" OWNER TO whaticket;

--
-- Name: FlowImgs_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."FlowImgs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FlowImgs_id_seq" OWNER TO whaticket;

--
-- Name: FlowImgs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."FlowImgs_id_seq" OWNED BY public."FlowImgs".id;


--
-- Name: Helps; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Helps" (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    video character varying(255),
    link text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Helps" OWNER TO whaticket;

--
-- Name: Helps_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Helps_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Helps_id_seq" OWNER TO whaticket;

--
-- Name: Helps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Helps_id_seq" OWNED BY public."Helps".id;


--
-- Name: InstallationLogs; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."InstallationLogs" (
    id integer NOT NULL,
    ip character varying(255) NOT NULL,
    frontend_url character varying(255) NOT NULL,
    backend_url character varying(255) NOT NULL,
    admin_url character varying(255),
    deploy_password character varying(255),
    master_password character varying(255),
    hostname character varying(255),
    os_info character varying(255),
    installer_version character varying(255),
    raw_payload json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."InstallationLogs" OWNER TO whaticket;

--
-- Name: InstallationLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."InstallationLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."InstallationLogs_id_seq" OWNER TO whaticket;

--
-- Name: InstallationLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."InstallationLogs_id_seq" OWNED BY public."InstallationLogs".id;


--
-- Name: Integrations; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Integrations" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "isActive" boolean DEFAULT false,
    token text,
    "foneContact" character varying(255),
    "userLogin" character varying(255),
    "passLogin" character varying(255),
    "finalCurrentMonth" integer,
    "initialCurrentMonth" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Integrations" OWNER TO whaticket;

--
-- Name: Integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Integrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Integrations_id_seq" OWNER TO whaticket;

--
-- Name: Integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Integrations_id_seq" OWNED BY public."Integrations".id;


--
-- Name: InteractiveMessageTemplates; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."InteractiveMessageTemplates" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "interactiveType" character varying(255) NOT NULL,
    "templateData" text NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."InteractiveMessageTemplates" OWNER TO whaticket;

--
-- Name: InteractiveMessageTemplates_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."InteractiveMessageTemplates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."InteractiveMessageTemplates_id_seq" OWNER TO whaticket;

--
-- Name: InteractiveMessageTemplates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."InteractiveMessageTemplates_id_seq" OWNED BY public."InteractiveMessageTemplates".id;


--
-- Name: Invoices; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Invoices" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "dueDate" character varying(255),
    detail character varying(255),
    status character varying(255),
    value double precision,
    users integer DEFAULT 0,
    connections integer DEFAULT 0,
    queues integer DEFAULT 0,
    "useWhatsapp" boolean DEFAULT true,
    "useFacebook" boolean DEFAULT true,
    "useInstagram" boolean DEFAULT true,
    "useCampaigns" boolean DEFAULT true,
    "useSchedules" boolean DEFAULT true,
    "useInternalChat" boolean DEFAULT true,
    "useExternalApi" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "linkInvoice" text DEFAULT ''::text,
    txid character varying(255)
);


ALTER TABLE public."Invoices" OWNER TO whaticket;

--
-- Name: Invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Invoices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Invoices_id_seq" OWNER TO whaticket;

--
-- Name: Invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Invoices_id_seq" OWNED BY public."Invoices".id;


--
-- Name: LogTickets; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."LogTickets" (
    id integer NOT NULL,
    "userId" integer,
    "ticketId" integer NOT NULL,
    "queueId" integer,
    type character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."LogTickets" OWNER TO whaticket;

--
-- Name: LogTickets_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."LogTickets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."LogTickets_id_seq" OWNER TO whaticket;

--
-- Name: LogTickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."LogTickets_id_seq" OWNED BY public."LogTickets".id;


--
-- Name: Messages; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Messages" (
    body text NOT NULL,
    ack integer DEFAULT 0 NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "mediaType" character varying(255),
    "mediaUrl" character varying(255),
    "ticketId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "fromMe" boolean DEFAULT false NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "contactId" integer,
    "companyId" integer,
    "remoteJid" text,
    "dataJson" text,
    participant text,
    "queueId" integer,
    "ticketTrakingId" integer,
    "quotedMsgId" integer,
    wid character varying(255),
    id integer NOT NULL,
    "isPrivate" boolean DEFAULT false,
    "isEdited" boolean DEFAULT false,
    "isForwarded" boolean DEFAULT false,
    transcrito boolean DEFAULT false
);


ALTER TABLE public."Messages" OWNER TO whaticket;

--
-- Name: Messages_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Messages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Messages_id_seq" OWNER TO whaticket;

--
-- Name: Messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Messages_id_seq" OWNED BY public."Messages".id;


--
-- Name: Partners; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Partners" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    email character varying(255),
    document character varying(255),
    commission numeric(10,2) NOT NULL,
    "typeCommission" character varying(255) NOT NULL,
    "walletId" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Partners" OWNER TO whaticket;

--
-- Name: Partners_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Partners_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Partners_id_seq" OWNER TO whaticket;

--
-- Name: Partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Partners_id_seq" OWNED BY public."Partners".id;


--
-- Name: PasswordResetTokens; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."PasswordResetTokens" (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    "userId" integer NOT NULL,
    "companyId" integer NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PasswordResetTokens" OWNER TO whaticket;

--
-- Name: PasswordResetTokens_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."PasswordResetTokens_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PasswordResetTokens_id_seq" OWNER TO whaticket;

--
-- Name: PasswordResetTokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."PasswordResetTokens_id_seq" OWNED BY public."PasswordResetTokens".id;


--
-- Name: Plans; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Plans" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    users integer DEFAULT 0,
    connections integer DEFAULT 0,
    queues integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    amount character varying(255),
    "useFacebook" boolean DEFAULT true,
    "useInstagram" boolean DEFAULT true,
    "useWhatsapp" boolean DEFAULT true,
    "useCampaigns" boolean DEFAULT true,
    "useExternalApi" boolean DEFAULT true,
    "useInternalChat" boolean DEFAULT true,
    "useSchedules" boolean DEFAULT true,
    "useKanban" boolean DEFAULT true,
    "isPublic" boolean DEFAULT true NOT NULL,
    recurrence character varying(255),
    trial boolean DEFAULT false,
    "trialDays" integer DEFAULT 0,
    "useOpenAi" boolean DEFAULT true,
    "useIntegrations" boolean DEFAULT true,
    "useWhatsappOfficial" boolean DEFAULT false,
    wavoip boolean DEFAULT false
);


ALTER TABLE public."Plans" OWNER TO whaticket;

--
-- Name: Plans_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Plans_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Plans_id_seq" OWNER TO whaticket;

--
-- Name: Plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Plans_id_seq" OWNED BY public."Plans".id;


--
-- Name: PresetWebhooks; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."PresetWebhooks" (
    id integer NOT NULL,
    "companyId" integer,
    name character varying(255) NOT NULL,
    description text,
    provider character varying(255) NOT NULL,
    configuration json NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PresetWebhooks" OWNER TO whaticket;

--
-- Name: PresetWebhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."PresetWebhooks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PresetWebhooks_id_seq" OWNER TO whaticket;

--
-- Name: PresetWebhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."PresetWebhooks_id_seq" OWNED BY public."PresetWebhooks".id;


--
-- Name: Prompts; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Prompts" (
    id integer NOT NULL,
    name text NOT NULL,
    "apiKey" text NOT NULL,
    prompt text NOT NULL,
    "maxTokens" integer DEFAULT 100 NOT NULL,
    "maxMessages" integer DEFAULT 10 NOT NULL,
    temperature integer DEFAULT 1 NOT NULL,
    "promptTokens" integer DEFAULT 0 NOT NULL,
    "completionTokens" integer DEFAULT 0 NOT NULL,
    "totalTokens" integer DEFAULT 0 NOT NULL,
    voice text,
    "voiceKey" text,
    "voiceRegion" text,
    "queueId" integer NOT NULL,
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "voiceMode" character varying(255) DEFAULT 'ambos'::character varying NOT NULL,
    "voicePriority" character varying(255) DEFAULT 'texto'::character varying NOT NULL
);


ALTER TABLE public."Prompts" OWNER TO whaticket;

--
-- Name: Prompts_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Prompts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Prompts_id_seq" OWNER TO whaticket;

--
-- Name: Prompts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Prompts_id_seq" OWNED BY public."Prompts".id;


--
-- Name: PushSubscriptions; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."PushSubscriptions" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "companyId" integer NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    "userAgent" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PushSubscriptions" OWNER TO whaticket;

--
-- Name: PushSubscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."PushSubscriptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PushSubscriptions_id_seq" OWNER TO whaticket;

--
-- Name: PushSubscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."PushSubscriptions_id_seq" OWNED BY public."PushSubscriptions".id;


--
-- Name: QueueIntegrations; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."QueueIntegrations" (
    id integer NOT NULL,
    type character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    "projectName" character varying(255) NOT NULL,
    "jsonContent" text NOT NULL,
    language character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "urlN8N" character varying(255) DEFAULT true NOT NULL,
    "companyId" integer,
    "typebotExpires" integer DEFAULT 0 NOT NULL,
    "typebotSlug" character varying(255) DEFAULT ''::character varying NOT NULL,
    "typebotKeywordFinish" character varying(255) DEFAULT ''::character varying NOT NULL,
    "typebotUnknownMessage" character varying(255) DEFAULT ''::character varying NOT NULL,
    "typebotDelayMessage" integer DEFAULT 1000 NOT NULL,
    "typebotKeywordRestart" character varying(255) DEFAULT ''::character varying,
    "typebotRestartMessage" character varying(255) DEFAULT ''::character varying,
    "enableTransfer" boolean DEFAULT false,
    "transferQueueId" integer,
    "transferUserId" integer,
    "queueIdAssign" integer,
    "whatsappId" integer,
    "userIdAssign" integer,
    "enableCloseTicket" boolean DEFAULT false,
    "closeTicketMessage" text,
    "enableOpenTicket" boolean DEFAULT false,
    "openTicketQueueId" integer,
    "openTicketUserId" integer,
    "openTicketMessage" text
);


ALTER TABLE public."QueueIntegrations" OWNER TO whaticket;

--
-- Name: QueueIntegrations_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."QueueIntegrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."QueueIntegrations_id_seq" OWNER TO whaticket;

--
-- Name: QueueIntegrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."QueueIntegrations_id_seq" OWNED BY public."QueueIntegrations".id;


--
-- Name: QueueOptions; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."QueueOptions" (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    option text,
    "queueId" integer,
    "parentId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."QueueOptions" OWNER TO whaticket;

--
-- Name: QueueOptions_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."QueueOptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."QueueOptions_id_seq" OWNER TO whaticket;

--
-- Name: QueueOptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."QueueOptions_id_seq" OWNED BY public."QueueOptions".id;


--
-- Name: QueueStates; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."QueueStates" (
    id integer NOT NULL,
    "queueId" integer NOT NULL,
    "lastUserIndex" integer DEFAULT '-1'::integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."QueueStates" OWNER TO whaticket;

--
-- Name: QueueStates_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."QueueStates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."QueueStates_id_seq" OWNER TO whaticket;

--
-- Name: QueueStates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."QueueStates_id_seq" OWNED BY public."QueueStates".id;


--
-- Name: Queues; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Queues" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    color character varying(255) NOT NULL,
    "greetingMessage" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "companyId" integer,
    "outOfHoursMessage" text,
    schedules jsonb DEFAULT '[]'::jsonb,
    "orderQueue" integer,
    "tempoRoteador" integer DEFAULT 0 NOT NULL,
    "ativarRoteador" boolean DEFAULT false NOT NULL,
    "integrationId" integer,
    "fileListId" integer,
    "closeTicket" boolean DEFAULT false NOT NULL,
    "typeRandomMode" text DEFAULT 'RANDOM'::text NOT NULL,
    "randomizeImmediate" boolean DEFAULT false
);


ALTER TABLE public."Queues" OWNER TO whaticket;

--
-- Name: Queues_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Queues_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Queues_id_seq" OWNER TO whaticket;

--
-- Name: Queues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Queues_id_seq" OWNED BY public."Queues".id;


--
-- Name: QuickMessageComponents; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."QuickMessageComponents" (
    id integer NOT NULL,
    "quickMessageId" integer NOT NULL,
    type character varying(255),
    text text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    buttons character varying(255),
    example character varying(2048),
    format character varying(255)
);


ALTER TABLE public."QuickMessageComponents" OWNER TO whaticket;

--
-- Name: QuickMessageComponents_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."QuickMessageComponents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."QuickMessageComponents_id_seq" OWNER TO whaticket;

--
-- Name: QuickMessageComponents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."QuickMessageComponents_id_seq" OWNED BY public."QuickMessageComponents".id;


--
-- Name: QuickMessages; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."QuickMessages" (
    id integer NOT NULL,
    shortcode character varying(255) NOT NULL,
    message text,
    "companyId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer,
    "mediaPath" character varying(255) DEFAULT NULL::character varying,
    "mediaName" character varying(255) DEFAULT NULL::character varying,
    geral boolean DEFAULT false NOT NULL,
    visao boolean DEFAULT true,
    "isOficial" boolean DEFAULT false,
    "metaID" character varying(255),
    status character varying(255),
    category character varying(255),
    language character varying(255),
    "whatsappId" integer,
    "mediaType" character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public."QuickMessages" OWNER TO whaticket;

--
-- Name: COLUMN "QuickMessages"."mediaType"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."QuickMessages"."mediaType" IS 'Tipo de mídia: image, audio, video, document';


--
-- Name: QuickMessages_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."QuickMessages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."QuickMessages_id_seq" OWNER TO whaticket;

--
-- Name: QuickMessages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."QuickMessages_id_seq" OWNED BY public."QuickMessages".id;


--
-- Name: ScheduledMessages; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."ScheduledMessages" (
    id integer NOT NULL,
    data_mensagem_programada timestamp with time zone,
    id_conexao character varying(255),
    intervalo character varying(255),
    valor_intervalo character varying(255),
    mensagem text,
    tipo_dias_envio character varying(255),
    mostrar_usuario_mensagem boolean DEFAULT false,
    criar_ticket boolean DEFAULT false,
    contatos jsonb,
    tags jsonb,
    "companyId" integer,
    nome character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "mediaPath" character varying(255),
    "mediaName" character varying(255),
    tipo_arquivo character varying(255),
    usuario_envio character varying(255),
    enviar_quantas_vezes character varying(255)
);


ALTER TABLE public."ScheduledMessages" OWNER TO whaticket;

--
-- Name: ScheduledMessagesEnvios; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."ScheduledMessagesEnvios" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "mediaPath" character varying(255),
    "mediaName" character varying(255),
    mensagem text,
    "companyId" integer,
    data_envio timestamp with time zone,
    scheduledmessages integer,
    key character varying(255)
);


ALTER TABLE public."ScheduledMessagesEnvios" OWNER TO whaticket;

--
-- Name: ScheduledMessagesEnvios_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."ScheduledMessagesEnvios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ScheduledMessagesEnvios_id_seq" OWNER TO whaticket;

--
-- Name: ScheduledMessagesEnvios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."ScheduledMessagesEnvios_id_seq" OWNED BY public."ScheduledMessagesEnvios".id;


--
-- Name: ScheduledMessages_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."ScheduledMessages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ScheduledMessages_id_seq" OWNER TO whaticket;

--
-- Name: ScheduledMessages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."ScheduledMessages_id_seq" OWNED BY public."ScheduledMessages".id;


--
-- Name: Schedules; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Schedules" (
    id integer NOT NULL,
    body text NOT NULL,
    "sendAt" timestamp with time zone,
    "sentAt" timestamp with time zone,
    "contactId" integer,
    "ticketId" integer,
    "userId" integer,
    "companyId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    status character varying(255),
    "ticketUserId" integer,
    "queueId" integer,
    "whatsappId" integer,
    "statusTicket" character varying(255) DEFAULT 'closed'::character varying,
    "openTicket" character varying(255) DEFAULT 'disabled'::character varying,
    "mediaName" character varying(255) DEFAULT NULL::character varying,
    "mediaPath" character varying(255) DEFAULT NULL::character varying,
    intervalo integer DEFAULT 1,
    "valorIntervalo" integer DEFAULT 0,
    "tipoDias" integer DEFAULT 4,
    "enviarQuantasVezes" integer DEFAULT 1,
    "contadorEnvio" integer DEFAULT 0,
    assinar boolean DEFAULT false,
    "reminderDate" timestamp with time zone,
    "reminderSentAt" timestamp with time zone,
    "reminderStatus" character varying(255) DEFAULT NULL::character varying,
    "reminderMessage" text
);


ALTER TABLE public."Schedules" OWNER TO whaticket;

--
-- Name: Schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Schedules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Schedules_id_seq" OWNER TO whaticket;

--
-- Name: Schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Schedules_id_seq" OWNED BY public."Schedules".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO whaticket;

--
-- Name: Settings; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Settings" (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "companyId" integer,
    id integer NOT NULL
);


ALTER TABLE public."Settings" OWNER TO whaticket;

--
-- Name: Settings_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Settings_id_seq" OWNER TO whaticket;

--
-- Name: Settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Settings_id_seq" OWNED BY public."Settings".id;


--
-- Name: Subscriptions; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Subscriptions" (
    id integer NOT NULL,
    "isActive" boolean DEFAULT false,
    "expiresAt" timestamp with time zone NOT NULL,
    "userPriceCents" integer,
    "whatsPriceCents" integer,
    "lastInvoiceUrl" character varying(255),
    "lastPlanChange" timestamp with time zone,
    "companyId" integer NOT NULL,
    "providerSubscriptionId" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Subscriptions" OWNER TO whaticket;

--
-- Name: Subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Subscriptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Subscriptions_id_seq" OWNER TO whaticket;

--
-- Name: Subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Subscriptions_id_seq" OWNED BY public."Subscriptions".id;


--
-- Name: Tags; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Tags" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    color character varying(255),
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    kanban integer,
    "timeLane" integer DEFAULT 0,
    "greetingMessageLane" text,
    "nextLaneId" integer,
    "rollbackLaneId" integer DEFAULT 0,
    "mediaFiles" text,
    "whatsappLabelId" character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public."Tags" OWNER TO whaticket;

--
-- Name: COLUMN "Tags"."mediaFiles"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."Tags"."mediaFiles" IS 'JSON array with media files information';


--
-- Name: Tags_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Tags_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Tags_id_seq" OWNER TO whaticket;

--
-- Name: Tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Tags_id_seq" OWNED BY public."Tags".id;


--
-- Name: TicketFinalizationReasons; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."TicketFinalizationReasons" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TicketFinalizationReasons" OWNER TO whaticket;

--
-- Name: TicketFinalizationReasons_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."TicketFinalizationReasons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TicketFinalizationReasons_id_seq" OWNER TO whaticket;

--
-- Name: TicketFinalizationReasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."TicketFinalizationReasons_id_seq" OWNED BY public."TicketFinalizationReasons".id;


--
-- Name: TicketNotes; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."TicketNotes" (
    id integer NOT NULL,
    note character varying(255) NOT NULL,
    "userId" integer,
    "contactId" integer NOT NULL,
    "ticketId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TicketNotes" OWNER TO whaticket;

--
-- Name: TicketNotes_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."TicketNotes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TicketNotes_id_seq" OWNER TO whaticket;

--
-- Name: TicketNotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."TicketNotes_id_seq" OWNED BY public."TicketNotes".id;


--
-- Name: TicketTags; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."TicketTags" (
    "ticketId" integer NOT NULL,
    "tagId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TicketTags" OWNER TO whaticket;

--
-- Name: TicketTraking; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."TicketTraking" (
    id integer NOT NULL,
    "ticketId" integer,
    "companyId" integer,
    "whatsappId" integer,
    "userId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "queuedAt" timestamp with time zone,
    "startedAt" timestamp with time zone,
    "finishedAt" timestamp with time zone,
    "ratingAt" timestamp with time zone,
    rated boolean DEFAULT false,
    "closedAt" timestamp with time zone,
    "chatbotAt" timestamp with time zone,
    "queueId" integer
);


ALTER TABLE public."TicketTraking" OWNER TO whaticket;

--
-- Name: TicketTraking_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."TicketTraking_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TicketTraking_id_seq" OWNER TO whaticket;

--
-- Name: TicketTraking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."TicketTraking_id_seq" OWNED BY public."TicketTraking".id;


--
-- Name: Tickets; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Tickets" (
    id integer NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    "lastMessage" text,
    "contactId" integer,
    "userId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "whatsappId" integer,
    "isGroup" boolean DEFAULT false NOT NULL,
    "unreadMessages" integer,
    "queueId" integer,
    "companyId" integer,
    uuid uuid,
    chatbot boolean DEFAULT false,
    "queueOptionId" integer,
    "isBot" boolean,
    channel text DEFAULT 'whatsapp'::text,
    "amountUsedBotQueues" integer,
    "fromMe" boolean DEFAULT false NOT NULL,
    "sendInactiveMessage" boolean DEFAULT false NOT NULL,
    "amountUsedBotQueuesNPS" integer DEFAULT 0 NOT NULL,
    "lgpdSendMessageAt" timestamp with time zone,
    "lgpdAcceptedAt" timestamp with time zone,
    imported timestamp with time zone,
    "flowWebhook" boolean DEFAULT false NOT NULL,
    "lastFlowId" character varying(255),
    "dataWebhook" json,
    "hashFlowId" character varying(255),
    "integrationId" integer,
    "useIntegration" boolean DEFAULT false,
    "isOutOfHour" boolean DEFAULT false,
    "flowStopped" character varying(255),
    "isActiveDemand" boolean DEFAULT false,
    "typebotSessionId" character varying(255) DEFAULT NULL::character varying,
    "typebotStatus" boolean DEFAULT false NOT NULL,
    "typebotSessionTime" timestamp with time zone,
    "valorVenda" double precision,
    "motivoNaoVenda" character varying(255),
    "finalizadoComVenda" boolean DEFAULT false NOT NULL,
    "motivoFinalizacao" character varying(255),
    "maxUseInactiveTime" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Tickets" OWNER TO whaticket;

--
-- Name: Tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Tickets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Tickets_id_seq" OWNER TO whaticket;

--
-- Name: Tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Tickets_id_seq" OWNED BY public."Tickets".id;


--
-- Name: UserQueues; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."UserQueues" (
    "userId" integer NOT NULL,
    "queueId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserQueues" OWNER TO whaticket;

--
-- Name: UserRatings; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."UserRatings" (
    id integer NOT NULL,
    "ticketId" integer,
    "companyId" integer,
    "userId" integer,
    rate integer DEFAULT 0,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."UserRatings" OWNER TO whaticket;

--
-- Name: UserRatings_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."UserRatings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserRatings_id_seq" OWNER TO whaticket;

--
-- Name: UserRatings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."UserRatings_id_seq" OWNED BY public."UserRatings".id;


--
-- Name: UserWhatsapps; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."UserWhatsapps" (
    "userId" integer NOT NULL,
    "whatsappId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserWhatsapps" OWNER TO whaticket;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    profile character varying(255) DEFAULT 'admin'::character varying NOT NULL,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    "companyId" integer,
    super boolean DEFAULT false,
    online boolean DEFAULT false,
    "endWork" character varying(255) DEFAULT '23:59'::character varying,
    "startWork" character varying(255) DEFAULT '00:00'::character varying,
    color character varying(255),
    "farewellMessage" text,
    "whatsappId" integer,
    "allTicket" character varying(255) DEFAULT 'disable'::character varying NOT NULL,
    "defaultMenu" character varying(255) DEFAULT 'closed'::character varying NOT NULL,
    "defaultTheme" character varying(255) DEFAULT 'light'::character varying NOT NULL,
    "allowGroup" boolean DEFAULT false NOT NULL,
    "profileImage" character varying(255),
    "allHistoric" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "allUserChat" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "userClosePendingTicket" character varying(255) DEFAULT 'enabled'::character varying NOT NULL,
    "showDashboard" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "defaultTicketsManagerWidth" integer DEFAULT 550 NOT NULL,
    "showCampaign" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "showContacts" character varying(255) DEFAULT 'enabled'::character varying NOT NULL,
    "lastSeen" timestamp with time zone,
    "allowRealTime" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "allowConnections" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "finalizacaoComValorVendaAtiva" boolean DEFAULT false NOT NULL,
    "birthDate" date,
    "showFlow" character varying(255) DEFAULT 'enabled'::character varying NOT NULL,
    "allowSeeMessagesInPendingTickets" character varying(255) DEFAULT 'enabled'::character varying NOT NULL,
    "showReturnQueueButton" character varying(255) DEFAULT 'enabled'::character varying CONSTRAINT "Users_showReturnQueueButton_temp_not_null" NOT NULL,
    "showTransferTicketButton" character varying(255) DEFAULT 'enabled'::character varying CONSTRAINT "Users_showTransferTicketButton_temp_not_null" NOT NULL,
    "sessionId" character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public."Users" OWNER TO whaticket;

--
-- Name: COLUMN "Users"."birthDate"; Type: COMMENT; Schema: public; Owner: whaticket
--

COMMENT ON COLUMN public."Users"."birthDate" IS 'Data de nascimento do usuário';


--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO whaticket;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: Versions; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Versions" (
    id integer NOT NULL,
    "versionFrontend" text NOT NULL,
    "versionBackend" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Versions" OWNER TO whaticket;

--
-- Name: Versions_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Versions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Versions_id_seq" OWNER TO whaticket;

--
-- Name: Versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Versions_id_seq" OWNED BY public."Versions".id;


--
-- Name: Webhooks; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Webhooks" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    hash_id character varying(255) NOT NULL,
    config json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id integer DEFAULT 0 NOT NULL,
    "requestAll" integer DEFAULT 0,
    "requestMonth" integer DEFAULT 0
);


ALTER TABLE public."Webhooks" OWNER TO whaticket;

--
-- Name: Webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Webhooks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Webhooks_id_seq" OWNER TO whaticket;

--
-- Name: Webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Webhooks_id_seq" OWNED BY public."Webhooks".id;


--
-- Name: WhatsappLidMaps; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."WhatsappLidMaps" (
    id integer NOT NULL,
    lid character varying(255) NOT NULL,
    "companyId" integer NOT NULL,
    "contactId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."WhatsappLidMaps" OWNER TO whaticket;

--
-- Name: WhatsappLidMaps_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."WhatsappLidMaps_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."WhatsappLidMaps_id_seq" OWNER TO whaticket;

--
-- Name: WhatsappLidMaps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."WhatsappLidMaps_id_seq" OWNED BY public."WhatsappLidMaps".id;


--
-- Name: WhatsappQueues; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."WhatsappQueues" (
    "whatsappId" integer NOT NULL,
    "queueId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."WhatsappQueues" OWNER TO whaticket;

--
-- Name: Whatsapps; Type: TABLE; Schema: public; Owner: whaticket
--

CREATE TABLE public."Whatsapps" (
    id integer NOT NULL,
    session text,
    qrcode text,
    status character varying(255),
    battery character varying(255),
    plugged boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL,
    "isDefault" boolean DEFAULT false CONSTRAINT "Whatsapps_default_not_null" NOT NULL,
    retries integer DEFAULT 0 NOT NULL,
    "greetingMessage" text,
    "companyId" integer,
    "complationMessage" text,
    "outOfHoursMessage" text,
    token text,
    "farewellMessage" text,
    provider text DEFAULT 'stable'::text,
    number text,
    channel text,
    "facebookUserToken" text,
    "tokenMeta" text,
    "facebookPageUserId" text,
    "facebookUserId" text,
    "maxUseBotQueues" integer,
    "expiresTicket" integer DEFAULT 0,
    "allowGroup" boolean DEFAULT false NOT NULL,
    "timeUseBotQueues" character varying(255) DEFAULT '0'::character varying NOT NULL,
    "timeSendQueue" integer,
    "sendIdQueue" integer,
    "maxUseBotQueuesNPS" integer DEFAULT 0,
    "timeInactiveMessage" character varying(255) DEFAULT ''::character varying,
    "inactiveMessage" character varying(255) DEFAULT ''::character varying,
    "expiresInactiveMessage" text,
    "whenExpiresTicket" character varying(255) DEFAULT ''::character varying,
    "expiresTicketNPS" character varying(255) DEFAULT ''::character varying,
    "ratingMessage" text,
    "groupAsTicket" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "importOldMessages" text,
    "importRecentMessages" text,
    "statusImportMessages" character varying(255),
    "closedTicketsPostImported" boolean,
    "importOldMessagesGroups" boolean,
    "timeCreateNewTicket" integer,
    "greetingMediaAttachment" character varying(255) DEFAULT NULL::character varying,
    "promptId" integer,
    "integrationId" integer,
    schedules jsonb DEFAULT '[]'::jsonb,
    "collectiveVacationEnd" character varying(255) DEFAULT NULL::character varying,
    "collectiveVacationStart" character varying(255) DEFAULT NULL::character varying,
    "collectiveVacationMessage" text,
    "queueIdImportMessages" integer,
    "triggerIntegrationOnClose" boolean DEFAULT false NOT NULL,
    "integrationTypeId" integer,
    phone_number_id character varying(255),
    waba_id character varying(255),
    phone_number character varying(255),
    business_id character varying(255),
    send_token text,
    waba_webhook character varying(255),
    color character varying(255),
    "flowIdNotPhrase" integer,
    "flowIdWelcome" integer,
    waba_webhook_id integer,
    "flowIdInactiveTime" integer,
    "flowInactiveTime" integer,
    "maxUseInactiveTime" integer DEFAULT 1,
    wavoip text,
    "timeToReturnQueue" integer DEFAULT 0,
    "timeAwaitActiveFlowId" integer,
    "timeAwaitActiveFlow" integer,
    "receiveComments" boolean DEFAULT true NOT NULL,
    "sentMessages" integer DEFAULT 0 NOT NULL,
    "dailyLimit" integer DEFAULT 0 NOT NULL,
    "receivedMessages" integer DEFAULT 0 NOT NULL,
    "activeTickets" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Whatsapps" OWNER TO whaticket;

--
-- Name: Whatsapps_id_seq; Type: SEQUENCE; Schema: public; Owner: whaticket
--

CREATE SEQUENCE public."Whatsapps_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Whatsapps_id_seq" OWNER TO whaticket;

--
-- Name: Whatsapps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whaticket
--

ALTER SEQUENCE public."Whatsapps_id_seq" OWNED BY public."Whatsapps".id;


--
-- Name: AIAgentKnowledges id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."AIAgentKnowledges" ALTER COLUMN id SET DEFAULT nextval('public."AIAgentKnowledges_id_seq"'::regclass);


--
-- Name: AIAgents id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."AIAgents" ALTER COLUMN id SET DEFAULT nextval('public."AIAgents_id_seq"'::regclass);


--
-- Name: Announcements id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Announcements" ALTER COLUMN id SET DEFAULT nextval('public."Announcements_id_seq"'::regclass);


--
-- Name: ApiUsages id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ApiUsages" ALTER COLUMN id SET DEFAULT nextval('public."ApiUsages_id_seq"'::regclass);


--
-- Name: Baileys id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Baileys" ALTER COLUMN id SET DEFAULT nextval('public."Baileys_id_seq"'::regclass);


--
-- Name: BirthdaySettings id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."BirthdaySettings" ALTER COLUMN id SET DEFAULT nextval('public."BirthdaySettings_id_seq"'::regclass);


--
-- Name: CallHistory id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CallHistory" ALTER COLUMN id SET DEFAULT nextval('public."CallHistory_id_seq"'::regclass);


--
-- Name: CampaignSettings id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CampaignSettings" ALTER COLUMN id SET DEFAULT nextval('public."CampaignSettings_id_seq"'::regclass);


--
-- Name: CampaignShipping id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CampaignShipping" ALTER COLUMN id SET DEFAULT nextval('public."CampaignShipping_id_seq"'::regclass);


--
-- Name: Campaigns id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Campaigns" ALTER COLUMN id SET DEFAULT nextval('public."Campaigns_id_seq"'::regclass);


--
-- Name: ChatMessages id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ChatMessages" ALTER COLUMN id SET DEFAULT nextval('public."ChatMessages_id_seq"'::regclass);


--
-- Name: ChatUsers id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ChatUsers" ALTER COLUMN id SET DEFAULT nextval('public."ChatUsers_id_seq"'::regclass);


--
-- Name: Chatbots id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chatbots" ALTER COLUMN id SET DEFAULT nextval('public."Chatbots_id_seq"'::regclass);


--
-- Name: Chats id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chats" ALTER COLUMN id SET DEFAULT nextval('public."Chats_id_seq"'::regclass);


--
-- Name: Companies id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Companies" ALTER COLUMN id SET DEFAULT nextval('public."Companies_id_seq"'::regclass);


--
-- Name: CompaniesSettings id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CompaniesSettings" ALTER COLUMN id SET DEFAULT nextval('public."CompaniesSettings_id_seq"'::regclass);


--
-- Name: CompanyKanbanConfigs id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CompanyKanbanConfigs" ALTER COLUMN id SET DEFAULT nextval('public."CompanyKanbanConfigs_id_seq"'::regclass);


--
-- Name: ContactCustomFields id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactCustomFields" ALTER COLUMN id SET DEFAULT nextval('public."ContactCustomFields_id_seq"'::regclass);


--
-- Name: ContactGroups id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactGroups" ALTER COLUMN id SET DEFAULT nextval('public."ContactGroups_id_seq"'::regclass);


--
-- Name: ContactListItems id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactListItems" ALTER COLUMN id SET DEFAULT nextval('public."ContactListItems_id_seq"'::regclass);


--
-- Name: ContactLists id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactLists" ALTER COLUMN id SET DEFAULT nextval('public."ContactLists_id_seq"'::regclass);


--
-- Name: ContactWallets id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactWallets" ALTER COLUMN id SET DEFAULT nextval('public."ContactWallets_id_seq"'::regclass);


--
-- Name: Contacts id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Contacts" ALTER COLUMN id SET DEFAULT nextval('public."Contacts_id_seq"'::regclass);


--
-- Name: DialogChatBots id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."DialogChatBots" ALTER COLUMN id SET DEFAULT nextval('public."DialogChatBots_id_seq"'::regclass);


--
-- Name: Files id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Files" ALTER COLUMN id SET DEFAULT nextval('public."Files_id_seq"'::regclass);


--
-- Name: FilesOptions id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FilesOptions" ALTER COLUMN id SET DEFAULT nextval('public."FilesOptions_id_seq"'::regclass);


--
-- Name: FloupSchedules id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FloupSchedules" ALTER COLUMN id SET DEFAULT nextval('public."FloupSchedules_id_seq"'::regclass);


--
-- Name: Floups id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Floups" ALTER COLUMN id SET DEFAULT nextval('public."Floups_id_seq"'::regclass);


--
-- Name: FlowAudios id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowAudios" ALTER COLUMN id SET DEFAULT nextval('public."FlowAudios_id_seq"'::regclass);


--
-- Name: FlowBuilders id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowBuilders" ALTER COLUMN id SET DEFAULT nextval('public."FlowBuilders_id_seq"'::regclass);


--
-- Name: FlowCampaigns id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowCampaigns" ALTER COLUMN id SET DEFAULT nextval('public."FlowCampaigns_id_seq"'::regclass);


--
-- Name: FlowDefaults id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowDefaults" ALTER COLUMN id SET DEFAULT nextval('public."FlowDefaults_id_seq"'::regclass);


--
-- Name: FlowDocs id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowDocs" ALTER COLUMN id SET DEFAULT nextval('public."FlowDocs_id_seq"'::regclass);


--
-- Name: FlowImgs id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowImgs" ALTER COLUMN id SET DEFAULT nextval('public."FlowImgs_id_seq"'::regclass);


--
-- Name: Helps id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Helps" ALTER COLUMN id SET DEFAULT nextval('public."Helps_id_seq"'::regclass);


--
-- Name: InstallationLogs id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."InstallationLogs" ALTER COLUMN id SET DEFAULT nextval('public."InstallationLogs_id_seq"'::regclass);


--
-- Name: Integrations id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Integrations" ALTER COLUMN id SET DEFAULT nextval('public."Integrations_id_seq"'::regclass);


--
-- Name: InteractiveMessageTemplates id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."InteractiveMessageTemplates" ALTER COLUMN id SET DEFAULT nextval('public."InteractiveMessageTemplates_id_seq"'::regclass);


--
-- Name: Invoices id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Invoices" ALTER COLUMN id SET DEFAULT nextval('public."Invoices_id_seq"'::regclass);


--
-- Name: LogTickets id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."LogTickets" ALTER COLUMN id SET DEFAULT nextval('public."LogTickets_id_seq"'::regclass);


--
-- Name: Messages id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Messages" ALTER COLUMN id SET DEFAULT nextval('public."Messages_id_seq"'::regclass);


--
-- Name: Partners id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Partners" ALTER COLUMN id SET DEFAULT nextval('public."Partners_id_seq"'::regclass);


--
-- Name: PasswordResetTokens id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PasswordResetTokens" ALTER COLUMN id SET DEFAULT nextval('public."PasswordResetTokens_id_seq"'::regclass);


--
-- Name: Plans id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Plans" ALTER COLUMN id SET DEFAULT nextval('public."Plans_id_seq"'::regclass);


--
-- Name: PresetWebhooks id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PresetWebhooks" ALTER COLUMN id SET DEFAULT nextval('public."PresetWebhooks_id_seq"'::regclass);


--
-- Name: Prompts id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Prompts" ALTER COLUMN id SET DEFAULT nextval('public."Prompts_id_seq"'::regclass);


--
-- Name: PushSubscriptions id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PushSubscriptions" ALTER COLUMN id SET DEFAULT nextval('public."PushSubscriptions_id_seq"'::regclass);


--
-- Name: QueueIntegrations id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueIntegrations" ALTER COLUMN id SET DEFAULT nextval('public."QueueIntegrations_id_seq"'::regclass);


--
-- Name: QueueOptions id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueOptions" ALTER COLUMN id SET DEFAULT nextval('public."QueueOptions_id_seq"'::regclass);


--
-- Name: QueueStates id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueStates" ALTER COLUMN id SET DEFAULT nextval('public."QueueStates_id_seq"'::regclass);


--
-- Name: Queues id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Queues" ALTER COLUMN id SET DEFAULT nextval('public."Queues_id_seq"'::regclass);


--
-- Name: QuickMessageComponents id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QuickMessageComponents" ALTER COLUMN id SET DEFAULT nextval('public."QuickMessageComponents_id_seq"'::regclass);


--
-- Name: QuickMessages id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QuickMessages" ALTER COLUMN id SET DEFAULT nextval('public."QuickMessages_id_seq"'::regclass);


--
-- Name: ScheduledMessages id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ScheduledMessages" ALTER COLUMN id SET DEFAULT nextval('public."ScheduledMessages_id_seq"'::regclass);


--
-- Name: ScheduledMessagesEnvios id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ScheduledMessagesEnvios" ALTER COLUMN id SET DEFAULT nextval('public."ScheduledMessagesEnvios_id_seq"'::regclass);


--
-- Name: Schedules id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Schedules" ALTER COLUMN id SET DEFAULT nextval('public."Schedules_id_seq"'::regclass);


--
-- Name: Settings id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Settings" ALTER COLUMN id SET DEFAULT nextval('public."Settings_id_seq"'::regclass);


--
-- Name: Subscriptions id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Subscriptions" ALTER COLUMN id SET DEFAULT nextval('public."Subscriptions_id_seq"'::regclass);


--
-- Name: Tags id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tags" ALTER COLUMN id SET DEFAULT nextval('public."Tags_id_seq"'::regclass);


--
-- Name: TicketFinalizationReasons id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketFinalizationReasons" ALTER COLUMN id SET DEFAULT nextval('public."TicketFinalizationReasons_id_seq"'::regclass);


--
-- Name: TicketNotes id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketNotes" ALTER COLUMN id SET DEFAULT nextval('public."TicketNotes_id_seq"'::regclass);


--
-- Name: TicketTraking id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketTraking" ALTER COLUMN id SET DEFAULT nextval('public."TicketTraking_id_seq"'::regclass);


--
-- Name: Tickets id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tickets" ALTER COLUMN id SET DEFAULT nextval('public."Tickets_id_seq"'::regclass);


--
-- Name: UserRatings id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."UserRatings" ALTER COLUMN id SET DEFAULT nextval('public."UserRatings_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Name: Versions id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Versions" ALTER COLUMN id SET DEFAULT nextval('public."Versions_id_seq"'::regclass);


--
-- Name: Webhooks id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Webhooks" ALTER COLUMN id SET DEFAULT nextval('public."Webhooks_id_seq"'::regclass);


--
-- Name: WhatsappLidMaps id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."WhatsappLidMaps" ALTER COLUMN id SET DEFAULT nextval('public."WhatsappLidMaps_id_seq"'::regclass);


--
-- Name: Whatsapps id; Type: DEFAULT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Whatsapps" ALTER COLUMN id SET DEFAULT nextval('public."Whatsapps_id_seq"'::regclass);


--
-- Name: AIAgentKnowledges AIAgentKnowledges_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."AIAgentKnowledges"
    ADD CONSTRAINT "AIAgentKnowledges_pkey" PRIMARY KEY (id);


--
-- Name: AIAgents AIAgents_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."AIAgents"
    ADD CONSTRAINT "AIAgents_pkey" PRIMARY KEY (id);


--
-- Name: Announcements Announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Announcements"
    ADD CONSTRAINT "Announcements_pkey" PRIMARY KEY (id);


--
-- Name: ApiUsages ApiUsages_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ApiUsages"
    ADD CONSTRAINT "ApiUsages_pkey" PRIMARY KEY (id);


--
-- Name: Baileys Baileys_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Baileys"
    ADD CONSTRAINT "Baileys_pkey" PRIMARY KEY (id, "whatsappId");


--
-- Name: BirthdaySettings BirthdaySettings_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."BirthdaySettings"
    ADD CONSTRAINT "BirthdaySettings_pkey" PRIMARY KEY (id);


--
-- Name: CallHistory CallHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CallHistory"
    ADD CONSTRAINT "CallHistory_pkey" PRIMARY KEY (id);


--
-- Name: CampaignSettings CampaignSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CampaignSettings"
    ADD CONSTRAINT "CampaignSettings_pkey" PRIMARY KEY (id);


--
-- Name: CampaignShipping CampaignShipping_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CampaignShipping"
    ADD CONSTRAINT "CampaignShipping_pkey" PRIMARY KEY (id);


--
-- Name: Campaigns Campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessages ChatMessages_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_pkey" PRIMARY KEY (id);


--
-- Name: ChatUsers ChatUsers_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ChatUsers"
    ADD CONSTRAINT "ChatUsers_pkey" PRIMARY KEY (id);


--
-- Name: Chatbots Chatbots_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_pkey" PRIMARY KEY (id);


--
-- Name: Chats Chats_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_pkey" PRIMARY KEY (id);


--
-- Name: CompaniesSettings CompaniesSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CompaniesSettings"
    ADD CONSTRAINT "CompaniesSettings_pkey" PRIMARY KEY (id);


--
-- Name: Companies Companies_name_key; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_name_key" UNIQUE (name);


--
-- Name: Companies Companies_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_pkey" PRIMARY KEY (id);


--
-- Name: CompanyKanbanConfigs CompanyKanbanConfigs_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CompanyKanbanConfigs"
    ADD CONSTRAINT "CompanyKanbanConfigs_pkey" PRIMARY KEY (id);


--
-- Name: ContactCustomFields ContactCustomFields_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactCustomFields"
    ADD CONSTRAINT "ContactCustomFields_pkey" PRIMARY KEY (id);


--
-- Name: ContactGroups ContactGroups_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactGroups"
    ADD CONSTRAINT "ContactGroups_pkey" PRIMARY KEY (id);


--
-- Name: ContactListItems ContactListItems_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactListItems"
    ADD CONSTRAINT "ContactListItems_pkey" PRIMARY KEY (id);


--
-- Name: ContactLists ContactLists_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactLists"
    ADD CONSTRAINT "ContactLists_pkey" PRIMARY KEY (id);


--
-- Name: ContactWallets ContactWallets_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactWallets"
    ADD CONSTRAINT "ContactWallets_pkey" PRIMARY KEY (id);


--
-- Name: Contacts Contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Contacts"
    ADD CONSTRAINT "Contacts_pkey" PRIMARY KEY (id);


--
-- Name: DialogChatBots DialogChatBots_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."DialogChatBots"
    ADD CONSTRAINT "DialogChatBots_pkey" PRIMARY KEY (id);


--
-- Name: FilesOptions FilesOptions_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FilesOptions"
    ADD CONSTRAINT "FilesOptions_pkey" PRIMARY KEY (id);


--
-- Name: Files Files_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "Files_pkey" PRIMARY KEY (id);


--
-- Name: FloupSchedules FloupSchedules_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FloupSchedules"
    ADD CONSTRAINT "FloupSchedules_pkey" PRIMARY KEY (id);


--
-- Name: Floups Floups_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Floups"
    ADD CONSTRAINT "Floups_pkey" PRIMARY KEY (id);


--
-- Name: FlowAudios FlowAudios_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowAudios"
    ADD CONSTRAINT "FlowAudios_pkey" PRIMARY KEY (id);


--
-- Name: FlowBuilders FlowBuilders_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowBuilders"
    ADD CONSTRAINT "FlowBuilders_pkey" PRIMARY KEY (id);


--
-- Name: FlowCampaigns FlowCampaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowCampaigns"
    ADD CONSTRAINT "FlowCampaigns_pkey" PRIMARY KEY (id);


--
-- Name: FlowDefaults FlowDefaults_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowDefaults"
    ADD CONSTRAINT "FlowDefaults_pkey" PRIMARY KEY (id);


--
-- Name: FlowDocs FlowDocs_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowDocs"
    ADD CONSTRAINT "FlowDocs_pkey" PRIMARY KEY (id);


--
-- Name: FlowImgs FlowImgs_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowImgs"
    ADD CONSTRAINT "FlowImgs_pkey" PRIMARY KEY (id);


--
-- Name: Helps Helps_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Helps"
    ADD CONSTRAINT "Helps_pkey" PRIMARY KEY (id);


--
-- Name: InstallationLogs InstallationLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."InstallationLogs"
    ADD CONSTRAINT "InstallationLogs_pkey" PRIMARY KEY (id);


--
-- Name: Integrations Integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Integrations"
    ADD CONSTRAINT "Integrations_pkey" PRIMARY KEY (id);


--
-- Name: InteractiveMessageTemplates InteractiveMessageTemplates_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."InteractiveMessageTemplates"
    ADD CONSTRAINT "InteractiveMessageTemplates_pkey" PRIMARY KEY (id);


--
-- Name: Invoices Invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_pkey" PRIMARY KEY (id);


--
-- Name: LogTickets LogTickets_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."LogTickets"
    ADD CONSTRAINT "LogTickets_pkey" PRIMARY KEY (id);


--
-- Name: Messages Messages_id_key; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_id_key" UNIQUE (id);


--
-- Name: Messages Messages_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_pkey" PRIMARY KEY (id);


--
-- Name: Partners Partners_document_key; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Partners"
    ADD CONSTRAINT "Partners_document_key" UNIQUE (document);


--
-- Name: Partners Partners_name_key; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Partners"
    ADD CONSTRAINT "Partners_name_key" UNIQUE (name);


--
-- Name: Partners Partners_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Partners"
    ADD CONSTRAINT "Partners_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetTokens PasswordResetTokens_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PasswordResetTokens"
    ADD CONSTRAINT "PasswordResetTokens_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetTokens PasswordResetTokens_token_key; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PasswordResetTokens"
    ADD CONSTRAINT "PasswordResetTokens_token_key" UNIQUE (token);


--
-- Name: Plans Plans_name_key; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_name_key" UNIQUE (name);


--
-- Name: Plans Plans_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_pkey" PRIMARY KEY (id);


--
-- Name: PresetWebhooks PresetWebhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PresetWebhooks"
    ADD CONSTRAINT "PresetWebhooks_pkey" PRIMARY KEY (id);


--
-- Name: Prompts Prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Prompts"
    ADD CONSTRAINT "Prompts_pkey" PRIMARY KEY (id);


--
-- Name: PushSubscriptions PushSubscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PushSubscriptions"
    ADD CONSTRAINT "PushSubscriptions_pkey" PRIMARY KEY (id);


--
-- Name: QueueIntegrations QueueIntegrations_name_companyId_unique; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_name_companyId_unique" UNIQUE (name, "companyId");


--
-- Name: QueueIntegrations QueueIntegrations_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_pkey" PRIMARY KEY (id);


--
-- Name: QueueOptions QueueOptions_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueOptions"
    ADD CONSTRAINT "QueueOptions_pkey" PRIMARY KEY (id);


--
-- Name: QueueStates QueueStates_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueStates"
    ADD CONSTRAINT "QueueStates_pkey" PRIMARY KEY (id);


--
-- Name: Queues Queues_color_key; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_color_key" UNIQUE (color, "companyId");


--
-- Name: Queues Queues_name_key; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_name_key" UNIQUE (name, "companyId");


--
-- Name: Queues Queues_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_pkey" PRIMARY KEY (id);


--
-- Name: QuickMessageComponents QuickMessageComponents_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QuickMessageComponents"
    ADD CONSTRAINT "QuickMessageComponents_pkey" PRIMARY KEY (id);


--
-- Name: QuickMessages QuickMessages_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QuickMessages"
    ADD CONSTRAINT "QuickMessages_pkey" PRIMARY KEY (id);


--
-- Name: ScheduledMessagesEnvios ScheduledMessagesEnvios_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ScheduledMessagesEnvios"
    ADD CONSTRAINT "ScheduledMessagesEnvios_pkey" PRIMARY KEY (id);


--
-- Name: ScheduledMessages ScheduledMessages_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ScheduledMessages"
    ADD CONSTRAINT "ScheduledMessages_pkey" PRIMARY KEY (id);


--
-- Name: Schedules Schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: Subscriptions Subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Subscriptions"
    ADD CONSTRAINT "Subscriptions_pkey" PRIMARY KEY (id);


--
-- Name: Tags Tags_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tags"
    ADD CONSTRAINT "Tags_pkey" PRIMARY KEY (id);


--
-- Name: TicketFinalizationReasons TicketFinalizationReasons_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketFinalizationReasons"
    ADD CONSTRAINT "TicketFinalizationReasons_pkey" PRIMARY KEY (id);


--
-- Name: TicketNotes TicketNotes_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketNotes"
    ADD CONSTRAINT "TicketNotes_pkey" PRIMARY KEY (id);


--
-- Name: TicketTraking TicketTraking_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_pkey" PRIMARY KEY (id);


--
-- Name: Tickets Tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_pkey" PRIMARY KEY (id);


--
-- Name: UserQueues UserQueues_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."UserQueues"
    ADD CONSTRAINT "UserQueues_pkey" PRIMARY KEY ("userId", "queueId");


--
-- Name: UserRatings UserRatings_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."UserRatings"
    ADD CONSTRAINT "UserRatings_pkey" PRIMARY KEY (id);


--
-- Name: UserWhatsapps UserWhatsapps_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."UserWhatsapps"
    ADD CONSTRAINT "UserWhatsapps_pkey" PRIMARY KEY ("userId", "whatsappId");


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Versions Versions_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Versions"
    ADD CONSTRAINT "Versions_pkey" PRIMARY KEY (id);


--
-- Name: Webhooks Webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Webhooks"
    ADD CONSTRAINT "Webhooks_pkey" PRIMARY KEY (id);


--
-- Name: WhatsappLidMaps WhatsappLidMaps_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."WhatsappLidMaps"
    ADD CONSTRAINT "WhatsappLidMaps_pkey" PRIMARY KEY (id);


--
-- Name: WhatsappQueues WhatsappQueues_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."WhatsappQueues"
    ADD CONSTRAINT "WhatsappQueues_pkey" PRIMARY KEY ("whatsappId", "queueId");


--
-- Name: Whatsapps Whatsapps_pkey; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_pkey" PRIMARY KEY (id);


--
-- Name: Tickets contactid_companyid_whatsappid_unique; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT contactid_companyid_whatsappid_unique UNIQUE (id, "contactId", "companyId", "whatsappId");


--
-- Name: Contacts number_companyid_unique; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Contacts"
    ADD CONSTRAINT number_companyid_unique UNIQUE (number, "companyId");


--
-- Name: WhatsappLidMaps unique_lid_companyId; Type: CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."WhatsappLidMaps"
    ADD CONSTRAINT "unique_lid_companyId" UNIQUE (lid, "companyId");


--
-- Name: contacts_lid_company_idx; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX contacts_lid_company_idx ON public."Contacts" USING btree (lid, "companyId");


--
-- Name: idx_ContactCustomFields_contact_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX "idx_ContactCustomFields_contact_id" ON public."ContactCustomFields" USING btree ("contactId");


--
-- Name: idx_LogTickets_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX "idx_LogTickets_ticket_id" ON public."LogTickets" USING btree ("ticketId");


--
-- Name: idx_Messages_contact_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX "idx_Messages_contact_id" ON public."Messages" USING btree ("contactId");


--
-- Name: idx_TicketTags_tag_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX "idx_TicketTags_tag_id" ON public."TicketTags" USING btree ("tagId");


--
-- Name: idx_TicketTags_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX "idx_TicketTags_ticket_id" ON public."TicketTags" USING btree ("ticketId");


--
-- Name: idx_TicketTraking_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX "idx_TicketTraking_company_id" ON public."TicketTraking" USING btree ("companyId");


--
-- Name: idx_TicketTraking_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX "idx_TicketTraking_ticket_id" ON public."TicketTraking" USING btree ("ticketId");


--
-- Name: idx_announcements_auto_generated; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_announcements_auto_generated ON public."Announcements" USING btree ("isAutoGenerated");


--
-- Name: idx_announcements_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_announcements_company_id ON public."Announcements" USING btree ("companyId");


--
-- Name: idx_announcements_expires_at; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_announcements_expires_at ON public."Announcements" USING btree ("expiresAt");


--
-- Name: idx_announcements_priority; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_announcements_priority ON public."Announcements" USING btree (priority);


--
-- Name: idx_announcements_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_announcements_status ON public."Announcements" USING btree (status);


--
-- Name: idx_announcements_target_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_announcements_target_company_id ON public."Announcements" USING btree ("targetCompanyId");


--
-- Name: idx_announcements_type; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_announcements_type ON public."Announcements" USING btree (type);


--
-- Name: idx_apiusages_company_date; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_apiusages_company_date ON public."ApiUsages" USING btree ("companyId", "dateUsed");


--
-- Name: idx_apiusages_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_apiusages_company_id ON public."ApiUsages" USING btree ("companyId");


--
-- Name: idx_apiusages_date_used; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_apiusages_date_used ON public."ApiUsages" USING btree ("dateUsed");


--
-- Name: idx_baileys_whatsapp_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_baileys_whatsapp_id ON public."Baileys" USING btree ("whatsappId");


--
-- Name: idx_birthday_settings_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE UNIQUE INDEX idx_birthday_settings_company_id ON public."BirthdaySettings" USING btree ("companyId");


--
-- Name: idx_camp_company_scheduled; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_camp_company_scheduled ON public."Campaigns" USING btree ("companyId", "scheduledAt");


--
-- Name: idx_camp_company_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_camp_company_status ON public."Campaigns" USING btree ("companyId", status);


--
-- Name: idx_campaign_settings_company_key; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campaign_settings_company_key ON public."CampaignSettings" USING btree ("companyId", key);


--
-- Name: idx_campaign_settings_key; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campaign_settings_key ON public."CampaignSettings" USING btree (key);


--
-- Name: idx_campaign_shipping_campaign_confirm; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campaign_shipping_campaign_confirm ON public."CampaignShipping" USING btree ("campaignId", "confirmationRequestedAt");


--
-- Name: idx_campaign_shipping_campaign_delivered; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campaign_shipping_campaign_delivered ON public."CampaignShipping" USING btree ("campaignId", "deliveredAt");


--
-- Name: idx_campaign_shipping_campaign_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campaign_shipping_campaign_id ON public."CampaignShipping" USING btree ("campaignId");


--
-- Name: idx_campaign_shipping_contact_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campaign_shipping_contact_id ON public."CampaignShipping" USING btree ("contactId");


--
-- Name: idx_campaign_shipping_number; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campaign_shipping_number ON public."CampaignShipping" USING btree (number);


--
-- Name: idx_campaigns_company_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campaigns_company_status ON public."Campaigns" USING btree ("companyId", status);


--
-- Name: idx_campaigns_scheduled_at; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campaigns_scheduled_at ON public."Campaigns" USING btree ("scheduledAt");


--
-- Name: idx_campaigns_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campaigns_status ON public."Campaigns" USING btree (status);


--
-- Name: idx_campship_campaign_number; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campship_campaign_number ON public."CampaignShipping" USING btree ("campaignId", number);


--
-- Name: idx_campship_contact; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campship_contact ON public."CampaignShipping" USING btree ("contactId");


--
-- Name: idx_campship_job; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_campship_job ON public."CampaignShipping" USING btree ("jobId");


--
-- Name: idx_chat_messages_chat_created; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chat_messages_chat_created ON public."ChatMessages" USING btree ("chatId", "createdAt");


--
-- Name: idx_chat_messages_chat_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chat_messages_chat_id ON public."ChatMessages" USING btree ("chatId");


--
-- Name: idx_chat_messages_reply_to_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chat_messages_reply_to_id ON public."ChatMessages" USING btree ("replyToId");


--
-- Name: idx_chat_messages_sender_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chat_messages_sender_id ON public."ChatMessages" USING btree ("senderId");


--
-- Name: idx_chat_users_chat_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chat_users_chat_id ON public."ChatUsers" USING btree ("chatId");


--
-- Name: idx_chat_users_user_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chat_users_user_id ON public."ChatUsers" USING btree ("userId");


--
-- Name: idx_chatbots_chatbot_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chatbots_chatbot_id ON public."Chatbots" USING btree ("chatbotId");


--
-- Name: idx_chatbots_opt_queue_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chatbots_opt_queue_id ON public."Chatbots" USING btree ("optQueueId");


--
-- Name: idx_chatbots_opt_user_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chatbots_opt_user_id ON public."Chatbots" USING btree ("optUserId");


--
-- Name: idx_chatbots_queue_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chatbots_queue_id ON public."Chatbots" USING btree ("queueId");


--
-- Name: idx_chats_company_is_group; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chats_company_is_group ON public."Chats" USING btree ("companyId", "isGroup");


--
-- Name: idx_chats_is_group; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chats_is_group ON public."Chats" USING btree ("isGroup");


--
-- Name: idx_chats_owner_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_chats_owner_id ON public."Chats" USING btree ("ownerId");


--
-- Name: idx_companies_plan_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_companies_plan_id ON public."Companies" USING btree ("planId");


--
-- Name: idx_companies_settings_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_companies_settings_company_id ON public."CompaniesSettings" USING btree ("companyId");


--
-- Name: idx_companies_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_companies_status ON public."Companies" USING btree (status);


--
-- Name: idx_company_kanban_config_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE UNIQUE INDEX idx_company_kanban_config_company_id ON public."CompanyKanbanConfigs" USING btree ("companyId");


--
-- Name: idx_cont_company_active; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_cont_company_active ON public."Contacts" USING btree ("companyId", active);


--
-- Name: idx_cont_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_cont_company_id ON public."Contacts" USING btree ("companyId");


--
-- Name: idx_cont_company_isgroup; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_cont_company_isgroup ON public."Contacts" USING btree ("companyId", "isGroup");


--
-- Name: idx_cont_number_company; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_cont_number_company ON public."Contacts" USING btree (number, "companyId");


--
-- Name: idx_contactTag_contact_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX "idx_contactTag_contact_id" ON public."ContactTags" USING btree ("contactId");


--
-- Name: idx_contactTag_tagId; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX "idx_contactTag_tagId" ON public."ContactTags" USING btree ("tagId");


--
-- Name: idx_contactTag_tag_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX "idx_contactTag_tag_id" ON public."ContactTags" USING btree ("tagId");


--
-- Name: idx_contact_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_company_id ON public."Contacts" USING btree ("companyId");


--
-- Name: idx_contact_custom_fields_contact_id_v2; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_custom_fields_contact_id_v2 ON public."ContactCustomFields" USING btree ("contactId");


--
-- Name: idx_contact_custom_fields_name_value; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_custom_fields_name_value ON public."ContactCustomFields" USING btree (name, value);


--
-- Name: idx_contact_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_id ON public."Contacts" USING btree (id);


--
-- Name: idx_contact_list_items_number; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_list_items_number ON public."ContactListItems" USING btree (number);


--
-- Name: idx_contact_list_items_whatsapp_valid; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_list_items_whatsapp_valid ON public."ContactListItems" USING btree ("isWhatsappValid");


--
-- Name: idx_contact_lists_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_lists_company_id ON public."ContactLists" USING btree ("companyId");


--
-- Name: idx_contact_name; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_name ON public."Contacts" USING btree (name);


--
-- Name: idx_contact_number; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_number ON public."Contacts" USING btree (number);


--
-- Name: idx_contact_tags_contact_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_tags_contact_id ON public."ContactTags" USING btree ("contactId");


--
-- Name: idx_contact_tags_contact_tag; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_tags_contact_tag ON public."ContactTags" USING btree ("contactId", "tagId");


--
-- Name: idx_contact_tags_tag_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_tags_tag_id ON public."ContactTags" USING btree ("tagId");


--
-- Name: idx_contact_wallets_contact_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_wallets_contact_id ON public."ContactWallets" USING btree ("contactId");


--
-- Name: idx_contact_wallets_queue_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_wallets_queue_id ON public."ContactWallets" USING btree ("queueId");


--
-- Name: idx_contact_wallets_wallet_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_wallets_wallet_id ON public."ContactWallets" USING btree ("walletId");


--
-- Name: idx_contact_whatsapp_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contact_whatsapp_id ON public."Contacts" USING btree ("whatsappId");


--
-- Name: idx_contacts_active; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contacts_active ON public."Contacts" USING btree (active);


--
-- Name: idx_contacts_birth_date; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contacts_birth_date ON public."Contacts" USING btree ("birthDate");


--
-- Name: idx_contacts_channel; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contacts_channel ON public."Contacts" USING btree (channel);


--
-- Name: idx_contacts_company_active; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contacts_company_active ON public."Contacts" USING btree ("companyId", active);


--
-- Name: idx_contacts_company_email; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contacts_company_email ON public."Contacts" USING btree ("companyId", email);


--
-- Name: idx_contacts_company_name; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contacts_company_name ON public."Contacts" USING btree ("companyId", name);


--
-- Name: idx_contacts_is_group; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contacts_is_group ON public."Contacts" USING btree ("isGroup");


--
-- Name: idx_contacts_lid_company; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contacts_lid_company ON public."Contacts" USING btree (lid, "companyId");


--
-- Name: idx_contacts_number_company; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contacts_number_company ON public."Contacts" USING btree (number, "companyId");


--
-- Name: idx_contacts_remotejid_company; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contacts_remotejid_company ON public."Contacts" USING btree ("remoteJid", "companyId");


--
-- Name: idx_contag_contact; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contag_contact ON public."ContactTags" USING btree ("contactId");


--
-- Name: idx_contag_tag; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contag_tag ON public."ContactTags" USING btree ("tagId");


--
-- Name: idx_contlist_company; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contlist_company ON public."ContactLists" USING btree ("companyId");


--
-- Name: idx_contlisti_company_list; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contlisti_company_list ON public."ContactListItems" USING btree ("companyId", "contactListId");


--
-- Name: idx_contwallet_contact; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contwallet_contact ON public."ContactWallets" USING btree ("contactId");


--
-- Name: idx_contwallet_wallet_company; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_contwallet_wallet_company ON public."ContactWallets" USING btree ("walletId", "companyId");


--
-- Name: idx_cpsh_campaign_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_cpsh_campaign_id ON public."CampaignShipping" USING btree ("campaignId");


--
-- Name: idx_ctli_contact_list_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ctli_contact_list_id ON public."ContactListItems" USING btree ("contactListId");


--
-- Name: idx_dialog_chatbots_chatbot_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_dialog_chatbots_chatbot_id ON public."DialogChatBots" USING btree ("chatbotId");


--
-- Name: idx_dialog_chatbots_contact_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_dialog_chatbots_contact_id ON public."DialogChatBots" USING btree ("contactId");


--
-- Name: idx_dialog_chatbots_queue_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_dialog_chatbots_queue_id ON public."DialogChatBots" USING btree ("queueId");


--
-- Name: idx_files_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_files_company_id ON public."Files" USING btree ("companyId");


--
-- Name: idx_files_options_file_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_files_options_file_id ON public."FilesOptions" USING btree ("fileId");


--
-- Name: idx_floups_company; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_floups_company ON public."Floups" USING btree ("companyId");


--
-- Name: idx_floupschedule_company; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_floupschedule_company ON public."FloupSchedules" USING btree ("companyId");


--
-- Name: idx_flow_builders_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_flow_builders_company_id ON public."FlowBuilders" USING btree (company_id);


--
-- Name: idx_flow_campaigns_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_flow_campaigns_status ON public."FlowCampaigns" USING btree (status);


--
-- Name: idx_flow_campaigns_whatsapp_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_flow_campaigns_whatsapp_id ON public."FlowCampaigns" USING btree ("whatsappId");


--
-- Name: idx_flowbui_id_user_id_active; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_flowbui_id_user_id_active ON public."FlowBuilders" USING btree (id, user_id, active);


--
-- Name: idx_flowcamp_id_company_id_phrase; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_flowcamp_id_company_id_phrase ON public."FlowCampaigns" USING btree (id, "companyId", phrase);


--
-- Name: idx_flowdefa_id_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_flowdefa_id_company_id ON public."FlowDefaults" USING btree (id, "companyId");


--
-- Name: idx_integrations_company_active; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_integrations_company_active ON public."Integrations" USING btree ("companyId", "isActive");


--
-- Name: idx_integrations_is_active; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_integrations_is_active ON public."Integrations" USING btree ("isActive");


--
-- Name: idx_invoices_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_invoices_company_id ON public."Invoices" USING btree ("companyId");


--
-- Name: idx_invoices_due_date; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_invoices_due_date ON public."Invoices" USING btree ("dueDate");


--
-- Name: idx_invoices_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_invoices_status ON public."Invoices" USING btree (status);


--
-- Name: idx_log_tickets_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_log_tickets_ticket_id ON public."LogTickets" USING btree ("ticketId");


--
-- Name: idx_log_tickets_user_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_log_tickets_user_id ON public."LogTickets" USING btree ("userId");


--
-- Name: idx_message_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_message_company_id ON public."Messages" USING btree ("companyId");


--
-- Name: idx_message_quoted_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_message_quoted_id ON public."Messages" USING btree ("quotedMsgId");


--
-- Name: idx_message_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_message_ticket_id ON public."Messages" USING btree ("ticketId");


--
-- Name: idx_messages_company_created; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_messages_company_created ON public."Messages" USING btree ("companyId", "createdAt");


--
-- Name: idx_messages_from_me; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_messages_from_me ON public."Messages" USING btree ("fromMe");


--
-- Name: idx_messages_ticket_company; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_messages_ticket_company ON public."Messages" USING btree ("ticketId", "companyId");


--
-- Name: idx_messages_ticket_created; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_messages_ticket_created ON public."Messages" USING btree ("ticketId", "createdAt");


--
-- Name: idx_messages_ticket_from_deleted; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_messages_ticket_from_deleted ON public."Messages" USING btree ("ticketId", "fromMe", "isDeleted");


--
-- Name: idx_messages_ticketid_isdeleted_mediaurl; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_messages_ticketid_isdeleted_mediaurl ON public."Messages" USING btree ("ticketId", "isDeleted", "mediaUrl");


--
-- Name: idx_messages_ticketid_mediaurl; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_messages_ticketid_mediaurl ON public."Messages" USING btree ("ticketId", "mediaUrl");


--
-- Name: idx_messages_wid; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_messages_wid ON public."Messages" USING btree (wid);


--
-- Name: idx_messages_wid_company; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_messages_wid_company ON public."Messages" USING btree (wid, "companyId");


--
-- Name: idx_messages_wid_fromme; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_messages_wid_fromme ON public."Messages" USING btree (wid, "fromMe");


--
-- Name: idx_messages_wid_unique; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_messages_wid_unique ON public."Messages" USING btree (wid);


--
-- Name: idx_ms_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ms_company_id ON public."Messages" USING btree ("companyId");


--
-- Name: idx_ms_company_id_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ms_company_id_ticket_id ON public."Messages" USING btree ("companyId", "ticketId");


--
-- Name: idx_msg_company_created; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_msg_company_created ON public."Messages" USING btree ("companyId", "createdAt");


--
-- Name: idx_msg_fromme_ticket; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_msg_fromme_ticket ON public."Messages" USING btree ("fromMe", "ticketId");


--
-- Name: idx_msg_ticket_created; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_msg_ticket_created ON public."Messages" USING btree ("ticketId", "createdAt");


--
-- Name: idx_prompts_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_prompts_company_id ON public."Prompts" USING btree ("companyId");


--
-- Name: idx_prompts_queue_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_prompts_queue_id ON public."Prompts" USING btree ("queueId");


--
-- Name: idx_queue_integrations_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_queue_integrations_company_id ON public."QueueIntegrations" USING btree ("companyId");


--
-- Name: idx_queue_options_parent_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_queue_options_parent_id ON public."QueueOptions" USING btree ("parentId");


--
-- Name: idx_queue_options_queue_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_queue_options_queue_id ON public."QueueOptions" USING btree ("queueId");


--
-- Name: idx_queue_states_queue_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_queue_states_queue_id ON public."QueueStates" USING btree ("queueId");


--
-- Name: idx_queues_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_queues_company_id ON public."Queues" USING btree ("companyId");


--
-- Name: idx_queues_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_queues_id ON public."Queues" USING btree (id);


--
-- Name: idx_quick_message_components_quick_message_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_quick_message_components_quick_message_id ON public."QuickMessageComponents" USING btree ("quickMessageId");


--
-- Name: idx_quick_messages_geral; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_quick_messages_geral ON public."QuickMessages" USING btree (geral);


--
-- Name: idx_quick_messages_user_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_quick_messages_user_id ON public."QuickMessages" USING btree ("userId");


--
-- Name: idx_quick_messages_whatsapp_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_quick_messages_whatsapp_id ON public."QuickMessages" USING btree ("whatsappId");


--
-- Name: idx_sched_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_sched_company_id ON public."Schedules" USING btree ("companyId");


--
-- Name: idx_sched_company_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_sched_company_status ON public."Schedules" USING btree ("companyId", status);


--
-- Name: idx_sched_send_at; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_sched_send_at ON public."Schedules" USING btree ("sendAt");


--
-- Name: idx_scheduled_messages_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_scheduled_messages_company_id ON public."ScheduledMessages" USING btree ("companyId");


--
-- Name: idx_scheduled_messages_date; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_scheduled_messages_date ON public."ScheduledMessages" USING btree (data_mensagem_programada);


--
-- Name: idx_scheduled_messages_envio_date; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_scheduled_messages_envio_date ON public."ScheduledMessagesEnvios" USING btree (data_envio);


--
-- Name: idx_scheduled_messages_envio_parent; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_scheduled_messages_envio_parent ON public."ScheduledMessagesEnvios" USING btree (scheduledmessages);


--
-- Name: idx_scheduled_messages_envios_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_scheduled_messages_envios_company_id ON public."ScheduledMessagesEnvios" USING btree ("companyId");


--
-- Name: idx_schedules_company_send_at; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_schedules_company_send_at ON public."Schedules" USING btree ("companyId", "sendAt");


--
-- Name: idx_schedules_reminder_status_date; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_schedules_reminder_status_date ON public."Schedules" USING btree ("reminderStatus", "reminderDate");


--
-- Name: idx_schedules_send_at; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_schedules_send_at ON public."Schedules" USING btree ("sendAt");


--
-- Name: idx_schedules_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_schedules_status ON public."Schedules" USING btree (status);


--
-- Name: idx_schedules_status_sendat; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_schedules_status_sendat ON public."Schedules" USING btree (status, "sendAt");


--
-- Name: idx_settings_company_key; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_settings_company_key ON public."Settings" USING btree ("companyId", key);


--
-- Name: idx_settings_key; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_settings_key ON public."Settings" USING btree (key);


--
-- Name: idx_subscriptions_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_subscriptions_company_id ON public."Subscriptions" USING btree ("companyId");


--
-- Name: idx_subscriptions_is_active; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_subscriptions_is_active ON public."Subscriptions" USING btree ("isActive");


--
-- Name: idx_tags_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tags_company_id ON public."Tags" USING btree ("companyId");


--
-- Name: idx_tags_company_kanban; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tags_company_kanban ON public."Tags" USING btree ("companyId", kanban);


--
-- Name: idx_tags_kanban; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tags_kanban ON public."Tags" USING btree (kanban);


--
-- Name: idx_tg_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tg_company_id ON public."Tags" USING btree ("companyId");


--
-- Name: idx_tick_company_queue; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tick_company_queue ON public."Tickets" USING btree ("companyId", "queueId");


--
-- Name: idx_tick_company_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tick_company_status ON public."Tickets" USING btree ("companyId", status);


--
-- Name: idx_tick_company_user; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tick_company_user ON public."Tickets" USING btree ("companyId", "userId");


--
-- Name: idx_tick_company_whatsapp; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tick_company_whatsapp ON public."Tickets" USING btree ("companyId", "whatsappId");


--
-- Name: idx_tick_status_company_updated; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tick_status_company_updated ON public."Tickets" USING btree (status, "companyId", "updatedAt");


--
-- Name: idx_tick_updated_at; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tick_updated_at ON public."Tickets" USING btree ("updatedAt");


--
-- Name: idx_tick_whatsapp_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tick_whatsapp_status ON public."Tickets" USING btree ("whatsappId", status);


--
-- Name: idx_ticket_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_company_id ON public."Tickets" USING btree ("companyId");


--
-- Name: idx_ticket_contact_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_contact_id ON public."Tickets" USING btree ("contactId");


--
-- Name: idx_ticket_finalization_reasons_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_finalization_reasons_company_id ON public."TicketFinalizationReasons" USING btree ("companyId");


--
-- Name: idx_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_id ON public."Tickets" USING btree (id);


--
-- Name: idx_ticket_notes_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_notes_ticket_id ON public."TicketNotes" USING btree ("ticketId");


--
-- Name: idx_ticket_notes_user_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_notes_user_id ON public."TicketNotes" USING btree ("userId");


--
-- Name: idx_ticket_queue_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_queue_id ON public."Tickets" USING btree ("queueId");


--
-- Name: idx_ticket_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_status ON public."Tickets" USING btree (status);


--
-- Name: idx_ticket_tags_tag_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_tags_tag_id ON public."TicketTags" USING btree ("tagId");


--
-- Name: idx_ticket_tags_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_tags_ticket_id ON public."TicketTags" USING btree ("ticketId");


--
-- Name: idx_ticket_tags_ticket_tag; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_tags_ticket_tag ON public."TicketTags" USING btree ("ticketId", "tagId");


--
-- Name: idx_ticket_traking_company_created; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_traking_company_created ON public."TicketTraking" USING btree ("companyId", "createdAt");


--
-- Name: idx_ticket_traking_company_finished; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_traking_company_finished ON public."TicketTraking" USING btree ("companyId", "finishedAt");


--
-- Name: idx_ticket_traking_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_traking_company_id ON public."TicketTraking" USING btree ("companyId");


--
-- Name: idx_ticket_traking_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_traking_ticket_id ON public."TicketTraking" USING btree ("ticketId");


--
-- Name: idx_ticket_traking_user_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_traking_user_id ON public."TicketTraking" USING btree ("userId");


--
-- Name: idx_ticket_traking_whatsapp_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_traking_whatsapp_id ON public."TicketTraking" USING btree ("whatsappId");


--
-- Name: idx_ticket_user_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_user_id ON public."Tickets" USING btree ("userId");


--
-- Name: idx_ticket_whatsapp_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticket_whatsapp_id ON public."Tickets" USING btree ("whatsappId");


--
-- Name: idx_tickets_company_is_group; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_company_is_group ON public."Tickets" USING btree ("companyId", "isGroup");


--
-- Name: idx_tickets_company_queue_status_user; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_company_queue_status_user ON public."Tickets" USING btree ("companyId", "queueId", status, "userId");


--
-- Name: idx_tickets_company_status_created; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_company_status_created ON public."Tickets" USING btree ("companyId", status, "createdAt");


--
-- Name: idx_tickets_company_status_queue_group; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_company_status_queue_group ON public."Tickets" USING btree ("companyId", status, "queueId", "isGroup");


--
-- Name: idx_tickets_company_status_unread; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_company_status_unread ON public."Tickets" USING btree ("companyId", status, "unreadMessages");


--
-- Name: idx_tickets_company_status_updated; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_company_status_updated ON public."Tickets" USING btree ("companyId", status, "updatedAt");


--
-- Name: idx_tickets_company_user_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_company_user_status ON public."Tickets" USING btree ("companyId", "userId", status);


--
-- Name: idx_tickets_company_whatsapp_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_company_whatsapp_status ON public."Tickets" USING btree ("companyId", "whatsappId", status);


--
-- Name: idx_tickets_contact_company_whatsapp; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_contact_company_whatsapp ON public."Tickets" USING btree ("contactId", "companyId", "whatsappId");


--
-- Name: idx_tickets_contact_whatsapp_company_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_contact_whatsapp_company_status ON public."Tickets" USING btree ("contactId", "whatsappId", "companyId", status);


--
-- Name: idx_tickets_kanban_lookup; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_kanban_lookup ON public."Tickets" USING btree ("companyId", status, "userId", "queueId");


--
-- Name: idx_tickets_queue_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_queue_status ON public."Tickets" USING btree ("queueId", status);


--
-- Name: idx_tickets_user_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tickets_user_status ON public."Tickets" USING btree ("userId", status);


--
-- Name: idx_ticktrack_company_created; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticktrack_company_created ON public."TicketTraking" USING btree ("companyId", "createdAt");


--
-- Name: idx_ticktrack_ticket; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_ticktrack_ticket ON public."TicketTraking" USING btree ("ticketId");


--
-- Name: idx_tictag_tag; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tictag_tag ON public."TicketTags" USING btree ("tagId");


--
-- Name: idx_tictag_ticket; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_tictag_ticket ON public."TicketTags" USING btree ("ticketId");


--
-- Name: idx_user_company_profile; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_user_company_profile ON public."Users" USING btree ("companyId", profile);


--
-- Name: idx_user_queues_queue_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_user_queues_queue_id ON public."UserQueues" USING btree ("queueId");


--
-- Name: idx_user_queues_user_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_user_queues_user_id ON public."UserQueues" USING btree ("userId");


--
-- Name: idx_user_ratings_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_user_ratings_company_id ON public."UserRatings" USING btree ("companyId");


--
-- Name: idx_user_ratings_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_user_ratings_ticket_id ON public."UserRatings" USING btree ("ticketId");


--
-- Name: idx_user_ratings_user_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_user_ratings_user_id ON public."UserRatings" USING btree ("userId");


--
-- Name: idx_userqueue_queue; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_userqueue_queue ON public."UserQueues" USING btree ("queueId");


--
-- Name: idx_userqueue_user; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_userqueue_user ON public."UserQueues" USING btree ("userId");


--
-- Name: idx_userratings_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_userratings_company_id ON public."UserRatings" USING btree ("companyId");


--
-- Name: idx_userratings_ticket_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_userratings_ticket_id ON public."UserRatings" USING btree ("ticketId");


--
-- Name: idx_users_birth_date; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_users_birth_date ON public."Users" USING btree ("birthDate");


--
-- Name: idx_users_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_users_company_id ON public."Users" USING btree ("companyId");


--
-- Name: idx_users_company_profile; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_users_company_profile ON public."Users" USING btree ("companyId", profile);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_users_email ON public."Users" USING btree (email);


--
-- Name: idx_users_online; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_users_online ON public."Users" USING btree (online);


--
-- Name: idx_users_profile; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_users_profile ON public."Users" USING btree (profile);


--
-- Name: idx_users_whatsapp_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_users_whatsapp_id ON public."Users" USING btree ("whatsappId");


--
-- Name: idx_webhooks_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_webhooks_company_id ON public."Webhooks" USING btree (company_id);


--
-- Name: idx_webhooks_user_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_webhooks_user_id ON public."Webhooks" USING btree (user_id);


--
-- Name: idx_whats_company_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whats_company_status ON public."Whatsapps" USING btree ("companyId", status);


--
-- Name: idx_whatsapp_queues_queue_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whatsapp_queues_queue_id ON public."WhatsappQueues" USING btree ("queueId");


--
-- Name: idx_whatsapp_queues_whatsapp_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whatsapp_queues_whatsapp_id ON public."WhatsappQueues" USING btree ("whatsappId");


--
-- Name: idx_whatsapplidmaps_contactid; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whatsapplidmaps_contactid ON public."WhatsappLidMaps" USING btree ("contactId");


--
-- Name: idx_whatsapps_channel; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whatsapps_channel ON public."Whatsapps" USING btree (channel);


--
-- Name: idx_whatsapps_company_default; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whatsapps_company_default ON public."Whatsapps" USING btree ("companyId", "isDefault");


--
-- Name: idx_whatsapps_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whatsapps_company_id ON public."Whatsapps" USING btree ("companyId");


--
-- Name: idx_whatsapps_company_status; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whatsapps_company_status ON public."Whatsapps" USING btree ("companyId", status);


--
-- Name: idx_whatsapps_integration_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whatsapps_integration_id ON public."Whatsapps" USING btree ("integrationId");


--
-- Name: idx_whatsapps_prompt_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whatsapps_prompt_id ON public."Whatsapps" USING btree ("promptId");


--
-- Name: idx_whatsapps_queue_import_messages; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whatsapps_queue_import_messages ON public."Whatsapps" USING btree ("queueIdImportMessages");


--
-- Name: idx_whatsapps_send_id_queue; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX idx_whatsapps_send_id_queue ON public."Whatsapps" USING btree ("sendIdQueue");


--
-- Name: preset_webhooks_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX preset_webhooks_company_id ON public."PresetWebhooks" USING btree ("companyId");


--
-- Name: preset_webhooks_company_id_is_active; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX preset_webhooks_company_id_is_active ON public."PresetWebhooks" USING btree ("companyId", "isActive");


--
-- Name: preset_webhooks_company_id_provider; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX preset_webhooks_company_id_provider ON public."PresetWebhooks" USING btree ("companyId", provider);


--
-- Name: preset_webhooks_is_active; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX preset_webhooks_is_active ON public."PresetWebhooks" USING btree ("isActive");


--
-- Name: preset_webhooks_is_system; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX preset_webhooks_is_system ON public."PresetWebhooks" USING btree ("isSystem");


--
-- Name: preset_webhooks_provider; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX preset_webhooks_provider ON public."PresetWebhooks" USING btree (provider);


--
-- Name: tickets_contact_company_status_idx; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX tickets_contact_company_status_idx ON public."Tickets" USING btree ("contactId", "companyId", status);


--
-- Name: tickets_contact_company_updatedat_idx; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX tickets_contact_company_updatedat_idx ON public."Tickets" USING btree ("contactId", "companyId", "updatedAt");


--
-- Name: tickets_contact_company_whatsapp_status_idx; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX tickets_contact_company_whatsapp_status_idx ON public."Tickets" USING btree ("contactId", "companyId", "whatsappId", status);


--
-- Name: tickets_uuid_idx; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX tickets_uuid_idx ON public."Tickets" USING btree (uuid);


--
-- Name: whatsapp_lid_maps_company_id; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX whatsapp_lid_maps_company_id ON public."WhatsappLidMaps" USING btree ("companyId");


--
-- Name: whatsapp_lid_maps_lid; Type: INDEX; Schema: public; Owner: whaticket
--

CREATE INDEX whatsapp_lid_maps_lid ON public."WhatsappLidMaps" USING btree (lid);


--
-- Name: AIAgentKnowledges AIAgentKnowledges_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."AIAgentKnowledges"
    ADD CONSTRAINT "AIAgentKnowledges_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public."AIAgents"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AIAgentKnowledges AIAgentKnowledges_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."AIAgentKnowledges"
    ADD CONSTRAINT "AIAgentKnowledges_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AIAgents AIAgents_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."AIAgents"
    ADD CONSTRAINT "AIAgents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AIAgents AIAgents_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."AIAgents"
    ADD CONSTRAINT "AIAgents_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Announcements Announcements_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Announcements"
    ADD CONSTRAINT "Announcements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Announcements Announcements_targetCompanyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Announcements"
    ADD CONSTRAINT "Announcements_targetCompanyId_fkey" FOREIGN KEY ("targetCompanyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BirthdaySettings BirthdaySettings_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."BirthdaySettings"
    ADD CONSTRAINT "BirthdaySettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BirthdaySettings BirthdaySettings_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."BirthdaySettings"
    ADD CONSTRAINT "BirthdaySettings_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CampaignSettings CampaignSettings_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CampaignSettings"
    ADD CONSTRAINT "CampaignSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignShipping CampaignShipping_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CampaignShipping"
    ADD CONSTRAINT "CampaignShipping_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."Campaigns"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignShipping CampaignShipping_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CampaignShipping"
    ADD CONSTRAINT "CampaignShipping_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."ContactListItems"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Campaigns Campaigns_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Campaigns Campaigns_contactListId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_contactListId_fkey" FOREIGN KEY ("contactListId") REFERENCES public."ContactLists"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Campaigns Campaigns_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Campaigns Campaigns_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."QuickMessages"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Campaigns Campaigns_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Campaigns Campaigns_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: ChatMessages ChatMessages_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public."Chats"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessages ChatMessages_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessages ChatMessages_forwardedFromId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_forwardedFromId_fkey" FOREIGN KEY ("forwardedFromId") REFERENCES public."ChatMessages"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChatMessages ChatMessages_replyToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES public."ChatMessages"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChatMessages ChatMessages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatUsers ChatUsers_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ChatUsers"
    ADD CONSTRAINT "ChatUsers_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public."Chats"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatUsers ChatUsers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ChatUsers"
    ADD CONSTRAINT "ChatUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Chatbots Chatbots_chatbotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES public."Chatbots"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Chatbots Chatbots_optFileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_optFileId_fkey" FOREIGN KEY ("optFileId") REFERENCES public."Files"(id);


--
-- Name: Chatbots Chatbots_optIntegrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_optIntegrationId_fkey" FOREIGN KEY ("optIntegrationId") REFERENCES public."QueueIntegrations"(id);


--
-- Name: Chatbots Chatbots_optQueueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_optQueueId_fkey" FOREIGN KEY ("optQueueId") REFERENCES public."Queues"(id);


--
-- Name: Chatbots Chatbots_optUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_optUserId_fkey" FOREIGN KEY ("optUserId") REFERENCES public."Users"(id);


--
-- Name: Chatbots Chatbots_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Chats Chats_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Chats Chats_groupAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_groupAdminId_fkey" FOREIGN KEY ("groupAdminId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Chats Chats_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompaniesSettings CompaniesSettings_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CompaniesSettings"
    ADD CONSTRAINT "CompaniesSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Companies Companies_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."Plans"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CompanyKanbanConfigs CompanyKanbanConfigs_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."CompanyKanbanConfigs"
    ADD CONSTRAINT "CompanyKanbanConfigs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactCustomFields ContactCustomFields_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactCustomFields"
    ADD CONSTRAINT "ContactCustomFields_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactListItems ContactListItems_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactListItems"
    ADD CONSTRAINT "ContactListItems_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactListItems ContactListItems_contactListId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactListItems"
    ADD CONSTRAINT "ContactListItems_contactListId_fkey" FOREIGN KEY ("contactListId") REFERENCES public."ContactLists"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactLists ContactLists_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactLists"
    ADD CONSTRAINT "ContactLists_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactTags ContactTags_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactTags"
    ADD CONSTRAINT "ContactTags_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactTags ContactTags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactTags"
    ADD CONSTRAINT "ContactTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tags"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactWallets ContactWallets_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactWallets"
    ADD CONSTRAINT "ContactWallets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactWallets ContactWallets_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactWallets"
    ADD CONSTRAINT "ContactWallets_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactWallets ContactWallets_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactWallets"
    ADD CONSTRAINT "ContactWallets_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactWallets ContactWallets_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."ContactWallets"
    ADD CONSTRAINT "ContactWallets_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Contacts Contacts_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Contacts"
    ADD CONSTRAINT "Contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Contacts Contacts_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Contacts"
    ADD CONSTRAINT "Contacts_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DialogChatBots DialogChatBots_chatbotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."DialogChatBots"
    ADD CONSTRAINT "DialogChatBots_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES public."Chatbots"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DialogChatBots DialogChatBots_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."DialogChatBots"
    ADD CONSTRAINT "DialogChatBots_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DialogChatBots DialogChatBots_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."DialogChatBots"
    ADD CONSTRAINT "DialogChatBots_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FilesOptions FilesOptions_fileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FilesOptions"
    ADD CONSTRAINT "FilesOptions_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES public."Files"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Files Files_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "Files_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FloupSchedules FloupSchedules_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FloupSchedules"
    ADD CONSTRAINT "FloupSchedules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FloupSchedules FloupSchedules_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FloupSchedules"
    ADD CONSTRAINT "FloupSchedules_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FloupSchedules FloupSchedules_floupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FloupSchedules"
    ADD CONSTRAINT "FloupSchedules_floupId_fkey" FOREIGN KEY ("floupId") REFERENCES public."Floups"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FloupSchedules FloupSchedules_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FloupSchedules"
    ADD CONSTRAINT "FloupSchedules_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Floups Floups_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Floups"
    ADD CONSTRAINT "Floups_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FlowCampaigns FlowCampaigns_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."FlowCampaigns"
    ADD CONSTRAINT "FlowCampaigns_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Integrations Integrations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Integrations"
    ADD CONSTRAINT "Integrations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InteractiveMessageTemplates InteractiveMessageTemplates_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."InteractiveMessageTemplates"
    ADD CONSTRAINT "InteractiveMessageTemplates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InteractiveMessageTemplates InteractiveMessageTemplates_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."InteractiveMessageTemplates"
    ADD CONSTRAINT "InteractiveMessageTemplates_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoices Invoices_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LogTickets LogTickets_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."LogTickets"
    ADD CONSTRAINT "LogTickets_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LogTickets LogTickets_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."LogTickets"
    ADD CONSTRAINT "LogTickets_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LogTickets LogTickets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."LogTickets"
    ADD CONSTRAINT "LogTickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Messages Messages_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Messages Messages_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Messages Messages_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Messages Messages_quotedMsgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_quotedMsgId_fkey" FOREIGN KEY ("quotedMsgId") REFERENCES public."Messages"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Messages Messages_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Messages Messages_ticketTrakingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_ticketTrakingId_fkey" FOREIGN KEY ("ticketTrakingId") REFERENCES public."TicketTraking"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: PasswordResetTokens PasswordResetTokens_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PasswordResetTokens"
    ADD CONSTRAINT "PasswordResetTokens_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PasswordResetTokens PasswordResetTokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PasswordResetTokens"
    ADD CONSTRAINT "PasswordResetTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PresetWebhooks PresetWebhooks_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PresetWebhooks"
    ADD CONSTRAINT "PresetWebhooks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Prompts Prompts_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Prompts"
    ADD CONSTRAINT "Prompts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id);


--
-- Name: Prompts Prompts_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Prompts"
    ADD CONSTRAINT "Prompts_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id);


--
-- Name: PushSubscriptions PushSubscriptions_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PushSubscriptions"
    ADD CONSTRAINT "PushSubscriptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PushSubscriptions PushSubscriptions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."PushSubscriptions"
    ADD CONSTRAINT "PushSubscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QueueIntegrations QueueIntegrations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: QueueIntegrations QueueIntegrations_openTicketQueueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_openTicketQueueId_fkey" FOREIGN KEY ("openTicketQueueId") REFERENCES public."Queues"(id);


--
-- Name: QueueIntegrations QueueIntegrations_openTicketUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_openTicketUserId_fkey" FOREIGN KEY ("openTicketUserId") REFERENCES public."Users"(id);


--
-- Name: QueueIntegrations QueueIntegrations_queueIdAssign_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_queueIdAssign_fkey" FOREIGN KEY ("queueIdAssign") REFERENCES public."Queues"(id);


--
-- Name: QueueIntegrations QueueIntegrations_transferQueueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_transferQueueId_fkey" FOREIGN KEY ("transferQueueId") REFERENCES public."Queues"(id);


--
-- Name: QueueIntegrations QueueIntegrations_transferUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_transferUserId_fkey" FOREIGN KEY ("transferUserId") REFERENCES public."Users"(id);


--
-- Name: QueueIntegrations QueueIntegrations_userIdAssign_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_userIdAssign_fkey" FOREIGN KEY ("userIdAssign") REFERENCES public."Users"(id);


--
-- Name: QueueIntegrations QueueIntegrations_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id);


--
-- Name: QueueOptions QueueOptions_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueOptions"
    ADD CONSTRAINT "QueueOptions_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."QueueOptions"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QueueOptions QueueOptions_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueOptions"
    ADD CONSTRAINT "QueueOptions_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QueueStates QueueStates_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QueueStates"
    ADD CONSTRAINT "QueueStates_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Queues Queues_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Queues Queues_fileListId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_fileListId_fkey" FOREIGN KEY ("fileListId") REFERENCES public."Files"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Queues Queues_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."QueueIntegrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: QuickMessageComponents QuickMessageComponents_quickMessageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QuickMessageComponents"
    ADD CONSTRAINT "QuickMessageComponents_quickMessageId_fkey" FOREIGN KEY ("quickMessageId") REFERENCES public."QuickMessages"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuickMessages QuickMessages_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QuickMessages"
    ADD CONSTRAINT "QuickMessages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuickMessages QuickMessages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QuickMessages"
    ADD CONSTRAINT "QuickMessages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuickMessages QuickMessages_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."QuickMessages"
    ADD CONSTRAINT "QuickMessages_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Schedules Schedules_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Schedules Schedules_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Schedules Schedules_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Schedules Schedules_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Schedules Schedules_ticketUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_ticketUserId_fkey" FOREIGN KEY ("ticketUserId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Schedules Schedules_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Schedules Schedules_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Settings Settings_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Subscriptions Subscriptions_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Subscriptions"
    ADD CONSTRAINT "Subscriptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tags Tags_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tags"
    ADD CONSTRAINT "Tags_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketFinalizationReasons TicketFinalizationReasons_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketFinalizationReasons"
    ADD CONSTRAINT "TicketFinalizationReasons_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketNotes TicketNotes_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketNotes"
    ADD CONSTRAINT "TicketNotes_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketNotes TicketNotes_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketNotes"
    ADD CONSTRAINT "TicketNotes_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TicketNotes TicketNotes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketNotes"
    ADD CONSTRAINT "TicketNotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TicketTags TicketTags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketTags"
    ADD CONSTRAINT "TicketTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tags"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketTags TicketTags_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketTags"
    ADD CONSTRAINT "TicketTags_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketTraking TicketTraking_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON DELETE SET NULL;


--
-- Name: TicketTraking TicketTraking_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: TicketTraking TicketTraking_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON DELETE SET NULL;


--
-- Name: TicketTraking TicketTraking_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE SET NULL;


--
-- Name: TicketTraking TicketTraking_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON DELETE SET NULL;


--
-- Name: Tickets Tickets_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tickets Tickets_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Tickets Tickets_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."QueueIntegrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tickets Tickets_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tickets Tickets_queueOptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_queueOptionId_fkey" FOREIGN KEY ("queueOptionId") REFERENCES public."QueueOptions"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Tickets Tickets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tickets Tickets_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserRatings UserRatings_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."UserRatings"
    ADD CONSTRAINT "UserRatings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON DELETE SET NULL;


--
-- Name: UserRatings UserRatings_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."UserRatings"
    ADD CONSTRAINT "UserRatings_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON DELETE SET NULL;


--
-- Name: UserRatings UserRatings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."UserRatings"
    ADD CONSTRAINT "UserRatings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE SET NULL;


--
-- Name: UserWhatsapps UserWhatsapps_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."UserWhatsapps"
    ADD CONSTRAINT "UserWhatsapps_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserWhatsapps UserWhatsapps_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."UserWhatsapps"
    ADD CONSTRAINT "UserWhatsapps_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Users Users_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Users Users_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WhatsappLidMaps WhatsappLidMaps_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."WhatsappLidMaps"
    ADD CONSTRAINT "WhatsappLidMaps_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Whatsapps Whatsapps_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_flowIdInactiveTime_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_flowIdInactiveTime_fkey" FOREIGN KEY ("flowIdInactiveTime") REFERENCES public."FlowBuilders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_flowIdNotPhrase_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_flowIdNotPhrase_fkey" FOREIGN KEY ("flowIdNotPhrase") REFERENCES public."FlowBuilders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_flowIdWelcome_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_flowIdWelcome_fkey" FOREIGN KEY ("flowIdWelcome") REFERENCES public."FlowBuilders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."QueueIntegrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_integrationTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_integrationTypeId_fkey" FOREIGN KEY ("integrationTypeId") REFERENCES public."QueueIntegrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_promptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES public."Prompts"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: Whatsapps Whatsapps_queueIdImportMessages_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_queueIdImportMessages_fkey" FOREIGN KEY ("queueIdImportMessages") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_timeAwaitActiveFlowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whaticket
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_timeAwaitActiveFlowId_fkey" FOREIGN KEY ("timeAwaitActiveFlowId") REFERENCES public."FlowBuilders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict rItp041ip3XtfVxB6OdOf7kHnPz52w6SUfJ2llu5H6gjVaMy49OdJhkYO77O1si

