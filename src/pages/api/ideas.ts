import type { APIRoute } from 'astro';
import { getIdeas, createIdea } from '../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const { DB } = locals.runtime.env;
  
  try {
    const ideas = await getIdeas(DB);
    return new Response(JSON.stringify({ ideas }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { DB } = locals.runtime.env;
  
  try {
    const body = await request.json();
    const id = await createIdea(DB, body);
    return new Response(JSON.stringify({ success: true, id }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
};