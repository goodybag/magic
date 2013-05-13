-- #576 - Actions

create table "actions" (
  "id"                    serial primary key
, "type"                  text
, "dateTime"              timestamp without time zone default now()
, "userId"                int
, "productId"             int
, "source"                text
, "sourceVersion"         text
, "deviceId"              text
, "locationId"            int
, "data"                  text
);
