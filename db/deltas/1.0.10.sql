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