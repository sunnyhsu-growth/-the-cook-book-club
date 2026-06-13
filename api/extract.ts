import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// This file is the single source of truth for recipe extraction. It is the
// production Vercel function AND is re-exported by the local Express dev server
// (server/src/services/claude.ts). It imports only real npm packages so the
// Vercel bundler can package it without reaching outside /api.

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// claude-opus-4-8 = max accuracy on messy handwriting. Override with
// CLAUDE_MODEL=claude-sonnet-4-6 for a cheaper cost/quality balance.
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-8';

export const RecipeSchema = z.object({
  title: z.string(),
  description: z.string().default(''),
  ingredients: z
    .array(z.object({ quantity: z.string().default(''), item: z.string() }))
    .default([]),
  steps: z.array(z.string()).default([]),
  prep_minutes: z.number().int().nullable().default(null),
  cook_minutes: z.number().int().nullable().default(null),
  servings: z.number().int().nullable().default(null),
  tags: z.array(z.string()).default([]),
  notes: z.string().default(''),
});

export type ExtractedRecipe = z.infer<typeof RecipeSchema>;

// Forcing this tool guarantees Claude returns data in exactly this shape.
const RECIPE_TOOL: Anthropic.Tool = {
  name: 'save_recipe',
  description: 'Save the structured recipe transcribed from the provided photo or text.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'The recipe name.' },
      description: {
        type: 'string',
        description: 'A one or two sentence description, if present. Otherwise "".',
      },
      ingredients: {
        type: 'array',
        description: 'Each ingredient as a quantity + item.',
        items: {
          type: 'object',
          properties: {
            quantity: {
              type: 'string',
              description: 'e.g. "2 cups", "1 tbsp", or "" if none given.',
            },
            item: { type: 'string', description: 'e.g. "flour", "olive oil".' },
          },
          required: ['item'],
        },
      },
      steps: {
        type: 'array',
        description:
          'EVERY preparation step, in order — do not merge, summarize, or omit any. '
          + 'Split paragraph-style methods into one action per step. Include the '
          + 'baking, cooling, and serving steps, not just the first few.',
        items: { type: 'string' },
      },
      prep_minutes: {
        type: ['integer', 'null'],
        description: 'Prep time in minutes if stated anywhere (convert hours), else null.',
      },
      cook_minutes: {
        type: ['integer', 'null'],
        description:
          'Bake/cook time in minutes if stated anywhere (e.g. "bake 1 hour" -> 60), else null.',
      },
      servings: {
        type: 'integer',
        description:
          'Number of servings / yield. ALWAYS provide a number: use the stated yield if '
          + 'present, otherwise estimate a reasonable serving count from the ingredient '
          + 'quantities and dish type. Do not leave this blank.',
      },
      tags: {
        type: 'array',
        description:
          'Lowercase tags. ALWAYS include: cuisine (e.g. italian, mexican), meal type '
          + '(e.g. breakfast, dessert, dinner), and every dietary tag the ingredients '
          + 'support (e.g. vegetarian, vegan, gluten-free, dairy-free, contains-nuts). '
          + 'Be thorough with dietary tags, but only add one the ingredients actually justify.',
        items: { type: 'string' },
      },
      notes: {
        type: 'string',
        description:
          'Any extra context that is not an ingredient or a step: source/attribution '
          + '("From Grandma", "NYT Cooking"), tips, variations, substitutions, storage or '
          + 'serving suggestions, and headnotes. Use "" only if there is truly none.',
      },
    },
    required: ['title', 'ingredients', 'steps', 'servings'],
  },
};

const SYSTEM_PROMPT = [
  'You transcribe and structure recipes from photos (handwritten cards, screenshots,',
  'cookbook pages) or from pasted text. Transcribe faithfully AND completely.',
  '',
  'Language: if the source is not in English (e.g. Traditional or Simplified Chinese),',
  'translate EVERYTHING into clear, natural English — title, ingredients, steps, and',
  'notes — using normal English cooking terms. Translate measurements to their common',
  'English equivalents (湯匙 -> tablespoon, 茶匙 -> teaspoon, 杯 -> cup, 克 -> g,',
  '公斤 -> kg, 毫升 -> ml) while keeping the numeric amounts. Append the original dish',
  'name in parentheses after the English title, e.g. "Red-Braised Pork Belly (紅燒肉)".',
  '',
  'Faithful — never invent these (from the source only):',
  '- Ingredients, quantities, and preparation steps.',
  '- Times: record any stated time/temperature (bake/cook → cook_minutes, prep →',
  '  prep_minutes; convert hours to minutes). Leave a time null if none is stated.',
  '',
  'Completeness:',
  '- Capture EVERY preparation step, in order. Do not summarize, merge, or skip steps.',
  '  If the method is one paragraph or a run-on sentence, split it into separate',
  '  sequential steps (one action per step) — including mixing, baking, cooling, and',
  '  serving steps, not just the first few.',
  '- Capture every ingredient with its quantity, in the original order.',
  '',
  'Always fill these, inferring when the source does not state them:',
  '- servings: use the stated yield if present, otherwise ESTIMATE a reasonable number',
  '  from the ingredient quantities and dish type. Never leave servings blank.',
  '- tags: always include cuisine, meal type, AND every dietary tag the ingredients',
  '  support (vegetarian, vegan, gluten-free, dairy-free, contains-nuts, etc.). Be',
  '  thorough with dietary tags, but only add one the ingredients actually justify.',
  '- notes: capture any extra context that is not an ingredient or step — source/',
  '  attribution, tips, variations, substitutions, storage or serving suggestions,',
  '  headnotes. Use "" only if there is truly none.',
  '',
  'Read carefully: transcribe faint or messy handwriting rather than dropping it; fix',
  'only obvious OCR/handwriting artifacts and preserve the original wording.',
  'Always respond by calling the save_recipe tool.',
].join('\n');

type ExtractInput =
  | { type: 'image'; media_type: string; data: string }
  | { type: 'text'; text: string };

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function extractRecipe(input: ExtractInput): Promise<ExtractedRecipe> {
  let userContent: Anthropic.MessageParam['content'];

  if (input.type === 'image') {
    if (!ALLOWED_IMAGE_TYPES.includes(input.media_type)) {
      throw new Error(
        `Unsupported image type "${input.media_type}". Use JPEG, PNG, GIF, or WebP.`,
      );
    }
    userContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: input.media_type as
            | 'image/jpeg'
            | 'image/png'
            | 'image/gif'
            | 'image/webp',
          data: input.data,
        },
      },
      {
        type: 'text',
        text: 'Transcribe this recipe into structured fields using the save_recipe tool.',
      },
    ];
  } else {
    if (!input.text?.trim()) throw new Error('No text provided to extract.');
    userContent = [
      {
        type: 'text',
        text: 'Structure the following recipe text using the save_recipe tool:\n\n' + input.text,
      },
    ];
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [RECIPE_TOOL],
    tool_choice: { type: 'tool', name: 'save_recipe' },
    messages: [{ role: 'user', content: userContent }],
  });

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a structured recipe.');
  }
  return RecipeSchema.parse(toolUse.input);
}

// ─── Vercel serverless function (production) ─────────────────────────────────
export const config = { maxDuration: 60 };

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
    return res
      .status(500)
      .json({ error: 'Failed to extract recipe', details: err?.message ?? String(err) });
  }
}
