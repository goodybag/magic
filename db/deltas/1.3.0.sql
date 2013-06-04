-- 1.3.0.sql
insert into deltas (version, date) values ('1.3.0', 'now()');

-- #520 - Product Ordering

create table "menuSections" (
  "id"                serial primary key,
  "businessId"        int references businesses(id) on delete cascade,
  "name"              text,
  "order"             int,
  "isEnabled"         boolean
);

create table "menuSectionsProducts" (
  "id"                serial primary key,
  "sectionId"         int references "menuSections"(id) on delete cascade,
  "productId"         int references products(id) on delete cascade,
  "locationId"        int references locations(id) on delete cascade,
  "order"             int
);

create table "highlights" (
  "id"                serial primary key,
  "businessId"        int references businesses(id),
  "name"              text,
  "order"             int,
  "isEnabled"         boolean
);

create table "highlightsProducts" (
  "id"                serial primary key,
  "highlightId"       int references highlights(id) on delete cascade,
  "productId"         int references products(id) on delete cascade,
  "locationId"        int references locations(id) on delete cascade,
  "order"             int
);