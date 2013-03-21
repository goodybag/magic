-- 1.0.3.sql
alter table "deltas" alter column "date" type "timestamp";
insert into deltas (version, date) values ('1.0.3', 'now()');

-- Need to add delete behavior to match dev environment
alter table "productLikes" drop constraint "productLikes_userId_fkey";
alter table "productLikes" add foreign key ("userId")
  references users(id)
  on delete cascade;

alter table "productWants" drop constraint "productWants_userId_fkey";
alter table "productWants" add foreign key ("userId")
  references users(id)
  on delete cascade;

alter table "productTries" drop constraint "productTries_userId_fkey";
alter table "productTries" add foreign key ("userId")
  references users(id)
  on delete cascade;

-- #451: Remove bad user (consumer) records
delete from users where id not in (
  select id from consumers
) and id in (
  select "userId" from "usersGroups"
    where "groupId" = 5
);