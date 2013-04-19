-- 1.0.25.sql
insert into deltas (version, date) values ('1.0.25', 'now()');

-- #503 - Missing some database constraints on consumers, managers, and cachiers

-- remove consumers that don't have a cooresponding user

DELETE FROM consumers WHERE id NOT IN (SELECT id from users);

-- This adds foreign key and delete cascade constraints to the three tables that are missing them
ALTER TABLE consumers ADD CONSTRAINT consumers_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE managers ADD CONSTRAINT managers_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE cashiers ADD CONSTRAINT cashiers_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
