--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Homebrew)
-- Dumped by pg_dump version 17.5 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_table_access_method = heap;

--
-- Name: Area; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Area" (
    id bigint NOT NULL,
    "cityId" bigint NOT NULL,
    "orgId" bigint NOT NULL,
    tag text NOT NULL,
    name text NOT NULL,
    details text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL
);


--
-- Name: Area_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Area_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Area_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Area_id_seq" OWNED BY public."Area".id;


--
-- Name: Branch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Branch" (
    name text NOT NULL,
    phone text,
    email text,
    "managerId" text,
    "openTime" text DEFAULT '09:00'::text NOT NULL,
    "closeTime" text DEFAULT '23:00'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    "addrLine1" text DEFAULT ''::text NOT NULL,
    "addrLine2" text,
    "addrCity" text DEFAULT ''::text NOT NULL,
    "addrState" text DEFAULT ''::text NOT NULL,
    "addrCountry" text DEFAULT 'PK'::text NOT NULL,
    "addrPostCode" text DEFAULT ''::text NOT NULL,
    "addrLat" double precision,
    "addrLng" double precision,
    "addrArea" text DEFAULT ''::text NOT NULL,
    "areaId" bigint,
    "brandId" bigint NOT NULL,
    label text NOT NULL,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL,
    "cityId" bigint NOT NULL,
    "taxConfigId" bigint
);


--
-- Name: Branch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Branch_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Branch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Branch_id_seq" OWNED BY public."Branch".id;


--
-- Name: Brand; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Brand" (
    id bigint NOT NULL,
    "orgId" bigint NOT NULL,
    tag text NOT NULL,
    name text NOT NULL,
    logo text,
    tagline text,
    "primaryColor" text DEFAULT '#F97316'::text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL
);


--
-- Name: Brand_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Brand_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Brand_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Brand_id_seq" OWNED BY public."Brand".id;


--
-- Name: Campaign; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Campaign" (
    name text NOT NULL,
    channel text NOT NULL,
    template text NOT NULL,
    "targetTier" text,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    "sentAt" timestamp(3) without time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    "totalSent" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL
);


--
-- Name: Campaign_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Campaign_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Campaign_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Campaign_id_seq" OWNED BY public."Campaign".id;


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id bigint NOT NULL,
    "orgId" bigint NOT NULL,
    "foodTypeId" bigint,
    name text NOT NULL,
    tag text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL
);


--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Category_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: City; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."City" (
    name text NOT NULL,
    country text DEFAULT 'PK'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    code text NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    "stateId" bigint,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL
);


--
-- Name: City_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."City_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: City_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."City_id_seq" OWNED BY public."City".id;


--
-- Name: Customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Customer" (
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    "dateOfBirth" timestamp(3) without time zone,
    "phoneVerified" boolean DEFAULT false NOT NULL,
    "marketingOptIn" boolean DEFAULT false NOT NULL,
    "smsOptIn" boolean DEFAULT false NOT NULL,
    "loyaltyPoints" integer DEFAULT 0 NOT NULL,
    "lifetimePoints" integer DEFAULT 0 NOT NULL,
    "tierId" text,
    "totalOrders" integer DEFAULT 0 NOT NULL,
    "totalSpentPaisa" integer DEFAULT 0 NOT NULL,
    "lastOrderAt" timestamp(3) without time zone,
    "lastBranchId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL
);


--
-- Name: CustomerMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CustomerMessage" (
    channel text NOT NULL,
    type text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "customerId" bigint NOT NULL,
    "orgId" bigint NOT NULL
);


--
-- Name: CustomerMessage_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."CustomerMessage_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CustomerMessage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."CustomerMessage_id_seq" OWNED BY public."CustomerMessage".id;


--
-- Name: Customer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Customer_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Customer_id_seq" OWNED BY public."Customer".id;


--
-- Name: Deal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Deal" (
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    "basePricePaisa" integer NOT NULL,
    "discountPercentage" double precision,
    "salePricePaisa" integer,
    tag text NOT NULL,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL
);


--
-- Name: Deal_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Deal_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Deal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Deal_id_seq" OWNED BY public."Deal".id;


--
-- Name: DiscountPreset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DiscountPreset" (
    name text NOT NULL,
    type text NOT NULL,
    value double precision NOT NULL,
    level text NOT NULL,
    reason text DEFAULT 'promotional'::text NOT NULL,
    "requiresManagerPin" boolean DEFAULT false NOT NULL,
    "maxValuePaisa" integer,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL
);


--
-- Name: DiscountPreset_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."DiscountPreset_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: DiscountPreset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."DiscountPreset_id_seq" OWNED BY public."DiscountPreset".id;


--
-- Name: FoodType; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FoodType" (
    id bigint NOT NULL,
    "orgId" bigint NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL
);


--
-- Name: FoodType_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."FoodType_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: FoodType_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."FoodType_id_seq" OWNED BY public."FoodType".id;


--
-- Name: HeldOrder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."HeldOrder" (
    id bigint NOT NULL,
    "orgId" bigint NOT NULL,
    "cityId" bigint NOT NULL,
    "branchId" bigint NOT NULL,
    "terminalId" bigint NOT NULL,
    "cashierId" text NOT NULL,
    label text DEFAULT 'Held Order'::text NOT NULL,
    "itemsJson" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "activeCustomerJson" jsonb,
    "orderType" text DEFAULT 'dine-in'::text NOT NULL,
    "tableId" bigint,
    "tableName" text,
    covers integer,
    "customerId" text,
    "customerName" text,
    "customerPhone" text,
    "orderNotes" text,
    "heldAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL
);


--
-- Name: HeldOrder_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."HeldOrder_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: HeldOrder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."HeldOrder_id_seq" OWNED BY public."HeldOrder".id;


--
-- Name: Inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Inventory" (
    quantity double precision DEFAULT 0 NOT NULL,
    "minThreshold" double precision DEFAULT 5 NOT NULL,
    unit text DEFAULT 'units'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "productId" bigint NOT NULL,
    "branchId" bigint NOT NULL
);


--
-- Name: Inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Inventory_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Inventory_id_seq" OWNED BY public."Inventory".id;


--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Invoice" (
    "cashierId" text NOT NULL,
    "tableName" text,
    covers integer,
    "orderType" text DEFAULT 'dine_in'::text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "orderNotes" text,
    "customerId" text,
    "customerName" text,
    "customerPhone" text,
    "loyaltyPointsEarned" integer DEFAULT 0 NOT NULL,
    "loyaltyPointsRedeemed" integer DEFAULT 0 NOT NULL,
    "subtotalPaisa" integer DEFAULT 0 NOT NULL,
    "lineDiscountPaisa" integer DEFAULT 0 NOT NULL,
    "orderDiscountPaisa" integer DEFAULT 0 NOT NULL,
    "totalDiscountPaisa" integer DEFAULT 0 NOT NULL,
    "taxablePaisa" integer DEFAULT 0 NOT NULL,
    "taxRate" double precision DEFAULT 0 NOT NULL,
    "taxPaisa" integer DEFAULT 0 NOT NULL,
    "grandTotalPaisa" integer DEFAULT 0 NOT NULL,
    "roundingPaisa" integer DEFAULT 0 NOT NULL,
    "discountsJson" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "paymentMethod" text DEFAULT 'cash'::text NOT NULL,
    "paymentStatus" text DEFAULT 'paid'::text NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "allocationsJson" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "voidReason" text,
    "voidedBy" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    synced boolean DEFAULT false NOT NULL,
    "syncedAt" timestamp(3) without time zone,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL,
    "cityId" bigint NOT NULL,
    "branchId" bigint NOT NULL,
    "terminalId" bigint NOT NULL,
    "tillSessionId" bigint NOT NULL,
    "tableId" bigint
);


--
-- Name: InvoiceItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InvoiceItem" (
    "productName" text NOT NULL,
    "productCode" text DEFAULT ''::text NOT NULL,
    category text DEFAULT 'other'::text NOT NULL,
    "unitPricePaisa" integer NOT NULL,
    quantity integer NOT NULL,
    "discountPercent" double precision DEFAULT 0 NOT NULL,
    "lumpDiscountPaisa" integer DEFAULT 0 NOT NULL,
    "lineTotalPaisa" integer NOT NULL,
    "isDeal" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "invoiceId" bigint NOT NULL,
    "productId" bigint,
    "dealId" bigint
);


--
-- Name: InvoiceItem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."InvoiceItem_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: InvoiceItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."InvoiceItem_id_seq" OWNED BY public."InvoiceItem".id;


--
-- Name: Invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Invoice_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Invoice_id_seq" OWNED BY public."Invoice".id;


--
-- Name: KitchenOrder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."KitchenOrder" (
    id bigint NOT NULL,
    "invoiceId" bigint NOT NULL,
    "orgId" bigint NOT NULL,
    "branchId" bigint NOT NULL,
    "terminalId" bigint NOT NULL,
    "orderNumber" text NOT NULL,
    "orderType" text NOT NULL,
    "tableId" bigint,
    "tableName" text,
    covers integer,
    "cashierName" text DEFAULT ''::text NOT NULL,
    notes text,
    status text DEFAULT 'new'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    "placedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "acknowledgedAt" timestamp(3) without time zone,
    "startedAt" timestamp(3) without time zone,
    "readyAt" timestamp(3) without time zone,
    "servedAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: KitchenOrderItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."KitchenOrderItem" (
    id bigint NOT NULL,
    "kitchenOrderId" bigint NOT NULL,
    "productId" bigint,
    "productName" text NOT NULL,
    quantity integer NOT NULL,
    notes text,
    status text DEFAULT 'pending'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: KitchenOrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."KitchenOrderItem_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: KitchenOrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."KitchenOrderItem_id_seq" OWNED BY public."KitchenOrderItem".id;


--
-- Name: KitchenOrder_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."KitchenOrder_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: KitchenOrder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."KitchenOrder_id_seq" OWNED BY public."KitchenOrder".id;


--
-- Name: LoyaltyConfig; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoyaltyConfig" (
    "isEnabled" boolean DEFAULT true NOT NULL,
    "earnRatePaisa" integer DEFAULT 1000 NOT NULL,
    "pointValuePaisa" integer DEFAULT 50 NOT NULL,
    "minPointsRedeem" integer DEFAULT 100 NOT NULL,
    "maxRedeemPct" double precision DEFAULT 20 NOT NULL,
    "pointsExpireDays" integer,
    "tiersEnabled" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL
);


--
-- Name: LoyaltyConfig_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."LoyaltyConfig_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LoyaltyConfig_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."LoyaltyConfig_id_seq" OWNED BY public."LoyaltyConfig".id;


--
-- Name: LoyaltyTier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoyaltyTier" (
    name text NOT NULL,
    "minPoints" integer NOT NULL,
    color text DEFAULT '#CD7F32'::text NOT NULL,
    icon text DEFAULT '🥉'::text NOT NULL,
    "earnMultiplier" double precision DEFAULT 1.0 NOT NULL,
    "discountPct" double precision DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "configId" bigint NOT NULL
);


--
-- Name: LoyaltyTier_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."LoyaltyTier_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LoyaltyTier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."LoyaltyTier_id_seq" OWNED BY public."LoyaltyTier".id;


--
-- Name: LoyaltyTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoyaltyTransaction" (
    type text NOT NULL,
    points integer NOT NULL,
    balance integer NOT NULL,
    description text NOT NULL,
    "approvedBy" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "customerId" bigint NOT NULL,
    "orgId" bigint NOT NULL,
    "branchId" bigint NOT NULL,
    "invoiceId" bigint
);


--
-- Name: LoyaltyTransaction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."LoyaltyTransaction_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LoyaltyTransaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."LoyaltyTransaction_id_seq" OWNED BY public."LoyaltyTransaction".id;


