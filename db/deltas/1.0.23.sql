-- 1.0.23.sql
insert into deltas (version, date) values ('1.0.23', 'now()');

-- Log requests


-- Create a table to log all requests in.

CREATE TABLE requests (
       uuid text PRIMARY KEY,
       userId integer,
       httpMethod text,
       url text,
       application text,
       userAgent text
);
