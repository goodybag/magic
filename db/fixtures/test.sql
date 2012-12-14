
-- BUSINESSES

BEGIN;
INSERT INTO "businesses" VALUES ('1', 'Business 1', 'http://foobar.com', '1234', '123 Foobar St', '#1', 'Austin', 'TX', 78701, true, null, null);
INSERT INTO "businesses" VALUES ('2', 'Business 2', 'http://foobar.com', '1234', '123 Foobar St', '#1', 'Austin', 'TX', 78701, true, null, null);
INSERT INTO "businesses" VALUES ('3', 'Business 3', 'http://foobar.com', '1234', '123 Foobar St', '#1', 'Austin', 'TX', 78701, true, null, null);
COMMIT;
SELECT setval('businesses_id_seq', (SELECT MAX(id) from "businesses")); -- advance the sequence past the IDs just used

-- LOCATIONS

BEGIN;
INSERT INTO "locations" VALUES ('1', '1', 'Location 1', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', '555 555 5555', null, null, null, true);
INSERT INTO "locations" VALUES ('2', '2', 'Location 2', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', '555 555 5555', null, null, null, true);
INSERT INTO "locations" VALUES ('3', '3', 'Location 3', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', '555 555 5555', null, null, null, true);
COMMIT;
SELECT setval('locations_id_seq', (SELECT MAX(id) from "locations")); -- advance the sequence past the IDs just used

-- USERS

BEGIN;
INSERT INTO "users" VALUES ('1', 'abc@gmail.com', '123456',  'dagfdhsdhgdfh', '123', null, null);
INSERT INTO "users" VALUES ('2', 'def@yahoo.com', 'afgshgdhd', null, null, null, null);
INSERT INTO "users" VALUES ('3', 'dsfasg@hotmail.com', 'nevergiveup',  null, null, null, null);
COMMIT;
SELECT setval('users_id_seq', (SELECT MAX(id) from "users")); -- advance the sequence past the IDs just used

--GROUPS

BEGIN;
INSERT INTO "groups" VALUES ('1', 'sales');
INSERT INTO "groups" VALUES ('2', 'admins');
INSERT INTO "groups" VALUES ('3', 'consumers');
COMMIT;
SELECT setval('groups_id_seq', (SELECT MAX(id) from "groups")); -- advance the sequence past the IDs just used


--USER-GROUP
BEGIN;
INSERT INTO "usergroup" VALUES ('1', '1', '2');
INSERT INTO "usergroup" VALUES ('2', '1', '3');
INSERT INTO "usergroup" VALUES ('3', '3', '2');
COMMIT;
SELECT setval('usergroup_id_seq', (SELECT MAX(id) from "usergroup")); -- advance the sequence past the IDs just used

