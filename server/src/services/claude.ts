// Recipe extraction lives in /api/extract.ts — the production Vercel function and
// the single source of truth for the prompt, schema, and Claude call. The local
// Express dev server reuses it here so there's no duplicated logic.
// (The @vercel/node type import in that file is erased at runtime.)
export { extractRecipe, RecipeSchema } from '../../../api/extract';
export type { ExtractedRecipe } from '../../../api/extract';