--
-- Name: MessageTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MessageTemplate" (
    type text NOT NULL,
    channel text NOT NULL,
    subject text,
    body text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL
);


--
-- Name: MessageTemplate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."MessageTemplate_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: MessageTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."MessageTemplate_id_seq" OWNED BY public."MessageTemplate".id;


--
-- Name: OrgConfig; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrgConfig" (
    "currencyCode" text DEFAULT 'PKR'::text NOT NULL,
    "currencySymbol" text DEFAULT 'Rs'::text NOT NULL,
    "symbolPosition" text DEFAULT 'before'::text NOT NULL,
    "decimalPlaces" integer DEFAULT 2 NOT NULL,
    "thousandSep" text DEFAULT ','::text NOT NULL,
    "decimalSep" text DEFAULT '.'::text NOT NULL,
    locale text DEFAULT 'en-PK'::text NOT NULL,
    timezone text DEFAULT 'Asia/Karachi'::text NOT NULL,
    "dateFormat" text DEFAULT 'DD/MM/YYYY'::text NOT NULL,
    "timeFormat" text DEFAULT '24h'::text NOT NULL,
    country text DEFAULT 'PK'::text NOT NULL,
    "phoneCountryCode" text DEFAULT '+92'::text NOT NULL,
    "receiptHeader" text DEFAULT 'Thank you for visiting Crip & Crumbs!'::text NOT NULL,
    "receiptFooter" text DEFAULT 'Please visit again soon.'::text NOT NULL,
    "showLoyaltyOnReceipt" boolean DEFAULT true NOT NULL,
    "taxRegLabel" text DEFAULT 'NTN'::text NOT NULL,
    "taxRegNumber" text DEFAULT ''::text NOT NULL,
    "businessEmail" text DEFAULT ''::text NOT NULL,
    "businessPhone" text DEFAULT ''::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    "businessName" text DEFAULT ''::text NOT NULL,
    "defaultBranchId" bigint,
    "logoUrl" text DEFAULT ''::text NOT NULL,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL
);


--
-- Name: OrgConfig_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OrgConfig_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OrgConfig_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OrgConfig_id_seq" OWNED BY public."OrgConfig".id;


--
-- Name: OrgRolePermission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrgRolePermission" (
    id bigint NOT NULL,
    "orgId" bigint NOT NULL,
    "roleId" bigint NOT NULL,
    permission text NOT NULL,
    granted boolean NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL
);


--
-- Name: OrgRolePermission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OrgRolePermission_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OrgRolePermission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OrgRolePermission_id_seq" OWNED BY public."OrgRolePermission".id;


--
-- Name: Organisation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Organisation" (
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    website text,
    email text,
    phone text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    "addrLine1" text DEFAULT ''::text NOT NULL,
    "addrLine2" text,
    "addrCity" text DEFAULT ''::text NOT NULL,
    "addrState" text DEFAULT ''::text NOT NULL,
    "addrCountry" text DEFAULT 'PK'::text NOT NULL,
    "addrPostCode" text DEFAULT ''::text NOT NULL,
    id bigint NOT NULL
);


--
-- Name: Organisation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Organisation_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Organisation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Organisation_id_seq" OWNED BY public."Organisation".id;


--
-- Name: OtpCode; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OtpCode" (
    phone text NOT NULL,
    code text NOT NULL,
    purpose text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "userId" bigint
);


--
-- Name: OtpCode_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OtpCode_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OtpCode_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OtpCode_id_seq" OWNED BY public."OtpCode".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Product" (
    name text NOT NULL,
    sku text NOT NULL,
    "basePricePaisa" integer NOT NULL,
    "salePricePaisa" integer,
    "imageUrl" text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    "categoryId" bigint,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL
);


--
-- Name: ProductBranchConfig; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductBranchConfig" (
    "pricePaisa" integer NOT NULL,
    "salePricePaisa" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "productId" bigint NOT NULL,
    "branchId" bigint NOT NULL
);


--
-- Name: ProductBranchConfig_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ProductBranchConfig_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ProductBranchConfig_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ProductBranchConfig_id_seq" OWNED BY public."ProductBranchConfig".id;


--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Product_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: Reservation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Reservation" (
    "guestName" text NOT NULL,
    "guestPhone" text NOT NULL,
    covers integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "durationMin" integer DEFAULT 90 NOT NULL,
    status text DEFAULT 'confirmed'::text NOT NULL,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "branchId" bigint NOT NULL,
    "tableId" bigint
);


--
-- Name: Reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Reservation_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Reservation_id_seq" OWNED BY public."Reservation".id;


--
-- Name: Role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Role" (
    id bigint NOT NULL,
    "orgId" bigint NOT NULL,
    name text NOT NULL,
    tag text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL
);


--
-- Name: Role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Role_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Role_id_seq" OWNED BY public."Role".id;


--
-- Name: State; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."State" (
    id bigint NOT NULL,
    "orgId" bigint NOT NULL,
    tag text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "zipCode" text,
    country text DEFAULT 'PK'::text NOT NULL,
    region text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL
);


--
-- Name: State_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."State_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: State_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."State_id_seq" OWNED BY public."State".id;


--
-- Name: Table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Table" (
    number integer NOT NULL,
    name text NOT NULL,
    seats integer DEFAULT 4 NOT NULL,
    shape text DEFAULT 'square'::text NOT NULL,
    "posX" double precision DEFAULT 0 NOT NULL,
    "posY" double precision DEFAULT 0 NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    "assignedTo" text,
    "occupiedAt" timestamp(3) without time zone,
    covers integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "branchId" bigint NOT NULL,
    "sectionId" bigint
);


--
-- Name: TableSection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TableSection" (
    name text NOT NULL,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "branchId" bigint NOT NULL
);


--
-- Name: TableSection_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."TableSection_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TableSection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."TableSection_id_seq" OWNED BY public."TableSection".id;


--
-- Name: Table_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Table_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Table_id_seq" OWNED BY public."Table".id;


--
-- Name: TaxConfig; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TaxConfig" (
    name text NOT NULL,
    label text DEFAULT 'GST'::text NOT NULL,
    rate double precision DEFAULT 16.0 NOT NULL,
    mode text DEFAULT 'exclusive'::text NOT NULL,
    "appliesTo" text DEFAULT 'all'::text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    "paymentMethod" text DEFAULT 'all'::text NOT NULL,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL,
    "branchId" bigint
);


--
-- Name: TaxConfig_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."TaxConfig_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TaxConfig_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."TaxConfig_id_seq" OWNED BY public."TaxConfig".id;


--
-- Name: Terminal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Terminal" (
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    "lastSeenAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    id bigint NOT NULL,
    "branchId" bigint NOT NULL
);


--
-- Name: Terminal_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Terminal_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Terminal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Terminal_id_seq" OWNED BY public."Terminal".id;


--
-- Name: TillSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TillSession" (
    status text DEFAULT 'open'::text NOT NULL,
    "openedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "openedBy" text NOT NULL,
    "openedByName" text DEFAULT ''::text NOT NULL,
    "openingCashPaisa" integer DEFAULT 0 NOT NULL,
    "openingDenom" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "closedAt" timestamp(3) without time zone,
    "closedBy" text,
    "closingCashPaisa" integer,
    "closingDenom" jsonb,
    variance integer,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    synced boolean DEFAULT false NOT NULL,
    "syncedAt" timestamp(3) without time zone,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL,
    "cityId" bigint NOT NULL,
    "branchId" bigint NOT NULL,
    "terminalId" bigint NOT NULL
);


--
-- Name: TillSession_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."TillSession_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TillSession_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."TillSession_id_seq" OWNED BY public."TillSession".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    name text NOT NULL,
    email text,
    phone text,
    "passwordHash" text,
    "pinHash" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    "roleId" bigint,
    username text NOT NULL,
    id bigint NOT NULL,
    "orgId" bigint NOT NULL
);


--
-- Name: UserRoleAssignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserRoleAssignment" (
    "scopeType" text NOT NULL,
    "scopeId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text DEFAULT 'system'::text NOT NULL,
    "roleId" bigint NOT NULL,
    id bigint NOT NULL,
    "userId" bigint NOT NULL
);


--
-- Name: UserRoleAssignment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."UserRoleAssignment_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserRoleAssignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."UserRoleAssignment_id_seq" OWNED BY public."UserRoleAssignment".id;


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."User_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Area id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Area" ALTER COLUMN id SET DEFAULT nextval('public."Area_id_seq"'::regclass);


--
-- Name: Branch id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branch" ALTER COLUMN id SET DEFAULT nextval('public."Branch_id_seq"'::regclass);


--
-- Name: Brand id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Brand" ALTER COLUMN id SET DEFAULT nextval('public."Brand_id_seq"'::regclass);


--
-- Name: Campaign id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaign" ALTER COLUMN id SET DEFAULT nextval('public."Campaign_id_seq"'::regclass);


--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: City id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."City" ALTER COLUMN id SET DEFAULT nextval('public."City_id_seq"'::regclass);


--
-- Name: Customer id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer" ALTER COLUMN id SET DEFAULT nextval('public."Customer_id_seq"'::regclass);


--
-- Name: CustomerMessage id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CustomerMessage" ALTER COLUMN id SET DEFAULT nextval('public."CustomerMessage_id_seq"'::regclass);


--
-- Name: Deal id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deal" ALTER COLUMN id SET DEFAULT nextval('public."Deal_id_seq"'::regclass);


--
-- Name: DiscountPreset id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DiscountPreset" ALTER COLUMN id SET DEFAULT nextval('public."DiscountPreset_id_seq"'::regclass);


--
-- Name: FoodType id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FoodType" ALTER COLUMN id SET DEFAULT nextval('public."FoodType_id_seq"'::regclass);


--
-- Name: HeldOrder id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HeldOrder" ALTER COLUMN id SET DEFAULT nextval('public."HeldOrder_id_seq"'::regclass);


--
-- Name: Inventory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory" ALTER COLUMN id SET DEFAULT nextval('public."Inventory_id_seq"'::regclass);


--
-- Name: Invoice id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice" ALTER COLUMN id SET DEFAULT nextval('public."Invoice_id_seq"'::regclass);


--
-- Name: InvoiceItem id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InvoiceItem" ALTER COLUMN id SET DEFAULT nextval('public."InvoiceItem_id_seq"'::regclass);


--
-- Name: KitchenOrder id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."KitchenOrder" ALTER COLUMN id SET DEFAULT nextval('public."KitchenOrder_id_seq"'::regclass);


--
-- Name: KitchenOrderItem id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."KitchenOrderItem" ALTER COLUMN id SET DEFAULT nextval('public."KitchenOrderItem_id_seq"'::regclass);


--
-- Name: LoyaltyConfig id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyConfig" ALTER COLUMN id SET DEFAULT nextval('public."LoyaltyConfig_id_seq"'::regclass);


--
-- Name: LoyaltyTier id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyTier" ALTER COLUMN id SET DEFAULT nextval('public."LoyaltyTier_id_seq"'::regclass);


--
-- Name: LoyaltyTransaction id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyTransaction" ALTER COLUMN id SET DEFAULT nextval('public."LoyaltyTransaction_id_seq"'::regclass);


--
-- Name: MessageTemplate id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MessageTemplate" ALTER COLUMN id SET DEFAULT nextval('public."MessageTemplate_id_seq"'::regclass);


--
-- Name: OrgConfig id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrgConfig" ALTER COLUMN id SET DEFAULT nextval('public."OrgConfig_id_seq"'::regclass);


--
-- Name: OrgRolePermission id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrgRolePermission" ALTER COLUMN id SET DEFAULT nextval('public."OrgRolePermission_id_seq"'::regclass);


--
-- Name: Organisation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Organisation" ALTER COLUMN id SET DEFAULT nextval('public."Organisation_id_seq"'::regclass);


