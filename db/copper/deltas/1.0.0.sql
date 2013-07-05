create table if not exists requests (
  "uuid"            text,
  "userId"          integer,
  "httpMethod"      text,
  "url"             text,
  "application"     text,
  "userAgent"       text,
  "createdAt"       timestamp without time zone
);

-- Dump all of the old requests into this massive partion
create table if not exists requests_20130701 (
  check ( "createdAt" < '2013-06-01' )
) inherits (requests);

-- Create enough new requests tables to last us a while

create table if not exists requests_20130701_20130801 (
  check ( "createdAt" >= date '2013-07-01' and "createdAt" < date '2013-08-01' )
) inherits (requests);

create table if not exists requests_20130801_20130901 (
  check ( "createdAt" >= date '2013-08-01' and "createdAt" < date '2013-09-01' )
) inherits (requests);

create table if not exists requests_20130901_20131001 (
  check ( "createdAt" >= date '2013-09-01' and "createdAt" < date '2013-10-01' )
) inherits (requests);

create table if not exists requests_20131001_20131101 (
  check ( "createdAt" >= date '2013-10-01' and "createdAt" < date '2013-11-01' )
) inherits (requests);

create table if not exists requests_20131101_20131201 (
  check ( "createdAt" >= date '2013-11-01' and "createdAt" < date '2013-12-01' )
) inherits (requests);

create table if not exists requests_20131201_20140101 (
  check ( "createdAt" >= date '2013-12-01' and "createdAt" < date '2014-01-01' )
) inherits (requests);

create table if not exists requests_20140101_20140201 (
  check ( "createdAt" >= date '2014-01-01' and "createdAt" < date '2014-02-01' )
) inherits (requests);

create table if not exists requests_20140201_20140301 (
  check ( "createdAt" >= date '2014-02-01' and "createdAt" < date '2014-03-01' )
) inherits (requests);

create table if not exists requests_20140301_20140401 (
  check ( "createdAt" >= date '2014-03-01' and "createdAt" < date '2014-04-01' )
) inherits (requests);

create table if not exists requests_20140401_20140501 (
  check ( "createdAt" >= date '2014-04-01' and "createdAt" < date '2014-05-01' )
) inherits (requests);

create table if not exists requests_20140501_20140601 (
  check ( "createdAt" >= date '2014-05-01' and "createdAt" < date '2014-06-01' )
) inherits (requests);

create table if not exists requests_20140601_20140701 (
  check ( "createdAt" >= date '2014-06-01' and "createdAt" < date '2014-07-01' )
) inherits (requests);

-- Create indexes
create index requests_20130701_pkey on requests_20130701 (uuid);
create index "requests_20130701_createdAt" on requests_20130701 ("createdAt");

create index requests_20130701_20130801_pkey on requests_20130701_20130801 (uuid);
create index "requests_20130701_20130801_createdAt" on requests_20130701_20130801 ("createdAt");

create index requests_20130801_20130901_pkey on requests_20130801_20130901 (uuid);
create index "requests_20130801_20130901_createdAt" on requests_20130801_20130901 ("createdAt");

create index requests_20130901_20131001_pkey on requests_20130901_20131001 (uuid);
create index "requests_20130901_20131001_createdAt" on requests_20130901_20131001 ("createdAt");

create index requests_20131001_20131101_pkey on requests_20131001_20131101 (uuid);
create index "requests_20131001_20131101_createdAt" on requests_20131001_20131101 ("createdAt");

create index requests_20131101_20131201_pkey on requests_20131101_20131201 (uuid);
create index "requests_20131101_20131201_createdAt" on requests_20131101_20131201 ("createdAt");

create index requests_20131201_20140101_pkey on requests_20131201_20140101 (uuid);
create index "requests_20131201_20140101_createdAt" on requests_20131201_20140101 ("createdAt");

create index requests_20140101_20140201_pkey on requests_20140101_20140201 (uuid);
create index "requests_20140101_20140201_createdAt" on requests_20140101_20140201 ("createdAt");

create index requests_20140201_20140301_pkey on requests_20140201_20140301 (uuid);
create index "requests_20140201_20140301_createdAt" on requests_20140201_20140301 ("createdAt");

create index requests_20140301_20140401_pkey on requests_20140301_20140401 (uuid);
create index "requests_20140301_20140401_createdAt" on requests_20140301_20140401 ("createdAt");

create index requests_20140401_20140501_pkey on requests_20140401_20140501 (uuid);
create index "requests_20140401_20140501_createdAt" on requests_20140401_20140501 ("createdAt");

create index requests_20140501_20140601_pkey on requests_20140501_20140601 (uuid);
create index "requests_20140501_20140601_createdAt" on requests_20140501_20140601 ("createdAt");

create index requests_20140601_20140701_pkey on requests_20140601_20140701 (uuid);
create index "requests_20140601_20140701_createdAt" on requests_20140601_20140701 ("createdAt");

-- request trigger function
create or replace function request_insert_trigger()
returns trigger as $$
declare
  created_at date;
  table_name text;
begin
  created_at := NEW."createdAt";

  if ( created_at < date '2013-07-01' ) then
    table_name := 'requests_20130701';
  else
    table_name := 'requests_' || to_char(  created_at::timestamp, 'YYYYMM01')::text
                      ||  '_' || to_char( (created_at + interval '1 month')::timestamp, 'YYYYMM01')::text;
  end if;

  execute 'insert into ' || table_name || ' values ($1.*)'
  using NEW;

  return null;
end;
$$
language plpgsql;

-- Setup the trigger
create trigger insert_request_trigger
  before insert on requests
  for each row execute procedure request_insert_trigger();