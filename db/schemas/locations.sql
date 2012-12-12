-- Locations

CREATE TABLE locations (
  "id"                     serial primary key,
  "businessId"                int references businesses(id),
  "name"                     text,
  "street1"                  text,
  "street2"                  text,
  "city"                     text,
  "state"                    text,
  "zip"                       int,
  "country"                  text,
  "phone"                    text,
  "fax"                      text,
  "lat"                       int,
  "lng"                       int
);