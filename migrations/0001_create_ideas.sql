-- Ideas table for Idea Bank
CREATE TABLE IF NOT EXISTS ideas (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    tags TEXT, -- JSON array as string
    status TEXT DEFAULT 'idea', -- idea, in-progress, done, archived
    source TEXT, -- obsidian, hermes, manual, etc.
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at);