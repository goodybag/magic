-- Products

CREATE TABLE products (
  "id"                     serial primary key,
  "businessId"                int references businesses(id) on delete cascade,
  "name"                     text,
  "description"              text,
  "price"                    real,
  "isVerified"            boolean,
  "isEnabled"             boolean
);