--
-- Name: OtpCode id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OtpCode" ALTER COLUMN id SET DEFAULT nextval('public."OtpCode_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: ProductBranchConfig id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductBranchConfig" ALTER COLUMN id SET DEFAULT nextval('public."ProductBranchConfig_id_seq"'::regclass);


--
-- Name: Reservation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation" ALTER COLUMN id SET DEFAULT nextval('public."Reservation_id_seq"'::regclass);


--
-- Name: Role id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role" ALTER COLUMN id SET DEFAULT nextval('public."Role_id_seq"'::regclass);


--
-- Name: State id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."State" ALTER COLUMN id SET DEFAULT nextval('public."State_id_seq"'::regclass);


--
-- Name: Table id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table" ALTER COLUMN id SET DEFAULT nextval('public."Table_id_seq"'::regclass);


--
-- Name: TableSection id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TableSection" ALTER COLUMN id SET DEFAULT nextval('public."TableSection_id_seq"'::regclass);


--
-- Name: TaxConfig id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaxConfig" ALTER COLUMN id SET DEFAULT nextval('public."TaxConfig_id_seq"'::regclass);


--
-- Name: Terminal id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Terminal" ALTER COLUMN id SET DEFAULT nextval('public."Terminal_id_seq"'::regclass);


--
-- Name: TillSession id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TillSession" ALTER COLUMN id SET DEFAULT nextval('public."TillSession_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: UserRoleAssignment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRoleAssignment" ALTER COLUMN id SET DEFAULT nextval('public."UserRoleAssignment_id_seq"'::regclass);


--
-- Data for Name: Area; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Area" (id, "cityId", "orgId", tag, name, details, latitude, longitude, "isActive", "createdAt", "updatedAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Branch" (name, phone, email, "managerId", "openTime", "closeTime", "isActive", "createdAt", "updatedAt", "createdBy", "addrLine1", "addrLine2", "addrCity", "addrState", "addrCountry", "addrPostCode", "addrLat", "addrLng", "addrArea", "areaId", "brandId", label, id, "orgId", "cityId", "taxConfigId") FROM stdin;
Clifton Branch, Karachi	+92-21-1234567	clifton@cripcrumbs.pk	\N	09:00	23:00	t	2026-04-02 22:01:19.547	2026-04-02 22:01:19.547	seed	123 Clifton Road	\N	Karachi	Sindh	PK	75600	24.8138	67.0298	Clifton	\N	1	KHI-001-CLI	1	1	1	\N
\.


--
-- Data for Name: Brand; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Brand" (id, "orgId", tag, name, logo, tagline, "primaryColor", "isActive", "createdAt", "updatedAt", "createdBy") FROM stdin;
1	1	CC	Crisp & Crumbs	\N	Crispy. Always.	#F97316	t	2026-04-02 22:01:19.537	2026-04-02 22:01:19.537	seed
\.


--
-- Data for Name: Campaign; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Campaign" (name, channel, template, "targetTier", "scheduledAt", "sentAt", status, "totalSent", "isActive", "createdAt", "updatedAt", "createdBy", id, "orgId") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, "orgId", "foodTypeId", name, tag, "sortOrder", "isActive", "createdAt", "updatedAt", "createdBy") FROM stdin;
1	1	1	Burgers	BRG	1	t	2026-04-02 22:01:20.027	2026-04-02 22:01:20.027	seed
2	1	1	Wraps	WRP	2	t	2026-04-02 22:01:20.029	2026-04-02 22:01:20.029	seed
3	1	1	Chicken	CHK	3	t	2026-04-02 22:01:20.03	2026-04-02 22:01:20.03	seed
4	1	1	Fries	FRI	4	t	2026-04-02 22:01:20.031	2026-04-02 22:01:20.031	seed
5	1	1	Drinks	DRK	5	t	2026-04-02 22:01:20.032	2026-04-02 22:01:20.032	seed
6	1	1	Desserts	DES	6	t	2026-04-02 22:01:20.033	2026-04-02 22:01:20.033	seed
7	1	1	Combos	CMB	7	t	2026-04-02 22:01:20.034	2026-04-02 22:01:20.034	seed
\.


--
-- Data for Name: City; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."City" (name, country, "isActive", "createdAt", "updatedAt", "createdBy", code, latitude, longitude, "stateId", id, "orgId") FROM stdin;
Karachi	PK	t	2026-04-02 22:01:19.545	2026-04-02 22:01:19.545	seed	KHI	\N	\N	4	1	1
\.


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Customer" (name, phone, email, "dateOfBirth", "phoneVerified", "marketingOptIn", "smsOptIn", "loyaltyPoints", "lifetimePoints", "tierId", "totalOrders", "totalSpentPaisa", "lastOrderAt", "lastBranchId", "isActive", "createdAt", "updatedAt", "createdBy", id, "orgId") FROM stdin;
\.


--
-- Data for Name: CustomerMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CustomerMessage" (channel, type, content, status, "sentAt", "deliveredAt", "isActive", "createdAt", "updatedAt", "createdBy", id, "customerId", "orgId") FROM stdin;
\.


--
-- Data for Name: Deal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Deal" (name, description, "isActive", "createdAt", "updatedAt", "createdBy", "basePricePaisa", "discountPercentage", "salePricePaisa", tag, id, "orgId") FROM stdin;
\.


--
-- Data for Name: DiscountPreset; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DiscountPreset" (name, type, value, level, reason, "requiresManagerPin", "maxValuePaisa", "sortOrder", "isActive", "createdAt", "updatedAt", "createdBy", id, "orgId") FROM stdin;
Staff Discount	percent	20	order	promotional	f	\N	1	t	2026-04-02 22:01:20.148	2026-04-02 22:01:20.148	seed	1	1
Loyalty Discount	percent	10	order	promotional	f	\N	2	t	2026-04-02 22:01:20.152	2026-04-02 22:01:20.152	seed	2	1
Manager Override	percent	50	order	promotional	t	\N	3	t	2026-04-02 22:01:20.154	2026-04-02 22:01:20.154	seed	3	1
Rs 50 Off	fixed	5000	order	promotional	f	\N	4	t	2026-04-02 22:01:20.167	2026-04-02 22:01:20.167	seed	4	1
Rs 100 Off	fixed	10000	order	promotional	f	\N	5	t	2026-04-02 22:01:20.169	2026-04-02 22:01:20.169	seed	5	1
\.


--
-- Data for Name: FoodType; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FoodType" (id, "orgId", name, slug, "sortOrder", "isActive", "createdAt", "updatedAt", "createdBy") FROM stdin;
1	1	Fast Food	FFD	1	t	2026-04-02 22:01:20.019	2026-04-02 22:01:20.019	seed
2	1	Chinese	CHN	2	t	2026-04-02 22:01:20.022	2026-04-02 22:01:20.022	seed
3	1	Western	WST	3	t	2026-04-02 22:01:20.024	2026-04-02 22:01:20.024	seed
4	1	Asian Continental	ASN	4	t	2026-04-02 22:01:20.025	2026-04-02 22:01:20.025	seed
\.


