-- 1.0.16.sql
insert into deltas (version, date) values ('1.0.16', 'now()');

-- #457 - Don't add fashion collection to new consumers
delete from collections where "pseudoKey" = 'fashion';