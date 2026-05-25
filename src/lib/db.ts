import type { D1Database } from '@cloudflare/workers-types';

export interface Idea {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  tags: string | null; // JSON string
  status: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export async function getIdeas(db: D1Database, status?: string) {
  let query = 'SELECT * FROM ideas';
  const params: any[] = [];
  
  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await db.prepare(query).bind(...params).all();
  return result.results as Idea[];
}

export async function createIdea(db: D1Database, idea: Partial<Idea>) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await db.prepare(`
    INSERT INTO ideas (id, title, content, category, tags, status, source, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    idea.title,
    idea.content || null,
    idea.category || null,
    idea.tags || null,
    idea.status || 'idea',
    idea.source || 'dashboard',
    now,
    now
  ).run();
  
  return id;
}