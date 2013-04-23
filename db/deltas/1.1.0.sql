-- 1.0.0.sql
insert into deltas (version, date) values ('1.0.0', 'now()');

-- #543 fix forgot password tokens

-- remove the redundant expires column
ALTER TABLE "userPasswordResets" DROP COLUMN expires;

-- add boolean to tell if token has been used
ALTER TABLE "userPasswordResets" ADD used timestamp without time zone;
