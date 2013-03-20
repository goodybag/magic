-- 1.0.1.sql

-- #443: Create database versioning
-- Normally, the first line should be a database version update, but we need the versioning table
create table "deltas" (
  id            serial primary key,
  version       text,
  date          date
);

-- Update version
insert into deltas (version, date) values ('1.0.1', 'now()');

-- #434: tapin-station option to require a confirmation on first punch
ALTER TABLE "public"."tapinStations" ADD COLUMN "numUnconfirmedPunchesAllowed" int4;