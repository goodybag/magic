-- Group User

CREATE TABLE usergroup (
  "id"                     serial primary key,
  "userId"                int references users(id),
  "groupId"               int references groups(id)
);