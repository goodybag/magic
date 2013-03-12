
-- CHARITIES

BEGIN;
INSERT INTO "charities" (id, name, "desc", "logoUrl", "totalReceived") VALUES ('1', 'Charity 1', 'a charity', 'http://placekitten.com/500/500', 1000);
INSERT INTO "charities" (id, name, "desc", "logoUrl", "totalReceived") VALUES ('2', 'Charity 2', 'a charity', 'http://placekitten.com/500/500', 1000);
INSERT INTO "charities" (id, name, "desc", "logoUrl", "totalReceived") VALUES ('3', 'Charity 3', 'a charity', 'http://placekitten.com/500/500', 1000);
COMMIT;
SELECT setval('charities_id_seq', (SELECT MAX(id) from "charities")); -- advance the sequence past the IDs just used

-- BUSINESSES

BEGIN;
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isVerified", "isDeleted") VALUES ('1', 1, 'Geoffs Symposium of Awesomeness', 'http://foobar.com', 'http://placekitten.com/500/500', '1234', '123 Foobar St', '#1', 'Austin', 'TX', 78701, true, true, false);
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isVerified", "isDeleted") VALUES ('2', 1, 'Business 2', 'http://foobar.com', 'http://placekitten.com/500/500', '1234', '123 Foobar St', '#1', 'Austin', 'TX', 78701, true, true, false);
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isVerified", "isDeleted") VALUES ('3', 2, 'Business 3', 'http://foobar.com', 'http://placekitten.com/500/500', '1234', '123 Foobar St', '#1', 'Austin', 'TX', 78701, true, true, false);
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isVerified", "isDeleted") VALUES ('4', 2, 'Business 4', 'http://foobar.com', 'http://placekitten.com/500/500', '1234', '123 Foobar St', '#1', 'Austin', 'TX', 78701, true, false, false);
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isVerified", "isDeleted") VALUES ('39', 2, 'Amys Ice Cream ', 'http://foobar.com', 'http://placekitten.com/500/500', '000000', '3500 guadalupe St', null, 'Austin', 'TX', 78705, true, true, false);
INSERT INTO "businesses" (id, "charityId", name, url, "logoUrl", "cardCode", street1, street2, city, state, zip, "isEnabled", "isVerified", "isDeleted") VALUES ('500', 2, 'Biz With No Locations', 'http://foobar.com', 'http://placekitten.com/500/500', '000000', '3500 guadalupe St', null, 'Austin', 'TX', 78705, true, true, false);
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
-- INSERT INTO "businessTags" (id, "businessId", tag) VALUES ('4', '3', 'food');
INSERT INTO "businessTags" (id, "businessId", tag) VALUES ('5', '4', 'apparel');
INSERT INTO "businessTags" (id, "businessId", tag) VALUES ('6', '39', 'food');
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
INSERT INTO locations VALUES (51, 39, 'Loc 1', '3500 Guadalupe St', NULL, 'Austin', 'TX', 78705, 'us', NULL, NULL, 30.3012559999999986, -97.7391460000000052, '(-741564.946385488147, -5456652.12764491513, 3218082.66276435275)', '0:00 am', '0:00 am', '7:00 am', '5:00pm', '7:00 am', '5:00pm', '7:00 am', '5:00pm', '7:00 am', '5:00pm', '7:00 am', '5:00pm', '9:00 am', '5:00pm', true);
INSERT INTO locations VALUES (52, 39, 'Loc 2', '600 W 28th St', NULL, 'Austin', 'TX', 78705, 'us', NULL, NULL, 30.2935039999999987, -97.7426930000000027, '(-741961.401262949454, -5457037.58970967866, 3217337.57317374088)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO locations VALUES (53, 39, 'Loc 3', '2109 Northland Drive', NULL, 'Austin', 'TX', 78756, 'us', NULL, NULL, 0, 0, '(6378168, 0, 0)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);

COMMIT;
SELECT setval('locations_id_seq', (SELECT MAX(id) from "locations")); -- advance the sequence past the IDs just used

-- -- USERS
-- --   password: "password"

BEGIN;
INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('1', 'admin@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e');
INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('2', 'sales@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e');
INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('3', 'tablet@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e');
INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('4', 'client@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e');
INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('5', 'consumer@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e');
INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('6', 'dumb@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('7', 'tferguson@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-ABC');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('8', 'somebody_else@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-ABD');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('9', 'consumer2@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-ABD');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('10', 'consumer3@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-ABD');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11', 'consumer_redeem1@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '723457-ABD');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('12', 'consumer_redeem2@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-ABD');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('13', 'iamgoingtogetdeleted@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-YYY');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('14', 'iamgoingtogetdeleted2@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-YYZ');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('15', 'consumer4@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-CO4');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('16', 'consumer5@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '778899-CBA');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('17', 'consumer6@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '778899-CBB');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('18', 'consumer7@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '778899-CBC');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('19', null, null, null, '432123-AAA');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('20', null, null, null, '432123-AAB');

INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11110', 'some_manager@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XXX');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11111', 'some_manager2@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XXZ');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11112', 'manager_getting_deleted@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XXY');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11113', 'manager_redeem1@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-MA1');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11114', 'manager_redeem2@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XXY');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11115', 'manager_redeem3@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XXY');

INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11120', 'some_cashier@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XYX');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11121', 'some_cashier2@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XYZ');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11122', 'cashier_getting_deleted@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', null);
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11123', 'cashier_redeem1@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XYY');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11124', 'cashier_redeem2@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XYY');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11125', 'cashier_redeem3@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XYY');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11126', 'cashier_at_deleted_location@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XYY');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11127', 'cashier_redeem_admin@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e', '123456-XYY');
INSERT INTO "users" (id, email, password, "passwordSalt", "cardId") VALUES ('11137', 'cashier-11137@generated.goodybag.com', '$2a$10$wlk6VGTbVTCIq6ejzbauReAKGrmTmYjbRwx9PLMiBXOTZGPzwGoVy', '$2a$10$wlk6VGTbVTCIq6ejzbauRe', '255777-YRM');

INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('11130', 'tapin_station_0@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e');
INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('11131', 'tapin_station_1@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e');
INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('11132', 'tapin_station_2@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e');
INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('11133', 'ts_redeem1@goodybag.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e');
INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('11134', 'consumer_mutated@gmail.com', '$2a$10$kZ7XRgT28fj/IXxyO9WF7eM.eRtf1p7zUWGeIHJIpSpkcyvB4LFTq', '$2a$10$kZ7XRgT28fj/IXxyO9WF7e');
INSERT INTO "users" (id, email, password, "passwordSalt") VALUES ('11135', 'tapin-station-11135@generated.goodybag.com', '$2a$10$WjI6PB/.0RGw/pZ0wOKhe.nTbULMotpQTEajOL1GsDDMGoUMTizn.', '$2a$10$WjI6PB/.0RGw/pZ0wOKhe.');
COMMIT;
SELECT setval('users_id_seq', (SELECT MAX(id) from "users")); -- advance the sequence past the IDs just used

-- CONSUMERS

BEGIN;
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('7', 'Turd', 'Ferguson', 'tferguson');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('8', 'Somebody', 'Else', 'some_guy');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('9', 'Consumer', 'Two', 'consumer2');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('10', 'Consumer', 'Three', 'consumer3');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('11', 'Consumer', 'Redeem1', 'consumer_redeem1');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('12', 'Consumer', 'Redeem2', 'consumer_redeem2');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('13', 'Getting', 'Deleted', 'getting_deleted');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('14', 'Getting', 'Deleted2', 'getting_deleted2');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('15', 'Consumer', 'Four', 'consumer4');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('16', 'Consumer', 'Five', 'consumer5');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('17', 'Consumer', 'Six', 'consumer6');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('18', 'Consumer', 'Six', 'consumer6');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('19', 'Unregistered', 'Consumer', 'unregistered_consumer');
INSERT INTO "consumers" (id, "firstName", "lastName", "screenName") VALUES ('20', 'Unregistered', 'Consumer', 'unregistered_consumer');
COMMIT;

-- MANAGERS

BEGIN;
INSERT INTO "managers" (id, "businessId", "locationId") VALUES ('11110', '1', '1');
INSERT INTO "managers" (id, "businessId", "locationId") VALUES ('11111', '1', '1');
INSERT INTO "managers" (id, "businessId", "locationId") VALUES ('11112', '1', '1');
INSERT INTO "managers" (id, "businessId", "locationId") VALUES ('11113', '1', '1');
INSERT INTO "managers" (id, "businessId", "locationId") VALUES ('11114', '1', '4');
INSERT INTO "managers" (id, "businessId", "locationId") VALUES ('11115', '2', '2');
COMMIT;

-- CASHIERS

BEGIN;
INSERT INTO "cashiers" (id, "businessId", "locationId") VALUES ('11120', '1', '1');
INSERT INTO "cashiers" (id, "businessId", "locationId") VALUES ('11121', '1', '1');
INSERT INTO "cashiers" (id, "businessId", "locationId") VALUES ('11122', '1', '1');
INSERT INTO "cashiers" (id, "businessId", "locationId") VALUES ('11123', '1', '1');
INSERT INTO "cashiers" (id, "businessId", "locationId") VALUES ('11124', '1', '4');
INSERT INTO "cashiers" (id, "businessId", "locationId") VALUES ('11125', '2', '2');
INSERT INTO "cashiers" (id, "businessId", "locationId") VALUES ('11126', '1', '5');
INSERT INTO "cashiers" (id, "businessId", "locationId") VALUES ('11127', '1', '5');
INSERT INTO "cashiers" (id, "businessId", "locationId") VALUES ('11137', '39', '51');
COMMIT;

-- TAPINSTATIONS

