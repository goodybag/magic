-- 1.0.2.sql
alter table "deltas" alter column "date" type "timestamp";
insert into deltas (version, date) values ('1.0.2', 'now()');

-- #42: Add created at field for users
alter table "users" add column "createdAt" "timestamp";