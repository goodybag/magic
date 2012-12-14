-- Users

CREATE TABLE users (
  "id"                     serial primary key,
  "username"                 text,
  "password"                 text,
  "singlyAccessToken"        text,
  "singlyId"                 text,
  "createdAt"           timestamp,
  "updatedAt"           timestamp
);