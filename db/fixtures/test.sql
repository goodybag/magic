
-- CHARITIES

BEGIN;
INSERT INTO "charities" (id, name, "desc", "logoUrl", "totalReceived") VALUES ('1', 'Charity 1', 'a charity', 'http://placekitten.com/500/500', 1000);
INSERT INTO "charities" (id, name, "desc", "logoUrl", "totalReceived") VALUES ('2', 'Charity 2', 'a charity', 'http://placekitten.com/500/500', 1000);
INSERT INTO "charities" (id, name, "desc", "logoUrl", "totalReceived") VALUES ('3', 'Charity 3', 'a charity', 'http://placekitten.com/500/500', 1000);
COMMIT;
SELECT setval('charities_id_seq', (SELECT MAX(id) from "charities")); -- advance the sequence past the IDs just used

-- BUSINESSES

BEGIN;
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isDeleted") VALUES ('1', 1, 'Business 1', 'http://foobar.com', 'http://placekitten.com/500/500', '1234', '123 Foobar St', '#1', 'Austin', 'TX', 78701, true, false);
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isDeleted") VALUES ('2', 1, 'Business 2', 'http://foobar.com', 'http://placekitten.com/500/500', '1234', '123 Foobar St', '#1', 'Austin', 'TX', 78701, true, false);
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isDeleted") VALUES ('3', 2, 'Business 3', 'http://foobar.com', 'http://placekitten.com/500/500', '1234', '123 Foobar St', '#1', 'Austin', 'TX', 78701, true, false);
COMMIT;
SELECT setval('businesses_id_seq', (SELECT MAX(id) from "businesses")); -- advance the sequence past the IDs just used

-- LOCATIONS

BEGIN;
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, "isEnabled") VALUES ('1', '1', 'Location 1', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 10, 10, true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, "isEnabled") VALUES ('2', '2', 'Location 2', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 10.001, 10.001, true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, "isEnabled") VALUES ('3', '3', 'Location 3', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 0, 0, true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, "isEnabled") VALUES ('4', '1', 'Location 4', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 0, 0, true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, "isEnabled") VALUES ('5', '1', 'Location 4', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 0, 0, true);
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
INSERT INTO "users" (id, email, password) VALUES ('7', 'tablet@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
COMMIT;
SELECT setval('users_id_seq', (SELECT MAX(id) from "users")); -- advance the sequence past the IDs just used

-- GROUPS

BEGIN;
INSERT INTO "groups" (id, name) VALUES ('1', 'admin');
INSERT INTO "groups" (id, name) VALUES ('2', 'sales');
INSERT INTO "groups" (id, name) VALUES ('3', 'tablet');
INSERT INTO "groups" (id, name) VALUES ('4', 'client');
INSERT INTO "groups" (id, name) VALUES ('5', 'consumer');
INSERT INTO "groups" (id, name) VALUES ('6', 'tapin-station');
COMMIT;
SELECT setval('groups_id_seq', (SELECT MAX(id) from "groups")); -- advance the sequence past the IDs just used

-- USER GROUPS

BEGIN;
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('1', '1', '1');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('2', '2', '2');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('3', '3', '3');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('4', '4', '4');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('5', '5', '5');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('6', '7', '6');
COMMIT;
SELECT setval('"usersGroups_id_seq"', (SELECT MAX(id) from "usersGroups")); -- advance the sequence past the IDs just usedSELECT setval('locations_id_seq', (SELECT MAX(id) from "locations")); -- advance the sequence past the IDs just used

-- PRODUCTS

BEGIN;
INSERT INTO "products" (id, "businessId", name, description, price, "photoUrl", likes, wants, tries, "isVerified", "isEnabled") VALUES ('1', '1', 'Product 1', 'A product', 55.55, 'http://placekitten.com/200/300', 0, 0, 0, true, true);
INSERT INTO "products" (id, "businessId", name, description, price, "photoUrl", likes, wants, tries, "isVerified", "isEnabled") VALUES ('2', '2', 'Product 2', 'A product', 55.55, 'http://placekitten.com/200/300', 0, 0, 0, true, true);
INSERT INTO "products" (id, "businessId", name, description, price, "photoUrl", likes, wants, tries, "isVerified", "isEnabled") VALUES ('3', '3', 'Product 3', 'A product', 55.55, 'http://placekitten.com/200/300', 0, 0, 0, true, true);
INSERT INTO "products" (id, "businessId", name, description, price, "photoUrl", likes, wants, tries, "isVerified", "isEnabled") VALUES ('4', '1', 'Product 4', 'A product', 55.55, 'http://placekitten.com/200/300', 0, 0, 0, true, true);
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

-- PRODUCT LOCATIONS

BEGIN;
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position) VALUES ('1', '1', '1', '1', 10, 10, ll_to_earth(10, 10));
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position) VALUES ('2', '1', '1', '4', 0, 0, ll_to_earth(0, 0));
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position) VALUES ('3', '1', '1', '5', 0, 0, ll_to_earth(0, 0));
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position) VALUES ('4', '2', '2', '2', 10.001, 10.001, ll_to_earth(10.001, 10.001));
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position) VALUES ('5', '3', '3', '3', 0, 0, ll_to_earth(0, 0));
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position) VALUES ('6', '4', '1', '1', 10, 10, ll_to_earth(10, 10));
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position) VALUES ('7', '4', '1', '4', 0, 0, ll_to_earth(0, 0));
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position) VALUES ('8', '4', '1', '5', 0, 0, ll_to_earth(0, 0));
COMMIT;
SELECT setval('"productLocations_id_seq"', (SELECT MAX(id) from "productLocations")); -- advance the sequence past the IDs just used

-- PHOTOS

BEGIN;
INSERT INTO "photos" (id, "businessId", "productId", url, "isEnabled") VALUES ('1', '1', '1', 'http://placekitten.com/200/300', true);
INSERT INTO "photos" (id, "businessId", "productId", url, "isEnabled") VALUES ('2', '1', null, 'http://placekitten.com/200/300', true);
INSERT INTO "photos" (id, "businessId", "productId", url, "isEnabled") VALUES ('3', '3', '3', 'http://placekitten.com/200/300', true);
COMMIT;
SELECT setval('photos_id_seq', (SELECT MAX(id) from "photos")); -- advance the sequence past the IDs just used

-- TAGS

BEGIN;
INSERT INTO "productTags" (id, "businessId", tag) VALUES ('1', '1', 'food');
INSERT INTO "productTags" (id, "businessId", tag) VALUES ('2', '1', 'apparel');
INSERT INTO "productTags" (id, "businessId", tag) VALUES ('3', '2', 'food');
INSERT INTO "productTags" (id, "businessId", tag) VALUES ('4', '3', 'food');
COMMIT;
SELECT setval('"productTags_id_seq"', (SELECT MAX(id) from "productTags")); -- advance the sequence past the IDs just used

-- PRODUCTS TAGS

BEGIN;
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('1', '1', '1');
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('2', '2', '1');
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('3', '3', '2');
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('4', '4', '3');
COMMIT;
SELECT setval('"productsProductTags_id_seq"', (SELECT MAX(id) from "productsProductTags")); -- advance the sequence past the IDs just used