--
-- Data for Name: HeldOrder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."HeldOrder" (id, "orgId", "cityId", "branchId", "terminalId", "cashierId", label, "itemsJson", "activeCustomerJson", "orderType", "tableId", "tableName", covers, "customerId", "customerName", "customerPhone", "orderNotes", "heldAt", "isActive", "createdAt", "updatedAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: Inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Inventory" (quantity, "minThreshold", unit, "isActive", "createdAt", "updatedAt", "createdBy", id, "productId", "branchId") FROM stdin;
100	10	units	t	2026-04-02 22:01:20.041	2026-04-02 22:01:20.041	seed	1	1	1
100	10	units	t	2026-04-02 22:01:20.05	2026-04-02 22:01:20.05	seed	2	2	1
100	10	units	t	2026-04-02 22:01:20.053	2026-04-02 22:01:20.053	seed	3	3	1
100	10	units	t	2026-04-02 22:01:20.056	2026-04-02 22:01:20.056	seed	4	4	1
100	10	units	t	2026-04-02 22:01:20.058	2026-04-02 22:01:20.058	seed	5	5	1
100	10	units	t	2026-04-02 22:01:20.066	2026-04-02 22:01:20.066	seed	6	6	1
100	10	units	t	2026-04-02 22:01:20.09	2026-04-02 22:01:20.09	seed	7	7	1
100	10	units	t	2026-04-02 22:01:20.093	2026-04-02 22:01:20.093	seed	8	8	1
100	10	units	t	2026-04-02 22:01:20.095	2026-04-02 22:01:20.095	seed	9	9	1
100	10	units	t	2026-04-02 22:01:20.098	2026-04-02 22:01:20.098	seed	10	10	1
100	10	units	t	2026-04-02 22:01:20.1	2026-04-02 22:01:20.1	seed	11	11	1
100	10	units	t	2026-04-02 22:01:20.102	2026-04-02 22:01:20.102	seed	12	12	1
100	10	units	t	2026-04-02 22:01:20.105	2026-04-02 22:01:20.105	seed	13	13	1
100	10	units	t	2026-04-02 22:01:20.107	2026-04-02 22:01:20.107	seed	14	14	1
100	10	units	t	2026-04-02 22:01:20.11	2026-04-02 22:01:20.11	seed	15	15	1
100	10	units	t	2026-04-02 22:01:20.112	2026-04-02 22:01:20.112	seed	16	16	1
100	10	units	t	2026-04-02 22:01:20.118	2026-04-02 22:01:20.118	seed	17	17	1
100	10	units	t	2026-04-02 22:01:20.122	2026-04-02 22:01:20.122	seed	18	18	1
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Invoice" ("cashierId", "tableName", covers, "orderType", date, "orderNotes", "customerId", "customerName", "customerPhone", "loyaltyPointsEarned", "loyaltyPointsRedeemed", "subtotalPaisa", "lineDiscountPaisa", "orderDiscountPaisa", "totalDiscountPaisa", "taxablePaisa", "taxRate", "taxPaisa", "grandTotalPaisa", "roundingPaisa", "discountsJson", "paymentMethod", "paymentStatus", "paidAt", "allocationsJson", "voidReason", "voidedBy", "isActive", "createdAt", "updatedAt", "createdBy", synced, "syncedAt", id, "orgId", "cityId", "branchId", "terminalId", "tillSessionId", "tableId") FROM stdin;
1	\N	\N	dine-in	2026-04-03 07:50:30.853	\N	\N	\N	\N	0	0	4798	0	0	0	4798	17	816	5614	0	"[]"	cash	paid	2026-04-03 07:50:30.852	"[]"	\N	\N	t	2026-04-03 07:50:30.853	2026-04-03 07:50:30.853	1	f	\N	1	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-03 07:52:29.747	\N	\N	\N	\N	0	0	2798	0	0	0	2798	17	476	3274	0	"[]"	cash	paid	2026-04-03 07:52:29.746	"[]"	\N	\N	t	2026-04-03 07:52:29.747	2026-04-03 07:52:29.747	1	f	\N	2	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-03 08:56:48.476	\N	\N	\N	\N	0	0	2798	0	0	0	2798	17	476	3274	0	"[]"	cash	paid	2026-04-03 08:56:48.475	"[]"	\N	\N	t	2026-04-03 08:56:48.476	2026-04-03 08:56:48.476	1	f	\N	3	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-03 08:57:06.937	\N	\N	\N	\N	0	0	849	0	0	0	849	17	144	993	0	"[]"	cash	paid	2026-04-03 08:57:06.936	"[]"	\N	\N	t	2026-04-03 08:57:06.937	2026-04-03 08:57:06.937	1	f	\N	4	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-03 08:57:12.824	\N	\N	\N	\N	0	0	5447	0	0	0	5447	17	926	6373	0	"[]"	cash	paid	2026-04-03 08:57:12.823	"[]"	\N	\N	t	2026-04-03 08:57:12.824	2026-04-03 08:57:12.824	1	f	\N	5	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-03 08:57:18.636	\N	\N	\N	\N	0	0	4998	0	0	0	4998	17	850	5848	0	"[]"	cash	paid	2026-04-03 08:57:18.635	"[]"	\N	\N	t	2026-04-03 08:57:18.636	2026-04-03 08:57:18.636	1	f	\N	6	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-03 08:57:24.535	\N	\N	\N	\N	0	0	299	0	0	0	299	17	51	350	0	"[]"	cash	paid	2026-04-03 08:57:24.534	"[]"	\N	\N	t	2026-04-03 08:57:24.535	2026-04-03 08:57:24.535	1	f	\N	7	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-03 08:57:30.739	\N	\N	\N	\N	0	0	249	0	0	0	249	17	42	291	0	"[]"	cash	paid	2026-04-03 08:57:30.738	"[]"	\N	\N	t	2026-04-03 08:57:30.739	2026-04-03 08:57:30.739	1	f	\N	8	1	1	1	1	1	\N
1	\N	\N	delivery	2026-04-03 08:59:40.099	\N	\N	\N	\N	0	0	448	0	0	0	448	17	76	524	0	"[]"	cash	paid	2026-04-03 08:59:40.098	"[]"	\N	\N	t	2026-04-03 08:59:40.099	2026-04-03 08:59:40.099	1	f	\N	9	1	1	1	1	1	\N
1	\N	\N	delivery	2026-04-03 08:59:45.976	\N	\N	\N	\N	0	0	229	0	0	0	229	17	39	268	0	"[]"	cash	paid	2026-04-03 08:59:45.975	"[]"	\N	\N	t	2026-04-03 08:59:45.976	2026-04-03 08:59:45.976	1	f	\N	10	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-03 09:03:51.447	\N	\N	\N	\N	0	0	999	0	0	0	999	17	170	1169	0	"[]"	cash	paid	2026-04-03 09:03:51.446	"[]"	\N	\N	t	2026-04-03 09:03:51.447	2026-04-03 09:03:51.447	1	f	\N	11	1	1	1	1	1	\N
1	\N	\N	delivery	2026-04-03 09:12:28.832	\N	\N	\N	\N	0	0	1499	0	0	0	1499	17	255	1754	0	"[]"	card-on-delivery	paid	2026-04-03 09:12:28.831	"[]"	\N	\N	t	2026-04-03 09:12:28.832	2026-04-03 09:12:28.832	1	f	\N	12	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-03 09:20:09.387	\N	\N	\N	\N	0	0	13888	0	0	0	13888	17	2361	16249	0	"[]"	cash	paid	2026-04-03 09:20:09.387	"[]"	\N	\N	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	f	\N	13	1	1	1	1	1	\N
1	\N	\N	takeaway	2026-04-03 12:12:20.823	\N	\N	\N	\N	0	0	4896	0	0	0	4896	17	832	5728	0	"[]"	cash	paid	2026-04-03 12:12:20.821	"[]"	\N	\N	t	2026-04-03 12:12:20.823	2026-04-03 12:12:20.823	1	f	\N	14	1	1	1	1	1	\N
1	\N	\N	takeaway	2026-04-03 12:12:32.766	\N	\N	\N	\N	0	0	999	0	0	0	999	17	170	1169	0	"[]"	cash	paid	2026-04-03 12:12:32.765	"[]"	\N	\N	t	2026-04-03 12:12:32.766	2026-04-03 12:12:32.766	1	f	\N	15	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-03 12:48:27.585	\N	\N	\N	\N	0	0	1948	0	0	0	1948	17	331	2279	0	"[]"	cash	paid	2026-04-03 12:48:27.583	"[]"	\N	\N	t	2026-04-03 12:48:27.585	2026-04-03 12:48:27.585	1	f	\N	16	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-06 05:59:56.628	\N	\N	\N	\N	0	0	5995	0	0	0	5995	17	1019	7014	0	"[]"	cash	paid	2026-04-06 05:59:56.626	"[]"	\N	\N	t	2026-04-06 05:59:56.628	2026-04-06 05:59:56.628	1	f	\N	17	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-06 06:00:39.542	\N	\N	\N	\N	0	0	3347	0	0	0	3347	17	569	3916	0	"[]"	cash	paid	2026-04-06 06:00:39.541	"[]"	\N	\N	t	2026-04-06 06:00:39.542	2026-04-06 06:00:39.542	1	f	\N	18	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-06 06:04:55.386	\N	\N	\N	\N	0	0	5897	0	0	0	5897	17	1002	6899	0	"[]"	cash	paid	2026-04-06 06:04:55.385	"[]"	\N	\N	t	2026-04-06 06:04:55.386	2026-04-06 06:04:55.386	1	f	\N	19	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-18 17:47:58.892	\N	\N	\N	\N	0	0	2798	0	0	0	2798	17	476	3274	0	"[]"	cash	paid	2026-04-18 17:47:58.89	"[]"	\N	\N	t	2026-04-18 17:47:58.892	2026-04-18 17:47:58.892	1	f	\N	20	1	1	1	1	1	\N
1	\N	\N	dine-in	2026-04-18 17:48:29.239	\N	\N	\N	\N	0	0	849	0	0	0	849	17	144	993	0	"[]"	cash	paid	2026-04-18 17:48:29.238	"[]"	\N	\N	t	2026-04-18 17:48:29.239	2026-04-18 17:48:29.239	1	f	\N	21	1	1	1	1	1	\N
\.


--
-- Data for Name: InvoiceItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InvoiceItem" ("productName", "productCode", category, "unitPricePaisa", quantity, "discountPercent", "lumpDiscountPaisa", "lineTotalPaisa", "isDeal", "isActive", "createdAt", "updatedAt", "createdBy", id, "invoiceId", "productId", "dealId") FROM stdin;
Family Pack	DEAL-005	deals	3499	1	0	0	3499	f	t	2026-04-03 07:50:30.853	2026-04-03 07:50:30.853	1	1	1	\N	\N
Chicken Feast	DEAL-003	deals	1299	1	0	0	1299	f	t	2026-04-03 07:50:30.853	2026-04-03 07:50:30.853	1	2	1	\N	\N
Chicken Feast	DEAL-003	deals	1299	1	0	0	1299	f	t	2026-04-03 07:52:29.747	2026-04-03 07:52:29.747	1	3	2	\N	\N
Double Trouble	DEAL-002	deals	1499	1	0	0	1499	f	t	2026-04-03 07:52:29.747	2026-04-03 07:52:29.747	1	4	2	\N	\N
Chicken Feast	DEAL-003	deals	1299	1	0	0	1299	f	t	2026-04-03 08:56:48.476	2026-04-03 08:56:48.476	1	5	3	\N	\N
Double Trouble	DEAL-002	deals	1499	1	0	0	1499	f	t	2026-04-03 08:56:48.476	2026-04-03 08:56:48.476	1	6	3	\N	\N
Veggie Burger	BRG-004	burgers	849	1	0	0	849	f	t	2026-04-03 08:57:06.937	2026-04-03 08:57:06.937	1	7	4	\N	\N
Veggie Burger	BRG-004	burgers	849	1	0	0	849	f	t	2026-04-03 08:57:12.824	2026-04-03 08:57:12.824	1	8	5	\N	\N
Family Pack	DEAL-005	deals	3499	1	0	0	3499	f	t	2026-04-03 08:57:12.824	2026-04-03 08:57:12.824	1	9	5	\N	\N
Wrap & Go	DEAL-004	deals	1099	1	0	0	1099	f	t	2026-04-03 08:57:12.824	2026-04-03 08:57:12.824	1	10	5	\N	\N
Double Trouble	DEAL-002	deals	1499	1	0	0	1499	f	t	2026-04-03 08:57:18.636	2026-04-03 08:57:18.636	1	11	6	\N	\N
Family Pack	DEAL-005	deals	3499	1	0	0	3499	f	t	2026-04-03 08:57:18.636	2026-04-03 08:57:18.636	1	12	6	\N	\N
Regular Fries	FRS-001	fries	299	1	0	0	299	f	t	2026-04-03 08:57:24.535	2026-04-03 08:57:24.535	1	13	7	\N	\N
Lemonade	DRK-005	drinks	249	1	0	0	249	f	t	2026-04-03 08:57:30.739	2026-04-03 08:57:30.739	1	14	8	\N	\N
Soft Drink (Large)	DRK-002	drinks	249	1	0	0	249	f	t	2026-04-03 08:59:40.099	2026-04-03 08:59:40.099	1	15	9	\N	\N
Soft Drink (Reg)	DRK-001	drinks	199	1	0	0	199	f	t	2026-04-03 08:59:40.099	2026-04-03 08:59:40.099	1	16	9	\N	\N
Iced Tea	DRK-004	drinks	229	1	0	0	229	f	t	2026-04-03 08:59:45.976	2026-04-03 08:59:45.976	1	17	10	\N	\N
Classic Combo	DEAL-001	deals	999	1	0	0	999	f	t	2026-04-03 09:03:51.447	2026-04-03 09:03:51.447	1	18	11	\N	\N
Double Trouble	DEAL-002	deals	1499	1	0	0	1499	f	t	2026-04-03 09:12:28.832	2026-04-03 09:12:28.832	1	19	12	\N	\N
Classic Combo	DEAL-001	deals	999	1	0	0	999	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	20	13	\N	\N
Classic Cheeseburger	BRG-001	burgers	799	1	0	0	799	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	21	13	\N	\N
BBQ Ranch Wrap	WRP-003	wraps	849	1	0	0	849	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	22	13	\N	\N
3pc Crispy Tenders	CHK-001	chicken	699	1	0	0	699	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	23	13	\N	\N
5pc Crispy Tenders	CHK-002	chicken	999	1	0	0	999	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	24	13	\N	\N
Veggie Burger	BRG-004	burgers	849	1	0	0	849	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	25	13	\N	\N
Wrap & Go	DEAL-004	deals	1099	1	0	0	1099	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	26	13	\N	\N
Family Pack	DEAL-005	deals	3499	1	0	0	3499	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	27	13	\N	\N
Spicy Buffalo Wrap	WRP-002	wraps	899	1	0	0	899	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	28	13	\N	\N
Chicken Caesar Wrap	WRP-001	wraps	849	1	0	0	849	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	29	13	\N	\N
Chicken Wings (6pc)	CHK-003	chicken	849	1	0	0	849	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	30	13	\N	\N
Chicken Wings (12pc)	CHK-004	chicken	1499	1	0	0	1499	f	t	2026-04-03 09:20:09.387	2026-04-03 09:20:09.387	1	31	13	\N	\N
Classic Combo	DEAL-001	deals	999	1	0	0	999	f	t	2026-04-03 12:12:20.823	2026-04-03 12:12:20.823	1	32	14	\N	\N
Double Trouble	DEAL-002	deals	1499	1	0	0	1499	f	t	2026-04-03 12:12:20.823	2026-04-03 12:12:20.823	1	33	14	\N	\N
Chicken Feast	DEAL-003	deals	1299	1	0	0	1299	f	t	2026-04-03 12:12:20.823	2026-04-03 12:12:20.823	1	34	14	\N	\N
Wrap & Go	DEAL-004	deals	1099	1	0	0	1099	f	t	2026-04-03 12:12:20.823	2026-04-03 12:12:20.823	1	35	14	\N	\N
5pc Crispy Tenders	CHK-002	chicken	999	1	0	0	999	f	t	2026-04-03 12:12:32.766	2026-04-03 12:12:32.766	1	36	15	\N	\N
Wrap & Go	DEAL-004	deals	1099	1	0	0	1099	f	t	2026-04-03 12:48:27.585	2026-04-03 12:48:27.585	1	37	16	\N	\N
Chicken Caesar Wrap	WRP-001	wraps	849	1	0	0	849	f	t	2026-04-03 12:48:27.585	2026-04-03 12:48:27.585	1	38	16	\N	\N
Double Trouble	DEAL-002	deals	1499	1	0	0	1499	f	t	2026-04-06 05:59:56.628	2026-04-06 05:59:56.628	1	39	17	\N	\N
Chicken Feast	DEAL-003	deals	1299	1	0	0	1299	f	t	2026-04-06 05:59:56.628	2026-04-06 05:59:56.628	1	40	17	\N	\N
Double Trouble	DEAL-002	deals	1499	1	0	0	1499	f	t	2026-04-06 05:59:56.628	2026-04-06 05:59:56.628	1	41	17	\N	\N
Veggie Burger	BRG-004	burgers	849	1	0	0	849	f	t	2026-04-06 05:59:56.628	2026-04-06 05:59:56.628	1	42	17	\N	\N
Chicken Caesar Wrap	WRP-001	wraps	849	1	0	0	849	f	t	2026-04-06 05:59:56.628	2026-04-06 05:59:56.628	1	43	17	\N	\N
5pc Crispy Tenders	CHK-002	chicken	999	1	0	0	999	f	t	2026-04-06 06:00:39.542	2026-04-06 06:00:39.542	1	44	18	\N	\N
Chicken Wings (6pc)	CHK-003	chicken	849	1	0	0	849	f	t	2026-04-06 06:00:39.542	2026-04-06 06:00:39.542	1	45	18	\N	\N
Chicken Wings (12pc)	CHK-004	chicken	1499	1	0	0	1499	f	t	2026-04-06 06:00:39.542	2026-04-06 06:00:39.542	1	46	18	\N	\N
Family Pack	DEAL-005	deals	3499	1	0	0	3499	f	t	2026-04-06 06:04:55.386	2026-04-06 06:04:55.386	1	47	19	\N	\N
Spicy Buffalo Wrap	WRP-002	wraps	899	1	0	0	899	f	t	2026-04-06 06:04:55.386	2026-04-06 06:04:55.386	1	48	19	\N	\N
Chicken Wings (12pc)	CHK-004	chicken	1499	1	0	0	1499	f	t	2026-04-06 06:04:55.386	2026-04-06 06:04:55.386	1	49	19	\N	\N
Double Trouble	DEAL-002	deals	1499	1	0	0	1499	f	t	2026-04-18 17:47:58.892	2026-04-18 17:47:58.892	1	50	20	\N	\N
Chicken Feast	DEAL-003	deals	1299	1	0	0	1299	f	t	2026-04-18 17:47:58.892	2026-04-18 17:47:58.892	1	51	20	\N	\N
Veggie Burger	BRG-004	burgers	849	1	0	0	849	f	t	2026-04-18 17:48:29.239	2026-04-18 17:48:29.239	1	52	21	\N	\N
\.


--
-- Data for Name: KitchenOrder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."KitchenOrder" (id, "invoiceId", "orgId", "branchId", "terminalId", "orderNumber", "orderType", "tableId", "tableName", covers, "cashierName", notes, status, priority, "placedAt", "acknowledgedAt", "startedAt", "readyAt", "servedAt", "isActive", "createdAt", "updatedAt") FROM stdin;
1	1	1	1	1	#001	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-03 07:50:30.874	2026-04-03 07:50:42.278	2026-04-03 07:51:58.259	2026-04-03 07:52:03.372	2026-04-03 07:52:07.098	t	2026-04-03 07:50:30.875	2026-04-03 07:52:07.099
15	15	1	1	1	#015	takeaway	\N	\N	\N	1	\N	served	normal	2026-04-03 12:12:32.769	2026-04-03 12:49:37.819	2026-04-03 12:49:38.69	2026-04-06 05:59:43.861	2026-04-06 05:59:46.363	t	2026-04-03 12:12:32.77	2026-04-06 05:59:46.365
2	2	1	1	1	#002	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-03 07:52:29.751	2026-04-03 07:52:33.575	2026-04-03 07:52:37.025	2026-04-03 07:52:39.665	2026-04-03 07:52:41.441	t	2026-04-03 07:52:29.751	2026-04-03 07:52:41.442
16	16	1	1	1	#016	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-03 12:48:27.615	2026-04-06 05:59:40.903	2026-04-06 05:59:41.666	2026-04-06 05:59:44.964	2026-04-06 05:59:47.543	t	2026-04-03 12:48:27.618	2026-04-06 05:59:47.544
17	17	1	1	1	#017	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-06 05:59:56.658	2026-04-06 06:00:47.515	2026-04-06 06:00:48.98	2026-04-06 06:01:05.201	2026-04-06 06:01:43.808	t	2026-04-06 05:59:56.659	2026-04-06 06:01:43.809
18	18	1	1	1	#018	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-06 06:00:39.56	2026-04-06 06:00:59.532	2026-04-06 06:01:00.248	2026-04-06 06:01:42.578	2026-04-06 06:01:49.843	t	2026-04-06 06:00:39.562	2026-04-06 06:01:49.845
4	4	1	1	1	#004	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-03 08:57:06.941	2026-04-03 08:57:50.509	2026-04-03 08:57:50.811	2026-04-03 08:58:03.641	2026-04-03 08:58:10.062	t	2026-04-03 08:57:06.941	2026-04-03 08:58:10.062
3	3	1	1	1	#003	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-03 08:56:48.495	2026-04-03 08:57:46.112	2026-04-03 08:57:47.124	2026-04-03 08:58:05.995	2026-04-03 08:58:11.311	t	2026-04-03 08:56:48.496	2026-04-03 08:58:11.312
19	19	1	1	1	#019	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-06 06:04:55.4	2026-04-06 06:05:00.868	2026-04-06 06:05:02.297	2026-04-06 06:05:03.551	2026-04-06 06:05:05.153	t	2026-04-06 06:04:55.401	2026-04-06 06:05:05.155
5	5	1	1	1	#005	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-03 08:57:12.839	2026-04-03 08:57:48.509	2026-04-03 08:57:48.792	2026-04-03 08:58:07.241	2026-04-03 08:58:17.065	t	2026-04-03 08:57:12.84	2026-04-03 08:58:17.066
7	7	1	1	1	#007	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-03 08:57:24.539	2026-04-03 08:58:13.011	2026-04-03 08:58:13.726	2026-04-03 08:58:14.793	2026-04-03 08:58:19.026	t	2026-04-03 08:57:24.54	2026-04-03 08:58:19.027
20	20	1	1	1	#020	dine-in	\N	\N	\N	1	\N	ready	normal	2026-04-18 17:47:58.932	2026-04-18 17:48:32.459	2026-04-18 17:48:33.915	2026-04-18 17:48:39.449	\N	t	2026-04-18 17:47:58.933	2026-04-18 17:48:39.451
21	21	1	1	1	#021	dine-in	\N	\N	\N	1	\N	ready	normal	2026-04-18 17:48:29.247	2026-04-18 17:48:35.568	2026-04-18 17:48:36.399	2026-04-18 17:48:41.133	\N	t	2026-04-18 17:48:29.248	2026-04-18 17:48:41.135
10	10	1	1	1	#010	delivery	\N	\N	\N	1	\N	served	normal	2026-04-03 08:59:45.978	2026-04-03 09:00:03.694	2026-04-03 09:00:04.31	2026-04-03 09:00:50.446	2026-04-03 09:00:56.244	t	2026-04-03 08:59:45.979	2026-04-03 09:00:56.245
9	9	1	1	1	#009	delivery	\N	\N	\N	1	\N	served	normal	2026-04-03 08:59:40.102	2026-04-03 09:01:01.693	2026-04-03 09:01:02.611	2026-04-03 09:01:03.794	2026-04-03 09:01:05.494	t	2026-04-03 08:59:40.103	2026-04-03 09:01:05.495
6	6	1	1	1	#006	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-03 08:57:18.649	2026-04-03 09:01:19.86	2026-04-03 09:01:21.23	2026-04-03 09:01:22.708	2026-04-03 09:01:24.726	t	2026-04-03 08:57:18.65	2026-04-03 09:01:24.727
8	8	1	1	1	#008	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-03 08:57:30.741	2026-04-03 09:00:01.093	2026-04-03 09:00:01.977	2026-04-03 09:01:26.112	2026-04-03 09:01:27.443	t	2026-04-03 08:57:30.742	2026-04-03 09:01:27.444
11	11	1	1	1	#011	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-03 09:03:51.456	2026-04-03 09:03:58.178	2026-04-03 09:03:59.35	2026-04-03 09:04:05.31	2026-04-03 09:04:11.212	t	2026-04-03 09:03:51.456	2026-04-03 09:04:11.213
12	12	1	1	1	#012	delivery	\N	\N	\N	1	\N	served	normal	2026-04-03 09:12:28.858	2026-04-03 09:15:47.533	2026-04-03 09:15:48.559	2026-04-03 09:15:57.19	2026-04-03 09:16:58.188	t	2026-04-03 09:12:28.859	2026-04-03 09:16:58.192
13	13	1	1	1	#013	dine-in	\N	\N	\N	1	\N	served	normal	2026-04-03 09:20:09.417	2026-04-03 09:29:02.235	2026-04-03 09:29:03.089	2026-04-03 09:29:04.691	2026-04-03 09:29:08.308	t	2026-04-03 09:20:09.417	2026-04-03 09:29:08.309
14	14	1	1	1	#014	takeaway	\N	\N	\N	1	\N	served	normal	2026-04-03 12:12:20.843	2026-04-03 12:12:49.472	2026-04-03 12:12:52.117	2026-04-03 12:12:59.466	2026-04-03 12:13:06.4	t	2026-04-03 12:12:20.844	2026-04-03 12:13:06.402
\.


--
-- Data for Name: KitchenOrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."KitchenOrderItem" (id, "kitchenOrderId", "productId", "productName", quantity, notes, status, "isActive", "createdAt", "updatedAt") FROM stdin;
1	1	\N	Family Pack	1	\N	pending	t	2026-04-03 07:50:30.875	2026-04-03 07:50:30.875
2	1	\N	Chicken Feast	1	\N	pending	t	2026-04-03 07:50:30.875	2026-04-03 07:50:30.875
3	2	\N	Chicken Feast	1	\N	pending	t	2026-04-03 07:52:29.751	2026-04-03 07:52:29.751
4	2	\N	Double Trouble	1	\N	pending	t	2026-04-03 07:52:29.751	2026-04-03 07:52:29.751
5	3	\N	Chicken Feast	1	\N	pending	t	2026-04-03 08:56:48.496	2026-04-03 08:56:48.496
6	3	\N	Double Trouble	1	\N	pending	t	2026-04-03 08:56:48.496	2026-04-03 08:56:48.496
7	4	\N	Veggie Burger	1	\N	pending	t	2026-04-03 08:57:06.941	2026-04-03 08:57:06.941
8	5	\N	Veggie Burger	1	\N	pending	t	2026-04-03 08:57:12.84	2026-04-03 08:57:12.84
9	5	\N	Family Pack	1	\N	pending	t	2026-04-03 08:57:12.84	2026-04-03 08:57:12.84
10	5	\N	Wrap & Go	1	\N	pending	t	2026-04-03 08:57:12.84	2026-04-03 08:57:12.84
11	6	\N	Double Trouble	1	\N	pending	t	2026-04-03 08:57:18.65	2026-04-03 08:57:18.65
12	6	\N	Family Pack	1	\N	pending	t	2026-04-03 08:57:18.65	2026-04-03 08:57:18.65
13	7	\N	Regular Fries	1	\N	pending	t	2026-04-03 08:57:24.54	2026-04-03 08:57:24.54
14	8	\N	Lemonade	1	\N	pending	t	2026-04-03 08:57:30.742	2026-04-03 08:57:30.742
15	9	\N	Soft Drink (Large)	1	\N	pending	t	2026-04-03 08:59:40.103	2026-04-03 08:59:40.103
16	9	\N	Soft Drink (Reg)	1	\N	pending	t	2026-04-03 08:59:40.103	2026-04-03 08:59:40.103
17	10	\N	Iced Tea	1	\N	pending	t	2026-04-03 08:59:45.979	2026-04-03 08:59:45.979
18	11	\N	Classic Combo	1	\N	pending	t	2026-04-03 09:03:51.456	2026-04-03 09:03:51.456
19	12	\N	Double Trouble	1	\N	pending	t	2026-04-03 09:12:28.859	2026-04-03 09:12:28.859
20	13	\N	Classic Combo	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
21	13	\N	Classic Cheeseburger	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
22	13	\N	BBQ Ranch Wrap	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
23	13	\N	3pc Crispy Tenders	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
24	13	\N	5pc Crispy Tenders	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
25	13	\N	Veggie Burger	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
26	13	\N	Wrap & Go	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
27	13	\N	Family Pack	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
28	13	\N	Spicy Buffalo Wrap	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
29	13	\N	Chicken Caesar Wrap	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
30	13	\N	Chicken Wings (6pc)	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
31	13	\N	Chicken Wings (12pc)	1	\N	pending	t	2026-04-03 09:20:09.417	2026-04-03 09:20:09.417
32	14	\N	Classic Combo	1	\N	pending	t	2026-04-03 12:12:20.844	2026-04-03 12:12:20.844
33	14	\N	Double Trouble	1	\N	pending	t	2026-04-03 12:12:20.844	2026-04-03 12:12:20.844
34	14	\N	Chicken Feast	1	\N	pending	t	2026-04-03 12:12:20.844	2026-04-03 12:12:20.844
35	14	\N	Wrap & Go	1	\N	pending	t	2026-04-03 12:12:20.844	2026-04-03 12:12:20.844
36	15	\N	5pc Crispy Tenders	1	\N	pending	t	2026-04-03 12:12:32.77	2026-04-03 12:12:32.77
37	16	\N	Wrap & Go	1	\N	pending	t	2026-04-03 12:48:27.618	2026-04-03 12:48:27.618
38	16	\N	Chicken Caesar Wrap	1	\N	pending	t	2026-04-03 12:48:27.618	2026-04-03 12:48:27.618
39	17	\N	Double Trouble	1	\N	pending	t	2026-04-06 05:59:56.659	2026-04-06 05:59:56.659
40	17	\N	Chicken Feast	1	\N	pending	t	2026-04-06 05:59:56.659	2026-04-06 05:59:56.659
41	17	\N	Double Trouble	1	\N	pending	t	2026-04-06 05:59:56.659	2026-04-06 05:59:56.659
42	17	\N	Veggie Burger	1	\N	pending	t	2026-04-06 05:59:56.659	2026-04-06 05:59:56.659
43	17	\N	Chicken Caesar Wrap	1	\N	pending	t	2026-04-06 05:59:56.659	2026-04-06 05:59:56.659
44	18	\N	5pc Crispy Tenders	1	\N	pending	t	2026-04-06 06:00:39.562	2026-04-06 06:00:39.562
45	18	\N	Chicken Wings (6pc)	1	\N	pending	t	2026-04-06 06:00:39.562	2026-04-06 06:00:39.562
46	18	\N	Chicken Wings (12pc)	1	\N	pending	t	2026-04-06 06:00:39.562	2026-04-06 06:00:39.562
47	19	\N	Family Pack	1	\N	pending	t	2026-04-06 06:04:55.401	2026-04-06 06:04:55.401
48	19	\N	Spicy Buffalo Wrap	1	\N	pending	t	2026-04-06 06:04:55.401	2026-04-06 06:04:55.401
49	19	\N	Chicken Wings (12pc)	1	\N	pending	t	2026-04-06 06:04:55.401	2026-04-06 06:04:55.401
50	20	\N	Double Trouble	1	\N	pending	t	2026-04-18 17:47:58.933	2026-04-18 17:47:58.933
51	20	\N	Chicken Feast	1	\N	pending	t	2026-04-18 17:47:58.933	2026-04-18 17:47:58.933
52	21	\N	Veggie Burger	1	\N	pending	t	2026-04-18 17:48:29.248	2026-04-18 17:48:29.248
\.


--
-- Data for Name: LoyaltyConfig; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoyaltyConfig" ("isEnabled", "earnRatePaisa", "pointValuePaisa", "minPointsRedeem", "maxRedeemPct", "pointsExpireDays", "tiersEnabled", "isActive", "createdAt", "updatedAt", "createdBy", id, "orgId") FROM stdin;
\.


--
-- Data for Name: LoyaltyTier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoyaltyTier" (name, "minPoints", color, icon, "earnMultiplier", "discountPct", "isActive", "createdAt", "updatedAt", "createdBy", id, "configId") FROM stdin;
\.


--
-- Data for Name: LoyaltyTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoyaltyTransaction" (type, points, balance, description, "approvedBy", "isActive", "createdAt", "updatedAt", "createdBy", id, "customerId", "orgId", "branchId", "invoiceId") FROM stdin;
\.


--
-- Data for Name: MessageTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MessageTemplate" (type, channel, subject, body, "isActive", "createdAt", "updatedAt", "createdBy", id, "orgId") FROM stdin;
\.


--
-- Data for Name: OrgConfig; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrgConfig" ("currencyCode", "currencySymbol", "symbolPosition", "decimalPlaces", "thousandSep", "decimalSep", locale, timezone, "dateFormat", "timeFormat", country, "phoneCountryCode", "receiptHeader", "receiptFooter", "showLoyaltyOnReceipt", "taxRegLabel", "taxRegNumber", "businessEmail", "businessPhone", "isActive", "createdAt", "updatedAt", "createdBy", "businessName", "defaultBranchId", "logoUrl", id, "orgId") FROM stdin;
PKR	Rs	before	0	,	.	en-PK	Asia/Karachi	DD/MM/YYYY	24h	PK	+92	Crip Crumbs\n123 Main Street, Karachi	Thank you for dining with us!	t	NTN				t	2026-04-02 22:01:19.534	2026-04-02 22:01:19.534	seed		\N		1	1
\.


--
-- Data for Name: OrgRolePermission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrgRolePermission" (id, "orgId", "roleId", permission, granted, "isActive", "createdAt", "updatedAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: Organisation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Organisation" (name, slug, logo, website, email, phone, "isActive", "createdAt", "updatedAt", "createdBy", "addrLine1", "addrLine2", "addrCity", "addrState", "addrCountry", "addrPostCode", id) FROM stdin;
Crip Crumbs	crip-crumbs	\N	\N	info@cripcrumbs.pk	+92-21-1234567	t	2026-04-02 22:01:19.525	2026-04-02 22:01:19.525	seed	123 Main Street	\N	Karachi	Sindh	PK	75600	1
\.


--
-- Data for Name: OtpCode; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OtpCode" (phone, code, purpose, "expiresAt", "usedAt", "isActive", "createdAt", "updatedAt", "createdBy", id, "userId") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Product" (name, sku, "basePricePaisa", "salePricePaisa", "imageUrl", description, "isFeatured", "sortOrder", "isActive", "createdAt", "updatedAt", "createdBy", "categoryId", id, "orgId") FROM stdin;
Classic Beef Burger	BRG-0001	65000	\N			f	1	t	2026-04-02 22:01:20.035	2026-04-02 22:01:20.035	seed	1	1	1
Double Stack Burger	BRG-0002	85000	\N			f	2	t	2026-04-02 22:01:20.048	2026-04-02 22:01:20.048	seed	1	2	1
Crispy Chicken Burger	BRG-0003	70000	\N			f	3	t	2026-04-02 22:01:20.051	2026-04-02 22:01:20.051	seed	1	3	1
BBQ Bacon Burger	BRG-0004	95000	\N			f	4	t	2026-04-02 22:01:20.054	2026-04-02 22:01:20.054	seed	1	4	1
Chicken Wrap	WRP-0001	55000	\N			f	5	t	2026-04-02 22:01:20.057	2026-04-02 22:01:20.057	seed	2	5	1
Beef Wrap	WRP-0002	60000	\N			f	6	t	2026-04-02 22:01:20.06	2026-04-02 22:01:20.06	seed	2	6	1
Zinger Wrap	WRP-0003	65000	\N			f	7	t	2026-04-02 22:01:20.089	2026-04-02 22:01:20.089	seed	2	7	1
Crispy Tenders (4 pcs)	CHK-0001	50000	\N			f	8	t	2026-04-02 22:01:20.092	2026-04-02 22:01:20.092	seed	3	8	1
Crispy Tenders (8 pcs)	CHK-0002	95000	\N			f	9	t	2026-04-02 22:01:20.094	2026-04-02 22:01:20.094	seed	3	9	1
Popcorn Chicken	CHK-0003	40000	\N			f	10	t	2026-04-02 22:01:20.096	2026-04-02 22:01:20.096	seed	3	10	1
Regular Fries	FRI-0001	25000	\N			f	11	t	2026-04-02 22:01:20.099	2026-04-02 22:01:20.099	seed	4	11	1
Large Fries	FRI-0002	35000	\N			f	12	t	2026-04-02 22:01:20.101	2026-04-02 22:01:20.101	seed	4	12	1
Loaded Cheese Fries	FRI-0003	45000	\N			f	13	t	2026-04-02 22:01:20.104	2026-04-02 22:01:20.104	seed	4	13	1
Soft Drink (Regular)	DRK-0001	15000	\N			f	14	t	2026-04-02 22:01:20.106	2026-04-02 22:01:20.106	seed	5	14	1
Soft Drink (Large)	DRK-0002	20000	\N			f	15	t	2026-04-02 22:01:20.108	2026-04-02 22:01:20.108	seed	5	15	1
Milkshake	DRK-0003	45000	\N			f	16	t	2026-04-02 22:01:20.111	2026-04-02 22:01:20.111	seed	5	16	1
Fresh Juice	DRK-0004	30000	\N			f	17	t	2026-04-02 22:01:20.117	2026-04-02 22:01:20.117	seed	5	17	1
Mineral Water	DRK-0005	8000	\N			f	18	t	2026-04-02 22:01:20.119	2026-04-02 22:01:20.119	seed	5	18	1
\.


--
-- Data for Name: ProductBranchConfig; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductBranchConfig" ("pricePaisa", "salePricePaisa", "isActive", "createdAt", "updatedAt", "createdBy", id, "productId", "branchId") FROM stdin;
\.


--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Reservation" ("guestName", "guestPhone", covers, date, "durationMin", status, notes, "isActive", "createdAt", "updatedAt", "createdBy", id, "branchId", "tableId") FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Role" (id, "orgId", name, tag, description, "isActive", "createdAt", "updatedAt", "createdBy") FROM stdin;
1	1	Admin	admin	Full system access	t	2026-04-02 22:01:19.564	2026-04-02 22:01:19.564	seed
2	1	Kitchen Staff	kitchen	Order preparation	t	2026-04-02 22:01:19.565	2026-04-02 22:01:19.565	seed
3	1	Cashier	cashier	Point of sale and transactions	t	2026-04-02 22:01:19.564	2026-04-02 22:01:19.564	seed
4	1	Manager	manager	Branch and sales management	t	2026-04-02 22:01:19.564	2026-04-02 22:01:19.564	seed
\.


--
-- Data for Name: State; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."State" (id, "orgId", tag, name, code, "zipCode", country, region, "isActive", "createdAt", "updatedAt", "createdBy") FROM stdin;
1	1	ICT	Islamabad Capital Territory	PK-ICT	44000-46000	PK	South Asia	t	2026-04-02 22:01:19.538	2026-04-02 22:01:19.538	seed
2	1	KP	Khyber Pakhtunkhwa	PK-KP	25000-27000	PK	South Asia	t	2026-04-02 22:01:19.541	2026-04-02 22:01:19.541	seed
3	1	PJ	Punjab	PK-PJ	54000-62000	PK	South Asia	t	2026-04-02 22:01:19.542	2026-04-02 22:01:19.542	seed
4	1	SN	Sindh	PK-SN	75000-75500	PK	South Asia	t	2026-04-02 22:01:19.543	2026-04-02 22:01:19.543	seed
\.


--
-- Data for Name: Table; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Table" (number, name, seats, shape, "posX", "posY", status, "assignedTo", "occupiedAt", covers, "isActive", "createdAt", "updatedAt", "createdBy", id, "branchId", "sectionId") FROM stdin;
1	T1	2	square	50	50	available	\N	\N	0	t	2026-04-02 22:01:20.128	2026-04-02 22:01:20.128	seed	1	1	1
2	T2	2	square	250	50	available	\N	\N	0	t	2026-04-02 22:01:20.131	2026-04-02 22:01:20.131	seed	2	1	1
3	T3	2	square	450	50	available	\N	\N	0	t	2026-04-02 22:01:20.133	2026-04-02 22:01:20.133	seed	3	1	1
4	T4	2	square	650	50	available	\N	\N	0	t	2026-04-02 22:01:20.134	2026-04-02 22:01:20.134	seed	4	1	1
5	T5	4	rectangle	50	250	available	\N	\N	0	t	2026-04-02 22:01:20.136	2026-04-02 22:01:20.136	seed	5	1	1
6	T6	4	rectangle	250	250	available	\N	\N	0	t	2026-04-02 22:01:20.137	2026-04-02 22:01:20.137	seed	6	1	1
7	T7	4	rectangle	450	250	available	\N	\N	0	t	2026-04-02 22:01:20.139	2026-04-02 22:01:20.139	seed	7	1	1
8	T8	4	rectangle	650	250	available	\N	\N	0	t	2026-04-02 22:01:20.147	2026-04-02 22:01:20.147	seed	8	1	1
\.


--
-- Data for Name: TableSection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TableSection" (name, color, "sortOrder", "isActive", "createdAt", "updatedAt", "createdBy", id, "branchId") FROM stdin;
Dining Area	#3B82F6	1	t	2026-04-02 22:01:20.124	2026-04-02 22:01:20.124	seed	1	1
\.


--
-- Data for Name: TaxConfig; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TaxConfig" (name, label, rate, mode, "appliesTo", "isDefault", "isActive", "createdAt", "updatedAt", "createdBy", "paymentMethod", id, "orgId", "branchId") FROM stdin;
Standard GST	GST	17	exclusive	all	t	t	2026-04-02 22:01:19.563	2026-04-02 22:01:19.563	seed	all	1	1	\N
\.


--
-- Data for Name: Terminal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Terminal" (name, description, "lastSeenAt", "isActive", "createdAt", "updatedAt", "createdBy", id, "branchId") FROM stdin;
KHI-CLI-T1	Main counter — Till 1	\N	t	2026-04-02 22:01:19.557	2026-04-02 22:01:19.557	seed	1	1
KHI-CLI-T2	Main counter — Till 2	\N	t	2026-04-02 22:01:19.56	2026-04-02 22:01:19.56	seed	2	1
\.


--
-- Data for Name: TillSession; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TillSession" (status, "openedAt", "openedBy", "openedByName", "openingCashPaisa", "openingDenom", "closedAt", "closedBy", "closingCashPaisa", "closingDenom", variance, notes, "isActive", "createdAt", "updatedAt", "createdBy", synced, "syncedAt", id, "orgId", "cityId", "branchId", "terminalId") FROM stdin;
open	2026-04-03 07:31:47.538	1	Admin User	500000	"[{\\"value\\":5000,\\"label\\":\\"5,000\\",\\"count\\":1,\\"total\\":5000},{\\"value\\":1000,\\"label\\":\\"1,000\\",\\"count\\":0,\\"total\\":0},{\\"value\\":500,\\"label\\":\\"500\\",\\"count\\":0,\\"total\\":0},{\\"value\\":100,\\"label\\":\\"100\\",\\"count\\":0,\\"total\\":0},{\\"value\\":50,\\"label\\":\\"50\\",\\"count\\":0,\\"total\\":0},{\\"value\\":20,\\"label\\":\\"20\\",\\"count\\":0,\\"total\\":0},{\\"value\\":10,\\"label\\":\\"10\\",\\"count\\":0,\\"total\\":0},{\\"value\\":5,\\"label\\":\\"5\\",\\"count\\":0,\\"total\\":0},{\\"value\\":2,\\"label\\":\\"2\\",\\"count\\":0,\\"total\\":0},{\\"value\\":1,\\"label\\":\\"1\\",\\"count\\":0,\\"total\\":0}]"	\N	\N	\N	\N	\N	Cashier	t	2026-04-03 07:31:47.538	2026-04-03 07:31:47.538	1	f	\N	1	1	1	1	1
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (name, email, phone, "passwordHash", "pinHash", "isActive", "createdAt", "updatedAt", "createdBy", "roleId", username, id, "orgId") FROM stdin;
Admin User	admin@aipos.pk	\N	$2a$12$AJl8ZelMpAxeTtw/n5d4UeQ2chbahvmBVMOsPiPaOkcPbEshKcXLm	$2a$10$PTKF2u/9Otp3AxX75SohGO2TAADWOJOCLk9dBd1QZyrl4JhUAm5nO	t	2026-04-02 22:01:19.935	2026-04-02 22:01:19.935	seed	1	admin	1	1
Cashier One	cashier@aipos.pk	\N	\N	$2a$10$HyvovjQY2er9tAWEeHz7geD7dT0SDD/JmgixU8xJ5uiQrnaTS.JWu	t	2026-04-02 22:01:20.012	2026-04-02 22:01:20.012	seed	3	cashier1	2	1
Manager	manager@aipos.pk	\N	$2a$12$e35Kd3drtK4KsS4eOumCsOV4DSjS8FEdkf2V78vrQM.0lZacfnijS	\N	t	2026-04-03 12:36:55.12	2026-04-03 12:36:55.12	script	4	manager1	3	1
\.


--
-- Data for Name: UserRoleAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserRoleAssignment" ("scopeType", "scopeId", "isActive", "createdAt", "updatedAt", "createdBy", "roleId", id, "userId") FROM stdin;
organisation	1	t	2026-04-02 22:01:19.94	2026-04-02 22:01:19.94	seed	1	1	1
branch	1	t	2026-04-02 22:01:20.017	2026-04-02 22:01:20.017	seed	3	2	2
branch	1	t	2026-04-03 12:36:55.128	2026-04-03 12:36:55.128	script	4	3	3
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
55c2e951-bfc7-44e6-9438-421f106ea591	2337b809deed2eef34657b5163bfbcd20f2fa999e16d26eedb3e7ce2d62f2a68	2026-04-03 03:01:11.284708+05	20260320091116_init	\N	\N	2026-04-03 03:01:11.235313+05	1
04396bce-8840-4351-8aba-dd20f9f9af0f	ab2e40d10cee95bd072a44e9028e988b9cfb521e62932607199ea83bb7e37f4c	2026-04-03 03:01:17.02656+05	20260402220116_add_kitchen_orders	\N	\N	2026-04-03 03:01:16.932619+05	1
\.


--
-- Name: Area_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Area_id_seq"', 1, false);


--
-- Name: Branch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Branch_id_seq"', 1, true);


--
-- Name: Brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Brand_id_seq"', 1, true);


--
-- Name: Campaign_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Campaign_id_seq"', 1, false);


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Category_id_seq"', 7, true);


--
-- Name: City_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."City_id_seq"', 1, true);


--
-- Name: CustomerMessage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."CustomerMessage_id_seq"', 1, false);


--
-- Name: Customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Customer_id_seq"', 1, false);


--
-- Name: Deal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Deal_id_seq"', 1, false);


--
-- Name: DiscountPreset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."DiscountPreset_id_seq"', 5, true);


--
-- Name: FoodType_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."FoodType_id_seq"', 4, true);


--
-- Name: HeldOrder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."HeldOrder_id_seq"', 1, false);


--
-- Name: Inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Inventory_id_seq"', 18, true);


--
-- Name: InvoiceItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."InvoiceItem_id_seq"', 52, true);


--
-- Name: Invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Invoice_id_seq"', 21, true);


--
-- Name: KitchenOrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."KitchenOrderItem_id_seq"', 52, true);


--
-- Name: KitchenOrder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."KitchenOrder_id_seq"', 21, true);


--
-- Name: LoyaltyConfig_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."LoyaltyConfig_id_seq"', 1, false);


--
-- Name: LoyaltyTier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."LoyaltyTier_id_seq"', 1, false);


--
-- Name: LoyaltyTransaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."LoyaltyTransaction_id_seq"', 1, false);


--
-- Name: MessageTemplate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."MessageTemplate_id_seq"', 1, false);


--
-- Name: OrgConfig_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."OrgConfig_id_seq"', 1, true);


--
-- Name: OrgRolePermission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."OrgRolePermission_id_seq"', 1, false);


--
-- Name: Organisation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Organisation_id_seq"', 1, true);


--
-- Name: OtpCode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."OtpCode_id_seq"', 1, false);


--
-- Name: ProductBranchConfig_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ProductBranchConfig_id_seq"', 1, false);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Product_id_seq"', 18, true);


--
-- Name: Reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Reservation_id_seq"', 1, false);


--
-- Name: Role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Role_id_seq"', 4, true);


--
-- Name: State_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."State_id_seq"', 4, true);


--
-- Name: TableSection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TableSection_id_seq"', 1, true);


--
-- Name: Table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Table_id_seq"', 8, true);


--
-- Name: TaxConfig_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TaxConfig_id_seq"', 1, true);


--
-- Name: Terminal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Terminal_id_seq"', 2, true);


--
-- Name: TillSession_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TillSession_id_seq"', 1, true);


--
-- Name: UserRoleAssignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."UserRoleAssignment_id_seq"', 3, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."User_id_seq"', 3, true);


