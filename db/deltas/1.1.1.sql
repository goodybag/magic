-- 1.1.1.sql
insert into deltas (version, date) values ('1.1.1', 'now()');

-- #544 bad numPunches / numRewards data

UPDATE "userLoyaltyStats" u SET
"numRewards" = "numRewards" + ("numPunches" / (CASE WHEN "isElite" IS TRUE THEN b."elitePunchesRequired" ELSE b."regularPunchesRequired" END)),
"numPunches" = "numPunches" % (CASE WHEN "isElite" IS TRUE THEN b."elitePunchesRequired" ELSE b."regularPunchesRequired" END)
FROM "businessLoyaltySettings" b
WHERE u."businessId" = b."businessId" AND
(("numPunches" >= b."regularPunchesRequired" AND "isElite" IS NOT TRUE) OR ("numPunches" >= b."elitePunchesRequired" AND "isElite" IS TRUE));

-- #486 partial registration

CREATE TABLE "partialRegistrations" (
       id SERIAL PRIMARY KEY,
       "userId" integer REFERENCES users(id) ON DELETE CASCADE,
       token text,
       "createdAt" timestamp WITHOUT time zone DEFAULT now(),
       used timestamp WITHOUT time zone
);
