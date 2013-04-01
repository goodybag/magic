-- 1.0.10.sql
insert into deltas (version, date) values ('1.0.10', 'now()');

-- # 476 - Business Contact entries
create table "businessContactRequests" (
  id              serial primary key
, name            text
, "businessName"  text
, email           text
, zip             int
, comments        text
, date            timestamp default now() not null
);