--
-- Name: Area Area_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_pkey" PRIMARY KEY (id);


--
-- Name: Branch Branch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_pkey" PRIMARY KEY (id);


--
-- Name: Brand Brand_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Brand"
    ADD CONSTRAINT "Brand_pkey" PRIMARY KEY (id);


--
-- Name: Campaign Campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaign"
    ADD CONSTRAINT "Campaign_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: City City_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_pkey" PRIMARY KEY (id);


--
-- Name: CustomerMessage CustomerMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CustomerMessage"
    ADD CONSTRAINT "CustomerMessage_pkey" PRIMARY KEY (id);


--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: Deal Deal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deal"
    ADD CONSTRAINT "Deal_pkey" PRIMARY KEY (id);


--
-- Name: DiscountPreset DiscountPreset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DiscountPreset"
    ADD CONSTRAINT "DiscountPreset_pkey" PRIMARY KEY (id);


--
-- Name: FoodType FoodType_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FoodType"
    ADD CONSTRAINT "FoodType_pkey" PRIMARY KEY (id);


--
-- Name: HeldOrder HeldOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HeldOrder"
    ADD CONSTRAINT "HeldOrder_pkey" PRIMARY KEY (id);


--
-- Name: Inventory Inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceItem InvoiceItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: KitchenOrderItem KitchenOrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."KitchenOrderItem"
    ADD CONSTRAINT "KitchenOrderItem_pkey" PRIMARY KEY (id);


