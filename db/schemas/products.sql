-- Products

CREATE TABLE products (
  "id"                     serial primary key,
  "businessId"                int references businesses(id) on delete cascade,
  "name"                     text,
  "enabled"               boolean
);