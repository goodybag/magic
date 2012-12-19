-- User Groups

CREATE TABLE "userGroups" (
  "id"                     serial primary key,
  "userId"                    int,
  "groupId"                   int
);