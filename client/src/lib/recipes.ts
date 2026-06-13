import { supabase } from './supabase';
import type { Recipe, RecipeDraft } from './types';
import { classifyTag, COURSES, type Facet } from './taxonomy';

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
// One optional selection per facet group; set facets combine with AND.
export type FacetSelections = Partial<Record<Facet, string>>;
export interface RecipeFilters {
  search?: string;
  facets?: FacetSelections;
}

export async function listRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const f = filters.facets ?? {};
  // Course is the primary `category` column; cuisine/dietary live in `tags`.
  if (f.course) query = query.eq('category', f.course);
  if (f.cuisine) query = query.contains('tags', [f.cuisine]);
  if (f.dietary) query = query.contains('tags', [f.dietary]);

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
      category: draft.category || null,
      tags: draft.tags,
      notes: draft.notes,
      contributor: draft.contributor.trim() || null,
      video_url: draft.video_url.trim() || null,
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
      category: draft.category || null,
      tags: draft.tags,
      notes: draft.notes,
      contributor: draft.contributor.trim() || null,
      video_url: draft.video_url.trim() || null,
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

export interface Facets {
  courses: string[]; // ordered by COURSES
  cuisines: string[];
  dietary: string[];
}

// Distinct categories + tags actually present across published recipes, grouped
// for the filter bar.
export async function listFacets(): Promise<Facets> {
  const { data, error } = await supabase
    .from('recipes')
    .select('category, tags')
    .eq('status', 'published');
  if (error) throw error;

  const courseSet = new Set<string>();
  const cuisineSet = new Set<string>();
  const dietarySet = new Set<string>();
  (data ?? []).forEach((r: { category: string | null; tags: string[] }) => {
    if (r.category) courseSet.add(r.category);
    r.tags?.forEach((t) => {
      const g = classifyTag(t);
      if (g === 'cuisine') cuisineSet.add(t);
      else if (g === 'dietary') dietarySet.add(t);
    });
  });

  return {
    courses: COURSES.filter((c) => courseSet.has(c)),
    cuisines: [...cuisineSet].sort(),
    dietary: [...dietarySet].sort(),
  };
}
