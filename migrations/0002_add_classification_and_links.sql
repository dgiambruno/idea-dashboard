-- Add classification + links support
ALTER TABLE ideas ADD COLUMN classification TEXT;
ALTER TABLE ideas ADD COLUMN code_url TEXT;
ALTER TABLE ideas ADD COLUMN source_url TEXT;

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_ideas_classification ON ideas(classification);