import type { APIRoute } from 'astro';
import { getIdeas } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  const { DB } = locals.runtime.env;
  const body = await request.json();
  const { action, ids, newStatus } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return new Response(JSON.stringify({ error: 'No ideas selected' }), { status: 400 });
  }

  try {
    if (action === 'update-status' && newStatus) {
      const placeholders = ids.map(() => '?').join(',');
      await DB.prepare(
        `UPDATE ideas SET status = ?, updated_at = datetime('now') WHERE id IN (${placeholders})`
      ).bind(newStatus, ...ids).run();

      return new Response(JSON.stringify({ success: true, updated: ids.length }));
    }

    if (action === 'export-obsidian') {
      const ideas = await getIdeas(DB);
      const selected = ideas.filter(i => ids.includes(i.id));
      
      // Return markdown files ready for Obsidian
      const files = selected.map(idea => {
        const tags = idea.tags ? JSON.parse(idea.tags) : [];
        const frontmatter = [
          '---',
          `title: "${idea.title}"`,
          `classification: ${idea.classification || ''}`,
          `status: ${idea.status}`,
          `category: ${idea.category || ''}`,
          `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
          `created: ${idea.created_at}`,
          `source: ${idea.source || ''}`,
          `code_url: ${idea.code_url || ''}`,
          `source_url: ${idea.source_url || ''}`,
          '---',
          '',
          idea.content || ''
        ].join('\n');

        const filename = `${idea.id.slice(0,8)} - ${idea.title.replace(/[^a-z0-9]/gi, ' ').trim()}.md`;
        return { filename, content: frontmatter };
      });

      return new Response(JSON.stringify({ files }));
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
};