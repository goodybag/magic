-- 1.1.1.sql
insert into deltas (version, date) values ('1.1.1', 'now()');

-- #544 bad numPunches / numRewards data

UPDATE "userLoyaltyStats" u SET
"numRewards" = "numRewards" + ("numPunches" / (CASE WHEN "isElite" IS TRUE THEN b."elitePunchesRequired" ELSE b."regularPunchesRequired" END)),
"numPunches" = "numPunches" % (CASE WHEN "isElite" IS TRUE THEN b."elitePunchesRequired" ELSE b."regularPunchesRequired" END)
FROM "businessLoyaltySettings" b
WHERE u."businessId" = b."businessId" AND
(("numPunches" >= b."regularPunchesRequired" AND "isElite" IS NOT TRUE) OR ("numPunches" >= b."elitePunchesRequired" AND "isElite" IS TRUE));

-- #511 nearby algorithm

CREATE TABLE "nearbyGridItems" (
	"id" serial primary key,
	"productId" int references products(id) on delete cascade,
	"locationId" int references locations(id) on delete cascade,
	"businessId" int references businesses(id) on delete cascade,
	"lat" double precision,
	"lon" double precision,
	"position" earth,
	"createdAt" timestamp default now(),
	"isActive" bool default true
);

# 552 - Food tags

insert into "businessTags" ("businessId", tag) values (2107, 'food');
insert into "businessTags" ("businessId", tag) values (2031, 'food');
insert into "businessTags" ("businessId", tag) values (2162, 'food');
insert into "businessTags" ("businessId", tag) values (2153, 'food');
insert into "businessTags" ("businessId", tag) values (2163, 'food');
insert into "businessTags" ("businessId", tag) values (2087, 'food');
insert into "businessTags" ("businessId", tag) values (2096, 'food');
insert into "businessTags" ("businessId", tag) values (2135, 'food');
insert into "businessTags" ("businessId", tag) values (2142, 'food');