BEGIN;
INSERT INTO "tapinStations" (id, "businessId", "locationId", "loyaltyEnabled", "galleryEnabled") VALUES ('11130', '1', '1', 'true', 'true');
INSERT INTO "tapinStations" (id, "businessId", "locationId", "loyaltyEnabled", "galleryEnabled") VALUES ('11131', '1', '1', 'true', 'true');
INSERT INTO "tapinStations" (id, "businessId", "locationId", "loyaltyEnabled", "galleryEnabled") VALUES ('11132', '1', '1', 'true', 'true');
INSERT INTO "tapinStations" (id, "businessId", "locationId", "loyaltyEnabled", "galleryEnabled") VALUES ('11133', '1', '1', 'true', 'true');
INSERT INTO "tapinStations" (id, "businessId", "locationId", "loyaltyEnabled", "galleryEnabled") VALUES ('11135', '39', '51', 'true', 'true');
COMMIT;

-- TAPINS

BEGIN;
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('1', '1', '11130', '12345-ABC', now());
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('2', '1', '11130', '12345-ABC', now() - '2 days'::interval);
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('3', '1', '11130', '12345-ABC', now() - '2 weeks'::interval);
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('4', '1', '11130', '12345-ABC', now() - '2 months'::interval);
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('5', '2', '11130', '12346-ABC', now());
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('6', '2', '11130', '12346-ABC', now() - '2 days'::interval);
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('7', '2', '11130', '12346-ABC', now() - '2 weeks'::interval);
INSERT INTO "tapins" (id, "userId", "tapinStationId", "cardId", "dateTime") VALUES ('8', '2', '11130', '12346-ABC', now() - '2 months'::interval);
COMMIT;
SELECT setval('"tapins_id_seq"', (SELECT MAX(id) from "tapins")); -- advance the sequence past the IDs just used

-- VISITS

BEGIN;
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "userId", "isFirstVisit", "dateTime") VALUES (1, 1, 1, 1, 11130, 7, false, now());
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "userId", "isFirstVisit", "dateTime") VALUES (2, 2, 1, 1, 11130, 7, false, now() - '2 days'::interval);
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "userId", "isFirstVisit", "dateTime") VALUES (3, 3, 1, 1, 11130, 7, false, now() - '2 weeks'::interval);
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "userId", "isFirstVisit", "dateTime") VALUES (4, 4, 1, 1, 11130, 7, true, now() - '2 months'::interval);
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "userId", "isFirstVisit", "dateTime") VALUES (5, 5, 1, 1, 11131, 8, false, now());
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "userId", "isFirstVisit", "dateTime") VALUES (6, 6, 1, 1, 11131, 8, false, now() - '2 days'::interval);
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "userId", "isFirstVisit", "dateTime") VALUES (7, 7, 1, 1, 11131, 8, false, now() - '2 weeks'::interval);
INSERT INTO "visits" (id, "tapinId", "businessId", "locationId", "tapinStationId", "userId", "isFirstVisit", "dateTime") VALUES (8, 8, 1, 1, 11131, 8, true, now() - '2 months'::interval);
COMMIT;
SELECT setval('"visits_id_seq"', (SELECT MAX(id) from "visits")); -- advance the sequence past the IDs just used

-- GROUPS

BEGIN;
INSERT INTO "groups" (id, name) VALUES ('1', 'admin');
INSERT INTO "groups" (id, name) VALUES ('2', 'sales');
INSERT INTO "groups" (id, name) VALUES ('3', 'tapin-station');
INSERT INTO "groups" (id, name) VALUES ('4', 'client');
INSERT INTO "groups" (id, name) VALUES ('5', 'consumer');
INSERT INTO "groups" (id, name) VALUES ('6', 'foobar');
INSERT INTO "groups" (id, name) VALUES ('7', 'foobar2');
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

-- -- manager

INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11110', '11110', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11111', '11111', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11112', '11112', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11113', '11113', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11114', '11114', '11110');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11115', '11115', '11110');

-- -- cashier
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11120', '11120', '11111');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11121', '11121', '11111');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11122', '11122', '11111');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11123', '11123', '11111');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11124', '11124', '11111');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11125', '11125', '11111');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11137', '11137', '11111');

INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11126', '11127', '1');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11127', '11127', '11111');

-- tapin-station
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11130', '11130', '11112');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11131', '11131', '11112');
INSERT INTO "usersGroups" (id, "userId", "groupId") VALUES ('11132', '11132', '11112');
COMMIT;
SELECT setval('"usersGroups_id_seq"', (SELECT MAX(id) from "usersGroups")); -- advance the sequence past the IDs just usedSELECT setval('locations_id_seq', (SELECT MAX(id) from "locations")); -- advance the sequence past the IDs just used

-- USER LOYALTY STATS

