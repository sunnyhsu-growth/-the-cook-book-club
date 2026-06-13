export interface Ingredient {
  quantity: string;
  item: string;
}

// The shape returned by the extraction endpoint and edited in the form.
export interface RecipeDraft {
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prep_minutes: number | null;
  cook_minutes: number | null;
  servings: number | null;
  category: string;
  tags: string[];
  notes: string;
  contributor: string;
}

// A persisted recipe row from Supabase.
export interface Recipe extends RecipeDraft {
  id: string;
  user_id: string;
  image_url: string | null;
  source_image_url: string | null;
  status: string;
  created_at: string;
}

export function emptyDraft(): RecipeDraft {
  return {
    title: '',
    description: '',
    ingredients: [{ quantity: '', item: '' }],
    steps: [''],
    prep_minutes: null,
    cook_minutes: null,
    servings: null,
    category: '',
    tags: [],
    notes: '',
    contributor: '',
  };
}
