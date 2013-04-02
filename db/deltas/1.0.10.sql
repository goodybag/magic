-- 1.0.10.sql
insert into deltas (version, date) values ('1.0.10', 'now()');

-- # 476 - Business Contact entries
create table "businessContactRequests" (
  id              serial primary key
, name            text
, "businessName"  text
, email           text
, zip             int
, comments        text
, date            timestamp default now() not null
);

-- # 493 - businesses need food tag

insert into "businessTags" ("businessId", tag) values (2073, 'food'); -- Llamas
insert into "businessTags" ("businessId", tag) values (958,  'food'); -- Toros Tacos
insert into "businessTags" ("businessId", tag) values (2082, 'food'); -- Austin Daily Press
insert into "businessTags" ("businessId", tag) values (2097, 'food'); -- D’ Lites
insert into "businessTags" ("businessId", tag) values (2072, 'food'); -- Veracruz All Natural
insert into "businessTags" ("businessId", tag) values (2081, 'food'); -- Niki's Pizza - 620
insert into "businessTags" ("businessId", tag) values (2044, 'food'); -- C C Zing
insert into "businessTags" ("businessId", tag) values (2001, 'food'); -- El Ceviche Grill
insert into "businessTags" ("businessId", tag) values (2018, 'food'); -- Fire and Soul
insert into "businessTags" ("businessId", tag) values (1995, 'food'); -- Fishey Bizness
insert into "businessTags" ("businessId", tag) values (2023, 'food'); -- Curry in Hurry
insert into "businessTags" ("businessId", tag) values (2022, 'food'); -- Moontower Saloon
insert into "businessTags" ("businessId", tag) values (2011, 'food'); -- Wholly Kabob
insert into "businessTags" ("businessId", tag) values (1977, 'food'); -- Goodfellers
insert into "businessTags" ("businessId", tag) values (1974, 'food'); -- Brass House
insert into "businessTags" ("businessId", tag) values (1975, 'food'); -- Big Daddy's Burgers & Bar

-- #491 - cardID upper

update users set "cardId" = upper(users."cardId");

-- #492 - Pending facebook users use userId instead of cardId

alter table "pendingFacebookUsers" add column "userId" int;
alter table "pendingFacebookUsers" add foreign key ("userId") references users(id);

update "pendingFacebookUsers"
  set "userId" = users.id
  from users
  where "pendingFacebookUsers"."cardId" = users."cardId";

alter table "pendingFacebookUsers" drop column "cardId";

-- #495 - cleanup dup accounts cardId stuff

-- Turn empty string cardIds into nulls
update users set "cardId" = null where "cardId" = '';

-- Eliminate cardIds not in the range 150000-900000
with bad_card_id_users as (
  select * from users where
    (upper("cardId") < '130000-AAA' or
     upper("cardId") > '900000-ZZZ') and
    "cardId" is not null and
    "cardId" != '' and
    "cardId" != '777777-XYZ'
)
delete from users where id in (
  select id from bad_card_id_users
    left join "pendingFacebookUsers"
      on "pendingFacebookUsers"."cardId" = bad_card_id_users."cardId"
  where
    bad_card_id_users.email is null and
    "pendingFacebookUsers"."facebookId" is null
);

-- Any remainders, just set their cardId to null
update users set "cardId" = null where id in (
  select id from users where
    (upper("cardId") < '130000-AAA' or
     upper("cardId") > '900000-ZZZ') and
    "cardId" is not null and
    "cardId" != '' and
    "cardId" != '777777-XYZ'
);