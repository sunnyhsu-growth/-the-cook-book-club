import { supabase } from './supabase';
import type { Recipe, RecipeDraft } from './types';

// ─── Storage ─────────────────────────────────────────────────────────────────
export async function uploadImage(
  bucket: 'recipe-images' | 'recipe-sources',
  file: File,
  userId: string,
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── CRUD ──────────────────────────────────────────────────────────────────--
export interface RecipeFilters {
  search?: string;
  tag?: string;
}

export async function listRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (filters.tag) query = query.contains('tags', [filters.tag]);
  if (filters.search?.trim()) {
    // websearch_to_tsquery handles natural phrases & multiple ingredients.
    query = query.textSearch('search_tsv', filters.search.trim(), {
      type: 'websearch',
      config: 'english',
    });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Recipe[];
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Recipe | null;
}

export async function createRecipe(
  draft: RecipeDraft,
  userId: string,
  imageUrl: string | null,
  sourceImageUrl: string | null,
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      user_id: userId,
      title: draft.title,
      description: draft.description,
      ingredients: draft.ingredients.filter((i) => i.item.trim()),
      steps: draft.steps.filter((s) => s.trim()),
      prep_minutes: draft.prep_minutes,
      cook_minutes: draft.cook_minutes,
      servings: draft.servings,
      tags: draft.tags,
      notes: draft.notes,
      image_url: imageUrl,
      source_image_url: sourceImageUrl,
      status: 'published',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Recipe;
}

export async function updateRecipe(
  id: string,
  draft: RecipeDraft,
  imageUrl: string | null,
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .update({
      title: draft.title,
      description: draft.description,
      ingredients: draft.ingredients.filter((i) => i.item.trim()),
      steps: draft.steps.filter((s) => s.trim()),
      prep_minutes: draft.prep_minutes,
      cook_minutes: draft.cook_minutes,
      servings: draft.servings,
      tags: draft.tags,
      notes: draft.notes,
      image_url: imageUrl,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Recipe;
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

// Distinct tags across all published recipes, for the filter bar.
export async function listAllTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('tags')
    .eq('status', 'published');
  if (error) throw error;
  const set = new Set<string>();
  (data ?? []).forEach((r: { tags: string[] }) => r.tags?.forEach((t) => set.add(t)));
  return [...set].sort();
}
