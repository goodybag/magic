-- Product Tags

CREATE TABLE "productTags" (
  "id"                     serial primary key,
  "businessId"                int references businesses(id) on delete cascade,
  "productId"                 int references products(id) on delete cascade,
  "tag"                      text,
  "createdAt"           timestamp
);