--
-- Name: KitchenOrder KitchenOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."KitchenOrder"
    ADD CONSTRAINT "KitchenOrder_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltyConfig LoyaltyConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyConfig"
    ADD CONSTRAINT "LoyaltyConfig_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltyTier LoyaltyTier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyTier"
    ADD CONSTRAINT "LoyaltyTier_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltyTransaction LoyaltyTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyTransaction"
    ADD CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY (id);


--
-- Name: MessageTemplate MessageTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MessageTemplate"
    ADD CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY (id);


--
-- Name: OrgConfig OrgConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrgConfig"
    ADD CONSTRAINT "OrgConfig_pkey" PRIMARY KEY (id);


--
-- Name: OrgRolePermission OrgRolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrgRolePermission"
    ADD CONSTRAINT "OrgRolePermission_pkey" PRIMARY KEY (id);


--
-- Name: Organisation Organisation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Organisation"
    ADD CONSTRAINT "Organisation_pkey" PRIMARY KEY (id);


--
-- Name: OtpCode OtpCode_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OtpCode"
    ADD CONSTRAINT "OtpCode_pkey" PRIMARY KEY (id);


--
-- Name: ProductBranchConfig ProductBranchConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductBranchConfig"
    ADD CONSTRAINT "ProductBranchConfig_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: State State_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."State"
    ADD CONSTRAINT "State_pkey" PRIMARY KEY (id);


