-- Groups

CREATE TABLE groups (
  "id"                     serial primary key,
  "group"                     text,
  "createdAt"           timestamp,
  "updatedAt"           timestamp
);