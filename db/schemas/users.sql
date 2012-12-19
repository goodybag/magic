-- Users

CREATE TABLE users (
  "id"                     serial primary key,
  "email"                    text,
  "password"                 text,
  "singlyAccessToken"        text,
  "singlyId"                 text
);