--
-- Name: TableSection TableSection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TableSection"
    ADD CONSTRAINT "TableSection_pkey" PRIMARY KEY (id);


--
-- Name: Table Table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_pkey" PRIMARY KEY (id);


--
-- Name: TaxConfig TaxConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaxConfig"
    ADD CONSTRAINT "TaxConfig_pkey" PRIMARY KEY (id);


--
-- Name: Terminal Terminal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Terminal"
    ADD CONSTRAINT "Terminal_pkey" PRIMARY KEY (id);


--
-- Name: TillSession TillSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TillSession"
    ADD CONSTRAINT "TillSession_pkey" PRIMARY KEY (id);


--
-- Name: UserRoleAssignment UserRoleAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRoleAssignment"
    ADD CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Area_cityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Area_cityId_idx" ON public."Area" USING btree ("cityId");


--
-- Name: Area_cityId_tag_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Area_cityId_tag_key" ON public."Area" USING btree ("cityId", tag);


--
-- Name: Area_orgId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Area_orgId_idx" ON public."Area" USING btree ("orgId");


--
-- Name: Branch_orgId_label_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Branch_orgId_label_key" ON public."Branch" USING btree ("orgId", label);


--
-- Name: Brand_orgId_tag_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Brand_orgId_tag_key" ON public."Brand" USING btree ("orgId", tag);


