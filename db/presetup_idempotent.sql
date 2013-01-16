-- IDEMPOTENT pre-setup SQL statements
-- called before any database alterations (setup, migration) are made

-- !! MUST NEVER INCLUDE STATEMENTS WHICH... !!
--    1) would have different effects depending on when they are run
--    2) we would not feel confident running on a production server
--    3) would result in data loss

CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;