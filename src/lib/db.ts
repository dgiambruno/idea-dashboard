import type { D1Database } from '@cloudflare/workers-types';

export interface Idea {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  classification: string | null; // Business, AI, Personal, Product, Design, Research, etc.
  tags: string | null; // JSON string
  status: string;
  source: string | null;
  code_url: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getIdeas(
  db: D1Database, 
  options: { 
    status?: string; 
    classification?: string; 
    search?: string;
  } = {}
) {
  let query = 'SELECT * FROM ideas WHERE 1=1';
  const params: any[] = [];

  if (options.status) {
    query += ' AND status = ?';
    params.push(options.status);
  }

  if (options.classification) {
    query += ' AND classification = ?';
    params.push(options.classification);
  }

  if (options.search) {
    query += ' AND (title LIKE ? OR content LIKE ? OR category LIKE ?)';
    const term = `%${options.search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.prepare(query).bind(...params).all();
  return result.results as Idea[];
}

export async function createIdea(db: D1Database, idea: Partial<Idea>) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO ideas (
      id, title, content, category, classification, tags, status, source, 
      code_url, source_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    idea.title,
    idea.content || null,
    idea.category || null,
    idea.classification || null,
    idea.tags || null,
    idea.status || 'idea',
    idea.source || 'dashboard',
    idea.code_url || null,
    idea.source_url || null,
    now,
    now
  ).run();

  return id;
}