-- 1.1.3.sql
insert into deltas (version, date) values ('1.1.3', 'now()');

-- #486 partial registration

CREATE TABLE "partialRegistrations" (
       id SERIAL PRIMARY KEY,
       "userId" integer REFERENCES users(id) ON DELETE CASCADE,
       token text,
       "createdAt" timestamp WITHOUT time zone DEFAULT now(),
       used timestamp WITHOUT time zone
);

-- #556 email uniqueness

ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
