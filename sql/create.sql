ALTER TABLE "Locations" DROP CONSTRAINT "fk_locations_businesses";
ALTER TABLE "Usergroup" DROP CONSTRAINT "fk_usergroup_users";
ALTER TABLE "Usergroup" DROP CONSTRAINT "fk_usergroup_groupd";

ALTER TABLE "Businesses"DROP CONSTRAINT "";
ALTER TABLE "Locations"DROP CONSTRAINT "";
ALTER TABLE "Users"DROP CONSTRAINT "";


DROP TABLE "Businesses";
DROP TABLE "Locations";
DROP TABLE "Users";

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

CREATE TABLE "Users" (
"id" int,
"email" text,
"password" text,
"SinglyAccessToken" text,
"SinglyId" text,
PRIMARY KEY ("id")
);


ALTER TABLE "Locations" ADD CONSTRAINT "fk_locations_businesses" FOREIGN KEY ("businessId") REFERENCES "Businesses" ("id");
ALTER TABLE "UserGroup" ADD CONSTRAINT "fk_usergroup_users" FOREIGN KEY ("userId") REFERENCES "Users" ("id");
ALTER TABLE "UserGroup" ADD CONSTRAINT "fk_usergroup_groups" FOREIGN KEY ("groupId") REFERENCES "Groups" ("id");
