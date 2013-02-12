
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
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isDeleted") VALUES ('39', 2, 'Amys Ice Cream ', 'http://foobar.com', 'http://placekitten.com/500/500', '000000', '3500 guadalupe St', null, 'Austin', 'TX', 78705, true, false);
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isDeleted") VALUES ('500', 2, 'Biz With No Locations', 'http://foobar.com', 'http://placekitten.com/500/500', '000000', '3500 guadalupe St', null, 'Austin', 'TX', 78705, true, false);
COMMIT;
SELECT setval('businesses_id_seq', (SELECT MAX(id) from "businesses")); -- advance the sequence past the IDs just used

-- BUSINESS LOYALTY SETTINGS

BEGIN;
INSERT INTO "businessLoyaltySettings" (id, "businessId", reward, "requiredItem", "regularPunchesRequired", "elitePunchesRequired", "punchesRequiredToBecomeElite", "photoUrl") VALUES (1, 1, 'Burrito', 'Taco', 8, 4, 25, 'http://placekitten.com/200/300');
INSERT INTO "businessLoyaltySettings" (id, "businessId", reward, "requiredItem", "regularPunchesRequired", "elitePunchesRequired", "punchesRequiredToBecomeElite", "photoUrl") VALUES (2, 2, 'Umbrella', 'Hat', 6, 3, 20, 'http://placekitten.com/200/300');
INSERT INTO "businessLoyaltySettings" (id, "businessId", reward, "requiredItem", "regularPunchesRequired", "elitePunchesRequired", "punchesRequiredToBecomeElite", "photoUrl") VALUES (3, 3, 'Bee Repellant', 'Angry Bees', 20, 15, 30, 'http://placekitten.com/200/300');
INSERT INTO "businessLoyaltySettings" (id, "businessId", reward, "requiredItem", "regularPunchesRequired", "elitePunchesRequired", "punchesRequiredToBecomeElite", "photoUrl") VALUES (4, 39, 'Ice Cream', 'Treat', 8, 4, 10, 'http://placekitten.com/200/300');
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
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled", "lastKeyTagRequest", "keyTagRequestPending") VALUES ('1', '1', 'Location 1', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 10, 10, ll_to_earth(10,10), true, 'now()', true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled") VALUES ('2', '2', 'Location 2', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 10.001, 10.001, ll_to_earth(10.001,10.001), true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled") VALUES ('3', '3', 'Location 3', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 0, 0, ll_to_earth(0,0), true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled") VALUES ('4', '1', 'Location 4', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 0, 0, ll_to_earth(0,0), true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled") VALUES ('5', '1', 'Location 4', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 0, 0, ll_to_earth(0,0), true);
INSERT INTO "locations" (id, "businessId", name, street1, street2, city, state, zip, country, lat, lon, position, "isEnabled") VALUES ('6', '4', 'Location 6', '123 Foobar St', '#1', 'Austin', 'TX', 78701, 'USA', 0, 0, ll_to_earth(0,0), true);

-- amys
INSERT INTO locations VALUES (51, 39, 'Loc 1', '3500 Guadalupe St', NULL, 'Austin', 'TX', 78705, 'us', NULL, NULL, 30.3012559999999986, -97.7391460000000052, '(-741564.946385488147, -5456652.12764491513, 3218082.66276435275)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO locations VALUES (52, 39, 'Loc 2', '600 W 28th St', NULL, 'Austin', 'TX', 78705, 'us', NULL, NULL, 30.2935039999999987, -97.7426930000000027, '(-741961.401262949454, -5457037.58970967866, 3217337.57317374088)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO locations VALUES (53, 39, 'Loc 3', '2109 Northland Drive', NULL, 'Austin', 'TX', 78756, 'us', NULL, NULL, 0, 0, '(6378168, 0, 0)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);

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
INSERT INTO "users" (id, email, password) VALUES ('16', 'consumer5@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('17', 'consumer6@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('18', 'consumer7@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('19', null, null);
INSERT INTO "users" (id, email, password) VALUES ('20', 'not_registered@gmail.com', null);

INSERT INTO "users" (id, email, password) VALUES ('11110', 'some_manager@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11111', 'some_manager2@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11112', 'manager_getting_deleted@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11113', 'manager_redeem1@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11114', 'manager_redeem2@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11115', 'manager_redeem3@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');
INSERT INTO "users" (id, email, password) VALUES ('11116', 'manager_of_biz_without_loyalty@gmail.com', 'a960b9a5748e9207f8c0e18fdbbc5b79');

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
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('5', '11', 'Consumer', 'Redeem1', 'consumer_redeem1', '723457-ABD');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('6', '12', 'Consumer', 'Redeem2', 'consumer_redeem2', '123456-ABD');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('7', '13', 'Getting', 'Deleted', 'getting_deleted', '123456-YYY');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('8', '14', 'Getting', 'Deleted2', 'getting_deleted2', '123456-YYZ');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('9', '15', 'Consumer', 'Four', 'consumer4', '123456-CO4');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('10', '16', 'Consumer', 'Five', 'consumer5', '778899-CBA');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('11', '17', 'Consumer', 'Six', 'consumer6', '778899-CBB');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('12', '18', 'Consumer', 'Six', 'consumer6', '778899-CBC');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('13', '19', 'Unregistered', 'Consumer', 'unregistered_consumer', '432123-AAA');
INSERT INTO "consumers" (id, "userId", "firstName", "lastName", "screenName", "cardId") VALUES ('14', '20', 'Unregistered', 'Consumer', 'unregistered_consumer', '432123-AAB');
COMMIT;
SELECT setval('consumers_id_seq', (SELECT MAX(id) from "consumers")); -- advance the sequence past the IDs just used

-- MANAGERS

BEGIN;
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('1', '11110', '1', '1', '123456-XXX');
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('2', '11111', '1', '1', '123456-XXZ');
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('3', '11112', '1', '1', '123456-XXY');
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('4', '11113', '1', '1', '123456-MA1');
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('5', '11114', '1', '4', '123456-XXY');
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('6', '11115', '2', '2', '123456-XXY');
INSERT INTO "managers" (id, "userId", "businessId", "locationId", "cardId") VALUES ('7', '11116', '4', '2', '123456-XXY');
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

-- TAPINS

BEGIN;
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('1', '1', '1', '12345-ABC', now());
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('2', '1', '1', '12345-ABC', now() - '2 days'::interval);
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('3', '1', '1', '12345-ABC', now() - '2 weeks'::interval);
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('4', '1', '1', '12345-ABC', now() - '2 months'::interval);
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('5', '2', '1', '12346-ABC', now());
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('6', '2', '1', '12346-ABC', now() - '2 days'::interval);
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('7', '2', '1', '12346-ABC', now() - '2 weeks'::interval);
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('8', '2', '1', '12346-ABC', now() - '2 months'::interval);
COMMIT;
SELECT setval('"tapins_id_seq"', (SELECT MAX(id) from "tapins")); -- advance the sequence past the IDs just used

-- VISITS

BEGIN;
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "consumerId", "isFirstVisit", "dateTime") VALUES (1, 1, 1, 1, 1, 1, false, now());
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "consumerId", "isFirstVisit", "dateTime") VALUES (2, 2, 1, 1, 1, 1, false, now() - '2 days'::interval);
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "consumerId", "isFirstVisit", "dateTime") VALUES (3, 3, 1, 1, 1, 1, false, now() - '2 weeks'::interval);
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "consumerId", "isFirstVisit", "dateTime") VALUES (4, 4, 1, 1, 1, 1, true, now() - '2 months'::interval);
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "consumerId", "isFirstVisit", "dateTime") VALUES (5, 5, 1, 1, 2, 2, false, now());
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "consumerId", "isFirstVisit", "dateTime") VALUES (6, 6, 1, 1, 2, 2, false, now() - '2 days'::interval);
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "consumerId", "isFirstVisit", "dateTime") VALUES (7, 7, 1, 1, 2, 2, false, now() - '2 weeks'::interval);
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "consumerId", "isFirstVisit", "dateTime") VALUES (8, 8, 1, 1, 2, 2, true, now() - '2 months'::interval);
COMMIT;
SELECT setval('"visits_id_seq"', (SELECT MAX(id) from "visits")); -- advance the sequence past the IDs just used

