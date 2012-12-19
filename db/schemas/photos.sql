-- Photos

CREATE TABLE photos (
  "id"                     serial primary key,
  "businessId"                int references businesses(id) on delete cascade,
  "productId"                 int references products(id) on delete cascade,
  "consumerId"                int, -- :TODO: references businesses(id) on delete cascade,
  "url"                      text,
  "notes"                    text,
  "lat"                       int,
  "lon"                       int,
  "isEnabled"             boolean,
  "createdAt"           timestamp
);