import type { VercelRequest, VercelResponse } from '@vercel/node';
// Reuse the exact same extraction logic the local Express dev server uses —
// single source of truth for the prompt, schema, and Claude call.
import { extractRecipe } from '../server/src/services/claude';

// Recipe photos (base64) + Opus 4.8 extraction can take a little while.
export const config = { maxDuration: 60 };

// POST /api/extract — body is { type:"image", media_type, data } or { type:"text", text }.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = req.body ?? {};
    const { type } = body;

    if (type !== 'image' && type !== 'text') {
      return res.status(400).json({ error: 'Body must include type: "image" or "text".' });
    }
    if (type === 'image' && (!body.data || !body.media_type)) {
      return res
        .status(400)
        .json({ error: 'Image extraction requires "media_type" and base64 "data".' });
    }
    if (type === 'text' && !body.text) {
      return res.status(400).json({ error: 'Text extraction requires "text".' });
    }

    const recipe = await extractRecipe(body);
    return res.json({ recipe });
  } catch (err: any) {
    console.error('❌ /api/extract failed:', err?.message ?? err);
    return res.status(500).json({
      error: 'Failed to extract recipe',
      details: err?.message ?? String(err),
    });
  }
}
