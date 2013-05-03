-- 1.1.4.sql
insert into deltas (version, date) values ('1.1.4', 'now()');-

- #486 partial registration

CREATE TABLE "partialRegistrations" (
       id SERIAL PRIMARY KEY,
       "userId" integer REFERENCES users(id) ON DELETE CASCADE,
       token text,
       "createdAt" timestamp WITHOUT time zone DEFAULT now(),
       used timestamp WITHOUT time zone
);
