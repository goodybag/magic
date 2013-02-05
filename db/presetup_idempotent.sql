-- IDEMPOTENT pre-setup SQL statements
-- called before any database alterations (setup, migration) are made

-- !! MUST NEVER INCLUDE STATEMENTS WHICH... !!
--    1) would have different effects depending on when they are run
--    2) we would not feel confident running on a production server
--    3) would result in data loss

CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
CREATE EXTENSION IF NOT EXISTS hstore;

CREATE OR REPLACE FUNCTION escape_json (text) RETURNS text AS $$
SELECT replace($1, '"', '"'); $$ LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION to_json(text) RETURNS text AS $$
SELECT escape_json($1) $$ LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION to_json(KEY text, value text) RETURNS text AS $$
SELECT '"' || to_json($1) || '" : "' || to_json($2) || '"'; $$ LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION to_json(hstore) RETURNS text AS $$
SELECT '{' || array_to_string(array_agg(to_json(item.KEY, item.value)), ', ') || '}'
FROM each($1) item; $$ LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION to_json(text[]) RETURNS text AS $$
SELECT to_json(hstore($1)); $$ LANGUAGE SQL IMMUTABLE;