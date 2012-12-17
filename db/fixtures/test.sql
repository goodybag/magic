
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
INSERT INTO "users" (id, email, password) VALUES ('1', 'admin@goodybag.com', 'password');
INSERT INTO "users" (id, email, password) VALUES ('2', 'sales@goodybag.com', 'password');
INSERT INTO "users" (id, email, password) VALUES ('3', 'tablet@goodybag.com', 'password');
INSERT INTO "users" (id, email, password) VALUES ('4', 'client@goodybag.com', 'password');
INSERT INTO "users" (id, email, password) VALUES ('5', 'consumer@goodybag.com', 'password');
INSERT INTO "users" (id, email, password) VALUES ('6', 'dumb@goodybag.com', 'password');
COMMIT;
SELECT setval('users_id_seq', (SELECT MAX(id) from "users")); -- advance the sequence past the IDs just used

-- GROUPS

BEGIN;
INSERT INTO "groups" (id, name) VALUES ('1', 'admin');
INSERT INTO "groups" (id, name) VALUES ('2', 'sales');
INSERT INTO "groups" (id, name) VALUES ('3', 'tablet');
INSERT INTO "groups" (id, name) VALUES ('4', 'client');
INSERT INTO "groups" (id, name) VALUES ('5', 'consumer');
COMMIT;
SELECT setval('groups_id_seq', (SELECT MAX(id) from "groups")); -- advance the sequence past the IDs just used

-- USER GROUPS

BEGIN;
INSERT INTO "userGroups" (id, "userId", "groupId") VALUES ('1', '1', '1');
INSERT INTO "userGroups" (id, "userId", "groupId") VALUES ('2', '2', '2');
INSERT INTO "userGroups" (id, "userId", "groupId") VALUES ('3', '3', '3');
INSERT INTO "userGroups" (id, "userId", "groupId") VALUES ('4', '4', '4');
INSERT INTO "userGroups" (id, "userId", "groupId") VALUES ('5', '5', '5');
COMMIT;
SELECT setval('"userGroups_id_seq"', (SELECT MAX(id) from "userGroups")); -- advance the sequence past the IDs just used