-- 1.0.12.sql
insert into deltas (version, date) values ('1.0.12', 'now()');

-- # 501 - Forgot businses requests table
create table "businessRequests" (
  id              serial primary key
, name            text
, date            timestamp default now() not null
);