BEGIN;
INSERT INTO "userLoyaltyStats" (id, "userId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (1,  9, 1, 5, 23, 40, 0, false, now(), null);
INSERT INTO "userLoyaltyStats" (id, "userId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (2, 11, 1, 2, 10, 10, 1, false, now(), null);
INSERT INTO "userLoyaltyStats" (id, "userId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (3, 12, 1, 0,  4, 20, 1,  true, now(), now());
INSERT INTO "userLoyaltyStats" (id, "userId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (4, 15, 1, 5, 23, 40, 0, false, now(), null);
INSERT INTO "userLoyaltyStats" (id, "userId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (5, 16, 1, 5, 23, 40, 0, false, now(), null);
INSERT INTO "userLoyaltyStats" (id, "userId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (6, 17, 1, 5, 23, 40, 0, false, now(), null);
INSERT INTO "userLoyaltyStats" (id, "userId", "businessId", "numPunches", "totalPunches", "visitCount", "numRewards", "isElite", "lastVisit", "dateBecameElite") VALUES (7, 19, 1, 5, 23, 40, 0, false, now(), null);
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

-- amy's

INSERT INTO products VALUES (46175, 39, 'Cop Stop', 'Sweet Cream blended with espresso and mini sour cream donuts', 599, 'https://www.filepicker.io/api/file/2Lig6wrwQzyN1w9OGIDS', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46183, 39, 'Anchors Away', 'Sweet Cream blended with Mexican vanilla, Dr. Pepper, Sailor Jerry’s Run, and Corn Syrup', 599, 'https://www.filepicker.io/api/file/ZUlI4IzSSgxkCXIPMwsg', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46172, 39, 'Butter Pecan', 'Sweet Cream infused with butter and brown sugar, blended with whole pecan and pecan pieces', 599, 'https://www.filepicker.io/api/file/RkZ4ZzvGQMKltCuJwKbg', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46173, 39, 'Pumpkin', 'Sweet cream blended with pumpkin custard mix, pumpkin, cinnamon, nutmeg, clove, and ginger', 599, 'https://www.filepicker.io/api/file/oDnBUQewQ3yCKPOCCMLw', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46174, 39, 'Lemon Ginger', 'Sweet cream blended with pumpkin, cream cheese, clove, allspice, nutmeg, ground cinnamon and ginger, pasteurized egg yolks, and lemon juice.  ', 599, 'https://www.filepicker.io/api/file/pWY6ORTlQDScxuAjy6af', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46177, 39, 'Shiner Ice Cream', 'Sweet cream bended with shiner bock beer and corn syrup', 599, 'https://www.filepicker.io/api/file/O4jhkdktT3OUwlesxKJv', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46178, 39, 'Mexican Vanilla', 'Amy''s most popular flavor, made from a hybrid of vanilla bean that offers a richer, sweeter vanilla flavor', 599, 'https://www.filepicker.io/api/file/y4fbBh3TVUlxCeG3KC0A', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46179, 39, 'Oreo', 'Sweet cream infused with Mexican vanilla blended with oreo cookies', 599, 'https://www.filepicker.io/api/file/EjnEsxIuQ0W3JhYtTRA6', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46180, 39, 'Guinness', 'Sweet Cream blended with Guinness Beer and Corn Syrup', 599, 'https://www.filepicker.io/api/file/BHA51Fv0RQO2rHvFoszj', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46184, 39, 'Raspberry Ice', 'This is a tasty ice flavor', 599, 'https://www.filepicker.io/api/file/wde2vjbYRtCq7vV9kcxZ', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46185, 39, 'Black Metal Stout', 'When Jeffery Stuffing moved to Austin to start a new brewery, Jester King, the first Austin Business he felt a connection to was amys ice creams.  Visiting the 6th street store with his brother Michael they both imagined "how cool it would be to have a Jester King Brewery ice cream flavor".', 599, 'https://www.filepicker.io/api/file/R8FNWxejRECrxT5lIBJS', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46186, 39, 'Strawberry', 'Sweet Cream blended with corn syrup and sugared strawberries', 599, 'https://www.filepicker.io/api/file/OT5yTqOTRw27wfehnr2k', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46181, 39, 'Coffee Toffee', 'Sweet cream blended with espresso and Amys own homemade toffee', 599, 'https://www.filepicker.io/api/file/jml0U62JTsGso8xb2LMF', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46176, 39, 'Milk Shakes', 'A blended Combination of milk and ice cream of your choice topped with complimentary whipped cream.  Additionally for a small charge feel free to have any of our crush’ns blended into your shake.', 599, 'https://www.filepicker.io/api/file/vkwJeAMkQFCABPLOfpus', 0, 0, 0, NULL, NULL, true);

INSERT INTO products VALUES (46187, 39, 'Cop Stop 2', 'Sweet Cream blended with espresso and mini sour cream donuts', 599, 'https://www.filepicker.io/api/file/2Lig6wrwQzyN1w9OGIDS', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46188, 39, 'Anchors Away 2', 'Sweet Cream blended with Mexican vanilla, Dr. Pepper, Sailor Jerry’s Run, and Corn Syrup', 599, 'https://www.filepicker.io/api/file/ZUlI4IzSSgxkCXIPMwsg', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46189, 39, 'Butter Pecan 2', 'Sweet Cream infused with butter and brown sugar, blended with whole pecan and pecan pieces', 599, 'https://www.filepicker.io/api/file/RkZ4ZzvGQMKltCuJwKbg', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46190, 39, 'Pumpkin 2', 'Sweet cream blended with pumpkin custard mix, pumpkin, cinnamon, nutmeg, clove, and ginger', 599, 'https://www.filepicker.io/api/file/oDnBUQewQ3yCKPOCCMLw', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46191, 39, 'Lemon Ginger 2', 'Sweet cream blended with pumpkin, cream cheese, clove, allspice, nutmeg, ground cinnamon and ginger, pasteurized egg yolks, and lemon juice.  ', 599, 'https://www.filepicker.io/api/file/pWY6ORTlQDScxuAjy6af', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46192, 39, 'Shiner Ice Cream 2', 'Sweet cream bended with shiner bock beer and corn syrup', 599, 'https://www.filepicker.io/api/file/O4jhkdktT3OUwlesxKJv', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46193, 39, 'Mexican Vanilla 2', 'Amy''s most popular flavor, made from a hybrid of vanilla bean that offers a richer, sweeter vanilla flavor', 599, 'https://www.filepicker.io/api/file/y4fbBh3TVUlxCeG3KC0A', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46194, 39, 'Oreo 2', 'Sweet cream infused with Mexican vanilla blended with oreo cookies', 599, 'https://www.filepicker.io/api/file/EjnEsxIuQ0W3JhYtTRA6', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46195, 39, 'Guinness 2', 'Sweet Cream blended with Guinness Beer and Corn Syrup', 599, 'https://www.filepicker.io/api/file/BHA51Fv0RQO2rHvFoszj', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46196, 39, 'Raspberry Ice 2', 'This is a tasty ice flavor', 599, 'https://www.filepicker.io/api/file/wde2vjbYRtCq7vV9kcxZ', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46197, 39, 'Black Metal Stout 2', 'When Jeffery Stuffing moved to Austin to start a new brewery, Jester King, the first Austin Business he felt a connection to was amys ice creams.  Visiting the 6th street store with his brother Michael they both imagined "how cool it would be to have a Jester King Brewery ice cream flavor".', 599, 'https://www.filepicker.io/api/file/R8FNWxejRECrxT5lIBJS', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46198, 39, 'Strawberry 2', 'Sweet Cream blended with corn syrup and sugared strawberries', 599, 'https://www.filepicker.io/api/file/OT5yTqOTRw27wfehnr2k', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46199, 39, 'Coffee Toffee 2', 'Sweet cream blended with espresso and Amys own homemade toffee', 599, 'https://www.filepicker.io/api/file/jml0U62JTsGso8xb2LMF', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46200, 39, 'Milk Shakes 2', 'A blended Combination of milk and ice cream of your choice topped with complimentary whipped cream.  Additionally for a small charge feel free to have any of our crush’ns blended into your shake.', 599, 'https://www.filepicker.io/api/file/vkwJeAMkQFCABPLOfpus', 0, 0, 0, NULL, NULL, true);

INSERT INTO products VALUES (46201, 39, 'Cop Stop 3', 'Sweet Cream blended with espresso and mini sour cream donuts', 599, 'https://www.filepicker.io/api/file/2Lig6wrwQzyN1w9OGIDS', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46202, 39, 'Anchors Away 3', 'Sweet Cream blended with Mexican vanilla, Dr. Pepper, Sailor Jerry’s Run, and Corn Syrup', 599, 'https://www.filepicker.io/api/file/ZUlI4IzSSgxkCXIPMwsg', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46203, 39, 'Butter Pecan 3', 'Sweet Cream infused with butter and brown sugar, blended with whole pecan and pecan pieces', 599, 'https://www.filepicker.io/api/file/RkZ4ZzvGQMKltCuJwKbg', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46204, 39, 'Pumpkin 3', 'Sweet cream blended with pumpkin custard mix, pumpkin, cinnamon, nutmeg, clove, and ginger', 599, 'https://www.filepicker.io/api/file/oDnBUQewQ3yCKPOCCMLw', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46205, 39, 'Lemon Ginger 3', 'Sweet cream blended with pumpkin, cream cheese, clove, allspice, nutmeg, ground cinnamon and ginger, pasteurized egg yolks, and lemon juice.  ', 599, 'https://www.filepicker.io/api/file/pWY6ORTlQDScxuAjy6af', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46206, 39, 'Shiner Ice Cream 3', 'Sweet cream bended with shiner bock beer and corn syrup', 599, 'https://www.filepicker.io/api/file/O4jhkdktT3OUwlesxKJv', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46207, 39, 'Mexican Vanilla 3', 'Amy''s most popular flavor, made from a hybrid of vanilla bean that offers a richer, sweeter vanilla flavor', 599, 'https://www.filepicker.io/api/file/y4fbBh3TVUlxCeG3KC0A', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46208, 39, 'Oreo 3', 'Sweet cream infused with Mexican vanilla blended with oreo cookies', 599, 'https://www.filepicker.io/api/file/EjnEsxIuQ0W3JhYtTRA6', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46209, 39, 'Guinness 3', 'Sweet Cream blended with Guinness Beer and Corn Syrup', 599, 'https://www.filepicker.io/api/file/BHA51Fv0RQO2rHvFoszj', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46210, 39, 'Raspberry Ice 3', 'This is a tasty ice flavor', 599, 'https://www.filepicker.io/api/file/wde2vjbYRtCq7vV9kcxZ', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46211, 39, 'Black Metal Stout 3', 'When Jeffery Stuffing moved to Austin to start a new brewery, Jester King, the first Austin Business he felt a connection to was amys ice creams.  Visiting the 6th street store with his brother Michael they both imagined "how cool it would be to have a Jester King Brewery ice cream flavor".', 599, 'https://www.filepicker.io/api/file/R8FNWxejRECrxT5lIBJS', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46212, 39, 'Strawberry 3', 'Sweet Cream blended with corn syrup and sugared strawberries', 599, 'https://www.filepicker.io/api/file/OT5yTqOTRw27wfehnr2k', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46213, 39, 'Coffee Toffee 3', 'Sweet cream blended with espresso and Amys own homemade toffee', 599, 'https://www.filepicker.io/api/file/jml0U62JTsGso8xb2LMF', 0, 0, 0, NULL, NULL, true);
INSERT INTO products VALUES (46214, 39, 'Milk Shakes 3', 'A blended Combination of milk and ice cream of your choice topped with complimentary whipped cream.  Additionally for a small charge feel free to have any of our crush’ns blended into your shake.', 599, 'https://www.filepicker.io/api/file/vkwJeAMkQFCABPLOfpus', 0, 0, 0, NULL, NULL, true);

COMMIT;
SELECT setval('products_id_seq', (SELECT MAX(id) from "products")); -- advance the sequence past the IDs just used

-- PRODUCT CATEGORIES

BEGIN;
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES ('1', '1', '1', 'Category 1', true);
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES ('2', '1', '2', 'Category 2', false);
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES ('3', '2', '1', 'Category 1', true);
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES ('4', '3', '1', 'DUMB CATEGORY WILL BE DELETED', true);

-- amys
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES (114, 39, 0, 'Ice Creams', false);
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES (6458, 39, 0, 'Drinks', false);
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES (6459, 39, 0, 'Frozen Yogurt', false);
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES (6460, 39, 0, 'Fruit Ices', false);
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES (6461, 39, 0, 'Ice Cream Cakes', false);
INSERT INTO "productCategories" ("id", "businessId", "order", "name", "isFeatured") VALUES (6462, 39, 0, 'Chocolate Covered Strawberries', false);

COMMIT;
SELECT setval('"productCategories_id_seq"', (SELECT MAX(id) from "productCategories")); -- advance the sequence past the IDs just used

-- PRODUCTS <-> PRODUCT CATEGORIES

BEGIN;
INSERT INTO "productsProductCategories" ("id", "productId", "productCategoryId") VALUES ('1', '1', '1');
INSERT INTO "productsProductCategories" ("id", "productId", "productCategoryId") VALUES ('2', '1', '2');
INSERT INTO "productsProductCategories" ("id", "productId", "productCategoryId") VALUES ('3', '2', '3');

-- amys
INSERT INTO "productsProductCategories" ("id", "productId", "productCategoryId") VALUES (4, 46172, 114);
INSERT INTO "productsProductCategories" ("id", "productId", "productCategoryId") VALUES (5, 46173, 114);
INSERT INTO "productsProductCategories" ("id", "productId", "productCategoryId") VALUES (6, 46174, 114);
INSERT INTO "productsProductCategories" ("id", "productId", "productCategoryId") VALUES (7, 46175, 114);

COMMIT;
SELECT setval('"productsProductCategories_id_seq"', (SELECT MAX(id) from "productsProductCategories")); -- advance the sequence past the IDs just used

-- PRODUCT LOCATIONS

BEGIN;
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES ('1', '1', '1', '1', 10, 10, ll_to_earth(10, 10), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES ('2', '1', '1', '4', 0, 0, ll_to_earth(0, 0), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES ('3', '1', '1', '5', 0, 0, ll_to_earth(0, 0), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES ('4', '2', '2', '2', 10.001, 10.001, ll_to_earth(10.001, 10.001), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES ('5', '3', '3', '3', 0, 0, ll_to_earth(0, 0), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES ('6', '4', '1', '1', 10, 10, ll_to_earth(10, 10), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES ('7', '4', '1', '4', 0, 0, ll_to_earth(0, 0), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES ('8', '4', '1', '5', 0, 0, ll_to_earth(0, 0), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES ('9', '5', '1', '5', 0, 0, ll_to_earth(0, 0), false);

-- amys
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (12, 46172, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (13, 46173, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (14, 46174, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), true);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (15, 46175, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (16, 46176, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (17, 46177, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (18, 46178, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (19, 46179, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (20, 46180, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (21, 46181, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (23, 46183, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (24, 46184, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (25, 46185, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (26, 46186, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (27, 46187, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (28, 46188, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (29, 46189, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (30, 46190, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (31, 46191, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (32, 46192, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (33, 46193, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (34, 46194, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (35, 46195, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (36, 46196, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (37, 46197, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (38, 46198, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (39, 46199, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (40, 46200, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (41, 46201, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (42, 46202, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (43, 46203, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (44, 46204, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (45, 46205, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (46, 46206, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (47, 46207, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (48, 46208, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (49, 46209, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (50, 46210, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (51, 46211, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (52, 46212, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (53, 46213, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);
INSERT INTO "productLocations" (id, "productId", "businessId", "locationId", lat, lon, position, "inSpotlight") VALUES (54, 46214, 39, 51, 30.3012559999999986, -97.7391460000000052, ll_to_earth(30.3012559999999986, -97.7391460000000052), false);



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
INSERT INTO "photos" (id, "businessId", "productId", "userId", url, "isEnabled", "createdAt") VALUES ('1', '1', '1', 15, 'http://placekitten.com/200/300', true, NOW());
INSERT INTO "photos" (id, "businessId", "productId", "userId", url, "isEnabled")              VALUES ('2', '1', null, 10, 'http://placekitten.com/200/300', true);
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

-- amys
INSERT INTO "productTags" ("id","businessId", "tag") VALUES (6, 39, 'Tag1');
INSERT INTO "productTags" ("id","businessId", "tag") VALUES (7, 39, 'Tag2');
INSERT INTO "productTags" ("id","businessId", "tag") VALUES (8, 39, 'Tag3');
INSERT INTO "productTags" ("id","businessId", "tag") VALUES (9, 39, 'Tag4');
INSERT INTO "productTags" ("id","businessId", "tag") VALUES (10, 39, 'Tag5');
INSERT INTO "productTags" ("id","businessId", "tag") VALUES (11, 39, 'Tag6');
COMMIT;
SELECT setval('"productTags_id_seq"', (SELECT MAX(id) from "productTags")); -- advance the sequence past the IDs just used

-- PRODUCTS TAGS

BEGIN;
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('1', '1', '1');
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('2', '2', '1');
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('3', '3', '2');
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('4', '4', '3');
INSERT INTO "productsProductTags" (id, "productTagId", "productId") VALUES ('5', '5', '3');

-- amys
INSERT INTO "productsProductTags" ("id", "productTagId", "productId") VALUES (6, 6, 46183);
INSERT INTO "productsProductTags" ("id", "productTagId", "productId") VALUES (7, 7, 46183);
INSERT INTO "productsProductTags" ("id", "productTagId", "productId") VALUES (8, 8, 46183);
INSERT INTO "productsProductTags" ("id", "productTagId", "productId") VALUES (9, 9, 46183);
INSERT INTO "productsProductTags" ("id", "productTagId", "productId") VALUES (10, 10, 46183);
INSERT INTO "productsProductTags" ("id", "productTagId", "productId") VALUES (11, 11, 46183);

COMMIT;
SELECT setval('"productsProductTags_id_seq"', (SELECT MAX(id) from "productsProductTags")); -- advance the sequence past the IDs just used
-- COLLECTIONS

BEGIN;
INSERT INTO collections (id, "userId", "name", "isHidden", "pseudoKey") VALUES (1, 7, 'my first collection', false, 'mypseudo');
INSERT INTO collections (id, "userId", "name", "isHidden") VALUES (2, 7, 'my second collection', false);
INSERT INTO collections (id, "userId", "name", "isHidden") VALUES (3, 9, 'my third collection', false);
INSERT INTO collections (id, "userId", "name", "isHidden", "pseudoKey") VALUES (4, 7, 'Uncategorized', true, 'uncategorized');
INSERT INTO collections (id, "userId", "name", "isHidden", "pseudoKey") VALUES (5, 3, 'my pseudo collection', false, 'mypseudo');
COMMIT;
SELECT setval('"collections_id_seq"', (SELECT MAX(id) from "collections")); -- advance the sequence past the IDs just used

-- PRODUCTS COLLECTIONS

BEGIN;
INSERT INTO "productsCollections" (id, "userId", "productId", "collectionId", "createdAt") VALUES (1, 7, 1, 1, now());
INSERT INTO "productsCollections" (id, "userId", "productId", "collectionId", "createdAt") VALUES (2, 7, 2, 1, now());
INSERT INTO "productsCollections" (id, "userId", "productId", "collectionId", "createdAt") VALUES (3, 7, 2, 2, now());
INSERT INTO "productsCollections" (id, "userId", "productId", "collectionId", "createdAt") VALUES (4, 7, 3, 2, now());
INSERT INTO "productsCollections" (id, "userId", "productId", "collectionId", "createdAt") VALUES (5, 7, 4, 2, now());
INSERT INTO "productsCollections" (id, "userId", "productId", "collectionId", "createdAt") VALUES (6, 3, 4, 5, now());
COMMIT;
SELECT setval('"productsCollections_id_seq"', (SELECT MAX(id) from "productsCollections")); -- advance the sequence past the IDs just used

-- EVENTS

BEGIN;
INSERT INTO events (id, type, date, data) VALUES (1, 'loyalty.punch', NOW(), '"deltaPunches"=>"3", "userId"=>"7", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (2, 'loyalty.punch', NOW() - '2 days'::interval, '"deltaPunches"=>"3", "userId"=>"7", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (3, 'loyalty.punch', NOW() - '2 weeks'::interval, '"deltaPunches"=>"3", "userId"=>"7", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (4, 'loyalty.punch', NOW() - '2 months'::interval, '"deltaPunches"=>"3", "userId"=>"7", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (5, 'loyalty.redemption', NOW(), '"deltaPunches"=>"1", "userId"=>"7", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (6, 'loyalty.redemption', NOW() - '2 days'::interval, '"deltaPunches"=>"1", "userId"=>"7", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (7, 'loyalty.redemption', NOW() - '2 weeks'::interval, '"deltaPunches"=>"1", "userId"=>"7", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (8, 'loyalty.redemption', NOW() - '2 months'::interval, '"deltaPunches"=>"1", "userId"=>"7", "businessId"=>"1", "locationId"=>"1", "employeeId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (9, 'consumers.visit', NOW(), '"userId"=>"7", "visitId"=>"1", "businessId"=>"1", "locationId"=>"1", "isFirstVisit"=>"false"');
INSERT INTO events (id, type, date, data) VALUES (10, 'consumers.visit', NOW() - '2 days'::interval, '"userId"=>"7", "visitId"=>"2", "businessId"=>"1", "locationId"=>"1", "isFirstVisit"=>"false"');
INSERT INTO events (id, type, date, data) VALUES (11, 'consumers.visit', NOW() - '2 weeks'::interval, '"userId"=>"7", "visitId"=>"3", "businessId"=>"1", "locationId"=>"1", "isFirstVisit"=>"false"');
INSERT INTO events (id, type, date, data) VALUES (12, 'consumers.visit', NOW() - '2 months'::interval, '"userId"=>"7", "visitId"=>"4", "businessId"=>"1", "locationId"=>"1", "isFirstVisit"=>"true"');
INSERT INTO events (id, type, date, data) VALUES (13, 'consumers.tapin', NOW(), '"userId"=>"1", "tapinStationId"=>"11130"');
INSERT INTO events (id, type, date, data) VALUES (14, 'consumers.tapin', NOW() - '2 days'::interval, '"userId"=>"1", "tapinStationId"=>"11130"');
INSERT INTO events (id, type, date, data) VALUES (15, 'consumers.tapin', NOW() - '2 weeks'::interval, '"userId"=>"1", "tapinStationId"=>"11130"');
INSERT INTO events (id, type, date, data) VALUES (16, 'consumers.tapin', NOW() - '2 months'::interval, '"userId"=>"1", "tapinStationId"=>"11130"');
INSERT INTO events (id, type, date, data) VALUES (17, 'consumers.becameElite', NOW(), '"userId"=>"1", "businessId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (18, 'consumers.becameElite', NOW() - '2 days'::interval, '"userId"=>"2", "businessId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (19, 'consumers.becameElite', NOW() - '2 weeks'::interval, '"userId"=>"3", "businessId"=>"1"');
INSERT INTO events (id, type, date, data) VALUES (20, 'consumers.becameElite', NOW() - '2 months'::interval, '"userId"=>"4", "businessId"=>"1"');
COMMIT;
SELECT setval('"events_id_seq"', (SELECT MAX(id) from "events")); -- advance the sequence past the IDs just used

-- ACTIVITIY

BEGIN;
INSERT INTO activity (id, "userId", "businessId", "locationId", type, date, data) VALUES (1, 7, 1, 1, 'foobar', now(), '{"foo":"bar"}');
COMMIT;
SELECT setval('activity_id_seq', (SELECT MAX(id) from "activity")); -- advance the sequence past the IDs just used

--
BEGIN;
INSERT INTO "oddityLive" (id, "biz_name", "e_address", "e_postal", "e_city", "e_state", "web_url") VALUES ('1', 'Subway', '4424 Buffalo Gap Rd', '78749-1234', 'Austin', 'TX', 'www.subway.com' );
INSERT INTO "oddityLive" (id, "biz_name", "e_address", "e_postal", "e_city", "e_state", "web_url") VALUES ('2', 'Abilene', '1866 Pine St', '78749-1234', 'Houston', 'TX', 'www.abilene.com' );
INSERT INTO "oddityLive" (id, "biz_name", "e_address", "e_postal", "e_city", "e_state", "web_url") VALUES ('11', 'Abilene', '18677 Pine St', '78749-1234', 'Austin', 'TX', 'www.abilene.com' );
INSERT INTO "oddityLive" (id, "biz_name", "e_address", "e_postal", "e_city", "e_state", "web_url") VALUES ('22', 'Abilene', '18677 Guaterloop St', '78749-1234', 'Austin', 'TX', 'www.abilene.com' );
COMMIT;

--
BEGIN;
INSERT INTO "oddityMeta" (id, "userId","oddityLiveId", "toReview", "changeColumns", "isHidden", "hiddenBy", "reviewedBy", "lastUpdated") VALUES ('1','1', '11', true, true, false, 'admin@goodybag.com', 'sales@goodybag.com', '2013-02-13 15:21:57.497542');
INSERT INTO "oddityMeta" (id, "userId","oddityLiveId", "toReview", "changeColumns", "isHidden", "hiddenBy", "reviewedBy", "lastUpdated") VALUES ('2','2', '22', true, true, false, 'admin@goodybag.com', 'sales@goodybag.com', '2013-01-13 15:21:57.497542');
COMMIT;

BEGIN;
create table "pendingFacebookUsers" (
  "facebookId" int primary key,
  "cardId" text
);
create unique index "pendingFacebookUsers_cardId_idx" on "public"."pendingFacebookUsers" USING btree("cardId" ASC NULLS LAST);
COMMIT;