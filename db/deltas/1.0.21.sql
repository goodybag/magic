-- 1.0.21.sql
insert into deltas (version, date) values ('1.0.21', 'now()');

-- #516 - Duplicate loyalty stats

-- Clear bad records
----------------------------------------------------------------
-- Deletes loyalty stat records that are duplicates and have
-- totalPunches == 0; This won't preserve ALL of the good data,
-- but will preserve the data that matters. The users that lose
-- this record will get it created again when they interact with
-- user loyalty stats again
with ulsa as (select * from "userLoyaltyStats"),
     ulsb as (select * from "userLoyaltyStats")

delete from "userLoyaltyStats" where id in (
  select distinct ulsa.id from ulsa
    left join ulsb on
      ulsa."businessId" = ulsb."businessId" and
      ulsa."userId" = ulsb."userId"
    where ulsa.id != ulsb.id
) and "totalPunches" = 0;