import type { D1Database } from '@cloudflare/workers-types';

export interface Idea {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  classification: string | null;
  tags: string | null; // JSON array string: '["tag1","tag2"]'
  status: string; // new | raw | in-progress | review | complete | discarded | archived
  source: string | null;
  code_url: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export const IDEA_STATUSES = [
  'new',
  'raw',
  'in-progress',
  'review',
  'complete',
  'discarded',
  'archived'
] as const;

export async function getIdeas(
  db: D1Database, 
  options: { 
    status?: string; 
    classification?: string; 
    search?: string;
    tags?: string[];
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

  if (options.tags && options.tags.length > 0) {
    // Simple tag filtering (checks if any tag matches)
    const tagConditions = options.tags.map(() => 'tags LIKE ?').join(' OR ');
    query += ` AND (${tagConditions})`;
    options.tags.forEach(tag => params.push(`%"${tag}"%`));
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.prepare(query).bind(...params).all();
  return result.results as Idea[];
}

export async function createIdea(db: D1Database, idea: Partial<Idea>) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const tagsJson = idea.tags ? 
    (typeof idea.tags === 'string' ? idea.tags : JSON.stringify(idea.tags)) : null;

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
    tagsJson,
    idea.status || 'new',
    idea.source || 'dashboard',
    idea.code_url || null,
    idea.source_url || null,
    now,
    now
  ).run();

  return id;
}