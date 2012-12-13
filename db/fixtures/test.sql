
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