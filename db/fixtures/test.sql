
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
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isDeleted") VALUES ('4', 2, 'Business 4', 'http://foobar.com', 'http://placekitten.com/500/500', '1234', '123 Foobar St', '#1', 'Austin', 'TX', 78701, true, false);
COMMIT;
SELECT setval('businesses_id_seq', (SELECT MAX(id) from "businesses")); -- advance the sequence past the IDs just used

-- BUSINESS LOYALTY SETTINGS

BEGIN;
INSERT INTO "businessLoyaltySettings" (id, "businessId", reward, "requiredItem", "regularPunchesRequired", "elitePunchesRequired", "eliteVisitsRequired") VALUES (1, 1, 'Burrito', 'Taco', 8, 4, 20);
INSERT INTO "businessLoyaltySettings" (id, "businessId", reward, "requiredItem", "regularPunchesRequired", "elitePunchesRequired", "eliteVisitsRequired") VALUES (2, 2, 'Umbrella', 'Hat', 6, 3, 16);
INSERT INTO "businessLoyaltySettings" (id, "businessId", reward, "requiredItem", "regularPunchesRequired", "elitePunchesRequired", "eliteVisitsRequired") VALUES (3, 3, 'Bee Repellant', 'Angry Bees', 20, 15, 30);
COMMIT;
SELECT setval('"businessLoyaltySettings_id_seq"', (SELECT MAX(id) from "businessLoyaltySettings")); -- advance the sequence past the IDs just used

-- BUSINESS TAGS

BEGIN;
INSERT INTO "businessTags" (id, "businessId", tag) VALUES ('1', '2', 'uniquetag');
INSERT INTO "businessTags" (id, "businessId", tag) VALUES ('2', '1', 'apparel');
INSERT INTO "businessTags" (id, "businessId", tag) VALUES ('3', '2', 'food');
INSERT INTO "businessTags" (id, "businessId", tag) VALUES ('4', '3', 'food');
INSERT INTO "businessTags" (id, "businessId", tag) VALUES ('5', '4', 'apparel');
COMMIT;
SELECT setval('"businessTags_id_seq"', (SELECT MAX(id) from "businessTags")); -- advance the sequence past the IDs just used

-- LOCATIONS

