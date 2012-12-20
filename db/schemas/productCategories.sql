-- Product Categories

CREATE TABLE "productCategories" (
  "id"                     serial primary key,
  "businessId"                int references businesses(id) on delete cascade,
  "order"                     int,
  "isFeatured"            boolean,
  "name"                     text
);