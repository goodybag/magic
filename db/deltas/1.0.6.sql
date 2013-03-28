-- 1.0.6.sql

-- popular lists
CREATE TABLE "poplistItems" (
    id integer NOT NULL,
    listid integer,
    "productId" integer,
    "createdAt" timestamp without time zone DEFAULT now(),
    "isActive" boolean
);
CREATE SEQUENCE "poplistItems_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
SELECT pg_catalog.setval('"poplistItems_id_seq"', 1, false);
ALTER TABLE ONLY "poplistItems" ALTER COLUMN id SET DEFAULT nextval('"poplistItems_id_seq"'::regclass);
ALTER TABLE ONLY "poplistItems"
    ADD CONSTRAINT "poplistItems_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "poplistItems"
    ADD CONSTRAINT "poplistItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE;