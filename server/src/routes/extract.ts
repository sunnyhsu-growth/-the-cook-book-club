import { Router } from 'express';
import { extractRecipe } from '../services/claude.js';

const router = Router();

// POST /api/extract
// Body is one of:
//   { "type": "image", "media_type": "image/jpeg", "data": "<base64>" }
//   { "type": "text",  "text": "<pasted recipe text>" }
router.post('/', async (req, res) => {
  try {
    const { type } = req.body ?? {};

    if (type !== 'image' && type !== 'text') {
      return res
        .status(400)
        .json({ error: 'Body must include type: "image" or "text".' });
    }

    if (type === 'image' && (!req.body.data || !req.body.media_type)) {
      return res
        .status(400)
        .json({ error: 'Image extraction requires "media_type" and base64 "data".' });
    }

    if (type === 'text' && !req.body.text) {
      return res.status(400).json({ error: 'Text extraction requires "text".' });
    }

    const recipe = await extractRecipe(req.body);
    res.json({ recipe });
  } catch (err: any) {
    console.error('❌ /api/extract failed:', err?.message ?? err);
    res.status(500).json({
      error: 'Failed to extract recipe',
      details: err?.message ?? String(err),
    });
  }
});

export default router;
