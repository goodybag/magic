-- Users

CREATE TABLE users (
  "id"                     serial primary key,
  "name"                     text,
  "password"                 text,
  "enabled"               boolean,
  "createdAt"           timestamp,
  "updatedAt"           timestamp
);