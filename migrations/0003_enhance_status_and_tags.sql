-- Expand statuses and add tags support
-- New status options: new, raw, in-progress, review, complete, discarded, archived

-- Note: SQLite doesn't support easy enum changes, so we just ensure the column exists.
-- Tags stored as JSON array string.

ALTER TABLE ideas ADD COLUMN tags TEXT; -- already exists, safe to re-run in dev

-- Optional: You can run a one-time update if needed:
-- UPDATE ideas SET status = 'new' WHERE status = 'idea';