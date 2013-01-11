
-- TEST FILE

BEGIN;
INSERT INTO "oddity" VALUES ('1', 'Business 1', 'http://foobar.com',  '123 Foobar St', '#1', 'Austin', 'TX', 78701);
INSERT INTO "oddity" VALUES ('2', 'Business 2', 'http://foobar.com',  '123 Foobar St', '#1', 'Austin', 'TX', 78701);
INSERT INTO "oddity" VALUES ('3', 'Business 3', 'http://foobar.com',  '123 Foobar St', '#1', 'Austin', 'TX', 78701);
COMMIT;
SELECT setval('oddity_id_seq', (SELECT MAX(id) from "oddity")); -- advance the sequence past the IDs just used

BEGIN;
INSERT INTO "oddityMeta" ("oddityId", "toReview", "changeColumns") SELECT oddity.id, 'true', 'true' FROM oddity;
COMMIT;
