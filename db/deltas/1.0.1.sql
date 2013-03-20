-- 1.0.1.sql

-- #434: tapin-station option to require a confirmation on first punch
ALTER TABLE "public"."tapinStations" ADD COLUMN "numUnconfirmedPunchesAllowed" int4;