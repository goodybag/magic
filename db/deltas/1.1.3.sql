-- 1.1.3.sql
insert into deltas (version, date) values ('1.1.3', 'now()');

-- #556 email uniqueness

ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