BEGIN;
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled") VALUES ('1', '1', 'Location 1', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 10, 10, ll_to_earth(10,10), true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled") VALUES ('2', '2', 'Location 2', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 10.001, 10.001, ll_to_earth(10.001,10.001), true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled") VALUES ('3', '3', 'Location 3', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 0, 0, ll_to_earth(0,0), true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled") VALUES ('4', '1', 'Location 4', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 0, 0, ll_to_earth(0,0), true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled") VALUES ('5', '1', 'Location 4', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 0, 0, ll_to_earth(0,0), true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled") VALUES ('6', '4', 'Location 6', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 0, 0, ll_to_earth(0,0), true);
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
INSERT INTO "users" (id, email, password) VALUES ('7', 'tferguson@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('8', 'somebody_else@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('9', 'consumer2@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('10', 'consumer3@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11', 'consumer_redeem1@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('12', 'consumer_redeem2@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('13', 'iamgoingtogetdeleted@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('14', 'iamgoingtogetdeleted2@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('15', 'consumer4@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');

INSERT INTO "users" (id, email, password) VALUES ('11110', 'some_manager@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11111', 'some_manager2@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11112', 'manager_getting_deleted@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11113', 'manager_redeem1@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11114', 'manager_redeem2@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11115', 'manager_redeem3@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');

INSERT INTO "users" (id, email, password) VALUES ('11120', 'some_cashier@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11121', 'some_cashier2@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11122', 'cashier_getting_deleted@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11123', 'cashier_redeem1@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11124', 'cashier_redeem2@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11125', 'cashier_redeem3@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');

INSERT INTO "users" (id, email, password) VALUES ('11130', 'tapin_station_0@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11131', 'tapin_station_1@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11132', 'tapin_station_2@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11133', 'ts_redeem1@goodybag.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
COMMIT;
SELECT setval('users_id_seq', (SELECT MAX(id) from "users")); -- advance the sequence past the IDs just used

-- CONSUMERS

BEGIN;
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('1', '7', 'Turd', 'Ferguson', 'tferguson', '123456-ABC');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('2', '8', 'Somebody', 'Else', 'some_guy', '123456-ABD');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('3', '9', 'Consumer', 'Two', 'consumer2', '123456-ABD');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('4', '10', 'Consumer', 'Three', 'consumer3', '123456-ABD');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('5', '11', 'Consumer', 'Redeem1', 'consumer_redeem1', '123456-ABD');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('6', '12', 'Consumer', 'Redeem2', 'consumer_redeem2', '123456-ABD');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('7', '9', 'Getting', 'Deleted', 'getting_deleted', '123456-YYY');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('8', '14', 'Getting', 'Deleted2', 'getting_deleted2', '123456-YYZ');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('9', '15', 'Consumer', 'Four', 'consumer4', '123456-consumer4');
COMMIT;
SELECT setval('consumers_id_seq', (SELECT MAX(id) from "consumers")); -- advance the sequence past the IDs just used

-- MANAGERS

BEGIN;
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('1', '11110', '1', '1', '123456-XXX');
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('2', '11111', '1', '1', '123456-XXZ');
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('3', '11112', '1', '1', '123456-XXY');
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('4', '11113', '1', '1', '123456-manager_redeem1');
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('5', '11114', '1', '4', '123456-XXY');
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('6', '11115', '2', '2', '123456-XXY');
COMMIT;
SELECT setval('managers_id_seq', (SELECT MAX(id) from "managers")); -- advance the sequence past the IDs just used

-- CASHIERS

BEGIN;
INSERT INTO "cashiers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('1', '11120', '1', '1', '123456-XYX');
INSERT INTO "cashiers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('2', '11121', '1', '1', '123456-XYZ');
INSERT INTO "cashiers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('3', '11122', '1', '1', '123456-XYY');
INSERT INTO "cashiers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('4', '11123', '1', '1', '123456-XYY');
INSERT INTO "cashiers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('5', '11124', '1', '4', '123456-XYY');
INSERT INTO "cashiers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('6', '11125', '2', '2', '123456-XYY');
COMMIT;
SELECT setval('cashiers_id_seq', (SELECT MAX(id) from "cashiers")); -- advance the sequence past the IDs just used

-- TAPINSTATIONS

BEGIN;
INSERT INTO "tapinStations" (id, "userId", "businessId", "locationId", "loyaltyEnabled", "galleryEnabled") VALUES ('1', '11130', '1', '1', 'true', 'true');
INSERT INTO "tapinStations" (id, "userId", "businessId", "locationId", "loyaltyEnabled", "galleryEnabled") VALUES ('2', '11131', '1', '1', 'true', 'true');
INSERT INTO "tapinStations" (id, "userId", "businessId", "locationId", "loyaltyEnabled", "galleryEnabled") VALUES ('3', '11132', '1', '1', 'true', 'true');
INSERT INTO "tapinStations" (id, "userId", "businessId", "locationId", "loyaltyEnabled", "galleryEnabled") VALUES ('4', '11133', '1', '1', 'true', 'true');
COMMIT;
SELECT setval('"tapinStations_id_seq"', (SELECT MAX(id) from "tapinStations")); -- advance the sequence past the IDs just used

-- GROUPS

BEGIN;
INSERT INTO "groups" (id, name) VALUES ('1', 'admin');
INSERT INTO "groups" (id, name) VALUES ('2', 'sales');
INSERT INTO "groups" (id, name) VALUES ('3', 'tapin-station');
INSERT INTO "groups" (id, name) VALUES ('4', 'client');
INSERT INTO "groups" (id, name) VALUES ('5', 'consumer');
INSERT INTO "groups" (id, name) VALUES ('6', 'foobar');
INSERT INTO "groups" (id, name) VALUES ('11110', 'manager');
INSERT INTO "groups" (id, name) VALUES ('11111', 'cashier');
INSERT INTO "groups" (id, name) VALUES ('11112', 'tapin-station');
COMMIT;
SELECT setval('groups_id_seq', (SELECT MAX(id) from "groups")); -- advance the sequence past the IDs just used

-- USER GROUPS

BEGIN;
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('1', '1', '1');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('2', '2', '2');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('3', '3', '3');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('4', '4', '4');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('5', '5', '5');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('6', '7', '5');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('7', '8', '5');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('8', '9', '5');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('9', '10', '5');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('10', '11', '5');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11', '14', '5');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('12', '15', '5');

-- manager

INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11110', '11110', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11111', '11111', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11112', '11112', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11113', '11113', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11114', '11114', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11115', '11115', '11110');

-- cashier
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11120', '11120', '11111');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11121', '11121', '11111');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11122', '11122', '11111');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11123', '11123', '11111');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11124', '11124', '11111');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11125', '11125', '11111');

-- tapin-station
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11130', '11130', '11112');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11131', '11131', '11112');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11132', '11132', '11112');
COMMIT;
SELECT setval('"usersGroups_id_seq"', (SELECT MAX(id) from "usersGroups")); -- advance the sequence past the IDs just usedSELECT setval('locations_id_seq', (SELECT MAX(id) from "locations")); -- advance the sequence past the IDs just used

