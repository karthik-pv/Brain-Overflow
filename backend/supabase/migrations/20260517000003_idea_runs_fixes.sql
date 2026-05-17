-- Fix circular FK: ideas.latest_run_id must SET NULL when the run is deleted
-- Without this, deleting an idea with a latest_run_id fails at runtime
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'ideas'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'latest_run_id';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE ideas DROP CONSTRAINT ' || quote_ident(constraint_name);
  END IF;
END $$;

ALTER TABLE ideas
  ADD CONSTRAINT ideas_latest_run_id_fkey
  FOREIGN KEY (latest_run_id)
  REFERENCES idea_runs(id)
  ON DELETE SET NULL;
