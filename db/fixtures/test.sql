
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
INSERT INTO "locations" VALUES ('4', '1', 'Location 4', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', '555 555 5555', null, null, null, true);
COMMIT;
SELECT setval('locations_id_seq', (SELECT MAX(id) from "locations")); -- advance the sequence past the IDs just used

-- USERS
--   password: "password"

BEGIN;
INSERT INTO "users" (id, email, password) VALUES ('1', 'admin@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('2', 'sales@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('3', 'tablet@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('4', 'client@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('5', 'consumer@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('6', 'dumb@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
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
SELECT setval('"userGroups_id_seq"', (SELECT MAX(id) from "userGroups")); -- advance the sequence past the IDs just usedSELECT setval('locations_id_seq', (SELECT MAX(id) from "locations")); -- advance the sequence past the IDs just used

-- PRODUCTS

BEGIN;
INSERT INTO "products" VALUES ('1', '1', 'Product 1', 'A product', 55.55, true, false, true);
INSERT INTO "products" VALUES ('2', '2', 'Product 2', 'A product', 55.55, true, false, true);
INSERT INTO "products" VALUES ('3', '3', 'Product 3', 'A product', 55.55, true, false, true);
INSERT INTO "products" VALUES ('4', '1', 'Product 4', 'A product', 55.55, true, false, true);
COMMIT;
SELECT setval('products_id_seq', (SELECT MAX(id) from "products")); -- advance the sequence past the IDs just used

-- PRODUCT CATEGORIES

BEGIN;
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES ('1', '1', '1', 'Category 1', true);
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES ('2', '1', '2', 'Category 2', false);
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES ('3', '2', '1', 'Category 1', true);
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES ('4', '3', '1', 'DUMB CATEGORY WILL BE DELETED', true);
COMMIT;
SELECT setval('"productCategories_id_seq"', (SELECT MAX(id) from "productCategories")); -- advance the sequence past the IDs just used

-- PRODUCTS <-> PRODUCT CATEGORIES

BEGIN;
INSERT INTO "productsProductCategories" ("id", "productId", "productCategoryId") VALUES ('1', '1', '1');
INSERT INTO "productsProductCategories" ("id", "productId", "productCategoryId") VALUES ('2', '1', '2');
INSERT INTO "productsProductCategories" ("id", "productId", "productCategoryId") VALUES ('3', '2', '3');
COMMIT;
SELECT setval('"productsProductCategories_id_seq"', (SELECT MAX(id) from "productsProductCategories")); -- advance the sequence past the IDs just used

-- PHOTOS

BEGIN;
INSERT INTO "photos" (id, "businessId", "productId", url, "isEnabled") VALUES ('1', '1', '1', 'http://placekitten.com/200/300', true);
INSERT INTO "photos" (id, "businessId", "productId", url, "isEnabled") VALUES ('2', '1', null, 'http://placekitten.com/200/300', true);
INSERT INTO "photos" (id, "businessId", "productId", url, "isEnabled") VALUES ('3', '3', '3', 'http://placekitten.com/200/300', true);
COMMIT;
SELECT setval('photos_id_seq', (SELECT MAX(id) from "photos")); -- advance the sequence past the IDs just used

-- PRODUCT TAGS

BEGIN;
INSERT INTO "productTags" (id, "businessId", "productId", tag) VALUES ('1', '1', '1', 'food');
INSERT INTO "productTags" (id, "businessId", "productId", tag) VALUES ('2', '1', '1', 'apparel');
INSERT INTO "productTags" (id, "businessId", "productId", tag) VALUES ('3', '2', '2', 'food');
INSERT INTO "productTags" (id, "businessId", "productId", tag) VALUES ('4', '3', '3', 'food');
COMMIT;
SELECT setval('"productTags_id_seq"', (SELECT MAX(id) from "productTags")); -- advance the sequence past the IDs just used