-- USER LOYALTY STATS

BEGIN;
INSERT INTO "userLoyaltyStats" (id, "consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "lastVisit") VALUES ('1', '3', '1', 5, 23, 40, now());
INSERT INTO "userLoyaltyStats" (id, "consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "lastVisit") VALUES ('2', '5', '1', 10, 10, 10, now());
INSERT INTO "userLoyaltyStats" (id, "consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "lastVisit") VALUES ('3', '6', '1', 4, 4, 20, now());
INSERT INTO "userLoyaltyStats" (id, "consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "lastVisit") VALUES ('4', '9', '1', 5, 23, 40, now());
COMMIT;
SELECT setval('"userLoyaltyStats_id_seq"', (SELECT MAX(id) from "userLoyaltyStats")); -- advance the sequence past the IDs just used

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
INSERT INTO "productTags" (id, "businessId", tag) VALUES ('5', '3', 'uniquetag');
COMMIT;
SELECT setval('"productTags_id_seq"', (SELECT MAX(id) from "productTags")); -- advance the sequence past the IDs just used

-- PRODUCTS TAGS

BEGIN;
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('1', '1', '1');
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('2', '2', '1');
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('3', '3', '2');
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('4', '4', '3');
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('5', '5', '3');
COMMIT;
SELECT setval('"productsProductTags_id_seq"', (SELECT MAX(id) from "productsProductTags")); -- advance the sequence past the IDs just used


--
BEGIN;
INSERT INTO "oddityLive" (id, "biz_name", "e_address") VALUES ('1', 'Subway', '4424 Buffalo Gap Rd');
INSERT INTO "oddityLive" (id, "biz_name", "e_address") VALUES ('2', 'Abilene', '1866 Pine St');
INSERT INTO "oddityLive" (id, "biz_name", "e_address") VALUES ('11', 'Abilene', '18677 Pine St');
INSERT INTO "oddityLive" (id, "biz_name", "e_address") VALUES ('22', 'Abilene', '18677 Guaterloop St');
COMMIT;

--
BEGIN;
INSERT INTO "oddityMeta" (id, "oddityLiveId", "toReview", "changeColumns", "isHidden") VALUES ('1', '11', true, true, false);
INSERT INTO "oddityMeta" (id, "oddityLiveId", "toReview", "changeColumns", "isHidden") VALUES ('2', '22', true, true, false);
COMMIT;
