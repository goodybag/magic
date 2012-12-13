-- Users

CREATE TABLE users (
  "id"                     serial primary key,
  "name"                     text,
  "password"                 text,
  "email"                    text,
  "createdAt"           timestamp,
  "updatedAt"           timestamp
);