--
-- Name: Category_foodTypeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Category_foodTypeId_idx" ON public."Category" USING btree ("foodTypeId");


--
-- Name: Category_orgId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Category_orgId_idx" ON public."Category" USING btree ("orgId");


--
-- Name: Category_orgId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_orgId_name_key" ON public."Category" USING btree ("orgId", name);


--
-- Name: Category_orgId_tag_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_orgId_tag_key" ON public."Category" USING btree ("orgId", tag);


--
-- Name: City_orgId_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "City_orgId_code_key" ON public."City" USING btree ("orgId", code);


--
-- Name: City_orgId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "City_orgId_idx" ON public."City" USING btree ("orgId");


--
-- Name: City_orgId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "City_orgId_name_key" ON public."City" USING btree ("orgId", name);


--
-- Name: City_stateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "City_stateId_idx" ON public."City" USING btree ("stateId");


--
-- Name: Customer_orgId_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Customer_orgId_phone_key" ON public."Customer" USING btree ("orgId", phone);


--
-- Name: Deal_orgId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Deal_orgId_idx" ON public."Deal" USING btree ("orgId");


--
-- Name: Deal_orgId_tag_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Deal_orgId_tag_key" ON public."Deal" USING btree ("orgId", tag);


--
-- Name: DiscountPreset_orgId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DiscountPreset_orgId_name_key" ON public."DiscountPreset" USING btree ("orgId", name);


--
-- Name: FoodType_orgId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FoodType_orgId_idx" ON public."FoodType" USING btree ("orgId");


--
-- Name: FoodType_orgId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FoodType_orgId_name_key" ON public."FoodType" USING btree ("orgId", name);


--
-- Name: FoodType_orgId_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FoodType_orgId_slug_key" ON public."FoodType" USING btree ("orgId", slug);


--
-- Name: HeldOrder_branchId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "HeldOrder_branchId_idx" ON public."HeldOrder" USING btree ("branchId");


--
-- Name: Inventory_productId_branchId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Inventory_productId_branchId_key" ON public."Inventory" USING btree ("productId", "branchId");


--
-- Name: KitchenOrderItem_kitchenOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "KitchenOrderItem_kitchenOrderId_idx" ON public."KitchenOrderItem" USING btree ("kitchenOrderId");


--
-- Name: KitchenOrder_branchId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "KitchenOrder_branchId_idx" ON public."KitchenOrder" USING btree ("branchId");


--
-- Name: KitchenOrder_branchId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "KitchenOrder_branchId_status_idx" ON public."KitchenOrder" USING btree ("branchId", status);


--
-- Name: KitchenOrder_invoiceId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "KitchenOrder_invoiceId_key" ON public."KitchenOrder" USING btree ("invoiceId");


--
-- Name: KitchenOrder_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "KitchenOrder_status_idx" ON public."KitchenOrder" USING btree (status);


--
-- Name: LoyaltyConfig_orgId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LoyaltyConfig_orgId_key" ON public."LoyaltyConfig" USING btree ("orgId");


--
-- Name: OrgConfig_orgId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "OrgConfig_orgId_key" ON public."OrgConfig" USING btree ("orgId");


--
-- Name: OrgRolePermission_roleId_permission_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "OrgRolePermission_roleId_permission_key" ON public."OrgRolePermission" USING btree ("roleId", permission);


--
-- Name: Organisation_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Organisation_slug_key" ON public."Organisation" USING btree (slug);


--
-- Name: ProductBranchConfig_productId_branchId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ProductBranchConfig_productId_branchId_key" ON public."ProductBranchConfig" USING btree ("productId", "branchId");


--
-- Name: Product_orgId_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Product_orgId_sku_key" ON public."Product" USING btree ("orgId", sku);


--
-- Name: Role_orgId_tag_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Role_orgId_tag_key" ON public."Role" USING btree ("orgId", tag);


--
-- Name: State_country_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "State_country_idx" ON public."State" USING btree (country);


--
-- Name: State_orgId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "State_orgId_idx" ON public."State" USING btree ("orgId");


--
-- Name: State_orgId_tag_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "State_orgId_tag_key" ON public."State" USING btree ("orgId", tag);


--
-- Name: TableSection_branchId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TableSection_branchId_name_key" ON public."TableSection" USING btree ("branchId", name);


--
-- Name: Table_sectionId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Table_sectionId_number_key" ON public."Table" USING btree ("sectionId", number);


--
-- Name: Terminal_branchId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Terminal_branchId_name_key" ON public."Terminal" USING btree ("branchId", name);


--
-- Name: UserRoleAssignment_userId_roleId_scopeId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserRoleAssignment_userId_roleId_scopeId_key" ON public."UserRoleAssignment" USING btree ("userId", "roleId", "scopeId");


--
-- Name: User_orgId_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_orgId_email_key" ON public."User" USING btree ("orgId", email);


--
-- Name: User_orgId_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_orgId_username_key" ON public."User" USING btree ("orgId", username);


--
-- Name: Area Area_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public."City"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Area Area_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Branch Branch_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public."Area"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Branch Branch_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public."Brand"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Branch Branch_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public."City"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Brand Brand_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Brand"
    ADD CONSTRAINT "Brand_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Campaign Campaign_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaign"
    ADD CONSTRAINT "Campaign_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Category Category_foodTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_foodTypeId_fkey" FOREIGN KEY ("foodTypeId") REFERENCES public."FoodType"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Category Category_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: City City_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: City City_stateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES public."State"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CustomerMessage CustomerMessage_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CustomerMessage"
    ADD CONSTRAINT "CustomerMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Customer Customer_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Deal Deal_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deal"
    ADD CONSTRAINT "Deal_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DiscountPreset DiscountPreset_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DiscountPreset"
    ADD CONSTRAINT "DiscountPreset_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FoodType FoodType_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FoodType"
    ADD CONSTRAINT "FoodType_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HeldOrder HeldOrder_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HeldOrder"
    ADD CONSTRAINT "HeldOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inventory Inventory_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inventory Inventory_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InvoiceItem InvoiceItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invoice Invoice_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invoice Invoice_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."Table"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoice Invoice_terminalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES public."Terminal"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invoice Invoice_tillSessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_tillSessionId_fkey" FOREIGN KEY ("tillSessionId") REFERENCES public."TillSession"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KitchenOrderItem KitchenOrderItem_kitchenOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."KitchenOrderItem"
    ADD CONSTRAINT "KitchenOrderItem_kitchenOrderId_fkey" FOREIGN KEY ("kitchenOrderId") REFERENCES public."KitchenOrder"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LoyaltyConfig LoyaltyConfig_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyConfig"
    ADD CONSTRAINT "LoyaltyConfig_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LoyaltyTier LoyaltyTier_configId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyTier"
    ADD CONSTRAINT "LoyaltyTier_configId_fkey" FOREIGN KEY ("configId") REFERENCES public."LoyaltyConfig"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LoyaltyTransaction LoyaltyTransaction_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyTransaction"
    ADD CONSTRAINT "LoyaltyTransaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LoyaltyTransaction LoyaltyTransaction_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyTransaction"
    ADD CONSTRAINT "LoyaltyTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LoyaltyTransaction LoyaltyTransaction_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyTransaction"
    ADD CONSTRAINT "LoyaltyTransaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MessageTemplate MessageTemplate_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MessageTemplate"
    ADD CONSTRAINT "MessageTemplate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrgConfig OrgConfig_defaultBranchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrgConfig"
    ADD CONSTRAINT "OrgConfig_defaultBranchId_fkey" FOREIGN KEY ("defaultBranchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrgConfig OrgConfig_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrgConfig"
    ADD CONSTRAINT "OrgConfig_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrgRolePermission OrgRolePermission_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrgRolePermission"
    ADD CONSTRAINT "OrgRolePermission_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrgRolePermission OrgRolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrgRolePermission"
    ADD CONSTRAINT "OrgRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OtpCode OtpCode_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OtpCode"
    ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductBranchConfig ProductBranchConfig_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductBranchConfig"
    ADD CONSTRAINT "ProductBranchConfig_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductBranchConfig ProductBranchConfig_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductBranchConfig"
    ADD CONSTRAINT "ProductBranchConfig_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."Table"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Role Role_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: State State_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."State"
    ADD CONSTRAINT "State_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TableSection TableSection_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TableSection"
    ADD CONSTRAINT "TableSection_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Table Table_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Table Table_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."TableSection"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TaxConfig TaxConfig_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaxConfig"
    ADD CONSTRAINT "TaxConfig_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Terminal Terminal_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Terminal"
    ADD CONSTRAINT "Terminal_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TillSession TillSession_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TillSession"
    ADD CONSTRAINT "TillSession_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TillSession TillSession_terminalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TillSession"
    ADD CONSTRAINT "TillSession_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES public."Terminal"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserRoleAssignment UserRoleAssignment_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRoleAssignment"
    ADD CONSTRAINT "UserRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserRoleAssignment UserRoleAssignment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRoleAssignment"
    ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organisation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

