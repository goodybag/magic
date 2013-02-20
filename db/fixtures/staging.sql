
-- GROUPS

BEGIN;
INSERT INTO "groups" (id, name) VALUES (1, 'admin');
INSERT INTO "groups" (id, name) VALUES (2, 'sales');
INSERT INTO "groups" (id, name) VALUES (3, 'cashier');
INSERT INTO "groups" (id, name) VALUES (4, 'manager');
INSERT INTO "groups" (id, name) VALUES (5, 'consumer');
INSERT INTO "groups" (id, name) VALUES (6, 'tapin-station');
COMMIT;
SELECT setval('groups_id_seq', (SELECT MAX(id) from "groups")); -- advance the sequence past the IDs just used