-- 1.2.3.sql
insert into deltas (version, date) values ('1.2.3', 'now()');

-- #570 - Heartbeats

create table "heartbeats" (
  "userId"                int
, "businessId"            int
, "locationId"            int
, "type"                  text
, "createdAt"             timestamp without time zone default now()
, "data"                  text
);