-- GROUPS

BEGIN;
INSERT INTO "groups" (id, name) VALUES ('1', 'admin');
INSERT INTO "groups" (id, name) VALUES ('2', 'sales');
-- INSERT INTO "groups" (id, name) VALUES ('3', 'tapin-station');
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
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('13', '12', '5');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('14', '16', '5');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('15', '17', '5');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('16', '18', '5');

-- manager

INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11110', '11110', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11111', '11111', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11112', '11112', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11113', '11113', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11114', '11114', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11115', '11115', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11116', '11116', '11110');

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
INSERT INTO "userLoyaltyStats" (id, "consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (1,  3, 1, 5, 23, 40, 0, false, now(), null);
INSERT INTO "userLoyaltyStats" (id, "consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (2,  5, 1, 2, 10, 10, 1, false, now(), null);
INSERT INTO "userLoyaltyStats" (id, "consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (3,  6, 1, 0,  4, 20, 1,  true, now(), now());
INSERT INTO "userLoyaltyStats" (id, "consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (4,  9, 1, 5, 23, 40, 0, false, now(), null);
INSERT INTO "userLoyaltyStats" (id, "consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (5, 10, 1, 5, 23, 40, 0, false, now(), null);
INSERT INTO "userLoyaltyStats" (id, "consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (6, 11, 1, 5, 23, 40, 0, false, now(), null);
INSERT INTO "userLoyaltyStats" (id, "consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (7, 13, 1, 5, 23, 40, 0, false, now(), null);
COMMIT;
SELECT setval('"userLoyaltyStats_id_seq"', (SELECT MAX(id) from "userLoyaltyStats")); -- advance the sequence past the IDs just used

-- PRODUCTS

BEGIN;
INSERT INTO "products" (id, "businessId", name, description, price, "photoUrl", likes, wants, tries, "isVerified", "isEnabled") VALUES ('1', '1', 'Product 1', 'A product', 5500, 'http://placekitten.com/200/300', 4, 4, 4, true, true);
INSERT INTO "products" (id, "businessId", name, description, price, "photoUrl", likes, wants, tries, "isVerified", "isEnabled") VALUES ('2', '2', 'Product 2', 'A product', 5500, 'http://placekitten.com/200/300', 0, 0, 0, true, true);
INSERT INTO "products" (id, "businessId", name, description, price, "photoUrl", likes, wants, tries, "isVerified", "isEnabled") VALUES ('3', '3', 'Product 3', 'A product', 5500, 'http://placekitten.com/200/300', 0, 0, 0, true, true);
INSERT INTO "products" (id, "businessId", name, description, price, "photoUrl", likes, wants, tries, "isVerified", "isEnabled") VALUES ('4', '1', 'Product 4', 'A product', 5500, 'http://placekitten.com/200/300', 0, 0, 0, true, true);
INSERT INTO "products" (id, "businessId", name, description, price, "photoUrl", likes, wants, tries, "isVerified", "isEnabled") VALUES ('5', '1', 'Product 3.5', 'A product', 5500, 'http://placekitten.com/200/300', 0, 0, 0, true, true);

-- Make sure we're well ahead of the current product id
INSERT INTO "products" (id, "businessId", name, description, price, "photoUrl", likes, wants, tries, "isVerified", "isEnabled") VALUES ('2222', '1', 'Product 3.6', 'A product', 5500, 'http://placekitten.com/200/300', 0, 0, 0, true, true);

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
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "isSpotlight") VALUES ('1', '1', '1', '1', 10, 10, ll_to_earth(10, 10), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "isSpotlight") VALUES ('2', '1', '1', '4', 0, 0, ll_to_earth(0, 0), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "isSpotlight") VALUES ('3', '1', '1', '5', 0, 0, ll_to_earth(0, 0), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "isSpotlight") VALUES ('4', '2', '2', '2', 10.001, 10.001, ll_to_earth(10.001, 10.001), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "isSpotlight") VALUES ('5', '3', '3', '3', 0, 0, ll_to_earth(0, 0), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "isSpotlight") VALUES ('6', '4', '1', '1', 10, 10, ll_to_earth(10, 10), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "isSpotlight") VALUES ('7', '4', '1', '4', 0, 0, ll_to_earth(0, 0), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "isSpotlight") VALUES ('8', '4', '1', '5', 0, 0, ll_to_earth(0, 0), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "isSpotlight") VALUES ('9', '5', '1', '5', 0, 0, ll_to_earth(0, 0), false);
COMMIT;
SELECT setval('"productLocations_id_seq"', (SELECT MAX(id) from "productLocations")); -- advance the sequence past the IDs just used

-- PRODUCT LIKES

BEGIN;
INSERT INTO "productLikes" (id, "productId", "userId", "createdAt") VALUES ('1', '1', '7', NOW());
INSERT INTO "productLikes" (id, "productId", "userId", "createdAt") VALUES ('2', '1', '2', NOW() - '2 days'::interval);
INSERT INTO "productLikes" (id, "productId", "userId", "createdAt") VALUES ('3', '1', '3', NOW() - '2 weeks'::interval);
INSERT INTO "productLikes" (id, "productId", "userId", "createdAt") VALUES ('4', '1', '4', NOW() - '2 months'::interval);
INSERT INTO "productLikes" (id, "productId", "userId", "createdAt") VALUES ('5', '2', '7', NOW());
INSERT INTO "productLikes" (id, "productId", "userId", "createdAt") VALUES ('6', '3', '7', NOW());
COMMIT;
SELECT setval('"productLikes_id_seq"', (SELECT MAX(id) from "productLikes")); -- advance the sequence past the IDs just used

-- PRODUCT WANTS

BEGIN;
INSERT INTO "productWants" (id, "productId", "userId", "createdAt") VALUES ('1', '1', '7', NOW());
INSERT INTO "productWants" (id, "productId", "userId", "createdAt") VALUES ('2', '1', '2', NOW() - '2 days'::interval);
INSERT INTO "productWants" (id, "productId", "userId", "createdAt") VALUES ('3', '1', '3', NOW() - '2 weeks'::interval);
INSERT INTO "productWants" (id, "productId", "userId", "createdAt") VALUES ('4', '1', '4', NOW() - '2 months'::interval);
COMMIT;
SELECT setval('"productWants_id_seq"', (SELECT MAX(id) from "productWants")); -- advance the sequence past the IDs just used

-- PRODUCT TRIES

BEGIN;
INSERT INTO "productTries" (id, "productId", "userId", "createdAt") VALUES ('1', '1', '7', NOW());
INSERT INTO "productTries" (id, "productId", "userId", "createdAt") VALUES ('2', '1', '2', NOW() - '2 days'::interval);
INSERT INTO "productTries" (id, "productId", "userId", "createdAt") VALUES ('3', '1', '3', NOW() - '2 weeks'::interval);
INSERT INTO "productTries" (id, "productId", "userId", "createdAt") VALUES ('4', '1', '4', NOW() - '2 months'::interval);
COMMIT;
SELECT setval('"productTries_id_seq"', (SELECT MAX(id) from "productTries")); -- advance the sequence past the IDs just used

-- PHOTOS

BEGIN;
INSERT INTO "photos" (id, "businessId", "productId", "consumerId", url, "isEnabled", "createdAt") VALUES ('1', '1', '1', 9, 'http://placekitten.com/200/300', true, NOW());
INSERT INTO "photos" (id, "businessId", "productId", "consumerId", url, "isEnabled") VALUES ('2', '1', null, 4, 'http://placekitten.com/200/300', true);
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

-- COLLECTIONS

BEGIN;
INSERT INTO collections (id, "consumerId", "name") VALUES (1, 1, 'my first collection');
INSERT INTO collections (id, "consumerId", "name") VALUES (2, 1, 'my second collection');
COMMIT;
SELECT setval('"collections_id_seq"', (SELECT MAX(id) from "collections")); -- advance the sequence past the IDs just used

-- PRODUCTS COLLECTIONS

BEGIN;
INSERT INTO "productsCollections" (id, "productId", "collectionId", "createdAt") VALUES (1, 1, 1, now());
INSERT INTO "productsCollections" (id, "productId", "collectionId", "createdAt") VALUES (2, 2, 1, now());
INSERT INTO "productsCollections" (id, "productId", "collectionId", "createdAt") VALUES (3, 2, 2, now());
INSERT INTO "productsCollections" (id, "productId", "collectionId", "createdAt") VALUES (4, 3, 2, now());
INSERT INTO "productsCollections" (id, "productId", "collectionId", "createdAt") VALUES (5, 4, 2, now());
COMMIT;
SELECT setval('"productsCollections_id_seq"', (SELECT MAX(id) from "productsCollections")); -- advance the sequence past the IDs just used

-- EVENTS

BEGIN;
INSERT INTO events (id, type, date, data) VALUES (1, 'loyalty.punch', NOW(), '"deltaPunches"=>"3", "consumerId"=>"1", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (2, 'loyalty.punch', NOW() - '2 days'::interval, '"deltaPunches"=>"3", "consumerId"=>"1", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (3, 'loyalty.punch', NOW() - '2 weeks'::interval, '"deltaPunches"=>"3", "consumerId"=>"1", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (4, 'loyalty.punch', NOW() - '2 months'::interval, '"deltaPunches"=>"3", "consumerId"=>"1", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (5, 'loyalty.redemption', NOW(), '"deltaPunches"=>"1", "consumerId"=>"1", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (6, 'loyalty.redemption', NOW() - '2 days'::interval, '"deltaPunches"=>"1", "consumerId"=>"1", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (7, 'loyalty.redemption', NOW() - '2 weeks'::interval, '"deltaPunches"=>"1", "consumerId"=>"1", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (8, 'loyalty.redemption', NOW() - '2 months'::interval, '"deltaPunches"=>"1", "consumerId"=>"1", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (9, 'consumers.visit', NOW(), '"consumerId"=>"1", "visitId"=>"1", "businessId"=>"1", "locationId"=>"1", "isFirstVisit"=>"false"');
INSERT INTO events (id, type, date, data) VALUES (10, 'consumers.visit', NOW() - '2 days'::interval, '"consumerId"=>"1", "visitId"=>"2", "businessId"=>"1", "locationId"=>"1", "isFirstVisit"=>"false"');
INSERT INTO events (id, type, date, data) VALUES (11, 'consumers.visit', NOW() - '2 weeks'::interval, '"consumerId"=>"1", "visitId"=>"3", "businessId"=>"1", "locationId"=>"1", "isFirstVisit"=>"false"');
INSERT INTO events (id, type, date, data) VALUES (12, 'consumers.visit', NOW() - '2 months'::interval, '"consumerId"=>"1", "visitId"=>"4", "businessId"=>"1", "locationId"=>"1", "isFirstVisit"=>"true"');
INSERT INTO events (id, type, date, data) VALUES (13, 'consumers.tapin', NOW(), '"userId"=>"1", "tapinStationId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (14, 'consumers.tapin', NOW() - '2 days'::interval, '"userId"=>"1", "tapinStationId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (15, 'consumers.tapin', NOW() - '2 weeks'::interval, '"userId"=>"1", "tapinStationId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (16, 'consumers.tapin', NOW() - '2 months'::interval, '"userId"=>"1", "tapinStationId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (17, 'consumers.becameElite', NOW(), '"userId"=>"1", "businessId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (18, 'consumers.becameElite', NOW() - '2 days'::interval, '"userId"=>"2", "businessId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (19, 'consumers.becameElite', NOW() - '2 weeks'::interval, '"userId"=>"3", "businessId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (20, 'consumers.becameElite', NOW() - '2 months'::interval, '"userId"=>"4", "businessId"=>"1"');
COMMIT;
SELECT setval('"events_id_seq"', (SELECT MAX(id) from "events")); -- advance the sequence past the IDs just used

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
