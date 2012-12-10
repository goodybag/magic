ALTER TABLE "Locations" DROP CONSTRAINT "fk_locations_businesses";

ALTER TABLE "Businesses"DROP CONSTRAINT "";
ALTER TABLE "Locations"DROP CONSTRAINT "";

DROP TABLE "Businesses";
DROP TABLE "Locations";

CREATE TABLE "Businesses" (
"id" int,
"name" text,
"address1" text,
"address2" text,
"city" text,
"state" text,
"zip" int,
"locations" int,
"enabled" bool,
"createdAt" timestamp,
"updatedAt" timestamp,
PRIMARY KEY ("id") 
);

CREATE TABLE "Locations" (
"id" int,
"businessId" int,
"name" text,
"address1" text,
"address2" text,
"city" text,
"state" text,
"zip" int,
"enabled" bool,
"createdAt" timestamp,
"updatedAt" timestamp,
PRIMARY KEY ("id") 
);


ALTER TABLE "Locations" ADD CONSTRAINT "fk_locations_businesses" FOREIGN KEY ("businessId") REFERENCES "Businesses" ("id");

