-- 1.4.1.sql
insert into deltas (version, date) values ('1.4.1', 'now()');

-- #625 - Auth by phone number

ALTER TABLE users  ADD COLUMN phone text CHECK (phone SIMILAR TO '\d{10}(ex\d{4})?');
ALTER TABLE tapins ADD COLUMN phone text CHECK (phone SIMILAR TO '\d{10}(ex\d{4})?');
