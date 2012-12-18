-- Businesses

CREATE TABLE businesses (
  "id"                     serial primary key,
  "name"                     text,
  "url"                      text,
  "cardCode"                 text,
  "street1"                  text,
  "street2"                  text,
  "city"                     text,
  "state"                    text,
  "zip"                       int,
  "isEnabled"             boolean,
  "createdAt"           timestamp,
  "updatedAt"           timestamp
);