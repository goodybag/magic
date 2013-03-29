-- 1.0.9.sql
insert into deltas (version, date) values ('1.0.9', 'now()');

-- # 475 - Business Requests
create table "businessRequests" (
  id          serial primary key
, name        text
, date        timestamp default now() not null
);